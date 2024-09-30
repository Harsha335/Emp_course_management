/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#1E90FF',
          DEFAULT: '#006bdd',
        },
        secondary: {
          light: '#F0F0F0',
          DEFAULT: '#D3D3D3',
        },
        accent: {
          light: '#2C3E50',
          DEFAULT: '#34495E',
        },
        success: {
          light: '#28A745',
          DEFAULT: '#2ECC71',
        },
        warning: {
          light: '#FFC107',
          DEFAULT: '#F1C40F',
        },
        error: {
          light: '#DC3545',
          DEFAULT: '#E74C3C',
        },
      },
    },
  },
  plugins: [],
}