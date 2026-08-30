/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          DEFAULT: '#F9F6F0',
          50: '#FFFFFF',
          100: '#F9F6F0',
          200: '#F0EBE1',
        },
        rosegold: {
          DEFAULT: '#D4AF37',
          light: '#E6CA65',
          dark: '#B08E20',
        },
        emeraldsoft: {
          DEFAULT: '#2F5D62',
          light: '#3E777D',
          dark: '#1F3F43',
        },
        lavender: {
          DEFAULT: '#D8C3E5',
          light: '#EBE0F3',
          dark: '#BBA0CC',
        },
        slate: {
          dark: '#1E2A2F',
        },
        grey: {
          soft: '#8A8A8A',
          border: '#E8E4DE',
        },
        status: {
          green: '#3D9970',
          gold: '#E8B84B',
          blue: '#6C9BCF',
          coral: '#E86A5F',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Inter"', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px rgba(0, 0, 0, 0.06)',
        'luxury': '0 10px 30px rgba(47, 93, 98, 0.12)',
        'modal': '0 20px 50px rgba(30, 42, 47, 0.2)',
      }
    },
  },
  plugins: [],
}
