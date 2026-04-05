import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

export default defineConfig({
  site: 'https://prix-essence-quebec.pages.dev',
  integrations: [react()],
  output: 'static'
});