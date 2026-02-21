/** @type {import('tailwindcss').Config} */

module.exports = {

  content: [

    "./src/**/*.{js,jsx,ts,tsx}",

  ],

  theme: {

    extend: {
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
        gray: {
          200: 'rgba(255, 255, 255, 0.15)', // Override gray-200 for dark theme
        }
      },
    },

  },

  plugins: [],

}
