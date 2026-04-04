/**
 * Configuration Vitest pour les tests Prix Essence
 */

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/modules/prix-essence/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/modules/prix-essence/**/*.test.ts',
      ],
    },
  },
});
