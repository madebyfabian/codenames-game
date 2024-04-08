import type { Config } from 'tailwindcss'

export default <Partial<Config>>{
	future: {
		hoverOnlyWhenSupported: true,
	},

	theme: {
		container: {
			center: true,
			padding: '1.5rem',
		},

		extend: {},
	},
}
