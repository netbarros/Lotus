import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

/**
 * Vitest Configuration - Sofia AI Workspace
 * Extends root configuration with workspace-specific settings
 */
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      lines: 80,
      functions: 80,
      branches: 75,
      statements: 80,
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.config.{js,ts}',
        '**/*.d.ts',
        '**/types/**',
      ],
    },
    globals: true,
    environment: 'node',
    testTimeout: 10000,
    setupFiles: [resolve(__dirname, './src/test-setup.ts')],
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});
