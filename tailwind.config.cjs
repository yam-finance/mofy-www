module.exports = {
	mode: 'jit',
	purge: ['./src/**/*.{html,js,svelte,ts}'],
	darkMode: 'media', // or 'media' or 'class'
	theme: {
		screens: {
			sm: { max: '639px' },
			md: { max: '767px' },
			lg: { max: '1023px' },
			xl: { max: '1279px' }
		},
		backgroundColor: (theme) => ({
			...theme('colors'),
			gray: '#A5A5A5'
		}),
		extend: {}
	},
	variants: {
		extend: {}
	},
	plugins: [require('@tailwindcss/aspect-ratio'), require('@tailwindcss/forms')]
};
