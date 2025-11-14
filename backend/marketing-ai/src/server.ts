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
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}));
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

    // Initialize Marketing Intelligence (will initialize Sofia AI internally)
    // Note: In production, you would pass actual LangChain, Langfuse, Qdrant services
    // For now, we'll create placeholder initialization
    console.log('   🧠 Marketing Intelligence initialized (Sofia AI integration pending)');

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

// API routes
app.post('/api/campaigns', async (req: Request, res: Response) => {
  try {
    // TODO: Implement with MarketingIntelligence_v4
    res.status(501).json({
      error: 'Not implemented yet',
      message: 'Campaign creation will be powered by Sofia AI',
    });
  } catch (error: any) {
    res.status(500).json({
      error: 'Campaign creation failed',
      message: error.message,
    });
  }
});

app.post('/api/leads/score', async (req: Request, res: Response) => {
  try {
    // TODO: Implement with MarketingIntelligence_v4
    res.status(501).json({
      error: 'Not implemented yet',
      message: 'Lead scoring will be powered by Sofia AI',
    });
  } catch (error: any) {
    res.status(500).json({
      error: 'Lead scoring failed',
      message: error.message,
    });
  }
});

app.post('/api/content/generate', async (req: Request, res: Response) => {
  try {
    // TODO: Implement with MarketingIntelligence_v4
    res.status(501).json({
      error: 'Not implemented yet',
      message: 'Content generation will be powered by Sofia AI',
    });
  } catch (error: any) {
    res.status(500).json({
      error: 'Content generation failed',
      message: error.message,
    });
  }
});

app.get('/api/insights', async (req: Request, res: Response) => {
  try {
    // TODO: Implement with MarketingIntelligence_v4
    res.status(501).json({
      error: 'Not implemented yet',
      message: 'Insights generation will be powered by Sofia AI',
    });
  } catch (error: any) {
    res.status(500).json({
      error: 'Insights retrieval failed',
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
      console.log(`   GET  /health              - Health check`);
      console.log(`   GET  /status              - Service status`);
      console.log(`   POST /api/campaigns       - Create campaign (Sofia AI)`);
      console.log(`   POST /api/leads/score     - Score lead (Sofia AI)`);
      console.log(`   POST /api/content/generate - Generate content (Sofia AI)`);
      console.log(`   GET  /api/insights        - Get insights (Sofia AI)`);
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
