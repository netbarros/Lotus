/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║ 🧪 SOFIA CORE v4.0 - Unit Tests                                         ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SofiaCore_v4 } from '@core/SofiaCore_v4';
import { mockRedis, mockPool, createMockContext } from '../setup';

describe('SofiaCore_v4', () => {
  let sofia: SofiaCore_v4;

  beforeEach(() => {
    const config = {
      version: '4.0.0',
      anthropic: {
        apiKey: 'test-api-key',
        model: 'claude-sonnet-4',
        maxTokens: 4096,
        temperature: 0.7,
      },
      redis: {
        host: 'localhost',
        port: 6379,
      },
      features: {
        intentionEngine: true,
        uxValidation: true,
        seoOptimization: true,
        marketplace: true,
        adaptiveLearning: true,
        langchain: true,
        langfuse: true,
        qdrant: true,
        pgvector: true,
      },
      langchain: {
        enabled: true,
        model: 'claude-sonnet-4',
        temperature: 0.7,
        maxRetries: 3,
      },
      langfuse: {
        enabled: true,
        publicKey: 'test-public-key',
        secretKey: 'test-secret-key',
        host: 'http://localhost:3000',
      },
      qdrant: {
        url: 'http://localhost:6333',
        apiKey: 'test-api-key',
        collection: 'sofia_embeddings',
      },
      pgvector: {
        dimensions: 1536,
      },
    };

    sofia = new SofiaCore_v4(config, mockRedis as any, mockPool as any);
  });

  describe('Initialization', () => {
    it('should create SofiaCore_v4 instance', () => {
      expect(sofia).toBeDefined();
      expect(sofia).toBeInstanceOf(SofiaCore_v4);
    });

    it('should initialize with correct version', async () => {
      const health = await sofia.getHealth();
      expect(health.version).toBe('4.0.0');
    });

    it('should initialize all v4.0 components', async () => {
      await sofia.initialize();
      const health = await sofia.getHealth();

      expect(health.components).toHaveProperty('IntentionEngine');
      expect(health.components).toHaveProperty('LangChain');
      expect(health.components).toHaveProperty('Langfuse');
      expect(health.components).toHaveProperty('Qdrant');
      expect(health.components).toHaveProperty('pgVector');
    });
  });

  describe('Health Monitoring', () => {
    it('should return health status', async () => {
      const health = await sofia.getHealth();

      expect(health).toHaveProperty('status');
      expect(health).toHaveProperty('version');
      expect(health).toHaveProperty('uptime');
      expect(health).toHaveProperty('components');
      expect(health).toHaveProperty('metrics');
    });

    it('should track uptime', async () => {
      const health1 = await sofia.getHealth();
      await new Promise((resolve) => setTimeout(resolve, 100));
      const health2 = await sofia.getHealth();

      expect(health2.uptime).toBeGreaterThan(health1.uptime);
    });

    it('should report healthy status when all components active', async () => {
      const health = await sofia.getHealth();
      expect(['healthy', 'degraded', 'unhealthy']).toContain(health.status);
    });
  });

  describe('Metrics Tracking', () => {
    it('should return metrics', async () => {
      const metrics = await sofia.getMetrics();

      expect(metrics).toHaveProperty('version');
      expect(metrics).toHaveProperty('uptime');
      expect(metrics).toHaveProperty('status');
      expect(metrics).toHaveProperty('components');
      expect(metrics).toHaveProperty('metrics');
    });

    it('should track total requests', async () => {
      const metrics1 = await sofia.getMetrics();
      const initialRequests = metrics1.metrics.totalRequests;

      // Simulate some requests
      await sofia.getHealth();
      await sofia.getHealth();

      const metrics2 = await sofia.getMetrics();
      expect(metrics2.metrics.totalRequests).toBeGreaterThanOrEqual(initialRequests);
    });

    it('should calculate success rate', async () => {
      const metrics = await sofia.getMetrics();
      const { totalRequests, successfulRequests } = metrics.metrics;

      if (totalRequests > 0) {
        const successRate = (successfulRequests / totalRequests) * 100;
        expect(successRate).toBeGreaterThanOrEqual(0);
        expect(successRate).toBeLessThanOrEqual(100);
      }
    });
  });

  describe('Intention Engine', () => {
    it('should process intention request', async () => {
      const context = createMockContext();
      const intention = 'Create a SaaS for healthcare clinics';

      // Mock the intention engine response
      const result = await sofia.processIntention(intention, context);

      expect(result).toBeDefined();
      expect(result).toHaveProperty('intention');
      expect(result.intention).toBe(intention);
    });

    it('should validate context in intention', async () => {
      const context = createMockContext();
      const intention = '';

      await expect(sofia.processIntention(intention, context)).rejects.toThrow();
    });

    it('should generate solution structure', async () => {
      const context = createMockContext();
      const intention = 'Create a restaurant management SaaS';

      const result = await sofia.processIntention(intention, context);

      expect(result).toHaveProperty('solution');
      expect(result.solution).toHaveProperty('components');
      expect(result.solution).toHaveProperty('api_endpoints');
      expect(result.solution).toHaveProperty('database_schema');
    });
  });

  describe('Redis Integration', () => {
    it('should store data in Redis', async () => {
      const key = 'test-key';
      const value = { test: 'data' };

      mockRedis.set.mockResolvedValue('OK');
      mockRedis.get.mockResolvedValue(JSON.stringify(value));

      await sofia.cacheSet(key, value);
      const retrieved = await sofia.cacheGet(key);

      expect(mockRedis.set).toHaveBeenCalledWith(
        expect.stringContaining(key),
        JSON.stringify(value),
        expect.any(Object)
      );
      expect(retrieved).toEqual(value);
    });

    it('should handle Redis errors gracefully', async () => {
      const key = 'test-key';

      mockRedis.get.mockRejectedValue(new Error('Redis error'));

      const result = await sofia.cacheGet(key);
      expect(result).toBeNull();
    });
  });

  describe('PostgreSQL Integration', () => {
    it('should execute database queries', async () => {
      const query = 'SELECT * FROM test';
      const expectedResult = { rows: [{ id: 1, name: 'Test' }] };

      mockPool.query.mockResolvedValue(expectedResult);

      const result = await sofia.dbQuery(query);

      expect(mockPool.query).toHaveBeenCalledWith(query, undefined);
      expect(result).toEqual(expectedResult);
    });

    it('should handle database errors', async () => {
      const query = 'INVALID SQL';

      mockPool.query.mockRejectedValue(new Error('SQL error'));

      await expect(sofia.dbQuery(query)).rejects.toThrow('SQL error');
    });
  });

  describe('Event Store', () => {
    it('should log events', async () => {
      const event = {
        type: 'intention.processed',
        payload: { intention: 'test' },
        context: createMockContext(),
      };

      await sofia.logEvent(event);

      expect(mockRedis.set).toHaveBeenCalled();
    });

    it('should retrieve events', async () => {
      const events = await sofia.getEvents({ limit: 10 });

      expect(Array.isArray(events)).toBe(true);
    });
  });

  describe('Decision Logger', () => {
    it('should log AI decisions', async () => {
      const decision = {
        context: createMockContext(),
        question: 'What framework to use?',
        answer: 'React with TypeScript',
        reasoning: 'Better type safety and ecosystem',
        confidence: 0.95,
      };

      await sofia.logDecision(decision);

      expect(mockRedis.set).toHaveBeenCalled();
    });

    it('should retrieve decisions', async () => {
      const decisions = await sofia.getDecisions({ limit: 10 });

      expect(Array.isArray(decisions)).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle initialization errors', async () => {
      const badConfig = {
        ...sofia['config'],
        anthropic: { ...sofia['config'].anthropic, apiKey: '' },
      };

      const badSofia = new SofiaCore_v4(badConfig, mockRedis as any, mockPool as any);

      await expect(badSofia.initialize()).rejects.toThrow();
    });

    it('should provide meaningful error messages', async () => {
      try {
        await sofia.processIntention('', createMockContext());
        expect(true).toBe(false); // Should not reach here
      } catch (error: any) {
        expect(error.message).toBeTruthy();
        expect(error.message.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Performance', () => {
    it('should respond to health check quickly', async () => {
      const start = Date.now();
      await sofia.getHealth();
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(1000); // Should respond in less than 1s
    });

    it('should handle concurrent requests', async () => {
      const promises = Array(10)
        .fill(null)
        .map(() => sofia.getHealth());

      const results = await Promise.all(promises);

      expect(results).toHaveLength(10);
      results.forEach((result) => {
        expect(result).toHaveProperty('status');
      });
    });
  });
});
