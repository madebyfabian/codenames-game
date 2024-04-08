// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	devtools: {
		enabled: true,
	},

	routeRules: {
		'/game/*': {
			ssr: false,
		},
	},

	modules: ['@nuxtjs/supabase', '@nuxtjs/tailwindcss'],

	supabase: {
		url: process.env.NUXT_PUBLIC_SUPABASE_URL,
		key: process.env.NUXT_PUBLIC_SUPABASE_KEY,
		redirect: false,
	},
})
