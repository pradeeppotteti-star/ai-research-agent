/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FDFCFB',
          100: '#FBF9F5', // Canvas background
          200: '#F5F1EA', // Card accent / hover
          300: '#EBE5DC',
          400: '#DFD8CC',
        },
        stone: {
          warm: {
            50: '#FAF8F5',
            100: '#F7F5F0',
            200: '#E8E2D8', // Subtle border
            300: '#D8D0C4', // Distinct border / divider
            400: '#B8AEA0',
            500: '#948B80', // Metadata / subtext
          },
        },
        walnut: {
          900: '#1E1C1A', // Headings / strong text
          800: '#2D2926',
          700: '#433E38', // Body text
          600: '#5C554E', // Secondary text
          500: '#766E65', // Muted text
        },
        oxford: {
          900: '#0F1D45',
          800: '#172E6F',
          700: '#1E3A8A', // Primary brand / button
          600: '#254DB3',
          500: '#3B69DE',
          100: '#EEF2FF', // Pill badge / soft accent
          50: '#F5F7FF',
        },
        amber: {
          warm: {
            50: '#FFFBEB',
            100: '#FEF3C7',
            600: '#D97706',
            700: '#B45309',
          },
        },
        blue: {
          50: '#EEF2FF',
          100: '#DBEAFE',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1E3A8A',
          800: '#172E6F',
          900: '#0F1D45',
        },
        brand: {
          50: '#FDFCFB',
          100: '#FBF9F5',
          200: '#E8E2D8',
          300: '#D8D0C4',
          400: '#948B80',
          500: '#766E65',
          600: '#433E38',
          700: '#2D2926',
          800: '#1E1C1A',
          900: '#1E1C1A',
          950: '#1E1C1A',
        },
        darkbg: {
          DEFAULT: '#FBF9F5',
          card: '#FFFFFF',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
};






