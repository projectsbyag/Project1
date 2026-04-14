/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './static/**/*.{js,jsx,ts,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#5D5CDE',
        primaryDark: '#4A49B0',
        primaryLight: '#8180E7',
      }
    }
  },
  plugins: [],
}
