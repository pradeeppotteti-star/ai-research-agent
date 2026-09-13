/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#991b1b', // Deep University Crimson
          600: '#800020', // Harvard Crimson
          700: '#7f1d1d',
          800: '#651818',
          900: '#450a0a',
          950: '#2c0606',
        },
        bronze: {
          500: '#b45309',
          400: '#d97706',
          300: '#f59e0b',
        },
        darkbg: {
          DEFAULT: '#18181b', // Deep Espresso Charcoal
          card: '#27272a',
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


