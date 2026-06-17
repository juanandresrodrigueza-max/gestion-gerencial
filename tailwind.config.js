/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bs: {
          red:     '#e4003f',
          magenta: '#a42785',
          violet:  '#4f3089',
          lilac:   '#c5bcdd',
          gray:    '#d6d1ca',
        }
      },
      backgroundImage: {
        'bs-grad': 'linear-gradient(135deg, #e4003f 0%, #a42785 50%, #4f3089 100%)',
        'bs-grad-soft': 'linear-gradient(135deg, #fdf0f4 0%, #f5eef9 50%, #eeebf7 100%)',
      }
    },
  },
  plugins: [],
}
