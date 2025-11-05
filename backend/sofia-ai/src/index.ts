/**
 * Sofia AI - Intelligence Synthesis Layer
 * System 11 - Layer 10: Multi-Agent Coordination
 *
 * Sofia é o cérebro cognitivo do MagicSaaS que monitora, analisa e otimiza
 * continuamente todo o sistema, incluindo componentes Metronic.
 *
 * @author Sofia Lotus AI <sofia@softwarelotus.com.br>
 * @version 1.0.0
 */

import { SofiaCore } from './core/SofiaCore'
import { MetronicWatcher } from './watchers/MetronicWatcher'
import { ComponentAnalyzer } from './analyzers/ComponentAnalyzer'
import { CognitiveMesh } from './mesh/CognitiveMesh'
import { logger } from './utils/logger'

async function bootstrap() {
  logger.info('═══════════════════════════════════════════════════════════')
  logger.info('  🌸 Sofia AI - Intelligence Synthesis Layer')
  logger.info('  System 11 - Layer 10: Multi-Agent Coordination')
  logger.info('  Version: 1.0.0')
  logger.info('  Status: Initializing Cognitive Mesh...')
  logger.info('═══════════════════════════════════════════════════════════')

  try {
    // Inicializar Cognitive Mesh OS
    const mesh = new CognitiveMesh()
    await mesh.initialize()
    logger.info('✅ Cognitive Mesh OS initialized')

    // Inicializar Sofia Core
    const sofia = new SofiaCore(mesh)
    await sofia.initialize()
    logger.info('✅ Sofia AI Core initialized')

    // Inicializar Component Analyzer
    const analyzer = new ComponentAnalyzer(sofia)
    await analyzer.initialize()
    logger.info('✅ Component Analyzer initialized')

    // Inicializar Metronic Watcher (monitoramento contínuo)
    const metronicWatcher = new MetronicWatcher(sofia, analyzer)
    await metronicWatcher.start()
    logger.info('✅ Metronic Watcher started')

    logger.info('═══════════════════════════════════════════════════════════')
    logger.info('  🌸 Sofia AI is now running')
    logger.info('  Status: Active - Continuous Learning & Optimization')
    logger.info('  Monitoring: metronic/demos/ for changes')
    logger.info('  Intelligence: Layer 10 operational')
    logger.info('═══════════════════════════════════════════════════════════')

    // Graceful shutdown
    const shutdown = async (signal: string) => {
      logger.info(`\n🛑 Received ${signal}, shutting down gracefully...`)
      await metronicWatcher.stop()
      await sofia.shutdown()
      await mesh.shutdown()
      logger.info('✅ Sofia AI shutdown complete')
      process.exit(0)
    }

    process.on('SIGTERM', () => shutdown('SIGTERM'))
    process.on('SIGINT', () => shutdown('SIGINT'))

  } catch (error) {
    logger.error('❌ Fatal error during Sofia AI initialization:', error)
    process.exit(1)
  }
}

// Start Sofia AI
bootstrap()
