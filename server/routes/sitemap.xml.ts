export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Content-Type', 'application/xml; charset=utf-8')
  setResponseHeader(event, 'Cache-Control', 'public, max-age=3600, s-maxage=3600')

  const config = useRuntimeConfig()
  const BASE = 'https://warpulse.news'

  const supabaseUrl = config.public.supabaseUrl || process.env.SUPABASE_URL || ''
  const supabaseKey = config.public.supabaseAnonKey || process.env.SUPABASE_ANON_KEY || ''

  interface EventRow { id: string; updated_at: string }
  let events: EventRow[] = []

  if (supabaseUrl && supabaseKey) {
    try {
      events = await $fetch<EventRow[]>(
        `${supabaseUrl}/rest/v1/events?select=id,updated_at&status=eq.approved&order=created_at.desc&limit=500`,
        { headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` } },
      )
    } catch {}
  }

  const staticPages = [
    { loc: `${BASE}/`,       priority: '1.0', changefreq: 'hourly'  },
    { loc: `${BASE}/map`,    priority: '1.0', changefreq: 'hourly'  },
    { loc: `${BASE}/archive`,priority: '0.8', changefreq: 'hourly'  },
  ]

  const eventPages = events.map(e => ({
    loc:        `${BASE}/archive/${e.id}`,
    priority:   '0.7',
    changefreq: 'weekly',
    lastmod:    new Date(e.updated_at).toISOString(),
  }))

  const urlTags = [...staticPages, ...eventPages]
    .map(p => [
      '  <url>',
      `    <loc>${p.loc}</loc>`,
      `    <changefreq>${p.changefreq}</changefreq>`,
      `    <priority>${p.priority}</priority>`,
      'lastmod' in p ? `    <lastmod>${p.lastmod}</lastmod>` : '',
      '  </url>',
    ].filter(Boolean).join('\n'))
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${urlTags}
</urlset>`
})
