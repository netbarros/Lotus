/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║ 🧪 TEST SETUP - Global test configuration                               ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

import { beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { config } from 'dotenv';

// Load test environment variables
config({ path: '.env.test' });

// Mock Redis client
export const mockRedis = {
  get: vi.fn(),
  set: vi.fn(),
  del: vi.fn(),
  expire: vi.fn(),
  incr: vi.fn(),
  exists: vi.fn(),
  ping: vi.fn().mockResolvedValue('PONG'),
  disconnect: vi.fn(),
};

// Mock PostgreSQL Pool
export const mockPool = {
  query: vi.fn(),
  connect: vi.fn(),
  end: vi.fn(),
};

// Global test hooks
beforeAll(async () => {
  console.log('🧪 Starting Sofia AI v4.0 Test Suite...');
});

afterAll(async () => {
  console.log('✅ Sofia AI v4.0 Test Suite Complete');
});

beforeEach(() => {
  // Clear all mocks before each test
  vi.clearAllMocks();
});

afterEach(() => {
  // Cleanup after each test
  vi.resetAllMocks();
});

// Global test utilities
export const createMockContext = (overrides = {}) => ({
  tenantId: 'test-tenant-123',
  userId: 'test-user-456',
  requestId: 'test-request-789',
  timestamp: new Date().toISOString(),
  ...overrides,
});

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockEnv = (overrides: Record<string, string> = {}) => {
  const originalEnv = { ...process.env };

  Object.assign(process.env, {
    REDIS_HOST: 'localhost',
    REDIS_PORT: '6379',
    POSTGRES_HOST: 'localhost',
    POSTGRES_PORT: '5432',
    POSTGRES_DB: 'test_db',
    ANTHROPIC_API_KEY: 'test-key',
    LANGCHAIN_API_KEY: 'test-key',
    LANGFUSE_PUBLIC_KEY: 'test-key',
    QDRANT_URL: 'http://localhost:6333',
    ...overrides,
  });

  return () => {
    process.env = originalEnv;
  };
};
