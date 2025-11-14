/**
 * 🧪 ERP - TEST SETUP
 * Global test configuration and mocks
 */

import { beforeAll, afterAll, beforeEach, afterEach, vi } from 'vitest';
import { config } from 'dotenv';

config({ path: '.env.test' });

export const mockRedis = {
  get: vi.fn(),
  set: vi.fn(),
  setex: vi.fn(),
  del: vi.fn(),
  ping: vi.fn().mockResolvedValue('PONG'),
  quit: vi.fn(),
};

export const mockPool = {
  query: vi.fn(),
  connect: vi.fn(),
  end: vi.fn(),
};

beforeAll(() => {
  console.log('🧪 Starting ERP test suite...');
});

afterAll(() => {
  console.log('✅ ERP test suite completed');
});

beforeEach(() => {
  vi.clearAllMocks();
});

export const testUtils = {
  createMockTransaction: () => ({
    id: 'test-transaction-id',
    type: 'income' as const,
    amount: 5000,
    description: 'Test transaction',
    category: 'sales',
    date: new Date(),
    created_at: new Date(),
  }),

  createMockInventoryItem: () => ({
    id: 'test-item-id',
    sku: 'TEST-001',
    name: 'Test Product',
    quantity: 100,
    unit: 'un',
    costPrice: 50,
    retailPrice: 99.9,
    status: 'in_stock' as const,
    created_at: new Date(),
  }),

  createMockEmployee: () => ({
    id: 'test-employee-id',
    name: 'Test Employee',
    email: 'employee@test.com',
    department: 'Sales',
    position: 'Sales Rep',
    salary: 5000,
    hireDate: new Date(),
    status: 'active' as const,
    created_at: new Date(),
  }),
};
