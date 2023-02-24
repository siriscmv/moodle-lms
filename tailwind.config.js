module.exports = {
	content: [
		'./src/pages/**/*.{js,ts,jsx,tsx}',
		'./src/components/**/*.{js,ts,jsx,tsx}',
		'./src/utils/**/*.{js,ts,jsx,tsx}'
	],
	theme: {
		extend: {
			colors: {
				slate: '#020202',
				primary: '#f7b317',
				primaryBg: '#4B3503',
				danger: '#f35966'
			}
		}
	},
	plugins: []
};
