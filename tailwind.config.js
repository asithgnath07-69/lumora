/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        body: ['"DM Sans"', 'sans-serif'],
      },
      colors: {
        lumora: {
          50:  '#fdf4ff',
          100: '#f9e8ff',
          200: '#f3d0fe',
          300: '#e9adfd',
          400: '#d87dfb',
          500: '#c44ff4',
          600: '#a832d8',
          700: '#8c25b3',
          800: '#741f93',
          900: '#611c78',
        },
        blush: {
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f9a8d4',
          400: '#f472b6',
        },
        lavender: {
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
        }
      },
      backgroundImage: {
        'lumora-gradient': 'linear-gradient(135deg, #fce7f3 0%, #ede9fe 50%, #e0e7ff 100%)',
        'card-gradient': 'linear-gradient(145deg, rgba(255,255,255,0.9), rgba(255,255,255,0.6))',
        'hero-gradient': 'radial-gradient(ellipse at top, #f9e8ff 0%, #fce7f3 40%, #e0e7ff 100%)',
      },
      boxShadow: {
        'lumora': '0 8px 32px rgba(196, 79, 244, 0.15)',
        'lumora-lg': '0 16px 64px rgba(196, 79, 244, 0.2)',
        'glass': '0 4px 24px rgba(196, 79, 244, 0.1), inset 0 1px 0 rgba(255,255,255,0.8)',
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
