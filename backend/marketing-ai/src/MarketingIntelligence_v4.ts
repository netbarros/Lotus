
/**
 * 🎯 MARKETING INTELLIGENCE SYSTEM v4.0
 * Enterprise State-of-the-Art Marketing AI
 * Powered by Sofia AI v4.0 - The Marketing Brain
 *
 * Sofia está PRESENTE em TODAS as camadas:
 * - Campaign Intelligence
 * - Lead Scoring & Nurturing
 * - Content Generation
 * - Analytics & Insights
 * - Customer Journey Mapping
 * - Predictive Marketing
 *
 * Integrado ao Cognitive Mesh OS
 */

import { Redis } from 'ioredis';
import { Pool } from 'pg';
// Using stubs temporarily until cross-workspace typing is resolved
import {
  LangChainServiceStub as LangChainService,
  LangfuseServiceStub as LangfuseService,
  QdrantServiceStub as QdrantService,
} from './stubs/services.stub';

import {
  Campaign,
  TargetAudience,
  Channel,
  KPI,
  Lead,
  ContentPiece,
  MarketingInsight
} from './types';

import { CampaignModule } from './modules/CampaignModule';
import { LeadModule } from './modules/LeadModule';
import { ContentModule } from './modules/ContentModule';
import { AnalyticsModule } from './modules/AnalyticsModule';
import { JourneyModule } from './modules/JourneyModule';
import { TestingModule } from './modules/TestingModule';

// Re-export types for consumers
export * from './types';
export {
  LangChainService,
  LangfuseService,
  QdrantService
};

// ==================== MARKETING INTELLIGENCE CORE ====================

export class MarketingIntelligence_v4 {
  private redis: Redis;
  private pool: Pool;
  private sofia: LangChainService; // 🧠 Sofia AI - The Brain
  private langfuse: LangfuseService; // 📊 Observability
  private qdrant: QdrantService; // 🔍 Vector Search
  private isInitialized: boolean = false;

  // Modules
  public campaigns: CampaignModule;
  public leads: LeadModule;
  public content: ContentModule;
  public analytics: AnalyticsModule;
  public journeys: JourneyModule;
  public testing: TestingModule;

  constructor(
    redisClient: Redis,
    pgPool: Pool,
    sofiaService: LangChainService,
    langfuseService: LangfuseService,
    qdrantService: QdrantService
  ) {
    this.redis = redisClient;
    this.pool = pgPool;
    this.sofia = sofiaService;
    this.langfuse = langfuseService;
    this.qdrant = qdrantService;

    // Initialize Modules
    this.campaigns = new CampaignModule(this.pool, this.redis, this.sofia, this.langfuse);
    this.leads = new LeadModule(this.pool, this.redis, this.sofia);
    this.content = new ContentModule(this.pool, this.sofia);
    this.analytics = new AnalyticsModule(this.pool);
    this.journeys = new JourneyModule(this.pool, this.sofia);
    this.testing = new TestingModule(this.pool, this.sofia);
  }

  async initialize(): Promise<void> {
    console.log('🎯 Initializing Marketing Intelligence v4.0...');
    console.log('🧠 Sofia AI is present in ALL layers');

    // Verify Sofia AI is ready
    const sofiaStatus = await this.sofia.getStatus();
    if (sofiaStatus.status !== 'healthy') {
      throw new Error('Sofia AI must be healthy to initialize Marketing Intelligence');
    }

    // Initialize database schema
    await this.initializeSchema();

    // Warm up caches
    await this.warmUpCaches();

    this.isInitialized = true;
    console.log('✅ Marketing Intelligence v4.0 initialized with Sofia AI');
  }

  private async initializeSchema(): Promise<void> {
    const schema = `
      -- Marketing Campaigns
      CREATE TABLE IF NOT EXISTS marketing_campaigns (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        status VARCHAR(50) DEFAULT 'draft',
        objective TEXT,
        target_audience JSONB,
        budget DECIMAL(12,2),
        start_date TIMESTAMP,
        end_date TIMESTAMP,
        channels JSONB,
        kpis JSONB,
        sofia_generated BOOLEAN DEFAULT false,
        sofia_optimized BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      -- Leads & Scoring
      CREATE TABLE IF NOT EXISTS marketing_leads (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255),
        company VARCHAR(255),
        role VARCHAR(100),
        source VARCHAR(100),
        score INTEGER DEFAULT 0,
        stage VARCHAR(50) DEFAULT 'awareness',
        last_interaction TIMESTAMP,
        interactions JSONB DEFAULT '[]',
        predicted_conversion DECIMAL(5,4),
        next_best_action TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      -- Content Library
      CREATE TABLE IF NOT EXISTS marketing_content (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        type VARCHAR(50) NOT NULL,
        title VARCHAR(500) NOT NULL,
        content TEXT,
        keywords TEXT[],
        target_audience TEXT[],
        sofia_generated BOOLEAN DEFAULT false,
        seo_score INTEGER,
        engagement_prediction DECIMAL(5,4),
        status VARCHAR(50) DEFAULT 'draft',
        published_at TIMESTAMP,
        performance JSONB,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      -- A/B Tests
      CREATE TABLE IF NOT EXISTS marketing_ab_tests (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        variants JSONB NOT NULL,
        status VARCHAR(50) DEFAULT 'draft',
        winner VARCHAR(100),
        sofia_recommendation VARCHAR(100),
        started_at TIMESTAMP,
        completed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      );

      -- Marketing Insights (Sofia AI Generated)
      CREATE TABLE IF NOT EXISTS marketing_insights (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        impact VARCHAR(20),
        confidence DECIMAL(3,2),
        data JSONB,
        actionable BOOLEAN DEFAULT true,
        suggested_actions JSONB,
        generated_at TIMESTAMP DEFAULT NOW()
      );

      -- Customer Journeys
      CREATE TABLE IF NOT EXISTS marketing_journeys (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        lead_id UUID REFERENCES marketing_leads(id),
        stages JSONB NOT NULL,
        current_stage VARCHAR(100),
        time_in_stage INTEGER,
        sofia_insights JSONB,
        sofia_recommendations JSONB,
        predicted_path JSONB,
        risk_score INTEGER,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      -- Indexes for performance
      CREATE INDEX IF NOT EXISTS idx_campaigns_status ON marketing_campaigns(status);
      CREATE INDEX IF NOT EXISTS idx_campaigns_sofia ON marketing_campaigns(sofia_generated);
      CREATE INDEX IF NOT EXISTS idx_leads_score ON marketing_leads(score DESC);
      CREATE INDEX IF NOT EXISTS idx_leads_stage ON marketing_leads(stage);
      CREATE INDEX IF NOT EXISTS idx_leads_email ON marketing_leads(email);
      CREATE INDEX IF NOT EXISTS idx_content_sofia ON marketing_content(sofia_generated);
      CREATE INDEX IF NOT EXISTS idx_content_type ON marketing_content(type);
      CREATE INDEX IF NOT EXISTS idx_insights_type ON marketing_insights(type);
      CREATE INDEX IF NOT EXISTS idx_journeys_lead ON marketing_journeys(lead_id);
    `;

    await this.pool.query(schema);
  }

  private async warmUpCaches(): Promise<void> {
    // Cache common queries for performance
    await this.redis.set('marketing:initialized', 'true', 'EX', 3600);
  }
}
