export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f4f8ff',
          500: '#5b7cff',
          600: '#375ce6'
        }
      },
      boxShadow: {
        soft: '0 20px 45px -24px rgba(15, 23, 42, 0.35)'
      }
    }
  },
  plugins: []
};
