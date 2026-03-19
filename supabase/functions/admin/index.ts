// @ts-nocheck

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-admin-token',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { ...CORS, 'Content-Type': 'application/json' } })

const err = (msg, status = 400) => json({ error: msg }, status)

const hashPw = async (pw) => {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`warpulse:${pw}`))
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })

  const BASE = Deno.env.get('SUPABASE_URL')
  const KEY  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  const APWD = Deno.env.get('ADMIN_PASSWORD')
  if (!BASE || !KEY) return err('missing_env', 500)

  const H    = { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' }
  const rest = `${BASE}/rest/v1`
  const url  = new URL(req.url)
  const seg  = url.pathname.replace(/^(?:\/functions\/v1)?\/admin\/?/, '').split('/').filter(Boolean)

  try {

    if (req.method === 'POST' && seg[0] === 'login') {
      const body = await req.json()
      if (!APWD)                          return err('ADMIN_PASSWORD not configured', 500)
      if (String(body?.password) !== APWD) return err('Invalid password', 401)
      return json({ token: await hashPw(APWD) })
    }

    const token = req.headers.get('x-admin-token') ?? ''
    if (!APWD || token !== await hashPw(APWD)) return err('Unauthorized', 401)

    if (req.method === 'GET' && seg[0] === 'queue') {
      const [er, dr, rr] = await Promise.all([
        fetch(`${rest}/events?status=eq.pending&order=created_at.desc&limit=200`,                                              { headers: H }),
        fetch(`${rest}/discussions?status=eq.pending&order=created_at.desc&limit=200&select=id,event_id,content,status,created_at,events(title)`, { headers: H }),
        fetch(`${rest}/reports?status=eq.pending&order=created_at.desc&limit=200&select=id,event_id,reason,status,created_at,events(title)`,      { headers: H }),
      ])
      const [events, discussions, reports] = await Promise.all([er.json(), dr.json(), rr.json()])
      if (!er.ok) return err(events?.message ?? 'events fetch failed', 500)
      if (!dr.ok) return err(discussions?.message ?? 'discussions fetch failed', 500)
      if (!rr.ok) return err(reports?.message ?? 'reports fetch failed', 500)
      return json({ events, discussions, reports })
    }

    if (req.method === 'POST' && seg[0] === 'events' && seg[2]) {
      const status = seg[2] === 'approve' ? 'approved' : 'rejected'
      const r = await fetch(`${rest}/events?id=eq.${seg[1]}`, { method: 'PATCH', headers: { ...H, Prefer: 'return=minimal' }, body: JSON.stringify({ status }) })
      return r.ok ? json({ ok: true }) : err((await r.json())?.message ?? 'failed', 500)
    }

    if (req.method === 'POST' && seg[0] === 'discussions' && seg[2]) {
      const status = seg[2] === 'approve' ? 'approved' : 'rejected'
      const r = await fetch(`${rest}/discussions?id=eq.${seg[1]}`, { method: 'PATCH', headers: { ...H, Prefer: 'return=minimal' }, body: JSON.stringify({ status }) })
      return r.ok ? json({ ok: true }) : err((await r.json())?.message ?? 'failed', 500)
    }

    if (req.method === 'POST' && seg[0] === 'reports' && seg[2]) {
      const status = seg[2] === 'resolve' ? 'resolved' : 'dismissed'
      const r = await fetch(`${rest}/reports?id=eq.${seg[1]}`, { method: 'PATCH', headers: { ...H, Prefer: 'return=minimal' }, body: JSON.stringify({ status }) })
      return r.ok ? json({ ok: true }) : err((await r.json())?.message ?? 'failed', 500)
    }

  } catch (e) {
    console.error('[admin]', e)
    return err(String(e), 500)
  }

  return err('Not found', 404)
})
