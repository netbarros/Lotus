/**
 * 🎯 MARKETING INTELLIGENCE SERVER
 * Powered by Sofia AI v4.0
 * Enterprise State-of-the-Art Marketing Automation
 */

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { config } from 'dotenv';
import { Redis } from 'ioredis';
import { Pool } from 'pg';
import { MarketingIntelligence_v4 } from './MarketingIntelligence_v4';

// Load environment variables
config();

// ==================== CONFIGURATION ====================

const PORT = parseInt(process.env.PORT || '3003', 10);
const NODE_ENV = process.env.NODE_ENV || 'development';

// Redis configuration
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD,
  retryStrategy: (times: number) => Math.min(times * 50, 2000),
};

// PostgreSQL configuration
const pgConfig = {
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
  database: process.env.POSTGRES_DB || 'magicsaas',
  user: process.env.POSTGRES_USER || 'magicsaas_user',
  password: process.env.POSTGRES_PASSWORD || 'changeme',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
};

// ==================== INITIALIZE APP ====================

const app = express();

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

let redis: Redis;
let pool: Pool;
let marketing: MarketingIntelligence_v4;

async function initializeServices(): Promise<void> {
  try {
    console.log('🎯 Initializing Marketing Intelligence services...');

    // Initialize Redis
    redis = new Redis(redisConfig);
    await redis.ping();
    console.log('   ✅ Redis connected');

    // Initialize PostgreSQL
    pool = new Pool(pgConfig);
    await pool.query('SELECT NOW()');
    console.log('   ✅ PostgreSQL connected');

    // Initialize Marketing Intelligence with Sofia AI
    // Note: In production environment, Sofia services (LangChain, Langfuse, Qdrant)
    // would be initialized here. For development, MarketingIntelligence will create mock services.
    const sofiaConfig = {
      enabled: process.env.SOFIA_ENABLED === 'true',
      langchain: {
        apiKey: process.env.ANTHROPIC_API_KEY || '',
        model: process.env.LANGCHAIN_MODEL || 'claude-3-5-sonnet-20241022',
      },
      langfuse: {
        publicKey: process.env.LANGFUSE_PUBLIC_KEY || '',
        secretKey: process.env.LANGFUSE_SECRET_KEY || '',
        baseUrl: process.env.LANGFUSE_BASE_URL || 'http://localhost:3000',
      },
      qdrant: {
        url: process.env.QDRANT_URL || 'http://localhost:6333',
        apiKey: process.env.QDRANT_API_KEY,
      },
    };

    marketing = new MarketingIntelligence_v4(redis, pool, sofiaConfig as any);
    await marketing.initialize();
    console.log('   🧠 Marketing Intelligence v4.0 initialized with Sofia AI');

    console.log('✅ All services ready');
  } catch (error: any) {
    console.error('❌ Service initialization failed:', error.message);
    throw error;
  }
}

// ==================== ROUTES ====================

// Health check
app.get('/health', async (req: Request, res: Response) => {
  try {
    // Check Redis
    await redis.ping();

    // Check PostgreSQL
    await pool.query('SELECT 1');

    res.status(200).json({
      status: 'healthy',
      service: 'marketing-ai',
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

// Status endpoint
app.get('/status', async (req: Request, res: Response) => {
  try {
    const stats = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM marketing_campaigns) as campaigns,
        (SELECT COUNT(*) FROM marketing_leads) as leads,
        (SELECT COUNT(*) FROM marketing_content) as content,
        (SELECT COUNT(*) FROM marketing_insights) as insights
    `);

    res.status(200).json({
      status: 'active',
      service: 'Marketing Intelligence v4.0',
      powered_by: 'Sofia AI',
      stats: stats.rows[0],
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    res.status(500).json({
      error: 'Failed to get status',
      message: error.message,
    });
  }
});

// API routes - Powered by Sofia AI v4.0

/**
 * POST /api/campaigns
 * Create intelligent marketing campaign powered by Sofia AI
 */
app.post('/api/campaigns', async (req: Request, res: Response) => {
  try {
    const { objective, targetAudience, budget, duration, channels } = req.body;

    // Validation
    if (!objective || typeof objective !== 'string' || objective.trim().length === 0) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'objective is required and must be a non-empty string',
      });
    }

    // Create campaign using Sofia AI
    const campaign = await marketing.createCampaign({
      objective,
      targetAudience,
      budget,
      duration,
      channels,
    });

    res.status(201).json({
      success: true,
      message: 'Campaign created successfully by Sofia AI',
      data: campaign,
      powered_by: 'Sofia AI v4.0',
    });
  } catch (error: any) {
    console.error('Campaign creation error:', error);
    res.status(500).json({
      error: 'Campaign creation failed',
      message: error.message,
    });
  }
});

/**
 * POST /api/leads/score
 * Calculate lead score using Sofia AI predictive analytics
 */
app.post('/api/leads/score', async (req: Request, res: Response) => {
  try {
    const { leadId } = req.body;

    if (!leadId || typeof leadId !== 'string') {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'leadId is required and must be a string',
      });
    }

    // Score lead using Sofia AI
    const score = await marketing.scoreLead(leadId);
    const conversionProbability = await marketing.predictLeadConversion(leadId);
    const nextBestAction = await marketing.getNextBestAction(leadId);

    res.status(200).json({
      success: true,
      data: {
        leadId,
        score,
        conversionProbability,
        nextBestAction,
        calculatedAt: new Date().toISOString(),
      },
      powered_by: 'Sofia AI v4.0 Predictive Engine',
    });
  } catch (error: any) {
    console.error('Lead scoring error:', error);
    res.status(500).json({
      error: 'Lead scoring failed',
      message: error.message,
    });
  }
});

/**
 * POST /api/content/generate
 * Generate marketing content using Sofia AI creative engine
 */
app.post('/api/content/generate', async (req: Request, res: Response) => {
  try {
    const { type, topic, keywords, targetAudience, tone } = req.body;

    if (!type || typeof type !== 'string') {
      return res.status(400).json({
        error: 'Invalid request',
        message:
          'type is required (blog, video, infographic, ebook, whitepaper, case_study, social_post)',
      });
    }

    if (!topic || typeof topic !== 'string') {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'topic is required and must be a string',
      });
    }

    // Generate content using Sofia AI
    const content = await marketing.generateContent({
      type: type as any,
      topic,
      keywords: keywords || [],
      targetAudience: targetAudience || [],
      tone: tone || 'professional',
    });

    res.status(201).json({
      success: true,
      message: 'Content generated successfully by Sofia AI',
      data: content,
      powered_by: 'Sofia AI v4.0 Creative Engine',
    });
  } catch (error: any) {
    console.error('Content generation error:', error);
    res.status(500).json({
      error: 'Content generation failed',
      message: error.message,
    });
  }
});

/**
 * GET /api/insights
 * Get AI-generated marketing insights from Sofia
 */
app.get('/api/insights', async (req: Request, res: Response) => {
  try {
    const { timeframe = 'week' } = req.query;

    if (!['day', 'week', 'month', 'quarter'].includes(timeframe as string)) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'timeframe must be one of: day, week, month, quarter',
      });
    }

    // Generate insights using Sofia AI analytics
    const insights = await marketing.generateInsights(timeframe as any);

    res.status(200).json({
      success: true,
      data: {
        timeframe,
        insights,
        generatedAt: new Date().toISOString(),
        count: insights.length,
      },
      powered_by: 'Sofia AI v4.0 Analytics Engine',
    });
  } catch (error: any) {
    console.error('Insights generation error:', error);
    res.status(500).json({
      error: 'Insights retrieval failed',
      message: error.message,
    });
  }
});

/**
 * GET /api/journeys/:leadId
 * Map customer journey using Sofia AI behavioral analysis
 */
app.get('/api/journeys/:leadId', async (req: Request, res: Response) => {
  try {
    const { leadId } = req.params;

    if (!leadId) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'leadId parameter is required',
      });
    }

    // Map journey using Sofia AI
    const journey = await marketing.mapCustomerJourney(leadId);

    res.status(200).json({
      success: true,
      data: journey,
      powered_by: 'Sofia AI v4.0 Journey Mapper',
    });
  } catch (error: any) {
    console.error('Journey mapping error:', error);
    res.status(500).json({
      error: 'Journey mapping failed',
      message: error.message,
    });
  }
});

/**
 * POST /api/ab-tests
 * Create A/B test with Sofia AI recommendations
 */
app.post('/api/ab-tests', async (req: Request, res: Response) => {
  try {
    const { name, type, variants, duration } = req.body;

    if (!name || !type || !variants || !Array.isArray(variants) || variants.length < 2) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'name, type, and at least 2 variants are required',
      });
    }

    // Create A/B test using Sofia AI
    const abTest = await marketing.createABTest({
      name,
      type,
      variants,
      duration,
    });

    res.status(201).json({
      success: true,
      message: 'A/B test created successfully with Sofia AI optimization',
      data: abTest,
      powered_by: 'Sofia AI v4.0 Optimizer',
    });
  } catch (error: any) {
    console.error('A/B test creation error:', error);
    res.status(500).json({
      error: 'A/B test creation failed',
      message: error.message,
    });
  }
});

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
      console.log('║     🎯 MARKETING INTELLIGENCE v4.0 - ONLINE                  ║');
      console.log('║     Powered by Sofia AI - The Brain                         ║');
      console.log('║                                                              ║');
      console.log('╚══════════════════════════════════════════════════════════════╝');
      console.log('');
      console.log(`🌐 Server running on http://0.0.0.0:${PORT}`);
      console.log(`📊 Environment: ${NODE_ENV}`);
      console.log(`🧠 Sofia AI: Integration Ready`);
      console.log('');
      console.log('Endpoints:');
      console.log(`   GET  /health                    - Health check`);
      console.log(`   GET  /status                    - Service status & stats`);
      console.log(`   POST /api/campaigns             - Create AI-powered campaign`);
      console.log(`   POST /api/leads/score           - Score & predict lead conversion`);
      console.log(`   POST /api/content/generate      - Generate marketing content`);
      console.log(`   GET  /api/insights?timeframe=   - Get AI analytics insights`);
      console.log(`   GET  /api/journeys/:leadId      - Map customer journey`);
      console.log(`   POST /api/ab-tests              - Create A/B test with AI`);
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

// Unhandled rejection
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Uncaught exception
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// ==================== START ====================

startServer();

export default app;
