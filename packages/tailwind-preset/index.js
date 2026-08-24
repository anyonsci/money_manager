/** @type {import('tailwindcss').Config} */
const moneyManagerPreset = {
  content: [
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
    '../../packages/core/src/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        slate: {
          925: '#090d16',
          950: '#020617',
        }
      },
      boxShadow: {
        soft: '0 20px 45px -24px rgba(15, 23, 42, 0.35)',
        glow: '0 0 25px -5px rgba(99, 102, 241, 0.25)'
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica',
          'Arial',
          'sans-serif'
        ]
      }
    }
  },
  plugins: []
};

export default moneyManagerPreset;
