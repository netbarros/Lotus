/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║ 🔍 QDRANT SERVICE - HIGH-PERFORMANCE VECTOR DATABASE                     ║
 * ║ Sofia AI v4.0 - Complete Qdrant Integration                              ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 *
 * Qdrant provides:
 * - High-performance vector search
 * - 1536-dimensional embeddings (OpenAI/Anthropic compatible)
 * - Semantic search capabilities
 * - Similarity scoring
 * - Collection management
 * - Payload filtering
 */
import type { Redis } from 'ioredis';
import type { EventStore } from '../events/EventStore.js';
/**
 * Qdrant configuration
 */
export interface QdrantConfig {
  host: string;
  port?: number;
  grpcPort?: number;
  apiKey?: string;
  timeout?: number;
}
/**
 * Qdrant collection configuration
 */
export interface CollectionConfig {
  vectors: {
    size: number;
    distance: 'Cosine' | 'Euclid' | 'Dot';
  };
  optimizers?: {
    indexingThreshold: number;
  };
}
/**
 * Qdrant point (vector with payload)
 */
export interface QdrantPoint {
  id: string | number;
  vector: number[];
  payload?: Record<string, any>;
}
/**
 * Search result
 */
export interface SearchResult {
  id: string | number;
  score: number;
  payload?: Record<string, any>;
  vector?: number[];
}
/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║ QDRANT SERVICE                                                           ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */
export declare class QdrantService {
  private config;
  private redis;
  private eventStore;
  private isInitialized;
  private collections;
  private searchCount;
  private upsertCount;
  private totalSearchLatency;
  constructor(config: QdrantConfig, redis: Redis, eventStore: EventStore);
  /**
   * Initialize Qdrant service
   */
  initialize(): Promise<void>;
  /**
   * Create a collection
   */
  createCollection(name: string, config: CollectionConfig): Promise<void>;
  /**
   * Check if collection exists
   */
  collectionExists(name: string): boolean;
  /**
   * Delete a collection
   */
  deleteCollection(name: string): Promise<void>;
  /**
   * Upsert points (vectors) into a collection
   */
  upsert(collectionName: string, points: QdrantPoint[]): Promise<void>;
  /**
   * Search for similar vectors
   */
  search(
    collectionName: string,
    options: {
      vector: number[];
      limit?: number;
      filter?: Record<string, any>;
      withPayload?: boolean;
      withVector?: boolean;
      scoreThreshold?: number;
    }
  ): Promise<SearchResult[]>;
  /**
   * Get point by ID
   */
  getPoint(collectionName: string, pointId: string | number): Promise<QdrantPoint | null>;
  /**
   * Delete points by IDs
   */
  deletePoints(collectionName: string, pointIds: (string | number)[]): Promise<void>;
  /**
   * Get collection info
   */
  getCollectionInfo(collectionName: string): Promise<{
    name: string;
    vectorsCount: number;
    config: CollectionConfig;
  } | null>;
  /**
   * Load collections from Redis
   */
  private loadCollections;
  /**
   * Get service statistics
   */
  getStatistics(): {
    searchCount: number;
    upsertCount: number;
    averageSearchLatencyMs: number;
    collectionsCount: number;
  };
  /**
   * Get health status
   */
  getHealth(): {
    status: 'healthy' | 'unhealthy';
    initialized: boolean;
    collections: string[];
    statistics: ReturnType<typeof this.getStatistics>;
  };
}
//# sourceMappingURL=QdrantService.d.ts.map
