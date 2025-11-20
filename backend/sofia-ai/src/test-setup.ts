/**
 * Vitest Test Setup
 * Global setup for all Sofia AI tests
 */

import { beforeAll, afterAll, vi } from 'vitest';

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.ANTHROPIC_API_KEY = 'test-key-12345';
process.env.DIRECTUS_URL = 'http://localhost:8055';
process.env.REDIS_URL = 'redis://localhost:6379';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';

// Mock external services
beforeAll(() => {
  // Setup mocks
  vi.mock('@anthropic-ai/sdk');
  vi.mock('ioredis');
});

afterAll(() => {
  // Cleanup
  vi.clearAllMocks();
});
