const path = require('node:path');

/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require('../../packages/ui/src/styles/tailwind-preset.cjs')],
  content: [
    path.join(__dirname, 'index.html'),
    path.join(__dirname, 'src/**/*.{ts,tsx}'),
    path.join(__dirname, '../../packages/*/src/**/*.{ts,tsx}'),
  ],
};
