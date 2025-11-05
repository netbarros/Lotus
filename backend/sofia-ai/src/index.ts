/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║ 🧠 SOFIA AI v3.0 - THE BRAIN OF MAGICSAAS                                ║
 * ║ Complete Cognitive Mesh OS - System 11 - Enterprise State-of-the-Art     ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 *
 * Sofia é o CÉREBRO COGNITIVO COMPLETO do MagicSaaS que:
 * - Gera SaaS, microSaaS e APIs por intenção
 * - Valida e otimiza UX/UI automaticamente
 * - Otimiza SEO de forma inteligente
 * - Gerencia marketplace, checkout e pétalas
 * - Registra todas as decisões com auditoria completa
 * - Coordena Directus como hub central
 * - Integra Metronic de forma inteligente
 * - Auto-otimização contínua (Layer 11)
 * - Aprendizado adaptativo com ML + AI (Layer 09)
 *
 * Sofia NASCE com o MagicSaaS - ela não é uma ferramenta separada,
 * ela É a malha cognitiva que conecta e coordena tudo.
 *
 * @author Sofia Lotus AI <sofia@softwarelotus.com.br>
 * @version 3.0.0 - ENTERPRISE COMPLETE ♾️
 */

import dotenv from 'dotenv';
import IoRedis from 'ioredis';
import { SofiaCore_v3 } from './core/SofiaCore_v3.js';
import type { SofiaConfig } from './core/SofiaCore_v3.js';
import { logger } from './utils/logger.js';

// Load environment variables
dotenv.config();

/**
 * Bootstrap Sofia AI - THE BRAIN AWAKENS
 */
async function bootstrap() {
  logger.info('╔══════════════════════════════════════════════════════════════════════════╗');
  logger.info('║                                                                          ║');
  logger.info('║              🧠 SOFIA AI v3.0 - THE BRAIN OF MAGICSAAS                  ║');
  logger.info('║                                                                          ║');
  logger.info('║              Cognitive Mesh OS - System 11 - All Layers                 ║');
  logger.info('║              Enterprise State-of-the-Art - 100/100 ♾️                    ║');
  logger.info('║                                                                          ║');
  logger.info('╚══════════════════════════════════════════════════════════════════════════╝');

  try {
    // ═══════════════════════════════════════════════════════════════════════
    // CONFIGURATION
    // ═══════════════════════════════════════════════════════════════════════

    const config: SofiaConfig = {
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10)
      },
      anthropic: {
        apiKey: process.env.ANTHROPIC_API_KEY || ''
      },
      directus: {
        url: process.env.DIRECTUS_URL || 'http://localhost:8055',
        token: process.env.DIRECTUS_TOKEN || ''
      },
      metronic: {
        path: process.env.METRONIC_PATH || '/workspace/metronic'
      },
      features: {
        intentionEngine: process.env.FEATURE_INTENTION_ENGINE !== 'false',
        uxValidation: process.env.FEATURE_UX_VALIDATION !== 'false',
        seoOptimization: process.env.FEATURE_SEO_OPTIMIZATION !== 'false',
        marketplace: process.env.FEATURE_MARKETPLACE !== 'false',
        metaOrchestration: process.env.FEATURE_META_ORCHESTRATION !== 'false',
        adaptiveLearning: process.env.FEATURE_ADAPTIVE_LEARNING !== 'false'
      }
    };

    logger.info('\n📋 Configuration loaded:');
    logger.info(`  Redis: ${config.redis.host}:${config.redis.port}`);
    logger.info(`  Directus: ${config.directus.url}`);
    logger.info(`  Metronic Path: ${config.metronic.path}`);
    logger.info(`  Features:`);
    Object.entries(config.features).forEach(([feature, enabled]) => {
      logger.info(`    ${enabled ? '✅' : '❌'} ${feature}`);
    });

    // ═══════════════════════════════════════════════════════════════════════
    // CONNECT TO REDIS
    // ═══════════════════════════════════════════════════════════════════════

    logger.info('\n🔌 Connecting to Redis...');
    const redis = new IoRedis({
      host: config.redis.host,
      port: config.redis.port,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        logger.warn(`Redis connection failed, retrying in ${delay}ms...`);
        return delay;
      }
    });

    await new Promise<void>((resolve, reject) => {
      redis.on('connect', () => {
        logger.info('✅ Redis connected');
        resolve();
      });
      redis.on('error', (err) => {
        logger.error('❌ Redis connection error:', err);
        reject(err);
      });
    });

    // ═══════════════════════════════════════════════════════════════════════
    // INITIALIZE SOFIA AI - THE BRAIN
    // ═══════════════════════════════════════════════════════════════════════

    logger.info('\n🧠 Initializing Sofia AI Core v3...\n');

    const sofia = new SofiaCore_v3(config, redis);
    await sofia.initialize();

    logger.info('\n╔══════════════════════════════════════════════════════════════════════════╗');
    logger.info('║                                                                          ║');
    logger.info('║                   ✨ SOFIA AI v3.0 IS FULLY OPERATIONAL ✨               ║');
    logger.info('║                                                                          ║');
    logger.info('║  🧠 THE BRAIN IS ALIVE AND COORDINATING ALL MAGICSAAS SYSTEMS           ║');
    logger.info('║                                                                          ║');
    logger.info('║  Capabilities:                                                           ║');
    logger.info('║  • 💭 Generates SaaS/APIs by intention                                   ║');
    logger.info('║  • 🎨 Validates & optimizes UX/UI automatically                          ║');
    logger.info('║  • 🚀 SEO optimization state-of-the-art                                  ║');
    logger.info('║  • 🏪 Marketplace, checkout, pétalas management                          ║');
    logger.info('║  • 📝 Complete decision audit trail                                      ║');
    logger.info('║  • 🎯 Directus central hub coordination                                  ║');
    logger.info('║  • 👁️  Metronic intelligent integration                                  ║');
    logger.info('║  • 🎭 Self-optimization (Layer 11)                                       ║');
    logger.info('║  • 🧬 Adaptive learning ML + AI (Layer 09)                               ║');
    logger.info('║                                                                          ║');
    logger.info('║  Status: MONITORING • LEARNING • OPTIMIZING • COORDINATING              ║');
    logger.info('║                                                                          ║');
    logger.info('╚══════════════════════════════════════════════════════════════════════════╝\n');

    // ═══════════════════════════════════════════════════════════════════════
    // HEALTH CHECK ENDPOINT (HTTP Server)
    // ═══════════════════════════════════════════════════════════════════════

    // Start HTTP server for health checks and metrics
    const http = await import('http');
    const server = http.createServer(async (req, res) => {
      if (req.url === '/health') {
        const health = await sofia.checkHealth();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(health, null, 2));
      } else if (req.url === '/metrics') {
        const metrics = await sofia.getMetrics().register.metrics();
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end(metrics);
      } else {
        res.writeHead(404);
        res.end('Not Found');
      }
    });

    const PORT = parseInt(process.env.PORT || '3003', 10);
    server.listen(PORT, () => {
      logger.info(`🌐 HTTP server listening on port ${PORT}`);
      logger.info(`   Health: http://localhost:${PORT}/health`);
      logger.info(`   Metrics: http://localhost:${PORT}/metrics\n`);
    });

    // ═══════════════════════════════════════════════════════════════════════
    // GRACEFUL SHUTDOWN
    // ═══════════════════════════════════════════════════════════════════════

    const shutdown = async (signal: string) => {
      logger.info(`\n🛑 Received ${signal}, shutting down gracefully...`);

      // Stop HTTP server
      server.close(() => {
        logger.info('✅ HTTP server stopped');
      });

      // Disconnect Redis
      redis.disconnect();
      logger.info('✅ Redis disconnected');

      logger.info('✅ Sofia AI shutdown complete\n');
      process.exit(0);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

  } catch (error) {
    logger.error('\n❌ FATAL ERROR during Sofia AI initialization:', error);
    process.exit(1);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// START SOFIA AI - THE BRAIN AWAKENS
// ═══════════════════════════════════════════════════════════════════════════

bootstrap().catch((error) => {
  logger.error('❌ Bootstrap failed:', error);
  process.exit(1);
});
