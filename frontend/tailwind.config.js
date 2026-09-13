/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2', // Deep Aquamarine Cyan
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
          950: '#082f49',
        },
        turquoise: {
          400: '#2DD4BF',
          500: '#14B8A6',
          600: '#0D9488',
        },
        darkbg: {
          DEFAULT: '#061723', // Deep Abyss Cyan
          card: '#0E2A35',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};






