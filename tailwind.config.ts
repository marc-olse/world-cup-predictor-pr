import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#16211f',
        turf: '#16784b',
        chalk: '#f7f8f3',
        gold: '#d9a441',
        ocean: '#0f5e78',
        coral: '#d95f4c',
      },
    },
  },
  plugins: [],
};

export default config;
