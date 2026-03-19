export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  future: { compatibilityVersion: 4 },

  modules: ['@nuxtjs/tailwindcss', '@nuxtjs/supabase', 'nuxt-gtag'],

  gtag: {
    enabled: process.env.NODE_ENV === 'production',
    id: process.env.NUXT_PUBLIC_GTAG_ID,
  },

  supabase: {
    redirect: false,
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_ANON_KEY,
  },

  runtimeConfig: {
    public: {
      supabaseUrl:     process.env.SUPABASE_URL     ?? '',
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY ?? '',
    },
  },

  app: {
    head: {
      title: 'Warpulse',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Real-time war event tracking platform' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' },
        { rel: 'stylesheet', href: 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css', crossorigin: '' },
      ],
    },
  },

  css: ['~/assets/css/main.css'],

  nitro: {
    preset: 'vercel',
  },
})
