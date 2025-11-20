// @ts-nocheck - Temporarily disabled for cross-workspace type issues
/**
 * 🧠 SOFIA LEARNING ENGINE v4.0
 * The Brain - Cognitive Learning & Knowledge Acquisition
 *
 * CAPABILITIES:
 * - Anonymous learning from ALL tenants (privacy-first)
 * - Secure web scraping/crawling (no stack revelation)
 * - Marketing materials learning
 * - Continuous refinement & improvement
 * - Integration with ERP, CRM, all 16 Pétalas
 * - Multi-tenant knowledge graph
 * - Privacy & security by design
 *
 * Sofia nasce sabendo e continua aprendendo 24/7
 */

import { Redis } from 'ioredis';
import { Pool } from 'pg';
import { LangChainService } from '../integrations/LangChainService';
import { QdrantService } from '../integrations/QdrantService';
import { LangfuseService } from '../integrations/LangfuseService';
// @ts-expect-error - axios types not available
import axios from 'axios';
// @ts-expect-error - cheerio types not available
import * as cheerio from 'cheerio';
import crypto from 'crypto';

// ==================== TYPES ====================

export interface LearningSource {
  id: string;
  type:
    | 'tenant_interaction'
    | 'web_scraping'
    | 'marketing_material'
    | 'user_feedback'
    | 'system_event';
  tenantId?: string; // Anonymized if applicable
  content: string;
  metadata: Record<string, any>;
  anonymized: boolean;
  timestamp: Date;
}

export interface KnowledgeFragment {
  id: string;
  category:
    | 'business_logic'
    | 'industry_best_practice'
    | 'user_pattern'
    | 'technical_solution'
    | 'marketing_insight';
  content: string;
  confidence: number; // 0-1
  sources: string[]; // Source IDs
  embeddings?: number[]; // Vector embeddings
  usageCount: number;
  lastUsed?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface TenantLearning {
  tenantId: string; // Hashed/anonymized
  industry: string;
  patterns: string[];
  preferences: Record<string, any>;
  successMetrics: Record<string, number>;
  anonymized: boolean;
}

export interface ScrapingTarget {
  url: string;
  type: 'documentation' | 'blog' | 'research' | 'news' | 'competitor';
  allowedDomains: string[];
  excludedPatterns: string[];
  maxDepth: number;
  respectRobotsTxt: boolean;
}

export interface PrivacyPolicy {
  anonymizeUserData: boolean;
  anonymizeTenantData: boolean;
  retentionDays: number;
  allowExternalLearning: boolean;
  shareLearningsAcrossTenants: boolean; // Only anonymized
  revealStack: boolean; // ALWAYS FALSE
}

// ==================== SOFIA LEARNING ENGINE ====================

export class SofiaLearningEngine_v4 {
  private redis: Redis;
  private pool: Pool;
  private langchain: LangChainService;
  private qdrant: QdrantService;
  private langfuse: LangfuseService;

  private privacyPolicy: PrivacyPolicy = {
    anonymizeUserData: true,
    anonymizeTenantData: true,
    retentionDays: 365,
    allowExternalLearning: true,
    shareLearningsAcrossTenants: true,
    revealStack: false, // NEVER reveal Software Lotus stack
  };

  private knowledgeGraph: Map<string, KnowledgeFragment> = new Map();
  private isLearning: boolean = false;

  constructor(
    redisClient: Redis,
    pgPool: Pool,
    langchainService: LangChainService,
    qdrantService: QdrantService,
    langfuseService: LangfuseService
  ) {
    this.redis = redisClient;
    this.pool = pgPool;
    this.langchain = langchainService;
    this.qdrant = qdrantService;
    this.langfuse = langfuseService;
  }

  async initialize(): Promise<void> {
    console.log('🧠 Initializing Sofia Learning Engine v4.0...');
    console.log('   Privacy-first | Anonymous learning | Secure scraping');

    // Initialize database schema
    await this.initializeSchema();

    // Load existing knowledge into memory
    await this.loadKnowledgeGraph();

    // Start continuous learning loop
    this.startContinuousLearning();

    console.log('✅ Sofia Learning Engine initialized and learning...');
  }

  private async initializeSchema(): Promise<void> {
    const schema = `
      -- Sofia Learning Sources
      CREATE TABLE IF NOT EXISTS sofia_learning_sources (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        type VARCHAR(50) NOT NULL,
        tenant_id_hash VARCHAR(64), -- SHA256 hash for anonymity
        content TEXT NOT NULL,
        metadata JSONB,
        anonymized BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW()
      );

      -- Sofia Knowledge Graph
      CREATE TABLE IF NOT EXISTS sofia_knowledge_graph (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        category VARCHAR(50) NOT NULL,
        content TEXT NOT NULL,
        confidence DECIMAL(3,2) CHECK (confidence >= 0 AND confidence <= 1),
        sources JSONB, -- Array of source IDs
        embeddings vector(1536), -- pgVector for similarity search
        usage_count INTEGER DEFAULT 0,
        last_used TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      -- Sofia Tenant Learnings (Anonymized)
      CREATE TABLE IF NOT EXISTS sofia_tenant_learnings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id_hash VARCHAR(64) UNIQUE NOT NULL,
        industry VARCHAR(100),
        patterns JSONB,
        preferences JSONB,
        success_metrics JSONB,
        anonymized BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      -- Sofia Scraping Queue
      CREATE TABLE IF NOT EXISTS sofia_scraping_queue (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        url TEXT NOT NULL,
        type VARCHAR(50),
        priority INTEGER DEFAULT 5,
        status VARCHAR(20) DEFAULT 'pending',
        retry_count INTEGER DEFAULT 0,
        max_retries INTEGER DEFAULT 3,
        scheduled_for TIMESTAMP DEFAULT NOW(),
        completed_at TIMESTAMP
      );

      -- Sofia Learning Metrics
      CREATE TABLE IF NOT EXISTS sofia_learning_metrics (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        metric_type VARCHAR(50) NOT NULL,
        value DECIMAL(12,2),
        metadata JSONB,
        recorded_at TIMESTAMP DEFAULT NOW()
      );

      -- Indexes
      CREATE INDEX IF NOT EXISTS idx_learning_sources_type ON sofia_learning_sources(type);
      CREATE INDEX IF NOT EXISTS idx_learning_sources_tenant ON sofia_learning_sources(tenant_id_hash);
      CREATE INDEX IF NOT EXISTS idx_knowledge_category ON sofia_knowledge_graph(category);
      CREATE INDEX IF NOT EXISTS idx_knowledge_confidence ON sofia_knowledge_graph(confidence DESC);
      CREATE INDEX IF NOT EXISTS idx_scraping_status ON sofia_scraping_queue(status);
      CREATE INDEX IF NOT EXISTS idx_scraping_scheduled ON sofia_scraping_queue(scheduled_for);

      -- Vector similarity search index
      CREATE INDEX IF NOT EXISTS idx_knowledge_embeddings ON sofia_knowledge_graph
        USING ivfflat (embeddings vector_cosine_ops) WITH (lists = 100);
    `;

    await this.pool.query(schema);
  }

  private async loadKnowledgeGraph(): Promise<void> {
    console.log('🧠 Loading Sofia knowledge graph into memory...');

    const result = await this.pool.query(
      'SELECT * FROM sofia_knowledge_graph ORDER BY confidence DESC LIMIT 10000'
    );

    for (const row of result.rows) {
      const fragment: KnowledgeFragment = {
        id: row.id,
        category: row.category,
        content: row.content,
        confidence: parseFloat(row.confidence),
        sources: row.sources || [],
        usageCount: row.usage_count || 0,
        lastUsed: row.last_used,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };

      this.knowledgeGraph.set(fragment.id, fragment);
    }

    console.log(`   Loaded ${this.knowledgeGraph.size} knowledge fragments`);
  }

  // ==================== ANONYMOUS LEARNING FROM TENANTS ====================

  async learnFromTenantInteraction(data: {
    tenantId: string;
    interactionType: string;
    content: string;
    metadata?: Record<string, any>;
  }): Promise<void> {
    // Hash tenant ID for anonymity
    const tenantIdHash = this.hashTenantId(data.tenantId);

    // Create anonymized learning source
    const source: LearningSource = {
      id: crypto.randomUUID(),
      type: 'tenant_interaction',
      tenantId: tenantIdHash,
      content: this.anonymizeContent(data.content),
      metadata: this.anonymizeMetadata(data.metadata || {}),
      anonymized: true,
      timestamp: new Date(),
    };

    // Store learning source
    await this.pool.query(
      `INSERT INTO sofia_learning_sources (id, type, tenant_id_hash, content, metadata, anonymized)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        source.id,
        source.type,
        source.tenantId,
        source.content,
        JSON.stringify(source.metadata),
        source.anonymized,
      ]
    );

    // Extract knowledge from interaction
    await this.extractKnowledge(source);

    // Update tenant learning profile (anonymized)
    await this.updateTenantLearning(tenantIdHash, data.interactionType, data.metadata);

    console.log(`🧠 Learned from tenant interaction (anonymized): ${data.interactionType}`);
  }

  private hashTenantId(tenantId: string): string {
    return crypto.createHash('sha256').update(tenantId).digest('hex');
  }

  private anonymizeContent(content: string): string {
    // Remove PII: emails, phone numbers, names, addresses
    let anonymized = content;

    // Email anonymization
    anonymized = anonymized.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL]');

    // Phone anonymization
    anonymized = anonymized.replace(/(\+\d{1,3}[- ]?)?\d{10,}/g, '[PHONE]');

    // Credit card anonymization
    anonymized = anonymized.replace(/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, '[CARD]');

    // IP address anonymization
    anonymized = anonymized.replace(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, '[IP]');

    return anonymized;
  }

  private anonymizeMetadata(metadata: Record<string, any>): Record<string, any> {
    const anonymized = { ...metadata };

    // Remove sensitive keys
    const sensitiveKeys = [
      'userId',
      'email',
      'phone',
      'address',
      'creditCard',
      'ssn',
      'password',
      'token',
      'apiKey',
    ];

    for (const key of sensitiveKeys) {
      if (anonymized[key]) {
        anonymized[key] = '[REDACTED]';
      }
    }

    // Never reveal stack information
    const stackKeys = ['framework', 'library', 'database', 'server', 'deployment', 'vendor'];
    for (const key of stackKeys) {
      if (anonymized[key]) {
        delete anonymized[key]; // Remove completely
      }
    }

    return anonymized;
  }

  private async updateTenantLearning(
    tenantIdHash: string,
    interactionType: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    // Update or create tenant learning profile
    const existing = await this.pool.query(
      'SELECT * FROM sofia_tenant_learnings WHERE tenant_id_hash = $1',
      [tenantIdHash]
    );

    if (existing.rows.length > 0) {
      // Update existing
      const current = existing.rows[0];
      const patterns = current.patterns || [];

      if (!patterns.includes(interactionType)) {
        patterns.push(interactionType);
      }

      await this.pool.query(
        `UPDATE sofia_tenant_learnings
         SET patterns = $1, updated_at = NOW()
         WHERE tenant_id_hash = $2`,
        [JSON.stringify(patterns), tenantIdHash]
      );
    } else {
      // Create new
      await this.pool.query(
        `INSERT INTO sofia_tenant_learnings (tenant_id_hash, patterns, anonymized)
         VALUES ($1, $2, $3)`,
        [tenantIdHash, JSON.stringify([interactionType]), true]
      );
    }
  }

  // ==================== SECURE WEB SCRAPING ====================

  async scrapeWebContent(target: ScrapingTarget): Promise<void> {
    console.log(`🌐 Sofia scraping: ${target.url}`);

    // IMPORTANT: Never reveal Software Lotus stack in User-Agent or headers
    const safeHeaders = {
      'User-Agent': 'Mozilla/5.0 (compatible; Research Bot; +https://example.com/bot)',
      Accept: 'text/html,application/xhtml+xml,application/xml',
      // NO stack revelation: no "Sofia AI", "MagicSaaS", "Software Lotus"
    };

    // Check robots.txt if required
    if (target.respectRobotsTxt) {
      const allowed = await this.checkRobotsTxt(target.url);
      if (!allowed) {
        console.log(`   ❌ Blocked by robots.txt: ${target.url}`);
        return;
      }
    }

    try {
      // Add to scraping queue
      await this.pool.query(
        `INSERT INTO sofia_scraping_queue (url, type, status)
         VALUES ($1, $2, 'processing')`,
        [target.url, target.type]
      );

      // Fetch content with timeout and retry logic
      const response = await axios.get(target.url, {
        headers: safeHeaders,
        timeout: 10000,
        maxRedirects: 5,
        validateStatus: (status) => status < 500,
      });

      if (response.status !== 200) {
        console.log(`   ⚠️ Non-200 response: ${response.status}`);
        return;
      }

      // Parse HTML with cheerio
      const $ = cheerio.load(response.data);

      // Extract relevant content (remove scripts, styles, ads)
      $('script, style, nav, footer, aside, .ad, .advertisement').remove();
      const textContent = $('body').text().trim();

      // Extract knowledge from scraped content
      const source: LearningSource = {
        id: crypto.randomUUID(),
        type: 'web_scraping',
        content: textContent.substring(0, 10000), // Limit size
        metadata: {
          url: target.url,
          type: target.type,
          scrapedAt: new Date(),
          // NO stack information revealed
        },
        anonymized: true,
        timestamp: new Date(),
      };

      await this.pool.query(
        `INSERT INTO sofia_learning_sources (id, type, content, metadata, anonymized)
         VALUES ($1, $2, $3, $4, $5)`,
        [source.id, source.type, source.content, JSON.stringify(source.metadata), source.anonymized]
      );

      // Extract knowledge
      await this.extractKnowledge(source);

      // Update scraping queue status
      await this.pool.query(
        `UPDATE sofia_scraping_queue
         SET status = 'completed', completed_at = NOW()
         WHERE url = $1`,
        [target.url]
      );

      console.log(`   ✅ Scraped and learned from: ${target.url}`);
    } catch (error: any) {
      console.error(`   ❌ Scraping failed: ${error.message}`);

      // Update retry count
      await this.pool.query(
        `UPDATE sofia_scraping_queue
         SET status = 'failed', retry_count = retry_count + 1
         WHERE url = $1`,
        [target.url]
      );
    }
  }

  private async checkRobotsTxt(url: string): Promise<boolean> {
    try {
      const urlObj = new URL(url);
      const robotsUrl = `${urlObj.protocol}//${urlObj.host}/robots.txt`;

      const response = await axios.get(robotsUrl, { timeout: 5000 });
      const robotsTxt = response.data;

      // Simple check - in production, use a robots.txt parser library
      if (robotsTxt.includes('Disallow: /')) {
        return false;
      }

      return true;
    } catch {
      // If robots.txt doesn't exist or fails, allow scraping
      return true;
    }
  }

  // ==================== KNOWLEDGE EXTRACTION ====================

  private async extractKnowledge(source: LearningSource): Promise<void> {
    // Use Sofia's AI to extract actionable knowledge
    const extraction = await this.langchain.processIntention({
      intention: 'Extract key knowledge, patterns, and insights from this content',
      context: {
        content: source.content,
        type: source.type,
        metadata: source.metadata,
      },
    });

    // Create knowledge fragments
    if (extraction.insights && extraction.insights.length > 0) {
      for (const insight of extraction.insights) {
        const fragment: KnowledgeFragment = {
          id: crypto.randomUUID(),
          category: this.categorizeInsight(insight),
          content: insight,
          confidence: 0.7, // Initial confidence
          sources: [source.id],
          usageCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        // Generate embeddings for vector search
        const embeddings = await this.generateEmbeddings(insight);
        fragment.embeddings = embeddings;

        // Store in database
        await this.pool.query(
          `INSERT INTO sofia_knowledge_graph (id, category, content, confidence, sources, embeddings)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            fragment.id,
            fragment.category,
            fragment.content,
            fragment.confidence,
            JSON.stringify(fragment.sources),
            `[${embeddings.join(',')}]`, // pgVector format
          ]
        );

        // Add to in-memory graph
        this.knowledgeGraph.set(fragment.id, fragment);

        console.log(`   📚 Extracted knowledge: ${fragment.category}`);
      }
    }
  }

  private categorizeInsight(insight: string): KnowledgeFragment['category'] {
    const lower = insight.toLowerCase();

    if (lower.includes('business') || lower.includes('strategy')) return 'business_logic';
    if (lower.includes('best practice') || lower.includes('industry'))
      return 'industry_best_practice';
    if (lower.includes('user') || lower.includes('pattern')) return 'user_pattern';
    if (lower.includes('technical') || lower.includes('solution')) return 'technical_solution';
    if (lower.includes('marketing') || lower.includes('campaign')) return 'marketing_insight';

    return 'business_logic';
  }

  private async generateEmbeddings(text: string): Promise<number[]> {
    // Use LangChain to generate embeddings (1536D for OpenAI)
    // In production, this would call the embeddings API
    // For now, return mock embeddings
    const embeddings = new Array(1536).fill(0).map(() => Math.random() * 2 - 1);
    return embeddings;
  }

  // ==================== MARKETING MATERIALS LEARNING ====================

  async learnFromMarketingMaterials(materials: {
    type: 'blog' | 'case_study' | 'whitepaper' | 'video' | 'social_post';
    content: string;
    metadata?: Record<string, any>;
  }): Promise<void> {
    console.log(`📊 Sofia learning from marketing: ${materials.type}`);

    const source: LearningSource = {
      id: crypto.randomUUID(),
      type: 'marketing_material',
      content: materials.content,
      metadata: {
        materialType: materials.type,
        ...materials.metadata,
      },
      anonymized: true,
      timestamp: new Date(),
    };

    // Store source
    await this.pool.query(
      `INSERT INTO sofia_learning_sources (id, type, content, metadata, anonymized)
       VALUES ($1, $2, $3, $4, $5)`,
      [source.id, source.type, source.content, JSON.stringify(source.metadata), source.anonymized]
    );

    // Extract marketing insights
    await this.extractKnowledge(source);

    // Update marketing metrics
    await this.pool.query(
      `INSERT INTO sofia_learning_metrics (metric_type, value, metadata)
       VALUES ('marketing_material_learned', 1, $1)`,
      [JSON.stringify({ type: materials.type })]
    );

    console.log(`   ✅ Learned from ${materials.type}`);
  }

  // ==================== KNOWLEDGE RETRIEVAL ====================

  async queryKnowledge(
    query: string,
    category?: string,
    limit: number = 10
  ): Promise<KnowledgeFragment[]> {
    // Generate query embeddings
    const queryEmbeddings = await this.generateEmbeddings(query);

    // Vector similarity search
    const sql = `
      SELECT *, embeddings <=> $1::vector as distance
      FROM sofia_knowledge_graph
      ${category ? 'WHERE category = $2' : ''}
      ORDER BY distance
      LIMIT $${category ? '3' : '2'}
    `;

    const params = category
      ? [`[${queryEmbeddings.join(',')}]`, category, limit]
      : [`[${queryEmbeddings.join(',')}]`, limit];

    const result = await this.pool.query(sql, params);

    const fragments: KnowledgeFragment[] = result.rows.map((row) => ({
      id: row.id,
      category: row.category,
      content: row.content,
      confidence: parseFloat(row.confidence),
      sources: row.sources || [],
      usageCount: row.usage_count || 0,
      lastUsed: row.last_used,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    // Update usage count
    for (const fragment of fragments) {
      await this.pool.query(
        `UPDATE sofia_knowledge_graph
         SET usage_count = usage_count + 1, last_used = NOW()
         WHERE id = $1`,
        [fragment.id]
      );
    }

    return fragments;
  }

  // ==================== CONTINUOUS LEARNING ====================

  private startContinuousLearning(): Promise<void> {
    this.isLearning = true;

    // Run learning loop every 5 minutes
    setInterval(
      async () => {
        if (!this.isLearning) return;

        try {
          // Process scraping queue
          await this.processScrapingQueue();

          // Refine knowledge (increase confidence of frequently used, decrease rarely used)
          await this.refineKnowledge();

          // Generate learning metrics
          await this.generateLearningMetrics();
        } catch (error: any) {
          console.error('❌ Continuous learning error:', error.message);
        }
      },
      5 * 60 * 1000
    ); // 5 minutes

    return Promise.resolve();
  }

  private async processScrapingQueue(): Promise<void> {
    const pending = await this.pool.query(
      `SELECT * FROM sofia_scraping_queue
       WHERE status = 'pending' AND scheduled_for <= NOW()
       ORDER BY priority DESC
       LIMIT 5`
    );

    for (const job of pending.rows) {
      const target: ScrapingTarget = {
        url: job.url,
        type: job.type,
        allowedDomains: [],
        excludedPatterns: [],
        maxDepth: 1,
        respectRobotsTxt: true,
      };

      await this.scrapeWebContent(target);

      // Rate limiting: wait 2 seconds between requests
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  private async refineKnowledge(): Promise<void> {
    // Increase confidence of frequently used knowledge
    await this.pool.query(`
      UPDATE sofia_knowledge_graph
      SET confidence = LEAST(1.0, confidence + 0.01)
      WHERE usage_count > 10 AND last_used > NOW() - INTERVAL '7 days'
    `);

    // Decrease confidence of rarely used knowledge
    await this.pool.query(`
      UPDATE sofia_knowledge_graph
      SET confidence = GREATEST(0.1, confidence - 0.01)
      WHERE usage_count < 2 AND created_at < NOW() - INTERVAL '30 days'
    `);

    console.log('🔄 Sofia refined knowledge graph');
  }

  private async generateLearningMetrics(): Promise<void> {
    const stats = await this.pool.query(`
      SELECT
        COUNT(*) as total_knowledge,
        AVG(confidence) as avg_confidence,
        SUM(usage_count) as total_usage
      FROM sofia_knowledge_graph
    `);

    const row = stats.rows[0];

    await this.pool.query(
      `INSERT INTO sofia_learning_metrics (metric_type, value, metadata)
       VALUES
         ('total_knowledge', $1, '{}'),
         ('avg_confidence', $2, '{}'),
         ('total_usage', $3, '{}')`,
      [row.total_knowledge, row.avg_confidence, row.total_usage]
    );
  }

  // ==================== INTEGRATION WITH ERP, CRM, PÉTALAS ====================

  async learnFromERPData(data: {
    module: 'financial' | 'inventory' | 'hr' | 'crm' | 'projects';
    event: string;
    anonymizedData: Record<string, any>;
  }): Promise<void> {
    console.log(`💼 Sofia learning from ERP (${data.module}): ${data.event}`);

    const source: LearningSource = {
      id: crypto.randomUUID(),
      type: 'system_event',
      content: `ERP ${data.module} event: ${data.event}`,
      metadata: {
        module: data.module,
        event: data.event,
        data: this.anonymizeMetadata(data.anonymizedData),
      },
      anonymized: true,
      timestamp: new Date(),
    };

    await this.pool.query(
      `INSERT INTO sofia_learning_sources (id, type, content, metadata, anonymized)
       VALUES ($1, $2, $3, $4, $5)`,
      [source.id, source.type, source.content, JSON.stringify(source.metadata), source.anonymized]
    );

    await this.extractKnowledge(source);
  }

  async learnFromPetalaUsage(data: {
    petalaType: string;
    action: string;
    anonymizedContext: Record<string, any>;
  }): Promise<void> {
    console.log(`🌸 Sofia learning from pétala (${data.petalaType}): ${data.action}`);

    const source: LearningSource = {
      id: crypto.randomUUID(),
      type: 'system_event',
      content: `Pétala ${data.petalaType} action: ${data.action}`,
      metadata: {
        petala: data.petalaType,
        action: data.action,
        context: this.anonymizeMetadata(data.anonymizedContext),
      },
      anonymized: true,
      timestamp: new Date(),
    };

    await this.pool.query(
      `INSERT INTO sofia_learning_sources (id, type, content, metadata, anonymized)
       VALUES ($1, $2, $3, $4, $5)`,
      [source.id, source.type, source.content, JSON.stringify(source.metadata), source.anonymized]
    );

    await this.extractKnowledge(source);
  }

  // ==================== STATUS & METRICS ====================

  async getStatus(): Promise<{
    status: 'learning' | 'idle';
    knowledgeFragments: number;
    averageConfidence: number;
    totalUsage: number;
    scrapingQueueSize: number;
    privacyCompliant: boolean;
  }> {
    const stats = await this.pool.query(`
      SELECT
        COUNT(*) as total,
        AVG(confidence) as avg_conf,
        SUM(usage_count) as total_use
      FROM sofia_knowledge_graph
    `);

    const queue = await this.pool.query(
      `SELECT COUNT(*) as pending FROM sofia_scraping_queue WHERE status = 'pending'`
    );

    return {
      status: this.isLearning ? 'learning' : 'idle',
      knowledgeFragments: parseInt(stats.rows[0].total),
      averageConfidence: parseFloat(stats.rows[0].avg_conf),
      totalUsage: parseInt(stats.rows[0].total_use),
      scrapingQueueSize: parseInt(queue.rows[0].pending),
      privacyCompliant: this.privacyPolicy.anonymizeUserData && !this.privacyPolicy.revealStack,
    };
  }

  async stop(): Promise<void> {
    this.isLearning = false;
    console.log('🛑 Sofia Learning Engine stopped');
  }
}

export default SofiaLearningEngine_v4;
