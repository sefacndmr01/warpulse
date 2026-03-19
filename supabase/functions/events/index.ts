// @ts-nocheck

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { ...CORS, 'Content-Type': 'application/json' } })

const err = (msg, status = 400) => json({ error: msg }, status)

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })

  const BASE     = Deno.env.get('SUPABASE_URL')
  const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')
  const SVC_KEY  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!BASE || !ANON_KEY || !SVC_KEY) return err('missing_env', 500)

  const RH = { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}`, 'Content-Type': 'application/json' }
  const WH = { apikey: SVC_KEY,  Authorization: `Bearer ${SVC_KEY}`,  'Content-Type': 'application/json' }

  const rest = `${BASE}/rest/v1`
  const url  = new URL(req.url)
  const seg  = url.pathname.replace(/^(?:\/functions\/v1)?\/events\/?/, '').split('/').filter(Boolean)

  try {

    if (req.method === 'GET' && seg.length === 0) {
      const type  = url.searchParams.get('type') ?? 'all'
      const sort  = url.searchParams.get('sort') ?? 'latest'
      const limit = Math.min(200, Number(url.searchParams.get('limit') ?? 100))

      let queryUrl = `${rest}/events?status=eq.approved&limit=${limit}`
      if (type !== 'all') queryUrl += `&event_type=eq.${type}`

      const r = await fetch(queryUrl, { headers: RH })
      const d = await r.json()
      if (!r.ok) return err(d?.message ?? JSON.stringify(d), 500)

      if (sort === 'popular')
        d.sort((a, b) => b.upvotes - a.upvotes)
      else
        d.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

      return json(d)
    }

    if (req.method === 'GET' && seg[0] === 'archive') {
      const limit    = Math.min(100, Math.max(10, Number(url.searchParams.get('limit') ?? 30)))
      const page     = Math.max(0, Number(url.searchParams.get('page') ?? 0))
      const type     = url.searchParams.get('type') ?? 'all'
      const q        = (url.searchParams.get('q') ?? '').trim()
      const dateFrom = url.searchParams.get('from')
      const dateTo   = url.searchParams.get('to')
      const sort     = url.searchParams.get('sort') ?? 'latest'

      let queryUrl = `${rest}/events?status=eq.approved&limit=${limit}&offset=${page * limit}`
      if (type && type !== 'all') queryUrl += `&event_type=eq.${type}`
      if (q)        queryUrl += `&title=ilike.*${encodeURIComponent(q)}*`
      if (dateFrom) queryUrl += `&created_at=gte.${dateFrom}`
      if (dateTo)   queryUrl += `&created_at=lte.${dateTo}`

      const r = await fetch(queryUrl, { headers: RH })
      const d = await r.json()
      if (!r.ok) return err(d?.message ?? JSON.stringify(d), 500)

      if (sort === 'popular')
        d.sort((a, b) => b.upvotes - a.upvotes)
      else
        d.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

      return json({ data: d, page, limit })
    }

    if (req.method === 'GET' && seg.length === 1) {
      const r = await fetch(`${rest}/events?id=eq.${seg[0]}`, { headers: RH })
      const d = await r.json()
      if (!r.ok) return err(d?.message ?? JSON.stringify(d), 500)
      if (!Array.isArray(d) || !d.length) return err('Not found', 404)
      return json(d[0])
    }

    if (req.method === 'POST' && seg.length === 0) {
      const body = await req.json()
      if (!body.title?.trim())                  return err('Title is required')
      if (!body.event_type)                     return err('Event type is required')
      if (body.lat == null || body.lng == null) return err('Location is required')

      const r = await fetch(`${rest}/events`, {
        method: 'POST',
        headers: { ...WH, Prefer: 'return=representation' },
        body: JSON.stringify({
          title:         body.title.trim(),
          description:   body.description?.trim()   || null,
          source_url:    body.source_url?.trim()     || null,
          event_type:    body.event_type,
          lat:           body.lat,
          lng:           body.lng,
          location_name: body.location_name?.trim() || null,
          status:        'pending',
        }),
      })
      const d = await r.json()
      if (!r.ok) return err(d?.message ?? JSON.stringify(d), 500)
      const created = Array.isArray(d) ? d[0] : d

      fetch(`${BASE}/functions/v1/verify-event`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${SVC_KEY}` },
        body: JSON.stringify({ eventId: created.id, title: created.title, description: created.description, source_url: created.source_url }),
      }).catch(() => null)

      return json({ id: created.id, status: created.status })
    }

    if (req.method === 'POST' && seg.length === 2 && seg[1] === 'vote') {
      const body = await req.json()
      if (body.direction !== 'up' && body.direction !== 'down') return err('direction must be up or down')

      const rawIp =
        req.headers.get('cf-connecting-ip') ??
        req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
        req.headers.get('x-real-ip') ??
        'unknown'

      const ipHash = Array.from(
        new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(rawIp))),
      ).map(b => b.toString(16).padStart(2, '0')).join('')

      const r = await fetch(`${BASE}/rest/v1/rpc/vote_event`, {
        method: 'POST',
        headers: WH,
        body: JSON.stringify({ p_event_id: seg[0], p_ip_hash: ipHash, p_direction: body.direction }),
      })
      const d = await r.json()
      if (!r.ok) return err(d?.message ?? JSON.stringify(d), 500)
      if (!d.ok) return err(d.error, d.error === 'already_voted' ? 409 : 400)
      return json({ ok: true, switched: d.switched ?? false, direction: d.direction })
    }

    if (req.method === 'POST' && seg.length === 2 && seg[1] === 'report') {
      const body = await req.json()
      if (!body.reason?.trim()) return err('Reason is required')

      const r = await fetch(`${rest}/reports`, {
        method: 'POST',
        headers: { ...WH, Prefer: 'return=minimal' },
        body: JSON.stringify({ event_id: seg[0], reason: body.reason.trim() }),
      })
      if (!r.ok) { const rd = await r.json(); return err(rd?.message ?? JSON.stringify(rd), 500) }
      return json({ ok: true })
    }

  } catch (e) {
    console.error('[events]', e)
    return err(String(e), 500)
  }

  return err('Not found', 404)
})
