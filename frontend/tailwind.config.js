/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: 'var(--bg-canvas)',
        surface: 'var(--bg-surface)',
        elevated: 'var(--bg-elevated)',
        muted: 'var(--bg-muted)',
        heading: 'var(--text-heading)',
        body: 'var(--text-body)',
        subtle: 'var(--text-subtle)',
        stocksense: {
          50: '#FDF2F2',
          100: '#FDE8E8',
          200: '#FBD5D5',
          300: '#F8B4B4',
          400: '#F98080',
          500: '#C53B3B', // StockSense Crimson Red
          600: '#B33434',
          700: '#9B2C2C',
          800: '#7B2424',
          900: '#5F1D1D',
        },
        solar: {
          50: '#fdf2f2',
          100: '#fde8e8',
          200: '#fbd5d5',
          300: '#f8b4b4',
          400: '#f98080',
          500: '#c53b3b',
          600: '#b33434',
          700: '#9b2c2c',
          800: '#7b2424',
          900: '#5f1d1d',
        }
      }
    },
  },
  plugins: [],
}
