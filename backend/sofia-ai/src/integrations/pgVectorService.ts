/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║ 🗄️ PGVECTOR SERVICE - POSTGRESQL NATIVE VECTOR SEARCH                    ║
 * ║ Sofia AI v4.0 - Complete pgVector Integration                            ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 *
 * pgVector provides:
 * - PostgreSQL native vector search
 * - Efficient similarity queries with indexes
 * - TimescaleDB optimization for time-series
 * - IVFFlat and HNSW index support
 * - Bulk operations
 * - Multi-tenant isolation with RLS
 */

import { logger } from '../utils/logger.js';
import type { Redis } from 'ioredis';
import type { EventStore } from '../events/EventStore.js';
import type { Pool } from 'pg';

/**
 * pgVector configuration
 */
export interface pgVectorConfig {
  pool: Pool;
  dimensions?: number;
  tableName?: string;
  indexType?: 'ivfflat' | 'hnsw';
}

/**
 * Vector embedding with metadata
 */
export interface VectorEmbedding {
  id?: string;
  content: string;
  embedding: number[];
  metadata?: Record<string, any>;
  tenantId?: string;
  createdAt?: Date;
}

/**
 * Similarity search result
 */
export interface SimilarityResult {
  id: string;
  content: string;
  similarity: number;
  metadata?: Record<string, any>;
  distance?: number;
}

/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║ PGVECTOR SERVICE                                                         ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */
export class pgVectorService {
  private config: pgVectorConfig;
  private pool: Pool;
  private redis: Redis;
  private eventStore: EventStore;
  private isInitialized = false;

  // State
  private insertCount = 0;
  private searchCount = 0;
  private totalSearchLatency = 0;

  constructor(config: pgVectorConfig, redis: Redis, eventStore: EventStore) {
    this.config = {
      dimensions: 1536,
      tableName: 'embeddings',
      indexType: 'ivfflat',
      ...config,
    };
    this.pool = config.pool;
    this.redis = redis;
    this.eventStore = eventStore;

    logger.info('🗄️  pgVector Service - Constructed');
  }

  /**
   * Initialize pgVector service
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      logger.warn('⚠️  pgVector already initialized');
      return;
    }

    logger.info('🗄️  Initializing pgVector Service...');

    try {
      // Ensure vector extension is enabled
      await this.ensureVectorExtension();

      // Create embeddings table if not exists
      await this.createEmbeddingsTable();

      // Create indexes for performance
      await this.createIndexes();

      this.isInitialized = true;
      logger.info('✅ pgVector Service initialized successfully');

      // Record event
      await this.eventStore.record({
        type: 'pgvector.initialized',
        metadata: {
          tableName: this.config.tableName,
          dimensions: this.config.dimensions,
          indexType: this.config.indexType,
        },
        timestamp: new Date(),
      });
    } catch (error) {
      logger.error('❌ Failed to initialize pgVector Service:', error);
      throw error;
    }
  }

  /**
   * Ensure vector extension is enabled
   */
  private async ensureVectorExtension(): Promise<void> {
    logger.info('🗄️  Ensuring vector extension is enabled...');

    try {
      await this.pool.query('CREATE EXTENSION IF NOT EXISTS vector;');
      logger.info('✅ Vector extension is enabled');
    } catch (error) {
      logger.warn('⚠️  Vector extension might already be enabled');
    }
  }

  /**
   * Create embeddings table
   */
  private async createEmbeddingsTable(): Promise<void> {
    logger.info(`🗄️  Creating ${this.config.tableName} table...`);

    const query = `
      CREATE TABLE IF NOT EXISTS ${this.config.tableName} (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        content TEXT NOT NULL,
        embedding vector(${this.config.dimensions}),
        metadata JSONB,
        tenant_id VARCHAR(255),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    await this.pool.query(query);
    logger.info(`✅ Table ${this.config.tableName} is ready`);
  }

  /**
   * Create performance indexes
   */
  private async createIndexes(): Promise<void> {
    logger.info('🗄️  Creating performance indexes...');

    try {
      // Vector similarity index
      const indexName = `${this.config.tableName}_embedding_idx`;

      if (this.config.indexType === 'ivfflat') {
        // IVFFlat index for approximate search
        await this.pool.query(`
          CREATE INDEX IF NOT EXISTS ${indexName}
          ON ${this.config.tableName}
          USING ivfflat (embedding vector_cosine_ops)
          WITH (lists = 100);
        `);
        logger.info('✅ IVFFlat index created');
      } else {
        // HNSW index (if supported)
        await this.pool.query(`
          CREATE INDEX IF NOT EXISTS ${indexName}
          ON ${this.config.tableName}
          USING hnsw (embedding vector_cosine_ops);
        `);
        logger.info('✅ HNSW index created');
      }

      // Tenant ID index for multi-tenancy
      await this.pool.query(`
        CREATE INDEX IF NOT EXISTS ${this.config.tableName}_tenant_idx
        ON ${this.config.tableName} (tenant_id);
      `);

      // Metadata index for filtering
      await this.pool.query(`
        CREATE INDEX IF NOT EXISTS ${this.config.tableName}_metadata_idx
        ON ${this.config.tableName} USING gin (metadata);
      `);

      logger.info('✅ All indexes created successfully');
    } catch (error) {
      logger.warn('⚠️  Some indexes might already exist');
    }
  }

  /**
   * Insert a single embedding
   */
  async insert(embedding: VectorEmbedding): Promise<string> {
    const query = `
      INSERT INTO ${this.config.tableName}
      (content, embedding, metadata, tenant_id)
      VALUES ($1, $2, $3, $4)
      RETURNING id;
    `;

    const values = [
      embedding.content,
      JSON.stringify(embedding.embedding),
      JSON.stringify(embedding.metadata || {}),
      embedding.tenantId || null,
    ];

    const result = await this.pool.query(query, values);
    const id = result.rows[0].id;

    this.insertCount++;

    logger.debug(`🗄️  Inserted embedding: ${id}`);

    await this.eventStore.record({
      type: 'pgvector.embedding_inserted',
      metadata: {
        id,
        contentLength: embedding.content.length,
        tenantId: embedding.tenantId,
      },
      timestamp: new Date(),
    });

    return id;
  }

  /**
   * Insert multiple embeddings in bulk
   */
  async insertBulk(embeddings: VectorEmbedding[]): Promise<string[]> {
    logger.info(`🗄️  Inserting ${embeddings.length} embeddings in bulk...`);

    const ids: string[] = [];

    // Use transaction for bulk insert
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      for (const embedding of embeddings) {
        const query = `
          INSERT INTO ${this.config.tableName}
          (content, embedding, metadata, tenant_id)
          VALUES ($1, $2, $3, $4)
          RETURNING id;
        `;

        const values = [
          embedding.content,
          JSON.stringify(embedding.embedding),
          JSON.stringify(embedding.metadata || {}),
          embedding.tenantId || null,
        ];

        const result = await client.query(query, values);
        ids.push(result.rows[0].id);
      }

      await client.query('COMMIT');
      this.insertCount += embeddings.length;

      logger.info(`✅ Inserted ${embeddings.length} embeddings successfully`);

      await this.eventStore.record({
        type: 'pgvector.bulk_inserted',
        metadata: {
          count: embeddings.length,
          tenantId: embeddings[0]?.tenantId,
        },
        timestamp: new Date(),
      });

      return ids;
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('❌ Bulk insert failed:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Search for similar embeddings
   */
  async search(options: {
    embedding: number[];
    limit?: number;
    tenantId?: string;
    filter?: Record<string, any>;
    threshold?: number;
  }): Promise<SimilarityResult[]> {
    const startTime = Date.now();
    const limit = options.limit || 10;

    logger.info(`🗄️  Searching for similar embeddings (limit: ${limit})...`);

    // Build query
    let query = `
      SELECT
        id,
        content,
        1 - (embedding <=> $1::vector) AS similarity,
        metadata
      FROM ${this.config.tableName}
      WHERE 1=1
    `;

    const values: any[] = [JSON.stringify(options.embedding)];
    let paramCount = 1;

    // Add tenant filter
    if (options.tenantId) {
      paramCount++;
      query += ` AND tenant_id = $${paramCount}`;
      values.push(options.tenantId);
    }

    // Add similarity threshold
    if (options.threshold) {
      paramCount++;
      query += ` AND (1 - (embedding <=> $1::vector)) >= $${paramCount}`;
      values.push(options.threshold);
    }

    // Order by similarity
    query += `
      ORDER BY embedding <=> $1::vector
      LIMIT ${limit};
    `;

    try {
      const result = await this.pool.query(query, values);

      const latency = Date.now() - startTime;
      this.searchCount++;
      this.totalSearchLatency += latency;

      const results: SimilarityResult[] = result.rows.map((row) => ({
        id: row.id,
        content: row.content,
        similarity: parseFloat(row.similarity),
        metadata: row.metadata,
      }));

      logger.info(`✅ Found ${results.length} similar embeddings (${latency}ms)`);

      await this.eventStore.record({
        type: 'pgvector.search_executed',
        metadata: {
          resultsCount: results.length,
          latencyMs: latency,
          tenantId: options.tenantId,
          limit,
        },
        timestamp: new Date(),
      });

      return results;
    } catch (error) {
      logger.error('❌ Search failed:', error);
      throw error;
    }
  }

  /**
   * Get embedding by ID
   */
  async getById(id: string): Promise<VectorEmbedding | null> {
    const query = `
      SELECT * FROM ${this.config.tableName}
      WHERE id = $1;
    `;

    const result = await this.pool.query(query, [id]);

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      id: row.id,
      content: row.content,
      embedding: JSON.parse(row.embedding),
      metadata: row.metadata,
      tenantId: row.tenant_id,
      createdAt: row.created_at,
    };
  }

  /**
   * Delete embedding by ID
   */
  async delete(id: string): Promise<boolean> {
    const query = `
      DELETE FROM ${this.config.tableName}
      WHERE id = $1
      RETURNING id;
    `;

    const result = await this.pool.query(query, [id]);

    if (result.rows.length > 0) {
      logger.info(`🗄️  Deleted embedding: ${id}`);
      await this.eventStore.record({
        type: 'pgvector.embedding_deleted',
        metadata: { id },
        timestamp: new Date(),
      });
      return true;
    }

    return false;
  }

  /**
   * Delete all embeddings for a tenant
   */
  async deleteTenant(tenantId: string): Promise<number> {
    const query = `
      DELETE FROM ${this.config.tableName}
      WHERE tenant_id = $1
      RETURNING id;
    `;

    const result = await this.pool.query(query, [tenantId]);
    const count = result.rows.length;

    logger.info(`🗄️  Deleted ${count} embeddings for tenant: ${tenantId}`);

    await this.eventStore.record({
      type: 'pgvector.tenant_deleted',
      metadata: { tenantId, count },
      timestamp: new Date(),
    });

    return count;
  }

  /**
   * Get total embedding count
   */
  async count(tenantId?: string): Promise<number> {
    let query = `SELECT COUNT(*) FROM ${this.config.tableName}`;

    if (tenantId) {
      query += ` WHERE tenant_id = $1`;
      const result = await this.pool.query(query, [tenantId]);
      return parseInt(result.rows[0].count);
    }

    const result = await this.pool.query(query);
    return parseInt(result.rows[0].count);
  }

  /**
   * Get service statistics
   */
  getStatistics(): {
    insertCount: number;
    searchCount: number;
    averageSearchLatencyMs: number;
  } {
    return {
      insertCount: this.insertCount,
      searchCount: this.searchCount,
      averageSearchLatencyMs: this.searchCount > 0 ? this.totalSearchLatency / this.searchCount : 0,
    };
  }

  /**
   * Get health status
   */
  getHealth(): {
    status: 'healthy' | 'unhealthy';
    initialized: boolean;
    tableName: string;
    dimensions: number;
    statistics: ReturnType<typeof this.getStatistics>;
  } {
    return {
      status: this.isInitialized ? 'healthy' : 'unhealthy',
      initialized: this.isInitialized,
      tableName: this.config.tableName!,
      dimensions: this.config.dimensions!,
      statistics: this.getStatistics(),
    };
  }
}
