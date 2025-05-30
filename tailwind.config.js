import { tokens } from './src/styles/tokens';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: tokens.colors,
      spacing: tokens.spacing,
      fontFamily: tokens.typography.fontFamily,
      fontSize: tokens.typography.fontSize,
      fontWeight: tokens.typography.fontWeight,
      lineHeight: tokens.typography.lineHeight,
      borderRadius: tokens.borderRadius,
      boxShadow: tokens.shadows,
      transitionProperty: {
        height: 'height',
        spacing: 'margin, padding',
      },
      transitionTimingFunction: {
        'in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      transitionDuration: {
        DEFAULT: '150ms',
        fast: '100ms',
        slow: '300ms',
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};