/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#01a3ea',
        secondary: '#8E33FF',
        info: '#00B8D9',
        success: '#22C55E',
        warning: '#FFAB00',
        error: '#FF5630',
      },
      fontSize: {
        mdLg: '1.045rem',
      },
      fontFamily: {
        'public-sans': [
          'Public Sans',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
          'Apple Color Emoji',
          'Segoe UI Emoji',
          'Segoe UI Symbol',
        ],
        Poppins: ['Poppins', 'sans-serif'],
        Inter: ['Inter', 'sans-serif'],
        InterStatic: ['InterStatic', 'sans-serif'],
      },
      textShadow: {
        sm: '1px 1px 2px rgba(0, 0, 0, 0.25)',
        DEFAULT: '2px 2px 4px rgba(0, 0, 0, 0.3)',
        lg: '4px 4px 8px rgba(0, 0, 0, 0.4)',
      },
    },
  },
  prefix: 'tw-',
  plugins: [
    function ({ addUtilities }) {
      const newUtilities = {
        '.text-shadow-sm': {
          'text-shadow': '1px 1px 2px rgba(0, 0, 0, 0.25)',
        },
        '.text-shadow': {
          'text-shadow': '2px 2px 4px rgba(0, 0, 0, 0.3)',
        },
        '.text-shadow-lg': {
          'text-shadow': '4px 4px 8px rgba(0, 0, 0, 0.4)',
        },
        '.text-outline': {
          '-webkit-text-stroke': '1px black' /* Outline thickness and color */,
        },
        '.text-outline-md': {
          '-webkit-text-stroke': '1.2px #0f172a',
        },
        '.text-outline-lg': {
          '-webkit-text-stroke': '3px black',
        },
        '.text-outline-white': {
          '-webkit-text-stroke': '1px white' /* Outline thickness and color */,
        },
        '.text-outline-md': {
          '-webkit-text-stroke': '1.2px #0f172a',
        },
        '.text-outline-lg': {
          '-webkit-text-stroke': '3px white',
        },
      };
      addUtilities(newUtilities);
    },
  ],
};
