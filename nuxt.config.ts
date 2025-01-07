// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	compatibilityDate: "2024-11-01",
	devtools: { enabled: true },
	modules: ["@nuxt/eslint", "@vueuse/nuxt", "radix-vue/nuxt"],

	app: {
		head: {
			title: "soundingboard",
			viewport: [
				["width", "device-width"],
				["initial-scale", "1.0"],
				["viewport-fit", "cover"],
				["maximum-scale", "1.0"],
				["user-scalable", "no"],
			]
				.map(([key, value]) => `${key}=${value}`)
				.join(", "),
		},
	},

	vite: {
		css: {
			preprocessorOptions: {
				scss: {
					api: "modern-compiler",
				},
			},
		},
	},

	nitro: {
		experimental: {
			websocket: true,
		},
	},
})
