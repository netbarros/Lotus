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
import {
  LangChainServiceStub as LangChainService,
  LangfuseServiceStub as LangfuseService,
  QdrantServiceStub as QdrantService,
} from './stubs/services.stub';
export interface Campaign {
  id: string;
  name: string;
  type: 'email' | 'social' | 'ads' | 'content' | 'webinar' | 'event';
  status: 'draft' | 'scheduled' | 'running' | 'paused' | 'completed';
  objective: string;
  targetAudience: TargetAudience;
  budget?: number;
  startDate: Date;
  endDate?: Date;
  channels: Channel[];
  kpis: KPI[];
  sofiaGenerated?: boolean;
  sofiaOptimized?: boolean;
  createdAt: Date;
  updatedAt: Date;
}
export interface TargetAudience {
  segments: string[];
  demographics?: {
    ageRange?: [number, number];
    locations?: string[];
    industries?: string[];
    roles?: string[];
  };
  behaviors?: {
    interests?: string[];
    purchaseHistory?: string[];
    engagementLevel?: 'high' | 'medium' | 'low';
  };
  customCriteria?: Record<string, any>;
}
export interface Channel {
  type:
    | 'linkedin'
    | 'twitter'
    | 'instagram'
    | 'facebook'
    | 'email'
    | 'youtube'
    | 'tiktok'
    | 'google-ads'
    | 'meta-ads';
  budget?: number;
  frequency?: string;
  content?: string[];
}
export interface KPI {
  metric: string;
  target: number;
  current: number;
  unit: string;
}
export interface Lead {
  id: string;
  email: string;
  name?: string;
  company?: string;
  role?: string;
  source: string;
  score: number;
  stage: 'awareness' | 'consideration' | 'decision' | 'customer' | 'advocate';
  lastInteraction?: Date;
  interactions: Interaction[];
  predictedConversion?: number;
  nextBestAction?: string;
  createdAt: Date;
  updatedAt: Date;
}
export interface Interaction {
  type:
    | 'email_open'
    | 'email_click'
    | 'website_visit'
    | 'content_download'
    | 'webinar_attend'
    | 'demo_request'
    | 'trial_start';
  timestamp: Date;
  metadata?: Record<string, any>;
}
export interface ContentPiece {
  id: string;
  type: 'blog' | 'video' | 'infographic' | 'ebook' | 'whitepaper' | 'case_study' | 'social_post';
  title: string;
  content: string;
  keywords: string[];
  targetAudience: string[];
  sofiaGenerated: boolean;
  seoScore?: number;
  engagementPrediction?: number;
  status: 'draft' | 'review' | 'published' | 'archived';
  publishedAt?: Date;
  performance?: {
    views: number;
    engagement: number;
    conversions: number;
    shareRate: number;
  };
  createdAt: Date;
  updatedAt: Date;
}
export interface CustomerJourney {
  leadId: string;
  stages: JourneyStage[];
  currentStage: string;
  timeInStage: number;
  sofiaInsights?: string[];
  sofiaRecommendations?: string[];
  predictedPath?: string[];
  riskScore?: number;
}
export interface JourneyStage {
  name: string;
  enteredAt: Date;
  exitedAt?: Date;
  actions: string[];
  content: string[];
  conversions: number;
}
export interface MarketingInsight {
  id: string;
  type: 'trend' | 'anomaly' | 'opportunity' | 'warning' | 'recommendation';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  confidence: number;
  data: Record<string, any>;
  actionable: boolean;
  suggestedActions?: string[];
  generatedAt: Date;
}
export interface ABTest {
  id: string;
  name: string;
  type: 'email' | 'landing_page' | 'ad_creative' | 'cta' | 'subject_line';
  variants: Variant[];
  status: 'draft' | 'running' | 'completed';
  winner?: string;
  sofiaRecommendation?: string;
  startedAt?: Date;
  completedAt?: Date;
}
export interface Variant {
  id: string;
  name: string;
  content: string;
  traffic: number;
  metrics: {
    impressions: number;
    clicks: number;
    conversions: number;
    ctr: number;
    conversionRate: number;
  };
}
export declare class MarketingIntelligence_v4 {
  private redis;
  private pool;
  private sofia;
  private langfuse;
  private qdrant;
  private isInitialized;
  constructor(
    redisClient: Redis,
    pgPool: Pool,
    sofiaService: LangChainService,
    langfuseService: LangfuseService,
    qdrantService: QdrantService
  );
  initialize(): Promise<void>;
  private initializeSchema;
  private warmUpCaches;
  createCampaign(request: {
    objective: string;
    targetAudience?: TargetAudience;
    budget?: number;
    duration?: number;
    channels?: string[];
  }): Promise<Campaign>;
  private sofiaGenerateAudience;
  private sofiaSelectChannels;
  private sofiaGenerateKPIs;
  private determineCampaignType;
  scoreLead(leadId: string): Promise<number>;
  predictLeadConversion(leadId: string): Promise<number>;
  getNextBestAction(leadId: string): Promise<string>;
  private getLead;
  private getHistoricalConversionData;
  generateContent(request: {
    type: ContentPiece['type'];
    topic: string;
    keywords?: string[];
    targetAudience?: string[];
    length?: 'short' | 'medium' | 'long';
  }): Promise<ContentPiece>;
  private calculateSEOScore;
  private predictEngagement;
  generateInsights(timeframe?: 'day' | 'week' | 'month' | 'quarter'): Promise<MarketingInsight[]>;
  mapCustomerJourney(leadId: string): Promise<CustomerJourney>;
  private analyzeJourneyStages;
  private generateJourneyInsights;
  private generateJourneyRecommendations;
  private predictJourneyPath;
  private calculateChurnRisk;
  private calculateTimeInStage;
  createABTest(request: {
    name: string;
    type: ABTest['type'];
    variants: Array<{
      name: string;
      content: string;
    }>;
  }): Promise<ABTest>;
  getStatus(): Promise<{
    status: 'healthy' | 'degraded' | 'down';
    sofiaAI: string;
    campaigns: number;
    leads: number;
    content: number;
    insights: number;
  }>;
}
export default MarketingIntelligence_v4;
//# sourceMappingURL=MarketingIntelligence_v4.d.ts.map
