/**
 * 🧪 MARKETING AI - TEST SETUP
 * Global test configuration and mocks
 */

import { beforeAll, afterAll, beforeEach, afterEach, vi } from 'vitest';
import { config } from 'dotenv';

// Load test environment variables
config({ path: '.env.test' });

// Mock Redis
export const mockRedis = {
  get: vi.fn(),
  set: vi.fn(),
  setex: vi.fn(),
  del: vi.fn(),
  expire: vi.fn(),
  incr: vi.fn(),
  exists: vi.fn(),
  ping: vi.fn().mockResolvedValue('PONG'),
  quit: vi.fn(),
  disconnect: vi.fn(),
};

// Mock PostgreSQL Pool
export const mockPool = {
  query: vi.fn(),
  connect: vi.fn(),
  end: vi.fn(),
};

// Mock LangChain Service
export const mockLangChain = {
  processIntention: vi.fn(),
  getStatus: vi.fn().mockResolvedValue({ status: 'healthy' }),
  initialize: vi.fn(),
};

// Mock Langfuse Service
export const mockLangfuse = {
  logDecision: vi.fn(),
  logEvent: vi.fn(),
  getAnalytics: vi.fn(),
  initialize: vi.fn(),
};

// Mock Qdrant Service
export const mockQdrant = {
  search: vi.fn(),
  insert: vi.fn(),
  delete: vi.fn(),
  initialize: vi.fn(),
};

// Global test lifecycle hooks
beforeAll(() => {
  console.log('🧪 Starting Marketing AI test suite...');
});

afterAll(() => {
  console.log('✅ Marketing AI test suite completed');
});

beforeEach(() => {
  // Clear all mocks before each test
  vi.clearAllMocks();
});

afterEach(() => {
  // Cleanup after each test if needed
});

// Export test utilities
export const testUtils = {
  createMockCampaign: () => ({
    id: 'test-campaign-id',
    name: 'Test Campaign',
    type: 'email' as const,
    status: 'draft' as const,
    objective: 'Test objective',
    targetAudience: { segments: ['test'] },
    sofia_generated: true,
    created_at: new Date(),
    updated_at: new Date(),
  }),

  createMockLead: () => ({
    id: 'test-lead-id',
    email: 'test@example.com',
    name: 'Test Lead',
    source: 'linkedin',
    score: 75,
    stage: 'consideration' as const,
    created_at: new Date(),
    updated_at: new Date(),
  }),

  createMockContent: () => ({
    id: 'test-content-id',
    type: 'blog' as const,
    title: 'Test Blog Post',
    content: 'Test content here...',
    keywords: ['test', 'keyword'],
    sofia_generated: true,
    seo_score: 85,
    status: 'published' as const,
    created_at: new Date(),
    updated_at: new Date(),
  }),
};
