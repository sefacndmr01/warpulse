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

  try {

    if (req.method === 'GET') {
      const eventId = new URL(req.url).searchParams.get('eventId')
      if (!eventId) return err('eventId query param required')

      const r = await fetch(
        `${rest}/discussions?event_id=eq.${eventId}&status=eq.approved`,
        { headers: RH },
      )
      const d = await r.json()
      if (!r.ok) return err(d?.message ?? JSON.stringify(d), 500)
      d.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      return json(d)
    }

    if (req.method === 'POST') {
      const body = await req.json()
      if (!body.event_id)                              return err('event_id is required')
      if (!body.content?.trim())                       return err('content is required')
      if (body.content.trim().length < 3)              return err('Content too short')
      if (body.content.trim().length > 2000)           return err('Content too long')

      const r = await fetch(`${rest}/discussions`, {
        method: 'POST',
        headers: { ...WH, Prefer: 'return=representation' },
        body: JSON.stringify({ event_id: body.event_id, content: body.content.trim(), status: 'pending' }),
      })
      const d = await r.json()
      if (!r.ok) return err(d?.message ?? JSON.stringify(d), 500)
      const created = Array.isArray(d) ? d[0] : d
      return json({ id: created.id, status: created.status })
    }

  } catch (e) {
    console.error('[discussions]', e)
    return err(String(e), 500)
  }

  return err('Not found', 404)
})
