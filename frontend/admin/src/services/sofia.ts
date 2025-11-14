/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║ 🧠 SOFIA AI v4.0 SERVICE - The Brain Integration                        ║
 * ║ Complete AI Stack: LangChain + Langfuse + Qdrant + pgVector              ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

import axios, { AxiosInstance } from 'axios';
import type { SofiaHealth, SofiaMetrics, IntentionRequest, GeneratedSolution } from '@types';

// ═══════════════════════════════════════════════════════════════════════════
// SOFIA AI CLIENT
// ═══════════════════════════════════════════════════════════════════════════

class SofiaAIClient {
  private client: AxiosInstance;
  private healthCheckInterval?: NodeJS.Timeout;

  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_SOFIA_URL || 'http://localhost:3003',
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000, // 30s for AI operations
    });

    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        const apiKey = import.meta.env.VITE_SOFIA_API_KEY;
        if (apiKey) {
          config.headers['X-Sofia-API-Key'] = apiKey;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
  }

  // ═════════════════════════════════════════════════════════════════════════
  // HEALTH & METRICS
  // ═════════════════════════════════════════════════════════════════════════

  async getHealth(): Promise<SofiaHealth> {
    const response = await this.client.get<SofiaHealth>('/health');
    return response.data;
  }

  async getMetrics(): Promise<SofiaMetrics> {
    const response = await this.client.get<SofiaMetrics>('/metrics');
    return response.data;
  }

  startHealthCheck(callback: (health: SofiaHealth) => void, interval = 30000) {
    this.healthCheckInterval = setInterval(async () => {
      try {
        const health = await this.getHealth();
        callback(health);
      } catch (error) {
        console.error('Sofia health check failed:', error);
        callback({
          status: 'unhealthy',
          uptime: 0,
          components: {
            IntentionEngine: false,
            UXValidator: false,
            SEOOptimizer: false,
            DirectusOrchestrator: false,
            MarketplaceManager: false,
            DecisionLogger: false,
            EventStore: false,
            Metrics: false,
            LangChain: false,
            Langfuse: false,
            Qdrant: false,
            pgVector: false,
          },
          metrics: {
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            averageResponseTime: 0,
          },
        });
      }
    }, interval);
  }

  stopHealthCheck() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
  }

  // ═════════════════════════════════════════════════════════════════════════
  // INTENTION ENGINE
  // ═════════════════════════════════════════════════════════════════════════

  async generateByIntention(request: IntentionRequest): Promise<GeneratedSolution> {
    const response = await this.client.post<GeneratedSolution>('/api/intention/generate', request);
    return response.data;
  }

  async validateUX(html: string): Promise<any> {
    const response = await this.client.post('/api/ux/validate', { html });
    return response.data;
  }

  async optimizeSEO(url: string, html: string): Promise<any> {
    const response = await this.client.post('/api/seo/optimize', { url, html });
    return response.data;
  }

  // ═════════════════════════════════════════════════════════════════════════
  // VECTOR SEARCH (Qdrant + pgVector)
  // ═════════════════════════════════════════════════════════════════════════

  async searchSimilar(query: string, limit = 10): Promise<any[]> {
    const response = await this.client.post('/api/search/similar', { query, limit });
    return response.data;
  }

  async getEmbedding(text: string): Promise<number[]> {
    const response = await this.client.post<number[]>('/api/embeddings/generate', { text });
    return response.data;
  }

  // ═════════════════════════════════════════════════════════════════════════
  // LANGCHAIN ORCHESTRATION
  // ═════════════════════════════════════════════════════════════════════════

  async executeChain(chainName: string, input: any): Promise<any> {
    const response = await this.client.post(`/api/langchain/execute/${chainName}`, { input });
    return response.data;
  }

  async listChains(): Promise<string[]> {
    const response = await this.client.get<string[]>('/api/langchain/chains');
    return response.data;
  }

  // ═════════════════════════════════════════════════════════════════════════
  // LANGFUSE TRACING
  // ═════════════════════════════════════════════════════════════════════════

  async getTraces(limit = 50): Promise<any[]> {
    const response = await this.client.get('/api/langfuse/traces', { params: { limit } });
    return response.data;
  }

  async getAnalytics(timeRange = '24h'): Promise<any> {
    const response = await this.client.get('/api/langfuse/analytics', { params: { timeRange } });
    return response.data;
  }

  // ═════════════════════════════════════════════════════════════════════════
  // MARKETPLACE
  // ═════════════════════════════════════════════════════════════════════════

  async searchMarketplace(query: string): Promise<any[]> {
    const response = await this.client.get('/api/marketplace/search', { params: { query } });
    return response.data;
  }

  async getPetalaTemplate(petalaType: string): Promise<any> {
    const response = await this.client.get(`/api/marketplace/petala/${petalaType}`);
    return response.data;
  }

  // ═════════════════════════════════════════════════════════════════════════
  // DECISION LOGGING
  // ═════════════════════════════════════════════════════════════════════════

  async getDecisions(limit = 100): Promise<any[]> {
    const response = await this.client.get('/api/decisions', { params: { limit } });
    return response.data;
  }

  async getSuggestions(context: string): Promise<any[]> {
    const response = await this.client.post('/api/suggestions', { context });
    return response.data;
  }
}

export const sofia = new SofiaAIClient();
export default sofia;
