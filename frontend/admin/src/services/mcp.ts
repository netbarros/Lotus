/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║ 🔗 MCP SERVICE - Model Context Protocol Integration                     ║
 * ║ Multi-MCP integration with Directus across cognitive mesh                ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

import axios, { AxiosInstance } from 'axios';
import type { MCPConnection, MCPResource, MCPConfig } from '@/types';

// ═══════════════════════════════════════════════════════════════════════════
// MCP CLIENT
// ═══════════════════════════════════════════════════════════════════════════

class MCPClient {
  private connections: Map<string, AxiosInstance> = new Map();
  private config: MCPConfig;

  constructor(config?: Partial<MCPConfig>) {
    this.config = {
      enabled: import.meta.env.VITE_MCP_ENABLED === 'true',
      directusUrl: import.meta.env.VITE_MCP_DIRECTUS_URL || 'http://localhost:8055',
      ...config,
    };

    if (this.config.enabled) {
      this.initializeDefaultConnection();
    }
  }

  // ═════════════════════════════════════════════════════════════════════════
  // CONNECTION MANAGEMENT
  // ═════════════════════════════════════════════════════════════════════════

  private initializeDefaultConnection() {
    const client = axios.create({
      baseURL: this.config.directusUrl,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add auth interceptor
    client.interceptors.request.use((config) => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    this.connections.set('directus-default', client);
  }

  addConnection(connection: MCPConnection): void {
    const client = axios.create({
      baseURL: connection.config.url,
      headers: {
        'Content-Type': 'application/json',
        ...(connection.config.headers || {}),
      },
    });

    this.connections.set(connection.id, client);
  }

  removeConnection(connectionId: string): void {
    this.connections.delete(connectionId);
  }

  getConnection(connectionId: string): AxiosInstance | undefined {
    return this.connections.get(connectionId);
  }

  listConnections(): string[] {
    return Array.from(this.connections.keys());
  }

  // ═════════════════════════════════════════════════════════════════════════
  // RESOURCE OPERATIONS
  // ═════════════════════════════════════════════════════════════════════════

  async read(resource: MCPResource, connectionId = 'directus-default'): Promise<any> {
    const client = this.getConnection(connectionId);
    if (!client) {
      throw new Error(`MCP connection '${connectionId}' not found`);
    }

    const response = await client.get(`/items/${resource.collection}`, {
      params: resource.metadata?.params,
    });
    return response.data;
  }

  async readOne(collection: string, id: string, connectionId = 'directus-default'): Promise<any> {
    const client = this.getConnection(connectionId);
    if (!client) {
      throw new Error(`MCP connection '${connectionId}' not found`);
    }

    const response = await client.get(`/items/${collection}/${id}`);
    return response.data;
  }

  async create(resource: MCPResource, connectionId = 'directus-default'): Promise<any> {
    const client = this.getConnection(connectionId);
    if (!client) {
      throw new Error(`MCP connection '${connectionId}' not found`);
    }

    const response = await client.post(`/items/${resource.collection}`, resource.data);
    return response.data;
  }

  async update(
    collection: string,
    id: string,
    data: any,
    connectionId = 'directus-default'
  ): Promise<any> {
    const client = this.getConnection(connectionId);
    if (!client) {
      throw new Error(`MCP connection '${connectionId}' not found`);
    }

    const response = await client.patch(`/items/${collection}/${id}`, data);
    return response.data;
  }

  async delete(collection: string, id: string, connectionId = 'directus-default'): Promise<void> {
    const client = this.getConnection(connectionId);
    if (!client) {
      throw new Error(`MCP connection '${connectionId}' not found`);
    }

    await client.delete(`/items/${collection}/${id}`);
  }

  // ═════════════════════════════════════════════════════════════════════════
  // BULK OPERATIONS
  // ═════════════════════════════════════════════════════════════════════════

  async bulkRead(resources: MCPResource[]): Promise<any[]> {
    return Promise.all(
      resources.map((resource) => this.read(resource, resource.metadata?.connectionId))
    );
  }

  async bulkCreate(
    collection: string,
    items: any[],
    connectionId = 'directus-default'
  ): Promise<any[]> {
    const client = this.getConnection(connectionId);
    if (!client) {
      throw new Error(`MCP connection '${connectionId}' not found`);
    }

    const response = await client.post(`/items/${collection}`, items);
    return response.data;
  }

  // ═════════════════════════════════════════════════════════════════════════
  // SYNC OPERATIONS
  // ═════════════════════════════════════════════════════════════════════════

  async sync(
    sourceConnectionId: string,
    targetConnectionId: string,
    collections: string[]
  ): Promise<{ synced: number; errors: any[] }> {
    const results = {
      synced: 0,
      errors: [] as any[],
    };

    for (const collection of collections) {
      try {
        const sourceData = await this.read(
          { collection, operation: 'read', data: null },
          sourceConnectionId
        );

        await this.bulkCreate(collection, sourceData.data, targetConnectionId);
        results.synced += sourceData.data.length;
      } catch (error) {
        results.errors.push({ collection, error });
      }
    }

    return results;
  }

  // ═════════════════════════════════════════════════════════════════════════
  // REALTIME SUBSCRIPTIONS
  // ═════════════════════════════════════════════════════════════════════════

  subscribe(
    collection: string,
    callback: (data: any) => void,
    connectionId = 'directus-default'
  ): () => void {
    // WebSocket subscription for real-time updates
    const wsUrl = this.config.directusUrl.replace(/^http/, 'ws');
    const ws = new WebSocket(`${wsUrl}/websocket`);

    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          type: 'subscribe',
          collection,
          token: localStorage.getItem('auth_token'),
        })
      );
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      callback(data);
    };

    // Return unsubscribe function
    return () => {
      ws.close();
    };
  }

  // ═════════════════════════════════════════════════════════════════════════
  // HEALTH CHECK
  // ═════════════════════════════════════════════════════════════════════════

  async healthCheck(connectionId = 'directus-default'): Promise<boolean> {
    try {
      const client = this.getConnection(connectionId);
      if (!client) return false;

      await client.get('/server/ping');
      return true;
    } catch {
      return false;
    }
  }

  async healthCheckAll(): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {};

    for (const connectionId of this.listConnections()) {
      results[connectionId] = await this.healthCheck(connectionId);
    }

    return results;
  }
}

export const mcp = new MCPClient();
export default mcp;
