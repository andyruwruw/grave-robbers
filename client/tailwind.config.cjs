/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require('./src/styles/tailwind-preset.cjs')],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        pixel: ['"Press Start 2P"', 'monospace'],
      },
    },
  },
};
