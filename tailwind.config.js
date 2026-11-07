/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          light: '#f7d070',
          DEFAULT: '#d4af37',
          dark: '#aa820a',
        },
        royal: {
          maroon: '#4a0e17',
          crimson: '#721c24',
          night: '#0a0709',
        }
      },
      fontFamily: {
        cinzel: ['Cinzel', 'serif'],
        cinzelDecorative: ['"Cinzel Decorative"', 'serif'],
        cormorant: ['Cormorant Garamond', 'serif'],
        greatVibes: ['"Great Vibes"', 'cursive'],
        'great-vibes': ['"Great Vibes"', 'cursive'],
        script: ['"Great Vibes"', 'cursive'],
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

