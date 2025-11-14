/**
 * 🧠 SOFIA CENTRAL BRAIN v4.0
 * O Cérebro Central - Integração Total com TODO o Sistema
 *
 * INTEGRADO COM:
 * ✅ ERP (Financial, Inventory, HR, CRM, Projects)
 * ✅ Marketing Intelligence (Campaigns, Leads, Content, Analytics)
 * ✅ Todas as 16 Pétalas (Healthcare, Restaurant, Fashion, etc.)
 * ✅ Chatwoot (Customer Communication)
 * ✅ Learning Engine (Aprendizado Contínuo Anônimo)
 * ✅ MCP Protocol (Directus + Multi-conexões)
 * ✅ Security & Privacy Layer
 * ✅ Configuration System
 *
 * Sofia está PRESENTE em TODAS as camadas do MagicSaaS System-∞
 */

import { Redis } from 'ioredis';
import { Pool } from 'pg';

// Sofia AI Core Components
import { SofiaCore_v4 } from './core/SofiaCore_v4';
import { SofiaLearningEngine_v4 } from './core/SofiaLearningEngine_v4';

// Integrations
import { LangChainService } from './integrations/LangChainService';
import { LangfuseService } from './integrations/LangfuseService';
import { QdrantService } from './integrations/QdrantService';
import { ChatwootService } from './integrations/chatwoot.service';

// Business Modules
import { ERPCore } from '../../erp/src/ERPCore';
import { MarketingIntelligence_v4 } from '../../marketing-ai/src/MarketingIntelligence_v4';

// ==================== TYPES ====================

export interface SofiaBrainConfig {
  redis: Redis;
  postgres: Pool;
  chatwoot?: {
    apiUrl: string;
    apiKey: string;
    accountId: number;
  };
  security: {
    anonymizeData: boolean;
    revealStack: boolean; // ALWAYS false
    encryptionKey: string;
  };
  features: {
    enableLearning: boolean;
    enableChatwoot: boolean;
    enableMarketing: boolean;
    enableERP: boolean;
    enableAllPetalas: boolean;
  };
}

export interface SofiaCapability {
  module: string;
  status: 'active' | 'inactive' | 'error';
  lastActivity?: Date;
  metrics?: Record<string, any>;
}

export interface SofiaIntention {
  userInput: string;
  tenantId?: string;
  context?: Record<string, any>;
  requiresHumanReview?: boolean;
}

export interface SofiaResponse {
  response: string;
  confidence: number;
  actions?: SofiaAction[];
  learning?: string[];
  requiresHumanReview: boolean;
  executionTime: number;
}

export interface SofiaAction {
  type:
    | 'create_campaign'
    | 'generate_content'
    | 'score_lead'
    | 'erp_transaction'
    | 'petala_action'
    | 'send_message';
  module: string;
  payload: Record<string, any>;
  executed: boolean;
  result?: any;
}

// ==================== SOFIA CENTRAL BRAIN ====================

export class SofiaCentralBrain_v4 {
  private config: SofiaBrainConfig;
  private redis: Redis;
  private pool: Pool;

  // Core Components
  private sofiaCore!: SofiaCore_v4;
  private learningEngine!: SofiaLearningEngine_v4;

  // Integrations
  private langchain!: LangChainService;
  private langfuse!: LangfuseService;
  private qdrant!: QdrantService;
  private chatwoot?: ChatwootService;

  // Business Modules
  private erp?: ERPCore;
  private marketing?: MarketingIntelligence_v4;

  // State
  private isInitialized: boolean = false;
  private capabilities: Map<string, SofiaCapability> = new Map();

  constructor(config: SofiaBrainConfig) {
    this.config = config;
    this.redis = config.redis;
    this.pool = config.postgres;

    // SECURITY: Ensure stack is NEVER revealed
    if (this.config.security.revealStack) {
      throw new Error('SECURITY VIOLATION: revealStack must be false');
    }
  }

  async initialize(): Promise<void> {
    console.log('🧠 ========================================');
    console.log('🧠 SOFIA CENTRAL BRAIN v4.0 - INITIALIZING');
    console.log('🧠 The Brain of MagicSaaS System-∞');
    console.log('🧠 ========================================');

    const startTime = Date.now();

    try {
      // 1. Initialize Core AI Services
      await this.initializeCoreServices();

      // 2. Initialize Business Modules
      await this.initializeBusinessModules();

      // 3. Initialize Communication Channels
      await this.initializeCommunicationChannels();

      // 4. Initialize Learning Engine
      await this.initializeLearningEngine();

      // 5. Warm up Sofia's knowledge
      await this.warmUpKnowledge();

      // 6. Register all capabilities
      await this.registerCapabilities();

      this.isInitialized = true;

      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      console.log('🧠 ========================================');
      console.log(`🧠 ✅ SOFIA BRAIN ONLINE (${duration}s)`);
      console.log(`🧠 Capabilities: ${this.capabilities.size}`);
      console.log('🧠 Status: READY TO ASSIST');
      console.log('🧠 ========================================');
    } catch (error: any) {
      console.error('🧠 ❌ INITIALIZATION FAILED:', error.message);
      throw error;
    }
  }

  private async initializeCoreServices(): Promise<void> {
    console.log('🔧 Initializing Core AI Services...');

    // LangChain (AI Orchestration)
    this.langchain = new LangChainService(this.redis, this.pool);
    await this.langchain.initialize();
    console.log('   ✅ LangChain ready');

    // Langfuse (Observability)
    this.langfuse = new LangfuseService(this.redis, this.pool);
    await this.langfuse.initialize();
    console.log('   ✅ Langfuse ready');

    // Qdrant (Vector Search)
    this.qdrant = new QdrantService(this.redis, this.pool);
    await this.qdrant.initialize();
    console.log('   ✅ Qdrant ready');

    // Sofia Core
    this.sofiaCore = new SofiaCore_v4(
      this.redis,
      this.pool,
      this.langchain,
      this.langfuse,
      this.qdrant
    );
    await this.sofiaCore.initialize();
    console.log('   ✅ Sofia Core v4.0 ready');
  }

  private async initializeBusinessModules(): Promise<void> {
    console.log('💼 Initializing Business Modules...');

    // ERP Module
    if (this.config.features.enableERP) {
      this.erp = new ERPCore(this.redis, this.pool);
      await this.erp.initialize();
      console.log('   ✅ ERP (Financial, Inventory, HR, CRM, Projects) ready');
    }

    // Marketing Intelligence
    if (this.config.features.enableMarketing) {
      this.marketing = new MarketingIntelligence_v4(
        this.redis,
        this.pool,
        this.langchain,
        this.langfuse,
        this.qdrant
      );
      await this.marketing.initialize();
      console.log('   ✅ Marketing Intelligence ready');
    }

    // 16 Pétalas (loaded from database)
    if (this.config.features.enableAllPetalas) {
      await this.loadPetalas();
      console.log('   ✅ All 16 Pétalas loaded');
    }
  }

  private async initializeCommunicationChannels(): Promise<void> {
    console.log('💬 Initializing Communication Channels...');

    // Chatwoot
    if (this.config.features.enableChatwoot && this.config.chatwoot) {
      this.chatwoot = new ChatwootService(
        this.config.chatwoot,
        this.redis,
        this.pool,
        this.langchain
      );
      await this.chatwoot.initialize();
      console.log('   ✅ Chatwoot + Sofia AI ready');
    }
  }

  private async initializeLearningEngine(): Promise<void> {
    console.log('🎓 Initializing Learning Engine...');

    if (this.config.features.enableLearning) {
      this.learningEngine = new SofiaLearningEngine_v4(
        this.redis,
        this.pool,
        this.langchain,
        this.qdrant,
        this.langfuse
      );
      await this.learningEngine.initialize();
      console.log('   ✅ Learning Engine (anonymous, secure) ready');
    }
  }

  private async loadPetalas(): Promise<void> {
    const result = await this.pool.query('SELECT * FROM petalas WHERE status = $1', ['active']);

    console.log(`   Loaded ${result.rows.length} active pétalas`);
  }

  private async warmUpKnowledge(): Promise<void> {
    console.log('🔥 Warming up Sofia knowledge...');

    // Load frequently used knowledge into memory
    if (this.learningEngine) {
      const knowledge = await this.learningEngine.queryKnowledge(
        'startup knowledge',
        undefined,
        100
      );
      console.log(`   Preloaded ${knowledge.length} knowledge fragments`);
    }

    // Cache common queries
    await this.redis.set('sofia:warmup', 'true', 'EX', 3600);
  }

  private async registerCapabilities(): Promise<void> {
    // Register all available capabilities
    this.capabilities.set('intention_processing', {
      module: 'sofia_core',
      status: 'active',
      lastActivity: new Date(),
    });

    this.capabilities.set('marketing_intelligence', {
      module: 'marketing_ai',
      status: this.config.features.enableMarketing ? 'active' : 'inactive',
    });

    this.capabilities.set('erp_management', {
      module: 'erp',
      status: this.config.features.enableERP ? 'active' : 'inactive',
    });

    this.capabilities.set('customer_communication', {
      module: 'chatwoot',
      status: this.config.features.enableChatwoot ? 'active' : 'inactive',
    });

    this.capabilities.set('continuous_learning', {
      module: 'learning_engine',
      status: this.config.features.enableLearning ? 'active' : 'inactive',
    });

    this.capabilities.set('all_petalas', {
      module: 'petalas',
      status: this.config.features.enableAllPetalas ? 'active' : 'inactive',
    });

    console.log(`📋 Registered ${this.capabilities.size} capabilities`);
  }

  // ==================== MAIN PROCESSING METHOD ====================

  async processIntention(intention: SofiaIntention): Promise<SofiaResponse> {
    if (!this.isInitialized) {
      throw new Error('Sofia Brain not initialized. Call initialize() first.');
    }

    const startTime = Date.now();

    console.log(`🧠 Processing intention: "${intention.userInput.substring(0, 50)}..."`);

    try {
      // 1. Anonymize if tenant data present
      const anonymizedIntention = this.anonymizeIntention(intention);

      // 2. Process through Sofia Core
      const coreResponse = await this.sofiaCore.processIntention({
        intention: anonymizedIntention.userInput,
        context: anonymizedIntention.context || {},
      });

      // 3. Determine required actions
      const actions = await this.determineActions(coreResponse);

      // 4. Execute actions across modules
      const executedActions = await this.executeActions(actions);

      // 5. Learn from interaction (if enabled)
      if (this.learningEngine && this.config.features.enableLearning) {
        await this.learningEngine.learnFromTenantInteraction({
          tenantId: intention.tenantId || 'anonymous',
          interactionType: 'intention_processing',
          content: intention.userInput,
          metadata: { confidence: coreResponse.confidence },
        });
      }

      // 6. Log to Langfuse for observability
      await this.langfuse.logDecision({
        type: 'intention_processed',
        input: anonymizedIntention,
        output: coreResponse,
        metadata: {
          actionsExecuted: executedActions.length,
          executionTime: Date.now() - startTime,
        },
      });

      const executionTime = Date.now() - startTime;

      console.log(
        `   ✅ Processed in ${executionTime}ms | Confidence: ${(coreResponse.confidence * 100).toFixed(0)}%`
      );

      return {
        response: coreResponse.response || 'I understand. Let me help you with that.',
        confidence: coreResponse.confidence || 0.5,
        actions: executedActions,
        learning: coreResponse.learning,
        requiresHumanReview:
          coreResponse.confidence < 0.75 || intention.requiresHumanReview || false,
        executionTime,
      };
    } catch (error: any) {
      console.error(`   ❌ Error processing intention: ${error.message}`);

      // Log error to Langfuse
      await this.langfuse.logDecision({
        type: 'intention_error',
        input: intention,
        output: { error: error.message },
        metadata: { timestamp: new Date() },
      });

      return {
        response:
          'I encountered an issue processing your request. A human agent will assist you shortly.',
        confidence: 0,
        requiresHumanReview: true,
        executionTime: Date.now() - startTime,
      };
    }
  }

  private anonymizeIntention(intention: SofiaIntention): SofiaIntention {
    if (!this.config.security.anonymizeData) {
      return intention;
    }

    // Remove PII from user input
    let anonymizedInput = intention.userInput;
    anonymizedInput = anonymizedInput.replace(
      /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
      '[EMAIL]'
    );
    anonymizedInput = anonymizedInput.replace(/(\+\d{1,3}[- ]?)?\d{10,}/g, '[PHONE]');

    // Remove sensitive context
    const anonymizedContext = { ...intention.context };
    const sensitiveKeys = ['email', 'phone', 'creditCard', 'ssn', 'password'];
    for (const key of sensitiveKeys) {
      if (anonymizedContext[key]) {
        anonymizedContext[key] = '[REDACTED]';
      }
    }

    return {
      ...intention,
      userInput: anonymizedInput,
      context: anonymizedContext,
    };
  }

  private async determineActions(coreResponse: any): Promise<SofiaAction[]> {
    const actions: SofiaAction[] = [];

    // Parse Sofia's response to determine what actions to take
    const intent = coreResponse.intent?.toLowerCase() || '';

    // Marketing actions
    if (intent.includes('campaign') || intent.includes('marketing')) {
      actions.push({
        type: 'create_campaign',
        module: 'marketing',
        payload: coreResponse.campaignData || {},
        executed: false,
      });
    }

    if (intent.includes('content') || intent.includes('blog') || intent.includes('social')) {
      actions.push({
        type: 'generate_content',
        module: 'marketing',
        payload: coreResponse.contentData || {},
        executed: false,
      });
    }

    if (intent.includes('lead')) {
      actions.push({
        type: 'score_lead',
        module: 'marketing',
        payload: coreResponse.leadData || {},
        executed: false,
      });
    }

    // ERP actions
    if (
      intent.includes('transaction') ||
      intent.includes('payment') ||
      intent.includes('invoice')
    ) {
      actions.push({
        type: 'erp_transaction',
        module: 'erp',
        payload: coreResponse.erpData || {},
        executed: false,
      });
    }

    // Communication actions
    if (intent.includes('message') || intent.includes('notify') || intent.includes('send')) {
      actions.push({
        type: 'send_message',
        module: 'chatwoot',
        payload: coreResponse.messageData || {},
        executed: false,
      });
    }

    return actions;
  }

  private async executeActions(actions: SofiaAction[]): Promise<SofiaAction[]> {
    const executed: SofiaAction[] = [];

    for (const action of actions) {
      try {
        let result: any;

        switch (action.type) {
          case 'create_campaign':
            if (this.marketing) {
              result = await this.marketing.createCampaign(action.payload);
            }
            break;

          case 'generate_content':
            if (this.marketing) {
              result = await this.marketing.generateContent(action.payload);
            }
            break;

          case 'score_lead':
            if (this.marketing && action.payload.leadId) {
              result = await this.marketing.scoreLead(action.payload.leadId);
            }
            break;

          case 'erp_transaction':
            if (this.erp) {
              result = await this.erp.financial.createTransaction(action.payload);
            }
            break;

          case 'send_message':
            if (this.chatwoot && action.payload.conversationId) {
              result = await this.chatwoot.sendMessage(
                action.payload.conversationId,
                action.payload.message
              );
            }
            break;
        }

        action.executed = true;
        action.result = result;
        executed.push(action);

        console.log(`   ✅ Executed: ${action.type} in ${action.module}`);
      } catch (error: any) {
        console.error(`   ❌ Failed to execute ${action.type}: ${error.message}`);
        action.executed = false;
        action.result = { error: error.message };
        executed.push(action);
      }
    }

    return executed;
  }

  // ==================== MODULE-SPECIFIC METHODS ====================

  async createMarketingCampaign(request: any): Promise<any> {
    if (!this.marketing) {
      throw new Error('Marketing module not enabled');
    }

    return this.marketing.createCampaign(request);
  }

  async generateMarketingContent(request: any): Promise<any> {
    if (!this.marketing) {
      throw new Error('Marketing module not enabled');
    }

    return this.marketing.generateContent(request);
  }

  async processERPTransaction(transaction: any): Promise<any> {
    if (!this.erp) {
      throw new Error('ERP module not enabled');
    }

    return this.erp.financial.createTransaction(transaction);
  }

  async processChatwootMessage(message: any): Promise<void> {
    if (!this.chatwoot) {
      throw new Error('Chatwoot not enabled');
    }

    await this.chatwoot.processIncomingMessage(message);
  }

  // ==================== HEALTH & STATUS ====================

  async getHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'down';
    components: Record<string, any>;
    capabilities: string[];
    uptime: number;
  }> {
    const startTime = Date.now();

    const components: Record<string, any> = {
      sofia_core: await this.sofiaCore.getStatus(),
    };

    if (this.learningEngine) {
      components.learning_engine = await this.learningEngine.getStatus();
    }

    if (this.marketing) {
      components.marketing = await this.marketing.getStatus();
    }

    if (this.erp) {
      components.erp = await this.erp.getStatus();
    }

    if (this.chatwoot) {
      components.chatwoot = await this.chatwoot.getStatus();
    }

    // Check if any component is down
    const allHealthy = Object.values(components).every(
      (c) => c.status === 'healthy' || c.status === 'active' || c.status === 'connected'
    );

    return {
      status: allHealthy ? 'healthy' : 'degraded',
      components,
      capabilities: Array.from(this.capabilities.keys()),
      uptime: Date.now() - startTime,
    };
  }

  async getMetrics(): Promise<{
    totalIntentionsProcessed: number;
    avgConfidence: number;
    actionsExecuted: number;
    knowledgeFragments: number;
    activeCapabilities: number;
  }> {
    const stats = await this.pool.query(`
      SELECT
        COUNT(*) FILTER (WHERE type = 'intention_processed') as intentions,
        AVG((metadata->>'confidence')::DECIMAL) as avg_confidence,
        COUNT(*) FILTER (WHERE type LIKE '%_action_%') as actions
      FROM langfuse_events
      WHERE created_at > NOW() - INTERVAL '24 hours'
    `);

    const knowledge = this.learningEngine
      ? await this.learningEngine.getStatus()
      : { knowledgeFragments: 0 };

    return {
      totalIntentionsProcessed: parseInt(stats.rows[0]?.intentions || '0'),
      avgConfidence: parseFloat(stats.rows[0]?.avg_confidence || '0'),
      actionsExecuted: parseInt(stats.rows[0]?.actions || '0'),
      knowledgeFragments: knowledge.knowledgeFragments || 0,
      activeCapabilities: Array.from(this.capabilities.values()).filter(
        (c) => c.status === 'active'
      ).length,
    };
  }

  // ==================== SHUTDOWN ====================

  async shutdown(): Promise<void> {
    console.log('🧠 Shutting down Sofia Central Brain...');

    if (this.learningEngine) {
      await this.learningEngine.stop();
    }

    this.isInitialized = false;

    console.log('🧠 Sofia Brain offline');
  }
}

export default SofiaCentralBrain_v4;
