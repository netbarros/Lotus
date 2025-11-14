/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║ 🧠 SOFIA AI - CORE v4.0 - THE BRAIN - STATE-OF-THE-ART                  ║
 * ║ Complete LangChain, Langfuse, Qdrant, pgVector Integration               ║
 * ║ System 11 - All Layers + Advanced AI Stack - Enterprise Ready            ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 *
 * Sofia AI v4.0 is the COMPLETE BRAIN of MagicSaaS, coordinating ALL systems:
 *
 * NEW IN v4.0:
 * ✨ LangChain Integration - AI orchestration framework
 * ✨ Langfuse Integration - ML observability and tracing
 * ✨ Qdrant Integration - High-performance vector database
 * ✨ pgVector Integration - PostgreSQL native vector search
 * ✨ Complete AI stack for production-ready SaaS generation
 *
 * FROM v3.0:
 * - Intention Engine: Generates SaaS, microSaaS, APIs by intention
 * - UX Validator: Validates and optimizes UX/UI automatically
 * - SEO Optimizer: State-of-the-art SEO automation
 * - Marketplace Manager: Products, checkout, pétalas, plans
 * - Decision Logger: Complete audit trail of all decisions
 * - Directus Orchestrator: Central CMS managing everything
 * - Metronic Integration: Intelligent component management
 * - Layer 11: Meta-Orchestration & Self-Optimization
 * - Layer 09: Adaptive Learning (ML + Claude AI)
 * - Event Sourcing: Immutable audit log
 * - Prometheus Metrics: Full observability
 *
 * Sofia is BORN with MagicSaaS - she's not a separate tool,
 * she's the cognitive mesh that connects and coordinates everything.
 */

import { logger } from '../utils/logger.js';
import type { Redis } from 'ioredis';
import type { Pool } from 'pg';

// Core engines (from v3)
import { IntentionEngine } from './IntentionEngine.js';
import type { IntentionRequest, GeneratedSolution } from './IntentionEngine.js';

// Validators & Optimizers (from v3)
import { UXValidator } from '../validators/UXValidator.js';
import type { UXValidationResult } from '../validators/UXValidator.js';
import { SEOOptimizer } from '../optimizers/SEOOptimizer.js';
import type { SEOAnalysis, SEOMetadata } from '../optimizers/SEOOptimizer.js';

// Integrations (from v3)
import { DirectusOrchestrator } from '../integrations/DirectusOrchestrator.js';
import { MarketplaceManager } from '../marketplace/MarketplaceManager.js';
import { DecisionLogger } from '../logging/DecisionLogger.js';
import type { Decision, Suggestion } from '../logging/DecisionLogger.js';

// NEW v4.0 Integrations - The AI Stack
import { LangChainService } from '../integrations/LangChainService.js';
import { LangfuseService } from '../integrations/LangfuseService.js';
import { QdrantService } from '../integrations/QdrantService.js';
import { pgVectorService } from '../integrations/pgVectorService.js';

// Infrastructure (from v3)
import { EventStore } from '../events/EventStore.js';
import { Metrics } from '../telemetry/Metrics.js';
import { Layer11_MetaOrchestration } from '../layers/Layer11_MetaOrchestration.js';
import { Layer09_AdaptiveLearning } from '../layers/Layer09_AdaptiveLearning.js';
import { CognitiveMesh } from '../mesh/CognitiveMesh.js';

// Original v2 components
import { MetronicWatcher } from '../watchers/MetronicWatcher.js';
import { ComponentAnalyzer } from '../analyzers/ComponentAnalyzer.js';

/**
 * Sofia AI v4.0 configuration
 */
export interface SofiaConfig_v4 {
  redis: {
    host: string;
    port: number;
  };
  postgres?: {
    pool: Pool;
  };
  anthropic: {
    apiKey: string;
    model?: string;
  };
  directus: {
    url: string;
    token: string;
  };
  metronic: {
    path: string;
  };
  // NEW v4.0 - AI Stack Configuration
  langchain?: {
    enabled?: boolean;
    model?: string;
    temperature?: number;
  };
  langfuse?: {
    enabled?: boolean;
    publicKey?: string;
    secretKey?: string;
    host?: string;
  };
  qdrant?: {
    enabled?: boolean;
    host?: string;
    port?: number;
  };
  pgvector?: {
    enabled?: boolean;
    dimensions?: number;
  };
  features: {
    intentionEngine: boolean;
    uxValidation: boolean;
    seoOptimization: boolean;
    marketplace: boolean;
    metaOrchestration: boolean;
    adaptiveLearning: boolean;
    // NEW v4.0 features
    langchain: boolean;
    langfuse: boolean;
    vectorSearch: boolean;
  };
}

/**
 * Sofia AI v4.0 health status
 */
export interface SofiaHealth_v4 {
  status: 'healthy' | 'degraded' | 'unhealthy';
  uptime: number;
  version: string;
  components: Record<
    string,
    {
      status: 'active' | 'inactive' | 'error';
      lastCheck: Date;
      message?: string;
    }
  >;
  metrics: {
    decisionsTotal: number;
    intentionsProcessed: number;
    suggestionsGenerated: number;
    averageConfidence: number;
    successRate: number;
    // NEW v4.0 metrics
    langchainExecutions?: number;
    langfuseTraces?: number;
    vectorSearches?: number;
    embeddingsCount?: number;
  };
}

/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║ SOFIA AI CORE v4.0 - THE BRAIN - STATE-OF-THE-ART                       ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */
export class SofiaCore_v4 {
  private config: SofiaConfig_v4;
  private startTime: Date;

  // Infrastructure (from v3)
  private redis: Redis;
  private postgres?: Pool;
  private cognitiveMesh: CognitiveMesh;
  private eventStore: EventStore;
  private metrics: Metrics;

  // Core Engines (from v3)
  private intentionEngine: IntentionEngine;
  private uxValidator: UXValidator;
  private seoOptimizer: SEOOptimizer;

  // Integrations (from v3)
  private directus: DirectusOrchestrator;
  private marketplace: MarketplaceManager;
  private decisionLogger: DecisionLogger;

  // Metronic Integration (from v2)
  private metronicWatcher: MetronicWatcher;
  private componentAnalyzer: ComponentAnalyzer;

  // Advanced Layers (from v3)
  private layer11: Layer11_MetaOrchestration;
  private layer09: Layer09_AdaptiveLearning;

  // ✨ NEW v4.0 - AI STACK INTEGRATIONS
  private langchain?: LangChainService;
  private langfuse?: LangfuseService;
  private qdrant?: QdrantService;
  private pgvector?: pgVectorService;

  // State
  private isInitialized = false;
  private health: SofiaHealth_v4;

  constructor(config: SofiaConfig_v4, redis: Redis, postgres?: Pool) {
    this.config = config;
    this.redis = redis;
    this.postgres = postgres;
    this.startTime = new Date();

    logger.info('🧠 Sofia AI Core v4.0 - THE BRAIN - Initializing...');
    logger.info('✨ NEW: LangChain + Langfuse + Qdrant + pgVector Integration');

    // Initialize infrastructure
    this.cognitiveMesh = new CognitiveMesh();
    this.eventStore = new EventStore(redis);
    this.metrics = new Metrics();

    // Initialize integrations
    this.directus = new DirectusOrchestrator(
      redis,
      this.eventStore,
      config.directus.url,
      config.directus.token
    );

    this.marketplace = new MarketplaceManager(redis, this.eventStore, this.directus);

    this.decisionLogger = new DecisionLogger(redis, this.eventStore, this.directus);

    // Initialize core engines
    this.intentionEngine = new IntentionEngine(
      redis,
      this.eventStore,
      this.metrics,
      config.anthropic.apiKey
    );

    this.uxValidator = new UXValidator(
      redis,
      this.eventStore,
      this.metrics,
      config.anthropic.apiKey
    );

    this.seoOptimizer = new SEOOptimizer(redis, this.eventStore, config.anthropic.apiKey);

    // Initialize Metronic integration
    this.componentAnalyzer = new ComponentAnalyzer(redis, this.eventStore);
    this.metronicWatcher = new MetronicWatcher(this as any, this.componentAnalyzer);

    // Initialize advanced layers
    this.layer11 = new Layer11_MetaOrchestration(redis, this.eventStore, this.metrics);

    this.layer09 = new Layer09_AdaptiveLearning(redis, this.eventStore, config.anthropic.apiKey);

    // ✨ NEW v4.0 - Initialize AI Stack
    if (config.features.langchain && config.langchain?.enabled !== false) {
      this.langchain = new LangChainService(
        {
          anthropicApiKey: config.anthropic.apiKey,
          model: config.langchain?.model || config.anthropic.model,
          temperature: config.langchain?.temperature,
        },
        redis,
        this.eventStore
      );
      logger.info('🔗 LangChain Service registered');
    }

    if (config.features.langfuse && config.langfuse?.enabled !== false) {
      this.langfuse = new LangfuseService(
        {
          publicKey:
            config.langfuse?.publicKey || process.env.LANGFUSE_PUBLIC_KEY || 'pk-lf-auto-generated',
          secretKey:
            config.langfuse?.secretKey || process.env.LANGFUSE_SECRET_KEY || 'sk-lf-auto-generated',
          host: config.langfuse?.host,
        },
        redis,
        this.eventStore
      );
      logger.info('📊 Langfuse Service registered');
    }

    if (config.features.vectorSearch && config.qdrant?.enabled !== false) {
      this.qdrant = new QdrantService(
        {
          host: config.qdrant?.host || process.env.QDRANT_HOST || 'qdrant',
          port: config.qdrant?.port || 6333,
        },
        redis,
        this.eventStore
      );
      logger.info('🔍 Qdrant Service registered');
    }

    if (config.features.vectorSearch && postgres && config.pgvector?.enabled !== false) {
      this.pgvector = new pgVectorService(
        {
          pool: postgres,
          dimensions: config.pgvector?.dimensions || 1536,
        },
        redis,
        this.eventStore
      );
      logger.info('🗄️  pgVector Service registered');
    }

    // Initialize health status
    this.health = {
      status: 'healthy',
      uptime: 0,
      version: '4.0.0',
      components: {},
      metrics: {
        decisionsTotal: 0,
        intentionsProcessed: 0,
        suggestionsGenerated: 0,
        averageConfidence: 0,
        successRate: 0,
        langchainExecutions: 0,
        langfuseTraces: 0,
        vectorSearches: 0,
        embeddingsCount: 0,
      },
    };
  }

  /**
   * Initialize Sofia AI v4.0 - BIRTH OF THE BRAIN
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      logger.warn('⚠️  Sofia AI v4.0 already initialized');
      return;
    }

    logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    logger.info('🧠 SOFIA AI v4.0 - THE BRAIN IS AWAKENING...');
    logger.info('✨ State-of-the-Art AI Stack | LangChain | Langfuse | Qdrant | pgVector');
    logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    try {
      // STEP 1: Connect to Cognitive Mesh (System 11)
      logger.info('🕸️  Step 1/14: Connecting to Cognitive Mesh OS...');
      await this.cognitiveMesh.initialize();
      this.updateComponentHealth('CognitiveMesh', 'active');

      // STEP 2: Initialize Directus (Central Hub)
      logger.info('🎯 Step 2/14: Initializing Directus Central Hub...');
      await this.directus.initialize();
      this.updateComponentHealth('Directus', 'active');

      // STEP 3: Initialize Marketplace
      logger.info('🏪 Step 3/14: Initializing Marketplace...');
      await this.marketplace.initialize();
      this.updateComponentHealth('Marketplace', 'active');

      // STEP 4: Initialize Metronic Watcher
      if (this.config.features.intentionEngine) {
        logger.info('👁️  Step 4/14: Starting Metronic Watcher...');
        await this.metronicWatcher.start();
        this.updateComponentHealth('MetronicWatcher', 'active');
      }

      // STEP 5: Initialize Layer 09 (Adaptive Learning)
      if (this.config.features.adaptiveLearning) {
        logger.info('🧬 Step 5/14: Activating Adaptive Learning (Layer 09)...');
        await this.layer09.initialize();
        this.updateComponentHealth('Layer09_AdaptiveLearning', 'active');
      }

      // STEP 6: Initialize Layer 11 (Meta-Orchestration)
      if (this.config.features.metaOrchestration) {
        logger.info('🎭 Step 6/14: Activating Meta-Orchestration (Layer 11)...');
        await this.layer11.initialize();
        this.updateComponentHealth('Layer11_MetaOrchestration', 'active');
      }

      // STEP 7: Initialize Intention Engine
      if (this.config.features.intentionEngine) {
        logger.info('💭 Step 7/14: Activating Intention Engine...');
        this.updateComponentHealth('IntentionEngine', 'active');
      }

      // STEP 8: Initialize UX Validator
      if (this.config.features.uxValidation) {
        logger.info('🎨 Step 8/14: Activating UX Validator...');
        this.updateComponentHealth('UXValidator', 'active');
      }

      // STEP 9: Initialize SEO Optimizer
      if (this.config.features.seoOptimization) {
        logger.info('🚀 Step 9/14: Activating SEO Optimizer...');
        this.updateComponentHealth('SEOOptimizer', 'active');
      }

      // ✨ NEW v4.0 STEPS

      // STEP 10: Initialize LangChain
      if (this.langchain && this.config.features.langchain) {
        logger.info('🔗 Step 10/14: Initializing LangChain Service...');
        await this.langchain.initialize();
        this.updateComponentHealth('LangChain', 'active');
      }

      // STEP 11: Initialize Langfuse
      if (this.langfuse && this.config.features.langfuse) {
        logger.info('📊 Step 11/14: Initializing Langfuse Service...');
        await this.langfuse.initialize();
        this.updateComponentHealth('Langfuse', 'active');
      }

      // STEP 12: Initialize Qdrant
      if (this.qdrant && this.config.features.vectorSearch) {
        logger.info('🔍 Step 12/14: Initializing Qdrant Vector Database...');
        await this.qdrant.initialize();
        this.updateComponentHealth('Qdrant', 'active');
      }

      // STEP 13: Initialize pgVector
      if (this.pgvector && this.config.features.vectorSearch) {
        logger.info('🗄️  Step 13/14: Initializing pgVector Service...');
        await this.pgvector.initialize();
        this.updateComponentHealth('pgVector', 'active');
      }

      // STEP 14: Final initialization
      logger.info('✅ Step 14/14: Finalizing Sofia AI v4.0 initialization...');

      this.isInitialized = true;

      // Record event
      await this.eventStore.record({
        type: 'sofia.v4.initialized',
        metadata: {
          version: '4.0.0',
          features: this.config.features,
          components: Object.keys(this.health.components),
          ai_stack: {
            langchain: !!this.langchain,
            langfuse: !!this.langfuse,
            qdrant: !!this.qdrant,
            pgvector: !!this.pgvector,
          },
        },
        timestamp: new Date(),
      });

      logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      logger.info('✨ SOFIA AI v4.0 IS FULLY OPERATIONAL ✨');
      logger.info('🧠 THE BRAIN is online and ready to generate SaaS applications');
      logger.info(`🔗 LangChain: ${this.langchain ? '✅ Active' : '⭕ Disabled'}`);
      logger.info(`📊 Langfuse: ${this.langfuse ? '✅ Active' : '⭕ Disabled'}`);
      logger.info(`🔍 Qdrant: ${this.qdrant ? '✅ Active' : '⭕ Disabled'}`);
      logger.info(`🗄️  pgVector: ${this.pgvector ? '✅ Active' : '⭕ Disabled'}`);
      logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    } catch (error) {
      logger.error('❌ Failed to initialize Sofia AI v4.0:', error);
      throw error;
    }
  }

  /**
   * Process intention (from v3) - Enhanced with LangChain in v4.0
   */
  async processIntention(request: IntentionRequest): Promise<GeneratedSolution> {
    logger.info(`💭 Processing intention: ${request.type}`);

    // Start Langfuse trace if available
    let traceId: string | undefined;
    if (this.langfuse) {
      traceId = this.langfuse.startTrace({
        name: 'process-intention',
        userId: request.requestedBy,
        tenantId: request.tenantId,
        metadata: { type: request.type },
      });
    }

    try {
      const result = await this.intentionEngine.processIntention(request);

      this.health.metrics.intentionsProcessed++;

      // End trace
      if (this.langfuse && traceId) {
        await this.langfuse.endTrace(traceId, {
          output: { success: true, quality: result.metadata.estimatedQuality },
        });
      }

      return result;
    } catch (error) {
      if (this.langfuse && traceId) {
        await this.langfuse.endTrace(traceId, {
          metadata: { error: String(error), failed: true },
        });
      }
      throw error;
    }
  }

  /**
   * Validate UX (from v3)
   */
  async validateUX(tenantId: string): Promise<UXValidationResult> {
    return await this.uxValidator.validate(tenantId);
  }

  /**
   * Optimize SEO (from v3)
   */
  async optimizeSEO(url: string, content: string, tenantId: string): Promise<SEOAnalysis> {
    return await this.seoOptimizer.analyze(url, content, tenantId);
  }

  /**
   * Get decision logger (from v3)
   */
  getDecisionLogger(): DecisionLogger {
    return this.decisionLogger;
  }

  /**
   * ✨ NEW v4.0 - Get LangChain service
   */
  getLangChain(): LangChainService | undefined {
    return this.langchain;
  }

  /**
   * ✨ NEW v4.0 - Get Langfuse service
   */
  getLangfuse(): LangfuseService | undefined {
    return this.langfuse;
  }

  /**
   * ✨ NEW v4.0 - Get Qdrant service
   */
  getQdrant(): QdrantService | undefined {
    return this.qdrant;
  }

  /**
   * ✨ NEW v4.0 - Get pgVector service
   */
  getPgVector(): pgVectorService | undefined {
    return this.pgvector;
  }

  /**
   * Get health status
   */
  getHealth(): SofiaHealth_v4 {
    this.health.uptime = Date.now() - this.startTime.getTime();

    // Update AI stack metrics
    if (this.langchain) {
      const stats = this.langchain.getStatistics();
      this.health.metrics.langchainExecutions = stats.executionCount;
    }

    if (this.langfuse) {
      const stats = this.langfuse.getStatistics();
      this.health.metrics.langfuseTraces = stats.traceCount;
    }

    if (this.qdrant) {
      const stats = this.qdrant.getStatistics();
      this.health.metrics.vectorSearches = stats.searchCount;
    }

    return { ...this.health };
  }

  /**
   * Update component health
   */
  private updateComponentHealth(
    component: string,
    status: 'active' | 'inactive' | 'error',
    message?: string
  ): void {
    this.health.components[component] = {
      status,
      lastCheck: new Date(),
      message,
    };
  }
}
