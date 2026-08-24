import moneyManagerPreset from '@money-manager/tailwind-preset';

/** @type {import('tailwindcss').Config} */
export default {
  presets: [moneyManagerPreset],
  content: [
    './index.html',
    './**/*.{js,ts,jsx,tsx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
    '../../packages/core/src/**/*.{js,ts,jsx,tsx}'
  ]
};
