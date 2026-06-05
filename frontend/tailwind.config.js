/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#eef4ff',
          100: '#dae6ff',
          500: '#3b6cff',
          600: '#2d57e0',
          700: '#2547b8',
        },
      },
    },
  },
  plugins: [],
}
