import moneyManagerPreset from '@money-manager/tailwind-preset';

/** @type {import('tailwindcss').Config} */
export default {
  presets: [moneyManagerPreset],
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    ...(moneyManagerPreset.content || [])
  ]
};
