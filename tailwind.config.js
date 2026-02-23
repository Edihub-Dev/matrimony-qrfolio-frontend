// tailwind.config.js
const defaultTheme = require('tailwindcss/defaultTheme')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"DM Sans"', ...defaultTheme.fontFamily.sans],
        heading: ['Inter', ...defaultTheme.fontFamily.sans],
      },
      fontSize: {
        h1: ['88px', { lineHeight: '98px' }],
        h2: ['72px', { lineHeight: '82px' }],
        h3: ['40px', { lineHeight: '50px' }],
        body: ['24px', { lineHeight: '34px' }],
        bodyHeadline: ['24px', { lineHeight: '34px' }],
      },
    }
  },
  plugins: [],
};
