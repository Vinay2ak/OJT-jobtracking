import colors from 'tailwindcss/colors'

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        blue: colors.emerald,
        purple: colors.emerald,
        indigo: colors.emerald,
      }
    },
  },
  plugins: [],
}
