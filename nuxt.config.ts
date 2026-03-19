const SITE_URL = 'https://warpulse.news'
const SITE_NAME = 'Warpulse'
const SITE_DESC = 'Track the Iran-Israel war live. Real-time airstrikes, missile launches, and military operations on an interactive world map. AI-verified reports, anonymous submissions.'
const OG_IMAGE = `${SITE_URL}/og.svg`

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
		url: process.env.SUPABASE_URL ?? 'https://api.warpulse.news',
		key: process.env.SUPABASE_ANON_KEY,
	},

	runtimeConfig: {
		public: {
			supabaseUrl: process.env.SUPABASE_URL ?? '',
			supabaseAnonKey: process.env.SUPABASE_ANON_KEY ?? '',
			siteUrl: SITE_URL,
		},
	},

	app: {
		head: {
			titleTemplate: `%s — ${SITE_NAME}`,
			title: `${SITE_NAME} — Real-time Conflict Intelligence`,
			charset: 'utf-8',
			meta: [
				{ name: 'viewport', content: 'width=device-width, initial-scale=1' },
				{ name: 'description', content: SITE_DESC },
				{ name: 'keywords', content: 'iran israel war, iran war 2026, iran war map, iran israel conflict, iran war news realtime, airstrikes tracker, missile attack live, middle east conflict 2026, operation midnight hammer, tehran airstrikes, iran nuclear, war event tracker, conflict map, realtime war news, israel iran war live' },
				{ name: 'author', content: SITE_NAME },
				{ name: 'robots', content: 'index, follow' },
				{ name: 'theme-color', content: '#0f0e0b' },
				{ name: 'msapplication-TileColor', content: '#0f0e0b' },
				{ name: 'msapplication-config', content: '/browserconfig.xml' },
				{ name: 'apple-mobile-web-app-capable', content: 'yes' },
				{ name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
				{ name: 'apple-mobile-web-app-title', content: SITE_NAME },
				{ name: 'application-name', content: SITE_NAME },
				{ property: 'og:type', content: 'website' },
				{ property: 'og:site_name', content: SITE_NAME },
				{ property: 'og:title', content: `${SITE_NAME} — Real-time Conflict Intelligence` },
				{ property: 'og:description', content: SITE_DESC },
				{ property: 'og:image', content: OG_IMAGE },
				{ property: 'og:image:width', content: '1200' },
				{ property: 'og:image:height', content: '630' },
				{ property: 'og:image:type', content: 'image/svg+xml' },
				{ property: 'og:url', content: SITE_URL },
				{ name: 'twitter:card', content: 'summary_large_image' },
				{ name: 'twitter:site', content: '@warpulse' },
				{ name: 'twitter:title', content: `${SITE_NAME} — Real-time Conflict Intelligence` },
				{ name: 'twitter:description', content: SITE_DESC },
				{ name: 'twitter:image', content: OG_IMAGE },
			],
			link: [
				{ rel: 'icon', href: '/favicon.ico', sizes: '32x32' },
				{ rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
				{ rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
				{ rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
				{ rel: 'manifest', href: '/site.webmanifest' },
				{ rel: 'canonical', href: SITE_URL },
				{ rel: 'stylesheet', href: 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css', crossorigin: '' },
			],
		},
	},

	css: ['~/assets/css/main.css'],

	nitro: {
		preset: 'vercel',
	},
})
