/** @type {import('tailwindcss').Config} */

module.exports = {

  content: [

    "./src/**/*.{js,jsx,ts,tsx}",

  ],

  theme: {

    extend: {
      keyframes: {
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        shadowPulse: {
          '0%, 100%': { boxShadow: '0 0 10px 1px #a71f66' },
          '50%': { boxShadow: '0 0 10px 2px #a71f66' },
        },
      },
      animation: {
        blink: 'blink 1.5s infinite',
        'shadow-pulse': 'shadowPulse 1.5s ease-in-out infinite',
      },
      colors: {
        'custom-red': 'rgba(231, 6, 84, 1)',
        'custom-orange': 'rgba(255, 178, 0, 1)',
        'dark-bg': '#0a0a15',
        'dark-bg-secondary': 'rgba(0,0,0, 0.1)',
        'dark-bg-tertiary': '#151525',
        'pink-primary': '#E70654',
        'green-action': '#19BC54',
        'dark-blue': '#0f1a3f',
        'dark-blue-alt': '#0a0f2a',
        'light-bg-secondary': 'rgba(255, 255, 255, 0.1)',
        gray: {
          200: 'rgba(255, 255, 255, 0.15)', // Override gray-200 for dark theme
        }
      },
    },

  },

  plugins: [],

}
