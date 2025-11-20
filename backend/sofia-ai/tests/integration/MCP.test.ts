/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║ 🧪 MCP SERVICE - Integration Tests                                      ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { MCPService } from '@integrations/MCPService';
import { createMockContext } from '../setup';

describe('MCP Service Integration Tests', () => {
  let mcp: MCPService;

  beforeEach(() => {
    mcp = new MCPService({
      directusUrl: 'http://localhost:8055',
      enabled: true,
    });
  });

  describe('Connection Management', () => {
    it('should add new connection', () => {
      const connection = {
        id: 'test-connection',
        name: 'Test Connection',
        type: 'directus' as const,
        status: 'connected' as const,
        config: { url: 'http://localhost:8055' },
        lastSync: new Date().toISOString(),
      };

      mcp.addConnection(connection);
      const connections = mcp.listConnections();

      expect(connections).toContain('test-connection');
    });

    it('should remove connection', () => {
      const connectionId = 'test-connection';

      mcp.addConnection({
        id: connectionId,
        name: 'Test',
        type: 'directus',
        status: 'connected',
        config: {},
        lastSync: new Date().toISOString(),
      });

      mcp.removeConnection(connectionId);
      const connections = mcp.listConnections();

      expect(connections).not.toContain(connectionId);
    });

    it('should get connection by ID', () => {
      const connectionId = 'test-connection';

      mcp.addConnection({
        id: connectionId,
        name: 'Test',
        type: 'directus',
        status: 'connected',
        config: {},
        lastSync: new Date().toISOString(),
      });

      const connection = mcp.getConnection(connectionId);
      expect(connection).toBeDefined();
    });
  });

  describe('Resource Operations', () => {
    it('should read resource', async () => {
      const resource = {
        collection: 'petalas',
        operation: 'read' as const,
        data: null,
      };

      const result = await mcp.read(resource);
      expect(result).toBeDefined();
    });

    it('should create resource', async () => {
      const resource = {
        collection: 'petalas',
        operation: 'create' as const,
        data: {
          name: 'Test Pétala',
          slug: 'test-petala',
          status: 'active',
        },
      };

      const result = await mcp.create(resource);
      expect(result).toBeDefined();
      expect(result.data).toHaveProperty('id');
    });

    it('should update resource', async () => {
      const collection = 'petalas';
      const id = 'test-id';
      const data = { name: 'Updated Name' };

      const result = await mcp.update(collection, id, data);
      expect(result).toBeDefined();
    });

    it('should delete resource', async () => {
      const collection = 'petalas';
      const id = 'test-id';

      await expect(mcp.delete(collection, id)).resolves.not.toThrow();
    });
  });

  describe('Bulk Operations', () => {
    it('should bulk read resources', async () => {
      const resources = [
        { collection: 'petalas', operation: 'read' as const, data: null },
        { collection: 'users', operation: 'read' as const, data: null },
      ];

      const results = await mcp.bulkRead(resources);
      expect(results).toHaveLength(2);
    });

    it('should bulk create resources', async () => {
      const items = [{ name: 'Item 1' }, { name: 'Item 2' }];

      const results = await mcp.bulkCreate('petalas', items);
      expect(results).toHaveLength(2);
    });
  });

  describe('Sync Operations', () => {
    it('should sync between connections', async () => {
      const result = await mcp.sync('source-connection', 'target-connection', ['petalas', 'users']);

      expect(result).toHaveProperty('synced');
      expect(result).toHaveProperty('errors');
    });

    it('should handle sync errors gracefully', async () => {
      const result = await mcp.sync('invalid-source', 'invalid-target', ['non-existent']);

      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Health Check', () => {
    it('should check connection health', async () => {
      const isHealthy = await mcp.healthCheck();
      expect(typeof isHealthy).toBe('boolean');
    });

    it('should check all connections health', async () => {
      mcp.addConnection({
        id: 'conn1',
        name: 'Connection 1',
        type: 'directus',
        status: 'connected',
        config: { url: 'http://localhost:8055' },
        lastSync: new Date().toISOString(),
      });

      const results = await mcp.healthCheckAll();
      expect(results).toHaveProperty('conn1');
    });
  });
});
