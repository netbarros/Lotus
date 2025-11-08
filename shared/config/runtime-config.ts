/**
 * 🌸 MAGICSAAS SYSTEM-∞ - RUNTIME CONFIGURATION
 *
 * STATE-OF-THE-ART DYNAMIC CONFIGURATION SYSTEM
 * ============================================
 *
 * ✅ ZERO CODE CHANGES between environments
 * ✅ Automatic environment detection (localhost/production)
 * ✅ Domain-based pétala routing
 * ✅ Multi-tenant support
 * ✅ Runtime config without rebuild
 *
 * @version 3.0.0
 * @author MagicSaaS Architecture Team
 */

export interface RuntimeConfig {
  // Environment Detection
  environment: 'development' | 'staging' | 'production'
  isLocalhost: boolean
  isDevelopment: boolean
  isProduction: boolean

  // Domain Configuration
  domain: string
  subdomain: string | null
  protocol: string

  // Pétala Detection
  petala: {
    name: string
    type: 'fashion' | 'restaurant' | 'healthcare' | 'travel' | 'academy' | 'retail' | 'realestate' | 'education' | 'fitness' | 'hospitality' | 'financial' | 'legal' | 'manufacturing' | 'logistics'
    basePath: string
  }

  // API Configuration
  api: {
    baseUrl: string
    timeout: number
    retryAttempts: number
    retryDelay: number
  }

  // Directus CMS
  directus: {
    url: string
    graphqlUrl: string
    assetsUrl: string
  }

  // Sofia AI
  sofia: {
    enabled: boolean
    apiUrl: string
    features: {
      intentionEngine: boolean
      uxValidation: boolean
      seoOptimization: boolean
      voiceAssistant: boolean
    }
  }

  // Authentication
  auth: {
    jwtExpiration: string
    refreshExpiration: string
    storageKey: string
  }

  // Feature Flags
  features: {
    enablePWA: boolean
    enableOfflineMode: boolean
    enableAnalytics: boolean
    enableSentry: boolean
    enableHotjar: boolean
  }

  // Payment Gateways
  payment: {
    stripe: {
      enabled: boolean
      publicKey: string
    }
    mercadoPago: {
      enabled: boolean
      publicKey: string
    }
  }

  // Media & CDN
  media: {
    cloudinary: {
      enabled: boolean
      cloudName: string
      uploadPreset: string
    }
    maxUploadSize: number
    allowedFormats: string[]
  }

  // Search
  search: {
    algolia: {
      enabled: boolean
      appId: string
      searchKey: string
    }
  }

  // Analytics
  analytics: {
    googleAnalytics: {
      enabled: boolean
      measurementId: string
    }
    hotjar: {
      enabled: boolean
      siteId: string
    }
  }

  // Tenant
  tenant: {
    id: string
    name: string
    customDomain: string | null
  }
}

/**
 * Smart Environment Detection
 * Detects automatically based on hostname and protocol
 */
function detectEnvironment(): RuntimeConfig['environment'] {
  if (typeof window === 'undefined') return 'production'

  const hostname = window.location.hostname

  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.includes('.local')) {
    return 'development'
  }

  if (hostname.includes('staging.') || hostname.includes('.stg.')) {
    return 'staging'
  }

  return 'production'
}

/**
 * Smart Pétala Detection
 * Detects pétala based on:
 * 1. Subdomain (fashion.magicsaas.com)
 * 2. Path (/fashion/...)
 * 3. Custom domain mapping
 * 4. Environment variable override
 */
function detectPetala(): RuntimeConfig['petala'] {
  if (typeof window === 'undefined') {
    return { name: 'default', type: 'fashion', basePath: '/petalas/fashion' }
  }

  const hostname = window.location.hostname
  const pathname = window.location.pathname

  // 1. Check subdomain mapping
  const subdomainMap: Record<string, RuntimeConfig['petala']['type']> = {
    'fashion': 'fashion',
    'restaurant': 'restaurant',
    'food': 'restaurant',
    'delivery': 'restaurant',
    'health': 'healthcare',
    'healthcare': 'healthcare',
    'clinic': 'healthcare',
    'hospital': 'healthcare',
    'travel': 'travel',
    'trips': 'travel',
    'academy': 'academy',
    'education': 'education',
    'learn': 'academy',
    'retail': 'retail',
    'shop': 'retail',
    'store': 'retail',
    'realestate': 'realestate',
    'properties': 'realestate',
    'fitness': 'fitness',
    'gym': 'fitness',
    'hospitality': 'hospitality',
    'hotel': 'hospitality',
    'financial': 'financial',
    'finance': 'financial',
    'legal': 'legal',
    'law': 'legal',
    'manufacturing': 'manufacturing',
    'factory': 'manufacturing',
    'logistics': 'logistics',
    'shipping': 'logistics'
  }

  const subdomain = hostname.split('.')[0]
  if (subdomainMap[subdomain]) {
    const type = subdomainMap[subdomain]
    return {
      name: type.charAt(0).toUpperCase() + type.slice(1),
      type,
      basePath: `/petalas/${type}`
    }
  }

  // 2. Check path mapping
  const pathMatch = pathname.match(/^\/petalas\/([^/]+)/)
  if (pathMatch) {
    const type = pathMatch[1] as RuntimeConfig['petala']['type']
    return {
      name: type.charAt(0).toUpperCase() + type.slice(1),
      type,
      basePath: `/petalas/${type}`
    }
  }

  // 3. Check custom domain mapping (would come from API/database)
  // This would be loaded from a config endpoint

  // 4. Default to fashion (or read from meta tag)
  const metaTag = document.querySelector('meta[name="magicsaas:petala"]')
  if (metaTag) {
    const type = metaTag.getAttribute('content') as RuntimeConfig['petala']['type'] || 'fashion'
    return {
      name: type.charAt(0).toUpperCase() + type.slice(1),
      type,
      basePath: `/petalas/${type}`
    }
  }

  return { name: 'Fashion', type: 'fashion', basePath: '/petalas/fashion' }
}

/**
 * Smart API URL Detection
 * Detects API URL based on environment
 */
function detectApiUrl(environment: RuntimeConfig['environment']): string {
  if (typeof window === 'undefined') return 'http://localhost:8055'

  // Environment variable override (build-time)
  const envApiUrl = import.meta.env?.VITE_API_URL
  if (envApiUrl && envApiUrl !== 'AUTO') return envApiUrl

  // Runtime detection
  const hostname = window.location.hostname
  const protocol = window.location.protocol

  if (environment === 'development') {
    return 'http://localhost:8055'
  }

  if (environment === 'staging') {
    return `${protocol}//api.staging.magicsaas.com`
  }

  // Production: Use same domain with /api path or api subdomain
  if (hostname.startsWith('www.')) {
    return `${protocol}//api.${hostname.substring(4)}`
  }

  return `${protocol}//api.${hostname}`
}

/**
 * Load environment-specific configuration
 * Priority:
 * 1. Runtime config from /config.json (served by web server)
 * 2. Build-time environment variables
 * 3. Smart defaults based on detection
 */
async function loadRuntimeConfigFromServer(): Promise<Partial<RuntimeConfig> | null> {
  try {
    const response = await fetch('/config.json', {
      cache: 'no-cache',
      headers: { 'Accept': 'application/json' }
    })

    if (response.ok) {
      return await response.json()
    }
  } catch (error) {
    console.warn('Could not load runtime config from server, using defaults', error)
  }

  return null
}

/**
 * Create Runtime Configuration
 * Merges all sources with smart defaults
 */
export async function createRuntimeConfig(): Promise<RuntimeConfig> {
  // Detect environment
  const environment = detectEnvironment()
  const isLocalhost = typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')

  // Detect pétala
  const petala = detectPetala()

  // Detect API URL
  const apiBaseUrl = detectApiUrl(environment)

  // Load server config (if available)
  const serverConfig = await loadRuntimeConfigFromServer()

  // Build configuration with priorities
  const config: RuntimeConfig = {
    // Environment
    environment,
    isLocalhost,
    isDevelopment: environment === 'development',
    isProduction: environment === 'production',

    // Domain
    domain: typeof window !== 'undefined' ? window.location.hostname : 'localhost',
    subdomain: typeof window !== 'undefined' ? window.location.hostname.split('.')[0] || null : null,
    protocol: typeof window !== 'undefined' ? window.location.protocol : 'http:',

    // Pétala
    petala: serverConfig?.petala || petala,

    // API
    api: {
      baseUrl: serverConfig?.api?.baseUrl || apiBaseUrl,
      timeout: serverConfig?.api?.timeout || parseInt(import.meta.env?.VITE_API_TIMEOUT || '30000'),
      retryAttempts: serverConfig?.api?.retryAttempts || 3,
      retryDelay: serverConfig?.api?.retryDelay || 1000
    },

    // Directus
    directus: {
      url: serverConfig?.directus?.url || apiBaseUrl,
      graphqlUrl: serverConfig?.directus?.graphqlUrl || `${apiBaseUrl}/graphql`,
      assetsUrl: serverConfig?.directus?.assetsUrl || `${apiBaseUrl}/assets`
    },

    // Sofia AI
    sofia: {
      enabled: serverConfig?.sofia?.enabled ?? true,
      apiUrl: serverConfig?.sofia?.apiUrl || (isLocalhost ? 'http://localhost:3003' : `${apiBaseUrl.replace('/api', '')}/sofia`),
      features: {
        intentionEngine: serverConfig?.sofia?.features?.intentionEngine ?? true,
        uxValidation: serverConfig?.sofia?.features?.uxValidation ?? true,
        seoOptimization: serverConfig?.sofia?.features?.seoOptimization ?? true,
        voiceAssistant: serverConfig?.sofia?.features?.voiceAssistant ?? false
      }
    },

    // Auth
    auth: {
      jwtExpiration: serverConfig?.auth?.jwtExpiration || '7d',
      refreshExpiration: serverConfig?.auth?.refreshExpiration || '30d',
      storageKey: serverConfig?.auth?.storageKey || 'magicsaas_auth'
    },

    // Feature Flags
    features: {
      enablePWA: serverConfig?.features?.enablePWA ?? true,
      enableOfflineMode: serverConfig?.features?.enableOfflineMode ?? false,
      enableAnalytics: serverConfig?.features?.enableAnalytics ?? (environment === 'production'),
      enableSentry: serverConfig?.features?.enableSentry ?? (environment === 'production'),
      enableHotjar: serverConfig?.features?.enableHotjar ?? false
    },

    // Payment
    payment: {
      stripe: {
        enabled: serverConfig?.payment?.stripe?.enabled ?? false,
        publicKey: serverConfig?.payment?.stripe?.publicKey || import.meta.env?.VITE_STRIPE_PUBLIC_KEY || ''
      },
      mercadoPago: {
        enabled: serverConfig?.payment?.mercadoPago?.enabled ?? false,
        publicKey: serverConfig?.payment?.mercadoPago?.publicKey || import.meta.env?.VITE_MERCADOPAGO_PUBLIC_KEY || ''
      }
    },

    // Media
    media: {
      cloudinary: {
        enabled: serverConfig?.media?.cloudinary?.enabled ?? false,
        cloudName: serverConfig?.media?.cloudinary?.cloudName || import.meta.env?.VITE_CLOUDINARY_CLOUD_NAME || '',
        uploadPreset: serverConfig?.media?.cloudinary?.uploadPreset || import.meta.env?.VITE_CLOUDINARY_UPLOAD_PRESET || ''
      },
      maxUploadSize: serverConfig?.media?.maxUploadSize || 10485760, // 10MB
      allowedFormats: serverConfig?.media?.allowedFormats || ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg']
    },

    // Search
    search: {
      algolia: {
        enabled: serverConfig?.search?.algolia?.enabled ?? false,
        appId: serverConfig?.search?.algolia?.appId || import.meta.env?.VITE_ALGOLIA_APP_ID || '',
        searchKey: serverConfig?.search?.algolia?.searchKey || import.meta.env?.VITE_ALGOLIA_SEARCH_KEY || ''
      }
    },

    // Analytics
    analytics: {
      googleAnalytics: {
        enabled: serverConfig?.analytics?.googleAnalytics?.enabled ?? (environment === 'production'),
        measurementId: serverConfig?.analytics?.googleAnalytics?.measurementId || import.meta.env?.VITE_GA_MEASUREMENT_ID || ''
      },
      hotjar: {
        enabled: serverConfig?.analytics?.hotjar?.enabled ?? false,
        siteId: serverConfig?.analytics?.hotjar?.siteId || import.meta.env?.VITE_HOTJAR_SITE_ID || ''
      }
    },

    // Tenant
    tenant: {
      id: serverConfig?.tenant?.id || import.meta.env?.VITE_TENANT_ID || 'default',
      name: serverConfig?.tenant?.name || 'MagicSaaS',
      customDomain: serverConfig?.tenant?.customDomain || null
    }
  }

  return config
}

/**
 * Runtime Config Singleton
 */
let _runtimeConfig: RuntimeConfig | null = null

export async function getRuntimeConfig(): Promise<RuntimeConfig> {
  if (!_runtimeConfig) {
    _runtimeConfig = await createRuntimeConfig()

    // Log config in development
    if (_runtimeConfig.isDevelopment) {
      console.log('🌸 MagicSaaS Runtime Configuration:', _runtimeConfig)
    }
  }

  return _runtimeConfig
}

/**
 * Sync version (returns cached or throws)
 */
export function getRuntimeConfigSync(): RuntimeConfig {
  if (!_runtimeConfig) {
    throw new Error('Runtime config not initialized. Call getRuntimeConfig() first.')
  }
  return _runtimeConfig
}

/**
 * Reset config (useful for testing)
 */
export function resetRuntimeConfig(): void {
  _runtimeConfig = null
}

export default getRuntimeConfig
