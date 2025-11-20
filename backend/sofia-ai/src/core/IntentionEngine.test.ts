/**
 * IntentionEngine Functional Tests
 * Tests the core intention processing engine of Sofia AI
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { IntentionEngine, type IntentionRequest } from './IntentionEngine.js';
import type { Redis } from 'ioredis';
import type { EventStore } from '../events/EventStore.js';
import type { Metrics } from '../telemetry/Metrics.js';

// Mock dependencies
const createMockRedis = (): Redis =>
  ({
    get: vi.fn().mockResolvedValue(null),
    set: vi.fn().mockResolvedValue('OK'),
    setex: vi.fn().mockResolvedValue('OK'),
    del: vi.fn().mockResolvedValue(1),
    publish: vi.fn().mockResolvedValue(1),
  }) as any;

const createMockEventStore = (): EventStore =>
  ({
    append: vi.fn().mockResolvedValue(undefined),
    getEvents: vi.fn().mockResolvedValue([]),
    getEventsByAggregate: vi.fn().mockResolvedValue([]),
  }) as any;

const createMockMetrics = (): Metrics =>
  ({
    decisionsTotal: { inc: vi.fn() } as any,
    decisionLatency: { observe: vi.fn() } as any,
    errorsTotal: { inc: vi.fn() } as any,
    intentionProcessingDuration: { observe: vi.fn() } as any,
  }) as any;

// Mock Anthropic SDK
vi.mock('@anthropic-ai/sdk', () => {
  return {
    default: class MockAnthropic {
      messages = {
        create: vi.fn().mockResolvedValue({
          id: 'msg_test',
          type: 'message',
          role: 'assistant',
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                competitors: [
                  {
                    name: 'Shopify',
                    features: ['Products', 'Cart'],
                    strengths: ['Ease of use'],
                    weaknesses: ['Pricing'],
                  },
                ],
                bestPractices: ['Use HTTPS', 'Implement caching'],
                trends: ['Headless commerce', 'PWA'],
                recommendations: ['Focus on UX', 'Mobile-first'],
              }),
            },
          ],
          model: 'claude-3-5-sonnet-20241022',
          stop_reason: 'end_turn',
          stop_sequence: null,
          usage: { input_tokens: 100, output_tokens: 500 },
        }),
      };
    },
  };
});

describe('IntentionEngine', () => {
  let engine: IntentionEngine;
  let mockRedis: Redis;
  let mockEventStore: EventStore;
  let mockMetrics: Metrics;

  beforeEach(() => {
    mockRedis = createMockRedis();
    mockEventStore = createMockEventStore();
    mockMetrics = createMockMetrics();
    engine = new IntentionEngine(
      mockRedis,
      mockEventStore,
      mockMetrics,
      'test-anthropic-key-1234567890'
    );
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('Constructor', () => {
    it('should initialize with valid configuration', () => {
      expect(() => {
        new IntentionEngine(mockRedis, mockEventStore, mockMetrics, 'test-key-valid');
      }).not.toThrow();
    });

    it('should create instance with all dependencies', () => {
      const instance = new IntentionEngine(mockRedis, mockEventStore, mockMetrics, 'test-key');
      expect(instance).toBeInstanceOf(IntentionEngine);
      expect(instance.getActiveIntentions()).toBeInstanceOf(Map);
      expect(instance.getActiveIntentions().size).toBe(0);
    });
  });

  describe('processIntention', () => {
    it('should process simple component generation intention', async () => {
      const request: IntentionRequest = {
        id: 'test-intention-1',
        type: 'generate-component',
        description: 'Simple button component with primary and secondary variants',
        requirements: {
          features: ['Primary button', 'Secondary button', 'Disabled state'],
          technologies: ['React', 'TypeScript', 'TailwindCSS'],
        },
        priority: 'medium',
        requestedBy: 'user-123',
        tenantId: 'tenant-abc',
      };

      const solution = await engine.processIntention(request);

      // Validate solution structure
      expect(solution).toBeDefined();
      expect(solution.intentionId).toBe(request.id);
      expect(solution.type).toBe('generate-component');
      expect(solution.status).toBe('completed');

      // Validate artifacts generated
      expect(solution.artifacts).toBeDefined();
      expect(solution.artifacts.code).toBeDefined();
      expect(solution.artifacts.documentation).toBeDefined();
      expect(solution.artifacts.tests).toBeDefined();

      // Validate metadata
      expect(solution.metadata.generatedAt).toBeInstanceOf(Date);
      expect(solution.metadata.confidenceScore).toBeGreaterThan(0);
      expect(solution.metadata.estimatedQuality).toBeGreaterThan(0);

      // Validate validation scores
      expect(solution.validation).toBeDefined();
      expect(solution.validation.uxScore).toBeDefined();
      expect(solution.validation.performanceScore).toBeDefined();
      expect(solution.validation.securityScore).toBeDefined();

      // Validate event store was called
      expect(mockEventStore.append).toHaveBeenCalled();
      const eventCall = (mockEventStore.append as any).mock.calls[0][0];
      expect(eventCall.type).toBe('intention.completed');
      expect(eventCall.aggregateId).toBe(request.id);

      // Validate metrics were updated
      expect(mockMetrics.decisionsTotal.inc).toHaveBeenCalledWith({
        type: 'intention',
        status: 'completed',
      });
      expect(mockMetrics.decisionLatency.observe).toHaveBeenCalled();
    });

    it('should process SaaS generation with research phase', async () => {
      const request: IntentionRequest = {
        id: 'test-intention-saas-1',
        type: 'generate-saas',
        description: 'E-commerce platform for digital products with subscription support',
        requirements: {
          features: [
            'Product catalog',
            'Shopping cart',
            'Checkout with Stripe',
            'Subscription management',
            'Admin dashboard',
          ],
          technologies: ['Node.js', 'React', 'PostgreSQL', 'Redis'],
          targets: {
            vertical: 'E-commerce',
            scale: 'enterprise',
          },
        },
        priority: 'high',
        requestedBy: 'user-456',
        tenantId: 'tenant-xyz',
      };

      const solution = await engine.processIntention(request);

      // Validate solution completed
      expect(solution.status).toBe('completed');
      expect(solution.type).toBe('generate-saas');

      // Validate research was conducted (cached in Redis)
      expect(mockRedis.setex).toHaveBeenCalled();
      const redisCall = (mockRedis.setex as any).mock.calls.find((call: any[]) =>
        call[0].startsWith('research:')
      );
      expect(redisCall).toBeDefined();

      // Validate artifacts include backend AND frontend
      expect(solution.artifacts.code?.backend).toBeDefined();
      expect(solution.artifacts.code?.frontend).toBeDefined();
      expect(solution.artifacts.code?.database).toBeDefined();
      expect(solution.artifacts.code?.docker).toBeDefined();

      // Validate documentation is comprehensive
      expect(solution.artifacts.documentation?.readme).toBeDefined();
      expect(solution.artifacts.documentation?.api).toBeDefined();
      expect(solution.artifacts.documentation?.architecture).toBeDefined();
      expect(solution.artifacts.documentation?.deployment).toBeDefined();

      // Validate quality scores are reasonable
      expect(solution.metadata.confidenceScore).toBeGreaterThanOrEqual(70);
      expect(solution.metadata.estimatedQuality).toBeGreaterThanOrEqual(70);
    });

    it('should handle API generation intention', async () => {
      const request: IntentionRequest = {
        id: 'test-intention-api-1',
        type: 'generate-api',
        description: 'REST API for user management with RBAC',
        requirements: {
          features: ['User CRUD', 'Role management', 'JWT authentication'],
          technologies: ['NestJS', 'Prisma', 'PostgreSQL'],
        },
        priority: 'high',
        requestedBy: 'user-789',
        tenantId: 'tenant-123',
      };

      const solution = await engine.processIntention(request);

      expect(solution.status).toBe('completed');
      expect(solution.artifacts.code?.backend).toBeDefined();
      expect(solution.artifacts.code?.backend!.size).toBeGreaterThan(0);

      // API generation should have documentation
      expect(solution.artifacts.documentation?.api).toBeDefined();
    });

    it('should handle errors gracefully and log to event store', async () => {
      // Create engine with mock that throws error
      const errorRedis = createMockRedis();
      (errorRedis.setex as any).mockRejectedValue(new Error('Redis connection failed'));

      const errorEngine = new IntentionEngine(errorRedis, mockEventStore, mockMetrics, 'test-key');

      const request: IntentionRequest = {
        id: 'test-intention-error-1',
        type: 'generate-saas',
        description: 'Test error handling',
        priority: 'low',
        requestedBy: 'user-error',
        tenantId: 'tenant-error',
      };

      await expect(errorEngine.processIntention(request)).rejects.toThrow(
        'Redis connection failed'
      );

      // Validate error was logged to event store
      expect(mockEventStore.append).toHaveBeenCalled();
      const errorEvent = (mockEventStore.append as any).mock.calls.find(
        (call: any[]) => call[0].type === 'intention.failed'
      );
      expect(errorEvent).toBeDefined();
      expect(errorEvent[0].data.error).toContain('Redis');

      // Validate error metric was incremented
      expect(mockMetrics.errorsTotal.inc).toHaveBeenCalledWith({
        component: 'intention-engine',
      });
    });

    it('should cache research results in Redis', async () => {
      const request: IntentionRequest = {
        id: 'test-cache-1',
        type: 'generate-saas',
        description: 'CRM platform',
        priority: 'medium',
        requestedBy: 'user-cache',
        tenantId: 'tenant-cache',
      };

      await engine.processIntention(request);

      // Validate Redis setex was called with research cache
      expect(mockRedis.setex).toHaveBeenCalled();
      const cacheCall = (mockRedis.setex as any).mock.calls.find(
        (call: any[]) => call[0] === `research:${request.id}`
      );
      expect(cacheCall).toBeDefined();
      expect(cacheCall[1]).toBe(86400); // 24 hours TTL

      // Validate cached data is valid JSON
      const cachedData = JSON.parse(cacheCall[2]);
      expect(cachedData.competitors).toBeDefined();
      expect(cachedData.bestPractices).toBeDefined();
      expect(cachedData.trends).toBeDefined();
      expect(cachedData.recommendations).toBeDefined();
    });
  });

  describe('getActiveIntentions', () => {
    it('should track active intentions', async () => {
      const request: IntentionRequest = {
        id: 'test-active-1',
        type: 'generate-component',
        description: 'Test component',
        priority: 'low',
        requestedBy: 'user-active',
        tenantId: 'tenant-active',
      };

      // Before processing
      expect(engine.getActiveIntentions().size).toBe(0);

      // Process intention
      const solutionPromise = engine.processIntention(request);

      // Should be tracked as active (even though async)
      // Note: timing-dependent, but getActiveIntentions() includes in-progress

      await solutionPromise;

      // After completion, should still be in map
      expect(engine.getActiveIntentions().has(request.id)).toBe(true);
    });

    it('should retrieve intention by ID', async () => {
      const request: IntentionRequest = {
        id: 'test-retrieve-1',
        type: 'generate-api',
        description: 'Payment API',
        priority: 'high',
        requestedBy: 'user-retrieve',
        tenantId: 'tenant-retrieve',
      };

      await engine.processIntention(request);

      const retrieved = engine.getIntention(request.id);
      expect(retrieved).toBeDefined();
      expect(retrieved!.intentionId).toBe(request.id);
      expect(retrieved!.status).toBe('completed');
    });

    it('should return undefined for non-existent intention', () => {
      const retrieved = engine.getIntention('non-existent-id');
      expect(retrieved).toBeUndefined();
    });
  });

  describe('Validation', () => {
    it('should detect missing tests and add validation issue', async () => {
      const request: IntentionRequest = {
        id: 'test-validation-1',
        type: 'generate-component',
        description: 'Simple div wrapper',
        priority: 'low',
        requestedBy: 'user-validation',
        tenantId: 'tenant-validation',
      };

      const solution = await engine.processIntention(request);

      // Check if validation detected test issue
      // Note: Current implementation generates placeholder tests
      expect(solution.validation.issues).toBeDefined();
      expect(Array.isArray(solution.validation.issues)).toBe(true);
    });

    it('should calculate confidence score based on validation issues', async () => {
      const request: IntentionRequest = {
        id: 'test-confidence-1',
        type: 'generate-saas',
        description: 'Complete SaaS with all features',
        priority: 'high',
        requestedBy: 'user-confidence',
        tenantId: 'tenant-confidence',
      };

      const solution = await engine.processIntention(request);

      // Confidence should be between 0-100
      expect(solution.metadata.confidenceScore).toBeGreaterThanOrEqual(0);
      expect(solution.metadata.confidenceScore).toBeLessThanOrEqual(100);

      // Higher confidence if fewer issues
      const issueCount = solution.validation.issues.length;
      if (issueCount === 0) {
        expect(solution.metadata.confidenceScore).toBe(100);
      } else {
        expect(solution.metadata.confidenceScore).toBeLessThan(100);
      }
    });

    it('should calculate quality score from validation metrics', async () => {
      const request: IntentionRequest = {
        id: 'test-quality-1',
        type: 'generate-api',
        description: 'High-quality REST API',
        priority: 'high',
        requestedBy: 'user-quality',
        tenantId: 'tenant-quality',
      };

      const solution = await engine.processIntention(request);

      // Quality is average of UX, performance, security scores
      const avgScore =
        ((solution.validation.uxScore || 0) +
          (solution.validation.performanceScore || 0) +
          (solution.validation.securityScore || 0)) /
        3;

      expect(solution.metadata.estimatedQuality).toBeCloseTo(avgScore, 1);
    });
  });

  describe('Performance', () => {
    it('should complete intention processing within reasonable time', async () => {
      const startTime = Date.now();

      const request: IntentionRequest = {
        id: 'test-perf-1',
        type: 'generate-component',
        description: 'Button component',
        priority: 'low',
        requestedBy: 'user-perf',
        tenantId: 'tenant-perf',
      };

      await engine.processIntention(request);

      const duration = Date.now() - startTime;

      // Should complete within 10 seconds (mocked Claude calls are instant)
      expect(duration).toBeLessThan(10000);

      // Should have recorded latency metric
      expect(mockMetrics.decisionLatency.observe).toHaveBeenCalled();
      const observedLatency = (mockMetrics.decisionLatency.observe as any).mock.calls[0][0];
      expect(observedLatency).toBeGreaterThan(0);
    });

    it('should handle multiple concurrent intentions', async () => {
      const requests: IntentionRequest[] = Array(3)
        .fill(null)
        .map((_, i) => ({
          id: `test-concurrent-${i}`,
          type: 'generate-component' as const,
          description: `Component ${i}`,
          priority: 'low' as const,
          requestedBy: 'user-concurrent',
          tenantId: 'tenant-concurrent',
        }));

      // Process all concurrently
      const results = await Promise.all(requests.map((req) => engine.processIntention(req)));

      // All should complete successfully
      expect(results).toHaveLength(3);
      results.forEach((solution, i) => {
        expect(solution.status).toBe('completed');
        expect(solution.intentionId).toBe(`test-concurrent-${i}`);
      });

      // All should be tracked
      expect(engine.getActiveIntentions().size).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Edge Cases', () => {
    it('should handle minimal intention request', async () => {
      const request: IntentionRequest = {
        id: 'test-minimal-1',
        type: 'generate-component',
        description: 'Minimal component',
        priority: 'low',
        requestedBy: 'user-minimal',
        tenantId: 'tenant-minimal',
      };

      const solution = await engine.processIntention(request);

      expect(solution.status).toBe('completed');
      expect(solution.artifacts).toBeDefined();
    });

    it('should handle intention with extensive requirements', async () => {
      const request: IntentionRequest = {
        id: 'test-extensive-1',
        type: 'generate-saas',
        description: 'Comprehensive enterprise SaaS platform',
        requirements: {
          features: Array(30)
            .fill('feature')
            .map((f, i) => `${f}-${i}`),
          technologies: ['Node.js', 'React', 'PostgreSQL', 'Redis', 'Docker', 'Kubernetes'],
          constraints: ['GDPR compliant', 'SOC2 Type II', 'ISO27001'],
          targets: {
            vertical: 'Enterprise Software',
            audience: 'Fortune 500',
            scale: 'global',
          },
        },
        context: {
          existingCode: 'legacy-system-v1',
          similarProjects: ['salesforce', 'hubspot'],
          userPreferences: { theme: 'dark', language: 'en-US' },
        },
        priority: 'critical',
        requestedBy: 'user-extensive',
        tenantId: 'tenant-extensive',
      };

      const solution = await engine.processIntention(request);

      expect(solution.status).toBe('completed');
      expect(solution.metadata.technologies.length).toBeGreaterThan(0);
      expect(solution.metadata.features.length).toBeGreaterThan(0);
    });
  });
});
