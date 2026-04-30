/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#0f172a',
          green: '#16a34a',
          amber: '#f59e0b',
          red: '#dc2626',
          blue: '#0ea5e9'
        }
      }
    }
  },
  plugins: []
};
