/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        primary: {
          50: '#E8F8F6',
          100: '#D1F1ED',
          200: '#A3E3DB',
          300: '#75D5C9',
          400: '#4ECDC4',
          500: '#3DB8AF',
          600: '#30948C',
          700: '#237069',
          800: '#164C47',
          900: '#0B2623',
        },
        accent: {
          50: '#FFF0F0',
          100: '#FFE0E0',
          200: '#FFC1C1',
          300: '#FFA2A2',
          400: '#FF8383',
          500: '#FF6B6B',
          600: '#E85555',
          700: '#B84444',
          800: '#883333',
          900: '#582222',
        },
        ink: {
          50: '#F5F7F9',
          100: '#EAEDEF',
          200: '#D5DCE1',
          300: '#C0CAD2',
          400: '#ABB8C3',
          500: '#2C3E50',
          600: '#263545',
          700: '#1F2C38',
          800: '#18222B',
          900: '#10151D',
        },
        warm: {
          50: '#FDFCFA',
          100: '#FAFAF7',
          200: '#F3F1EB',
          300: '#EBE8DF',
          400: '#E4DFD3',
        }
      },
      fontFamily: {
        sans: ['"Noto Sans SC"', 'system-ui', 'sans-serif'],
        display: ['"Noto Sans SC"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(44, 62, 80, 0.06)',
        'card': '0 4px 20px rgba(44, 62, 80, 0.08)',
        'glow': '0 0 20px rgba(78, 205, 196, 0.3)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-soft': 'bounce-soft 2s ease-in-out infinite',
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'breath': 'breath 4s ease-in-out infinite',
      },
      keyframes: {
        'bounce-soft': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'fadeIn': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slideUp': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scaleIn': {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'breath': {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.05)', opacity: '0.85' },
        },
      },
    },
  },
  plugins: [],
};
