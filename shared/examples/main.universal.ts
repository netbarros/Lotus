/**
 * 🌸 MAGICSAAS SYSTEM-∞ - UNIVERSAL MAIN.TS
 *
 * THIS FILE WORKS FOR ALL PÉTALAS WITHOUT ANY CHANGES!
 * =====================================================
 *
 * ✅ Zero code changes between pétalas
 * ✅ Automatic pétala detection
 * ✅ Automatic environment detection
 * ✅ Runtime configuration
 *
 * @version 3.0.0
 * @author MagicSaaS Architecture Team
 *
 * USAGE:
 * Copy this file to any pétala's frontend/src/main.ts
 * It will automatically detect and configure everything!
 */

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createMagicSaaSPlugin } from '@/shared/plugins/magicsaas-plugin'
import App from './App.vue'
import router from './router'

// Import global styles
import './assets/styles/main.css'

/**
 * Create Vue App
 */
const app = createApp(App)

/**
 * Install Pinia (State Management)
 */
const pinia = createPinia()
app.use(pinia)

/**
 * Install MagicSaaS Universal System
 * This automatically:
 * - Detects environment (localhost/staging/production)
 * - Detects pétala (fashion/restaurant/healthcare/etc)
 * - Loads runtime config from /config.json (if available)
 * - Creates Universal API client
 * - Injects globally as $magicsaas
 */
app.use(createMagicSaaSPlugin({
  // Enable dev tools in development
  enableDevTools: import.meta.env.DEV,

  // Enable error tracking in production
  enableErrorTracking: import.meta.env.PROD,

  // Callback when initialized
  onInitialized: (magicsaas) => {
    console.log('╔════════════════════════════════════════════════════════════════╗')
    console.log('║  🌸 MAGICSAAS SYSTEM-∞ INITIALIZED                             ║')
    console.log('╠════════════════════════════════════════════════════════════════╣')
    console.log(`║  Pétala:      ${magicsaas.config.petala.name.padEnd(48)} ║`)
    console.log(`║  Environment: ${magicsaas.config.environment.padEnd(48)} ║`)
    console.log(`║  API URL:     ${magicsaas.config.api.baseUrl.padEnd(48)} ║`)
    console.log(`║  Tenant:      ${magicsaas.config.tenant.name.padEnd(48)} ║`)
    console.log('╚════════════════════════════════════════════════════════════════╝')

    // Store in window for debugging (development only)
    if (import.meta.env.DEV) {
      ;(window as any).__MAGICSAAS_CONFIG__ = magicsaas.config
      console.log('💡 Config available at window.__MAGICSAAS_CONFIG__')
    }
  },

  // Callback on error
  onError: (error) => {
    console.error('❌ Failed to initialize MagicSaaS:', error)

    // Show user-friendly error
    document.body.innerHTML = `
      <div style="
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        font-family: system-ui, -apple-system, sans-serif;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        text-align: center;
        padding: 20px;
      ">
        <div>
          <h1 style="font-size: 48px; margin-bottom: 20px;">⚠️</h1>
          <h2 style="margin-bottom: 10px;">Failed to Initialize</h2>
          <p style="opacity: 0.9; margin-bottom: 20px;">
            ${error.message}
          </p>
          <button
            onclick="window.location.reload()"
            style="
              background: white;
              color: #667eea;
              border: none;
              padding: 12px 24px;
              border-radius: 6px;
              font-size: 16px;
              font-weight: 600;
              cursor: pointer;
            "
          >
            Reload Page
          </button>
        </div>
      </div>
    `
  }
}))

/**
 * Install Router
 * Router is also pétala-aware and can use config
 */
app.use(router)

/**
 * Global Error Handler
 */
app.config.errorHandler = (err, instance, info) => {
  console.error('Vue Error:', err)
  console.error('Component:', instance)
  console.error('Info:', info)

  // In production, send to error tracking service
  if (import.meta.env.PROD) {
    // Send to Sentry or similar
    // Sentry.captureException(err)
  }
}

/**
 * Global Warning Handler (development only)
 */
if (import.meta.env.DEV) {
  app.config.warnHandler = (msg, instance, trace) => {
    console.warn('Vue Warning:', msg)
    console.warn('Trace:', trace)
  }
}

/**
 * Mount App
 */
app.mount('#app')

/**
 * Log mount success
 */
if (import.meta.env.DEV) {
  console.log('✅ App mounted successfully!')
}

/**
 * Service Worker (PWA) - Auto-register if enabled
 */
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then(registration => {
        console.log('✅ Service Worker registered:', registration)
      })
      .catch(error => {
        console.log('❌ Service Worker registration failed:', error)
      })
  })
}

/**
 * Hot Module Replacement (HMR) - Development only
 */
if (import.meta.hot) {
  import.meta.hot.accept(() => {
    console.log('🔄 Hot module replacement triggered')
  })
}

export { app }
