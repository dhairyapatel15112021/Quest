/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        shimmer: {
          '0%': {
            backgroundPosition: '-700px 0'
          },
          '100%': {
            backgroundPosition: '700px 0'
          }
        }
      },
      animation: {
        'shimmer': 'shimmer 2.5s infinite linear'
      }
    }
  },
  plugins: [],
} 