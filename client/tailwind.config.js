/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#0066CC',
        secondary: '#00B4D8',
        accent: '#FF006E',
        medical: '#0077B6',
      },
      backgroundImage: {
        gradient1: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        gradient2: 'linear-gradient(135deg, #0077B6 0%, #00B4D8 100%)',
      }
    },
  },
  plugins: [],
};
