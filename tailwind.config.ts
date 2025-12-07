/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        hunting: {
          dark: '#3D2817',      // Brun foncé
          light: '#6B4423',     // Brun clair
          kaki: '#8B9467',      // Kaki/vert forêt
          orange: '#FF8C00',    // Orange chasse
          accent: '#D4A373',    // Beige/accentuation
          slate: '#2C2C2C',     // Noir/gris foncé
        },
      },
      fontFamily: {
        serif: ['Georgia', 'serif'],
        sans: ['system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
