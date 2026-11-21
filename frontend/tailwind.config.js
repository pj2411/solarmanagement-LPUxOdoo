/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
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
        borderSubtle: 'var(--border-subtle)',
        borderStrong: 'var(--border-strong)',
        brand: {
          DEFAULT: '#C53B3B',
          hover: '#B33434',
          surface: '#FDF2F2',
          border: '#F87171',
          darkSurface: '#2A1818'
        },
        solar: {
          50: '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#facc15',
          500: '#eab308',
          600: '#ca8a04',
          700: '#a16207',
          800: '#854d0e',
          900: '#713f12',
        }
      }
    },
  },
  plugins: [],
}
