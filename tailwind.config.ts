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
          forest: '#1a3d2a',    // Vert forêt profond
          dark: '#2d1f1a',      // Brun très foncé (presque noir)
          brown: '#5c4033',     // Brun chaud
          sand: '#c4a57b',      // Sable/tan
          orange: '#d97706',    // Orange chasse (ambre-orange)
          slate: '#1f2937',     // Gris-noir anthracite
          cream: '#f5f1e8',     // Crème off-white
          gold: '#d4a574',      // Or/brass accent
        },
      },
      fontFamily: {
        display: ['Oswald', 'sans-serif'],
        heading: ['Bebas Neue', 'sans-serif'],
        sans: ['Inter', 'Roboto', 'sans-serif'],
      },
      spacing: {
        '128': '32rem',
      },
      backgroundImage: {
        'gradient-forest': 'linear-gradient(135deg, #1a3d2a 0%, #2d1f1a 100%)',
        'gradient-warm': 'linear-gradient(135deg, #5c4033 0%, #2d1f1a 100%)',
      },
    },
  },
  plugins: [],
};

export default config;
