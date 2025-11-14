/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║ 🧪 LANGCHAIN SERVICE - Unit Tests                                       ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LangChainService } from '@integrations/LangChainService';
import { mockRedis, createMockContext } from '../setup';

describe('LangChainService', () => {
  let service: LangChainService;

  beforeEach(() => {
    const config = {
      enabled: true,
      model: 'claude-sonnet-4',
      temperature: 0.7,
      maxRetries: 3,
      apiKey: 'test-api-key',
    };

    service = new LangChainService(config, mockRedis as any);
  });

  describe('Initialization', () => {
    it('should create LangChainService instance', () => {
      expect(service).toBeDefined();
    });

    it('should initialize with default chains', async () => {
      await service.initialize();
      const chains = await service.listChains();

      expect(chains).toContain('generate-saas');
      expect(chains).toContain('validate-ux');
      expect(chains).toContain('optimize-seo');
    });
  });

  describe('Chain Execution', () => {
    it('should execute chain successfully', async () => {
      const chainName = 'generate-saas';
      const input = {
        intention: 'Create a healthcare clinic SaaS',
        context: createMockContext(),
      };

      const result = await service.executeChain(chainName, input);

      expect(result).toBeDefined();
      expect(result).toHaveProperty('output');
    });

    it('should throw error for non-existent chain', async () => {
      await expect(
        service.executeChain('non-existent-chain', {})
      ).rejects.toThrow();
    });

    it('should handle chain execution errors', async () => {
      const chainName = 'generate-saas';
      const invalidInput = null;

      await expect(
        service.executeChain(chainName, invalidInput)
      ).rejects.toThrow();
    });
  });

  describe('Chain Management', () => {
    it('should register custom chain', async () => {
      const chainName = 'custom-chain';
      const chain = {
        name: chainName,
        template: 'Custom prompt template',
        execute: vi.fn().mockResolvedValue({ output: 'result' }),
      };

      await service.registerChain(chainName, chain);
      const chains = await service.listChains();

      expect(chains).toContain(chainName);
    });

    it('should get chain by name', async () => {
      const chainName = 'generate-saas';
      const chain = await service.getChain(chainName);

      expect(chain).toBeDefined();
      expect(chain.name).toBe(chainName);
    });
  });

  describe('Caching', () => {
    it('should cache chain results', async () => {
      const chainName = 'generate-saas';
      const input = { test: 'input' };

      mockRedis.get.mockResolvedValueOnce(null);
      mockRedis.set.mockResolvedValue('OK');

      await service.executeChain(chainName, input);

      expect(mockRedis.set).toHaveBeenCalled();
    });

    it('should return cached result', async () => {
      const chainName = 'generate-saas';
      const input = { test: 'input' };
      const cachedResult = { output: 'cached' };

      mockRedis.get.mockResolvedValue(JSON.stringify(cachedResult));

      const result = await service.executeChain(chainName, input);

      expect(result).toEqual(cachedResult);
    });
  });

  describe('Statistics', () => {
    it('should track execution statistics', async () => {
      const stats = await service.getStatistics();

      expect(stats).toHaveProperty('totalExecutions');
      expect(stats).toHaveProperty('successfulExecutions');
      expect(stats).toHaveProperty('failedExecutions');
      expect(stats).toHaveProperty('averageExecutionTime');
    });

    it('should increment execution count', async () => {
      const stats1 = await service.getStatistics();

      await service.executeChain('generate-saas', { test: 'input' });

      const stats2 = await service.getStatistics();
      expect(stats2.totalExecutions).toBeGreaterThan(stats1.totalExecutions);
    });
  });

  describe('Health Check', () => {
    it('should return health status', async () => {
      const health = await service.getHealth();

      expect(health).toHaveProperty('status');
      expect(health).toHaveProperty('chains');
      expect(health).toHaveProperty('statistics');
    });

    it('should report healthy when operational', async () => {
      await service.initialize();
      const health = await service.getHealth();

      expect(health.status).toBe('healthy');
    });
  });
});
