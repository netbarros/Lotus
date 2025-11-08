/**
 * 🌸 MAGICSAAS SYSTEM-∞ - VUE PLUGIN
 *
 * AUTOMATIC INITIALIZATION AND GLOBAL INJECTION
 * ==============================================
 *
 * ✅ Zero manual configuration
 * ✅ Automatic environment detection
 * ✅ Global $magicsaas injection
 * ✅ Ready to use in any component
 *
 * @version 3.0.0
 * @author MagicSaaS Architecture Team
 */

import type { App, Plugin } from 'vue'
import { getRuntimeConfig, type RuntimeConfig } from '../config/runtime-config'
import { getUniversalApis, type UniversalApis } from '../api/petala-apis'

export interface MagicSaaSGlobal {
  config: RuntimeConfig
  apis: UniversalApis
  version: string
  initialized: boolean
}

/**
 * MagicSaaS Plugin Options
 */
export interface MagicSaaSPluginOptions {
  // Optional config override
  config?: Partial<RuntimeConfig>

  // Callbacks
  onInitialized?: (magicsaas: MagicSaaSGlobal) => void
  onError?: (error: Error) => void

  // Feature toggles
  enableDevTools?: boolean
  enableErrorTracking?: boolean
}

/**
 * Create MagicSaaS Plugin
 */
export function createMagicSaaSPlugin(options: MagicSaaSPluginOptions = {}): Plugin {
  return {
    async install(app: App) {
      console.log('🌸 Initializing MagicSaaS System-∞...')

      try {
        // Load runtime config
        const config = await getRuntimeConfig()

        // Override with provided options
        if (options.config) {
          Object.assign(config, options.config)
        }

        // Create Universal APIs
        const apis = await getUniversalApis()

        // Create global instance
        const magicsaas: MagicSaaSGlobal = {
          config,
          apis,
          version: '3.0.0',
          initialized: true
        }

        // Inject globally
        app.config.globalProperties.$magicsaas = magicsaas
        app.provide('magicsaas', magicsaas)

        // Dev tools
        if (options.enableDevTools && config.isDevelopment) {
          installDevTools(app, magicsaas)
        }

        // Error tracking
        if (options.enableErrorTracking && config.features.enableSentry) {
          installErrorTracking(app, magicsaas)
        }

        // Success callback
        if (options.onInitialized) {
          options.onInitialized(magicsaas)
        }

        console.log('✅ MagicSaaS System-∞ initialized successfully!')
        console.log(`   Environment: ${config.environment}`)
        console.log(`   Pétala: ${config.petala.name} (${config.petala.type})`)
        console.log(`   API: ${config.api.baseUrl}`)
        console.log(`   Tenant: ${config.tenant.name} (${config.tenant.id})`)

      } catch (error) {
        console.error('❌ Failed to initialize MagicSaaS:', error)

        if (options.onError) {
          options.onError(error as Error)
        }

        throw error
      }
    }
  }
}

/**
 * Install dev tools
 */
function installDevTools(app: App, magicsaas: MagicSaaSGlobal): void {
  // Make available in window for debugging
  if (typeof window !== 'undefined') {
    (window as any).__MAGICSAAS__ = magicsaas
    console.log('🛠️ MagicSaaS Dev Tools available at window.__MAGICSAAS__')
  }

  // Install custom dev tools panel (future)
  // This could integrate with Vue DevTools
}

/**
 * Install error tracking (Sentry, etc.)
 */
function installErrorTracking(app: App, magicsaas: MagicSaaSGlobal): void {
  app.config.errorHandler = (err, instance, info) => {
    console.error('Vue Error:', err, info)

    // Send to error tracking service
    // This would integrate with Sentry or similar
    if (magicsaas.config.features.enableSentry) {
      // Sentry.captureException(err)
    }
  }
}

/**
 * Composition API helper to inject MagicSaaS
 */
export function useMagicSaaS(): MagicSaaSGlobal {
  const magicsaas = inject<MagicSaaSGlobal>('magicsaas')

  if (!magicsaas) {
    throw new Error('MagicSaaS plugin not installed. Install it in your main.ts with app.use(createMagicSaaSPlugin())')
  }

  return magicsaas
}

/**
 * Type augmentation for global properties
 */
declare module '@vue/runtime-core' {
  export interface ComponentCustomProperties {
    $magicsaas: MagicSaaSGlobal
  }
}

import { inject } from 'vue'

export default createMagicSaaSPlugin
