/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      animation: {
        'slide-in': 'slideIn 0.5s ease-out',
      },
      keyframes: {
        slideIn: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      colors: {
        platinum: {
          DEFAULT: '#E7E9E5',
          100: '#2e322b',
          200: '#5d6455',
          300: '#8b9482',
          400: '#babfb4',
          500: '#e7e9e5',
          600: '#edeeeb',
          700: '#f1f2f0',
          800: '#f6f7f5',
          900: '#fafbfa'
        },
        ash_gray: {
          DEFAULT: '#B7C5C7',
          100: '#222a2b',
          200: '#435456',
          300: '#657d81',
          400: '#8da2a5',
          500: '#b7c5c7',
          600: '#c6d1d2',
          700: '#d4dcdd',
          800: '#e2e8e9',
          900: '#f1f3f4'
        },
        lapis_lazuli: {
          DEFAULT: '#005E84',
          100: '#00131b',
          200: '#002635',
          300: '#003950',
          400: '#004c6a',
          500: '#005e84',
          600: '#0095d0',
          700: '#1dbfff',
          800: '#68d4ff',
          900: '#b4eaff'
        },
        indigo_dye: {
          DEFAULT: '#075375',
          100: '#011017',
          200: '#03202e',
          300: '#043145',
          400: '#05415d',
          500: '#075375',
          600: '#0b85bd',
          700: '#23b1f2',
          800: '#6ccbf6',
          900: '#b6e5fb'
        },
        indigo_dye2: {
          DEFAULT: '#0A435C',
          100: '#020d12',
          200: '#041b25',
          300: '#062837',
          400: '#083649',
          500: '#0a435c',
          600: '#1279a5',
          700: '#23ace7',
          800: '#6cc8ef',
          900: '#b6e3f7'
        },
        hover_dark_blue: '#0d4a60',
        primary_blue: '#005E84',
        dark_teal_blue: '#0A435C',
        hover_blue: '#075375',
        hover_dark_blue_alt: '#0d4a60',
        gray: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          600: '#4B5563',
          700: '#374151'
        },
        teal: {
          DEFAULT: '#00AD9C',
          100: '#00322e',
          200: '#00645b',
          300: '#009788',
          400: '#00b8a8',
          500: '#00ad9c',
          600: '#33c2b3',
          700: '#66d6ca',
          800: '#99e9e0',
          900: '#ccf4f0'
        },
        white: '#FFFFFF'
      },
    },
  },
  plugins: [],
};