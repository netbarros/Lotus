import { defineConfig } from 'vitest/config';

/**
 * Vitest Configuration - MagicSaaS System-∞
 * Root configuration for all workspaces
 * Coverage target: 80% (enterprise standard)
 */
export default defineConfig({
  test: {
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      lines: 80,
      functions: 80,
      branches: 80,
      statements: 80,
      exclude: [
        'node_modules/',
        'dist/',
        'build/',
        '**/*.config.{js,ts}',
        '**/*.d.ts',
        '**/types/**',
        '**/__tests__/**',
        '**/*.test.ts',
        '**/*.spec.ts',
      ],
    },

    // Global test configuration
    globals: true,
    environment: 'node',

    // Test execution
    testTimeout: 10000,
    hookTimeout: 10000,
    teardownTimeout: 10000,
    isolate: true,

    // Reporters
    reporters: ['verbose', 'html', 'json'],
    outputFile: {
      html: './coverage/test-results.html',
      json: './coverage/test-results.json',
    },

    // Watch mode
    watch: false,

    // Include/Exclude patterns
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: ['node_modules', 'dist', 'build', '.next', 'coverage'],
  },
});
