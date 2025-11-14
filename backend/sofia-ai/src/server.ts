/**
 * 🧠 SOFIA AI v4.0 - REST API SERVER
 * The Brain of MagicSaaS - Complete REST API
 * Powered by LangChain + Langfuse + Qdrant + pgVector
 *
 * Endpoints:
 * - POST /api/intentions/process - Process user intention and generate code
 * - POST /api/learning/learn - Learn from tenant data (anonymized)
 * - POST /api/learning/feedback - Provide feedback on AI generation
 * - POST /api/orchestrate - Orchestrate multi-service workflows
 * - GET  /api/knowledge/search - Search knowledge base (RAG)
 * - POST /api/petalas/recommend - Recommend pétalas for tenant
 * - POST /api/generate/component - Generate React component
 * - POST /api/generate/api - Generate backend API
 * - GET  /api/status - Sofia AI health and status
 */

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { config as dotenvConfig } from 'dotenv';
import { Pool } from 'pg';
import { Redis } from 'ioredis';
import { SofiaCore_v4 } from './core/SofiaCore_v4.js';
import { SofiaCentralBrain_v4 } from './SofiaCentralBrain_v4.js';
import { SofiaLearningEngine_v4 } from './core/SofiaLearningEngine_v4.js';
import { LangChainService } from './integrations/LangChainService.js';
import { LangfuseService } from './integrations/LangfuseService.js';
import { QdrantService } from './integrations/QdrantService.js';
import type { SofiaConfig_v4 } from './core/SofiaCore_v4.js';

// Load environment variables
dotenvConfig();

// ==================== TYPES ====================

interface IntentionRequest {
  intention: string;
  context?: {
    tenantId?: string;
    userId?: string;
    petala?: string;
    currentPage?: string;
  };
  options?: {
    generateCode?: boolean;
    validateUX?: boolean;
    optimizeSEO?: boolean;
  };
}

interface LearningRequest {
  tenantId: string;
  dataType: 'interaction' | 'feedback' | 'usage' | 'conversion';
  data: any;
  anonymize?: boolean;
}

interface OrchestrationRequest {
  workflow: string;
  steps: Array<{
    service: string;
    action: string;
    params: any;
  }>;
  context?: any;
}

interface KnowledgeSearchRequest {
  query: string;
  filters?: {
    tenant?: string;
    petala?: string;
    category?: string;
  };
  limit?: number;
}

// ==================== CONFIGURATION ====================

const PORT = parseInt(process.env.PORT || '3002', 10);
const NODE_ENV = process.env.NODE_ENV || 'development';

// PostgreSQL configuration
const pgConfig = {
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
  database: process.env.POSTGRES_DB || 'magicsaas',
  user: process.env.POSTGRES_USER || 'magicsaas_user',
  password: process.env.POSTGRES_PASSWORD || 'changeme',
  max: 20,
};

// Redis configuration
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD,
};

// Sofia AI configuration
const sofiaConfig: SofiaConfig_v4 = {
  redis: redisConfig,
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY || '',
    model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-5-20250929',
  },
  directus: {
    url: process.env.DIRECTUS_URL || 'http://localhost:8055',
    token: process.env.DIRECTUS_TOKEN || '',
  },
  metronic: {
    path: process.env.METRONIC_PATH || '/workspace/metronic',
  },
  langchain: {
    enabled: process.env.FEATURE_LANGCHAIN !== 'false',
    model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-5-20250929',
    temperature: 0.7,
  },
  langfuse: {
    enabled: process.env.FEATURE_LANGFUSE !== 'false',
    publicKey: process.env.LANGFUSE_PUBLIC_KEY,
    secretKey: process.env.LANGFUSE_SECRET_KEY,
    host: process.env.LANGFUSE_HOST || 'http://langfuse:3000',
  },
  qdrant: {
    enabled: process.env.FEATURE_VECTOR_SEARCH !== 'false',
    host: process.env.QDRANT_HOST || 'qdrant',
    port: parseInt(process.env.QDRANT_PORT || '6333', 10),
  },
  pgvector: {
    enabled: process.env.FEATURE_VECTOR_SEARCH !== 'false',
    dimensions: 1536,
  },
  petalas: {
    enabled: process.env.FEATURE_PETALAS !== 'false',
    directory: process.env.PETALAS_DIR || '/workspace/petalas',
  },
};

// ==================== INITIALIZE APP ====================

const app = express();
let pool: Pool;
let redis: Redis;
let sofia: SofiaCentralBrain_v4;
let learningEngine: SofiaLearningEngine_v4;
let langchainService: LangChainService;
let langfuseService: LangfuseService;
let qdrantService: QdrantService;

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  })
);
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} ${res.statusCode} ${duration}ms`);
  });
  next();
});

// ==================== INITIALIZE SERVICES ====================

async function initializeServices(): Promise<void> {
  try {
    console.log('🧠 Initializing Sofia AI v4.0 services...');

    // Initialize PostgreSQL
    pool = new Pool(pgConfig);
    await pool.query('SELECT NOW()');
    console.log('   ✅ PostgreSQL connected');

    // Initialize Redis
    redis = new Redis(redisConfig);
    await redis.ping();
    console.log('   ✅ Redis connected');

    // Initialize AI Services
    langchainService = new LangChainService({
      anthropicApiKey: sofiaConfig.anthropic.apiKey,
      model: sofiaConfig.langchain.model,
      temperature: sofiaConfig.langchain.temperature,
    });
    console.log('   ✅ LangChain service initialized');

    if (sofiaConfig.langfuse.publicKey && sofiaConfig.langfuse.secretKey) {
      langfuseService = new LangfuseService({
        publicKey: sofiaConfig.langfuse.publicKey!,
        secretKey: sofiaConfig.langfuse.secretKey!,
        baseUrl: sofiaConfig.langfuse.host,
      });
      console.log('   ✅ Langfuse service initialized');
    }

    qdrantService = new QdrantService({
      url: `http://${sofiaConfig.qdrant.host}:${sofiaConfig.qdrant.port}`,
    });
    await qdrantService.initialize();
    console.log('   ✅ Qdrant service initialized');

    // Initialize Sofia Central Brain
    sofia = new SofiaCentralBrain_v4(redis, pool, langchainService, langfuseService, qdrantService);
    await sofia.initialize();
    console.log('   ✅ Sofia Central Brain v4.0 initialized');

    // Initialize Learning Engine
    learningEngine = new SofiaLearningEngine_v4(redis, pool, qdrantService, langchainService);
    await learningEngine.initialize();
    console.log('   ✅ Sofia Learning Engine v4.0 initialized');

    console.log('✅ All Sofia AI services ready');
  } catch (error: any) {
    console.error('❌ Service initialization failed:', error.message);
    throw error;
  }
}

// ==================== ROUTES ====================

/**
 * GET /health - Health check
 */
app.get('/health', async (req: Request, res: Response) => {
  try {
    await pool.query('SELECT 1');
    await redis.ping();

    res.status(200).json({
      status: 'healthy',
      service: 'sofia-ai',
      version: '4.0.0',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  } catch (error: any) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
    });
  }
});

/**
 * GET /api/status - Sofia AI comprehensive status
 */
app.get('/api/status', async (req: Request, res: Response) => {
  try {
    const status = await sofia.getStatus();

    res.status(200).json({
      success: true,
      data: {
        ...status,
        services: {
          langchain: !!langchainService,
          langfuse: !!langfuseService,
          qdrant: await qdrantService.isHealthy(),
          learningEngine: true,
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({
      error: 'Failed to get status',
      message: error.message,
    });
  }
});

/**
 * POST /api/intentions/process
 * Process user intention and generate solution
 */
app.post('/api/intentions/process', async (req: Request, res: Response) => {
  try {
    const { intention, context, options }: IntentionRequest = req.body;

    if (!intention || typeof intention !== 'string') {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'intention is required and must be a string',
      });
    }

    // Process intention with Sofia AI
    const result = await sofia.processIntention({
      intention,
      tenantId: context?.tenantId || 'default',
      userId: context?.userId,
      petala: context?.petala,
      context: {
        currentPage: context?.currentPage,
        ...context,
      },
    });

    res.status(200).json({
      success: true,
      data: result,
      powered_by: 'Sofia AI v4.0 - LangChain + Langfuse + Qdrant',
    });
  } catch (error: any) {
    console.error('Intention processing error:', error);
    res.status(500).json({
      error: 'Intention processing failed',
      message: error.message,
    });
  }
});

/**
 * POST /api/learning/learn
 * Learn from tenant data (anonymized)
 */
app.post('/api/learning/learn', async (req: Request, res: Response) => {
  try {
    const { tenantId, dataType, data, anonymize = true }: LearningRequest = req.body;

    if (!tenantId || !dataType || !data) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'tenantId, dataType, and data are required',
      });
    }

    // Learn from data
    await learningEngine.learn({
      tenantId,
      dataType,
      data,
      anonymize,
    });

    res.status(200).json({
      success: true,
      message: 'Sofia learned from data successfully',
      powered_by: 'Sofia Learning Engine v4.0',
    });
  } catch (error: any) {
    console.error('Learning error:', error);
    res.status(500).json({
      error: 'Learning failed',
      message: error.message,
    });
  }
});

/**
 * POST /api/learning/feedback
 * Provide feedback on AI generation
 */
app.post('/api/learning/feedback', async (req: Request, res: Response) => {
  try {
    const { generationId, rating, feedback, context } = req.body;

    if (!generationId || rating === undefined) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'generationId and rating are required',
      });
    }

    // Store feedback for learning
    await learningEngine.recordFeedback({
      generationId,
      rating,
      feedback,
      context,
    });

    res.status(200).json({
      success: true,
      message: 'Feedback recorded successfully',
    });
  } catch (error: any) {
    console.error('Feedback error:', error);
    res.status(500).json({
      error: 'Feedback recording failed',
      message: error.message,
    });
  }
});

/**
 * POST /api/orchestrate
 * Orchestrate multi-service workflows
 */
app.post('/api/orchestrate', async (req: Request, res: Response) => {
  try {
    const { workflow, steps, context }: OrchestrationRequest = req.body;

    if (!workflow || !steps || !Array.isArray(steps)) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'workflow and steps array are required',
      });
    }

    // Orchestrate workflow
    const result = await sofia.orchestrateWorkflow({
      workflow,
      steps,
      context,
    });

    res.status(200).json({
      success: true,
      data: result,
      powered_by: 'Sofia Central Brain v4.0',
    });
  } catch (error: any) {
    console.error('Orchestration error:', error);
    res.status(500).json({
      error: 'Orchestration failed',
      message: error.message,
    });
  }
});

/**
 * GET /api/knowledge/search
 * Search knowledge base using RAG (Retrieval Augmented Generation)
 */
app.get('/api/knowledge/search', async (req: Request, res: Response) => {
  try {
    const { query, filters, limit = 10 }: any = req.query;

    if (!query) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'query parameter is required',
      });
    }

    // Search knowledge base using RAG
    const results = await sofia.searchKnowledge({
      query,
      filters: filters ? JSON.parse(filters) : undefined,
      limit: parseInt(limit, 10),
    });

    res.status(200).json({
      success: true,
      data: results,
      powered_by: 'Sofia AI RAG - Qdrant + LangChain',
    });
  } catch (error: any) {
    console.error('Knowledge search error:', error);
    res.status(500).json({
      error: 'Knowledge search failed',
      message: error.message,
    });
  }
});

/**
 * POST /api/petalas/recommend
 * Recommend pétalas for tenant based on context
 */
app.post('/api/petalas/recommend', async (req: Request, res: Response) => {
  try {
    const { tenantId, industry, requirements } = req.body;

    if (!tenantId) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'tenantId is required',
      });
    }

    // Recommend pétalas
    const recommendations = await sofia.recommendPetalas({
      tenantId,
      industry,
      requirements,
    });

    res.status(200).json({
      success: true,
      data: recommendations,
      powered_by: 'Sofia AI Recommendation Engine',
    });
  } catch (error: any) {
    console.error('Pétala recommendation error:', error);
    res.status(500).json({
      error: 'Recommendation failed',
      message: error.message,
    });
  }
});

/**
 * POST /api/generate/component
 * Generate React component with Metronic integration
 */
app.post('/api/generate/component', async (req: Request, res: Response) => {
  try {
    const { description, componentType, props, styling } = req.body;

    if (!description) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'description is required',
      });
    }

    // Generate component
    const component = await sofia.generateComponent({
      description,
      componentType: componentType || 'functional',
      props: props || [],
      styling: styling || 'metronic',
    });

    res.status(200).json({
      success: true,
      data: component,
      powered_by: 'Sofia AI Code Generator - LangChain',
    });
  } catch (error: any) {
    console.error('Component generation error:', error);
    res.status(500).json({
      error: 'Component generation failed',
      message: error.message,
    });
  }
});

/**
 * POST /api/generate/api
 * Generate backend API endpoint
 */
app.post('/api/generate/api', async (req: Request, res: Response) => {
  try {
    const { description, method, path, database } = req.body;

    if (!description || !method || !path) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'description, method, and path are required',
      });
    }

    // Generate API endpoint
    const api = await sofia.generateAPI({
      description,
      method,
      path,
      database: database || 'postgresql',
    });

    res.status(200).json({
      success: true,
      data: api,
      powered_by: 'Sofia AI API Generator - LangChain',
    });
  } catch (error: any) {
    console.error('API generation error:', error);
    res.status(500).json({
      error: 'API generation failed',
      message: error.message,
    });
  }
});

// ==================== ERROR HANDLERS ====================

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    path: req.path,
    method: req.method,
  });
});

// Error handler
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', error);
  res.status(500).json({
    error: 'Internal Server Error',
    message: NODE_ENV === 'development' ? error.message : 'Something went wrong',
  });
});

// ==================== START SERVER ====================

async function startServer(): Promise<void> {
  try {
    // Initialize services
    await initializeServices();

    // Start listening
    app.listen(PORT, '0.0.0.0', () => {
      console.log('');
      console.log('╔══════════════════════════════════════════════════════════════╗');
      console.log('║                                                              ║');
      console.log('║     🧠 SOFIA AI v4.0 REST API - ONLINE                      ║');
      console.log('║     The Brain of MagicSaaS                                  ║');
      console.log('║     LangChain + Langfuse + Qdrant + pgVector               ║');
      console.log('║                                                              ║');
      console.log('╚══════════════════════════════════════════════════════════════╝');
      console.log('');
      console.log(`🌐 Server running on http://0.0.0.0:${PORT}`);
      console.log(`📊 Environment: ${NODE_ENV}`);
      console.log(`🧠 Sofia AI: v4.0 STATE-OF-THE-ART`);
      console.log('');
      console.log('Endpoints:');
      console.log(`   GET  /health                      - Health check`);
      console.log(`   GET  /api/status                  - Sofia AI status`);
      console.log(`   POST /api/intentions/process      - Process intention`);
      console.log(`   POST /api/learning/learn          - Learn from data`);
      console.log(`   POST /api/learning/feedback       - Record feedback`);
      console.log(`   POST /api/orchestrate             - Orchestrate workflow`);
      console.log(`   GET  /api/knowledge/search        - Search knowledge (RAG)`);
      console.log(`   POST /api/petalas/recommend       - Recommend pétalas`);
      console.log(`   POST /api/generate/component      - Generate React component`);
      console.log(`   POST /api/generate/api            - Generate API endpoint`);
      console.log('');
    });
  } catch (error: any) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
}

// ==================== GRACEFUL SHUTDOWN ====================

process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  if (redis) await redis.quit();
  if (pool) await pool.end();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('\nSIGINT received, shutting down gracefully...');
  if (redis) await redis.quit();
  if (pool) await pool.end();
  process.exit(0);
});

// ==================== START ====================

startServer();

export default app;
