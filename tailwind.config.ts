import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: { 50: '#fef7ed', 500: '#f97316', 600: '#ea580c' },
      },
    },
  },
  plugins: [],
};

export default config;
