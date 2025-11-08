/**
 * 🌸 MAGICSAAS SYSTEM-∞ - BACKEND RUNTIME CONFIGURATION
 *
 * STATE-OF-THE-ART DYNAMIC BACKEND CONFIGURATION
 * ===============================================
 *
 * ✅ ZERO CODE CHANGES between environments
 * ✅ Automatic environment detection
 * ✅ ENV variables with smart defaults
 * ✅ Type-safe configuration
 *
 * @version 3.0.0
 * @author MagicSaaS Architecture Team
 */

import * as dotenv from 'dotenv'
import * as path from 'path'
import * as fs from 'fs'

// Load environment variables
dotenv.config()

export interface BackendRuntimeConfig {
  // Environment
  environment: 'development' | 'staging' | 'production' | 'test'
  isDevelopment: boolean
  isProduction: boolean
  isTest: boolean

  // Server
  server: {
    port: number
    host: string
    protocol: 'http' | 'https'
    baseUrl: string
    corsOrigins: string[]
  }

  // Database
  database: {
    url: string
    host: string
    port: number
    name: string
    user: string
    password: string
    ssl: boolean
    poolMin: number
    poolMax: number
  }

  // Redis
  redis: {
    host: string
    port: number
    password: string | null
    db: number
    url: string
  }

  // Directus
  directus: {
    url: string
    adminEmail: string
    adminPassword: string
    adminToken: string | null
    key: string
    secret: string
  }

  // Sofia AI
  sofia: {
    enabled: boolean
    port: number
    anthropicApiKey: string
    features: {
      intentionEngine: boolean
      uxValidation: boolean
      seoOptimization: boolean
      marketplace: boolean
      metaOrchestration: boolean
      adaptiveLearning: boolean
    }
  }

  // JWT
  jwt: {
    secret: string
    expiration: string
    refreshExpiration: string
  }

  // Security
  security: {
    encryptionKey: string
    rateLimitWindowMs: number
    rateLimitMaxRequests: number
    enableCors: boolean
    allowedOrigins: string[]
  }

  // Logging
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error'
    enableConsole: boolean
    enableFile: boolean
    filePath: string
  }

  // Email
  email: {
    enabled: boolean
    from: string
    fromName: string
    smtp: {
      host: string
      port: number
      user: string
      pass: string
      secure: boolean
    } | null
    postmark: {
      apiKey: string
    } | null
  }

  // Storage
  storage: {
    provider: 'local' | 's3' | 'cloudinary'
    local: {
      path: string
    }
    s3: {
      bucket: string
      region: string
      accessKeyId: string
      secretAccessKey: string
    } | null
    cloudinary: {
      cloudName: string
      apiKey: string
      apiSecret: string
    } | null
  }

  // Payment
  payment: {
    stripe: {
      enabled: boolean
      secretKey: string
      webhookSecret: string
    }
    mercadoPago: {
      enabled: boolean
      accessToken: string
    }
  }

  // Observability
  observability: {
    prometheus: {
      enabled: boolean
      port: number
    }
    grafana: {
      enabled: boolean
      port: number
      adminUser: string
      adminPassword: string
    }
    sentry: {
      enabled: boolean
      dsn: string
      environment: string
      tracesSampleRate: number
    }
  }

  // Feature Flags
  features: {
    enableVoiceAssistant: boolean
    enableBlockchain: boolean
    enableQuantum: boolean
    enableFederatedLearning: boolean
    enableMobileSDK: boolean
    enableEdgeComputing: boolean
  }

  // Compliance
  compliance: {
    gdprEnabled: boolean
    lgpdEnabled: boolean
    hipaaEnabled: boolean
    dataRetentionDays: number
    auditLogEnabled: boolean
  }
}

/**
 * Get environment variable with default
 */
function env(key: string, defaultValue: string = ''): string {
  return process.env[key] || defaultValue
}

/**
 * Get environment variable as number
 */
function envNumber(key: string, defaultValue: number = 0): number {
  const value = process.env[key]
  return value ? parseInt(value, 10) : defaultValue
}

/**
 * Get environment variable as boolean
 */
function envBoolean(key: string, defaultValue: boolean = false): boolean {
  const value = process.env[key]
  if (!value) return defaultValue
  return value.toLowerCase() === 'true' || value === '1'
}

/**
 * Detect environment
 */
function detectEnvironment(): BackendRuntimeConfig['environment'] {
  const nodeEnv = env('NODE_ENV', 'development')

  if (nodeEnv === 'test') return 'test'
  if (nodeEnv === 'production') return 'production'
  if (nodeEnv === 'staging') return 'staging'

  return 'development'
}

/**
 * Parse CORS origins
 */
function parseCorsOrigins(): string[] {
  const origins = env('ALLOWED_ORIGINS', 'http://localhost:3001,http://localhost:3002')
  return origins.split(',').map(o => o.trim()).filter(Boolean)
}

/**
 * Create Backend Runtime Configuration
 */
export function createBackendRuntimeConfig(): BackendRuntimeConfig {
  const environment = detectEnvironment()
  const isDevelopment = environment === 'development'
  const isProduction = environment === 'production'
  const isTest = environment === 'test'

  // Server configuration
  const serverPort = envNumber('PORT', envNumber('SOFIA_PORT', 3003))
  const serverHost = env('HOST', '0.0.0.0')
  const serverProtocol = envBoolean('HTTPS_ENABLED') ? 'https' : 'http'
  const appUrl = env('APP_URL', `http://localhost:${serverPort}`)

  const config: BackendRuntimeConfig = {
    // Environment
    environment,
    isDevelopment,
    isProduction,
    isTest,

    // Server
    server: {
      port: serverPort,
      host: serverHost,
      protocol: serverProtocol,
      baseUrl: appUrl,
      corsOrigins: parseCorsOrigins()
    },

    // Database
    database: {
      url: env('DATABASE_URL', 'postgresql://postgres:changeme@localhost:5432/magicsaas'),
      host: env('POSTGRES_HOST', 'localhost'),
      port: envNumber('POSTGRES_PORT', 5432),
      name: env('POSTGRES_DB', 'magicsaas'),
      user: env('POSTGRES_USER', 'postgres'),
      password: env('POSTGRES_PASSWORD', 'changeme'),
      ssl: envBoolean('DATABASE_SSL', false),
      poolMin: envNumber('DATABASE_POOL_MIN', 2),
      poolMax: envNumber('DATABASE_POOL_MAX', 10)
    },

    // Redis
    redis: {
      host: env('REDIS_HOST', 'localhost'),
      port: envNumber('REDIS_PORT', 6379),
      password: env('REDIS_PASSWORD') || null,
      db: envNumber('REDIS_DB', 0),
      url: env('REDIS_URL', 'redis://localhost:6379')
    },

    // Directus
    directus: {
      url: env('DIRECTUS_URL', 'http://localhost:8055'),
      adminEmail: env('DIRECTUS_ADMIN_EMAIL', 'admin@softwarelotus.com.br'),
      adminPassword: env('DIRECTUS_ADMIN_PASSWORD', 'Admin123!'),
      adminToken: env('DIRECTUS_ADMIN_TOKEN') || null,
      key: env('DIRECTUS_KEY', 'changeme-random-key'),
      secret: env('DIRECTUS_SECRET', 'changeme-random-secret')
    },

    // Sofia AI
    sofia: {
      enabled: envBoolean('SOFIA_ENABLED', true),
      port: envNumber('SOFIA_PORT', 3003),
      anthropicApiKey: env('ANTHROPIC_API_KEY', ''),
      features: {
        intentionEngine: envBoolean('FEATURE_INTENTION_ENGINE', true),
        uxValidation: envBoolean('FEATURE_UX_VALIDATION', true),
        seoOptimization: envBoolean('FEATURE_SEO_OPTIMIZATION', true),
        marketplace: envBoolean('FEATURE_MARKETPLACE', true),
        metaOrchestration: envBoolean('FEATURE_META_ORCHESTRATION', true),
        adaptiveLearning: envBoolean('FEATURE_ADAPTIVE_LEARNING', true)
      }
    },

    // JWT
    jwt: {
      secret: env('JWT_SECRET', 'changeme-super-secret-jwt-key'),
      expiration: env('JWT_EXPIRATION', '7d'),
      refreshExpiration: env('JWT_REFRESH_EXPIRATION', '30d')
    },

    // Security
    security: {
      encryptionKey: env('ENCRYPTION_KEY', 'changeme-encryption-key-64-chars'),
      rateLimitWindowMs: envNumber('RATE_LIMIT_WINDOW_MS', 60000),
      rateLimitMaxRequests: envNumber('RATE_LIMIT_MAX_REQUESTS', 100),
      enableCors: envBoolean('CORS_ENABLED', true),
      allowedOrigins: parseCorsOrigins()
    },

    // Logging
    logging: {
      level: (env('LOG_LEVEL', 'info') as any),
      enableConsole: envBoolean('LOG_CONSOLE', true),
      enableFile: envBoolean('LOG_FILE', isProduction),
      filePath: env('LOG_FILE_PATH', path.join(process.cwd(), 'logs', 'app.log'))
    },

    // Email
    email: {
      enabled: envBoolean('EMAIL_ENABLED', false),
      from: env('EMAIL_FROM', 'noreply@softwarelotus.com.br'),
      fromName: env('EMAIL_FROM_NAME', 'MagicSaaS'),
      smtp: env('SMTP_HOST') ? {
        host: env('SMTP_HOST'),
        port: envNumber('SMTP_PORT', 587),
        user: env('SMTP_USER'),
        pass: env('SMTP_PASS'),
        secure: envBoolean('SMTP_SECURE', true)
      } : null,
      postmark: env('POSTMARK_API_KEY') ? {
        apiKey: env('POSTMARK_API_KEY')
      } : null
    },

    // Storage
    storage: {
      provider: (env('STORAGE_PROVIDER', 'local') as any),
      local: {
        path: env('STORAGE_LOCAL_PATH', path.join(process.cwd(), 'uploads'))
      },
      s3: env('AWS_S3_BUCKET') ? {
        bucket: env('AWS_S3_BUCKET'),
        region: env('AWS_REGION', 'us-east-1'),
        accessKeyId: env('AWS_ACCESS_KEY_ID'),
        secretAccessKey: env('AWS_SECRET_ACCESS_KEY')
      } : null,
      cloudinary: env('CLOUDINARY_CLOUD_NAME') ? {
        cloudName: env('CLOUDINARY_CLOUD_NAME'),
        apiKey: env('CLOUDINARY_API_KEY'),
        apiSecret: env('CLOUDINARY_API_SECRET')
      } : null
    },

    // Payment
    payment: {
      stripe: {
        enabled: envBoolean('STRIPE_ENABLED', false),
        secretKey: env('STRIPE_SECRET_KEY', ''),
        webhookSecret: env('STRIPE_WEBHOOK_SECRET', '')
      },
      mercadoPago: {
        enabled: envBoolean('MERCADO_PAGO_ENABLED', false),
        accessToken: env('MERCADO_PAGO_ACCESS_TOKEN', '')
      }
    },

    // Observability
    observability: {
      prometheus: {
        enabled: envBoolean('PROMETHEUS_ENABLED', true),
        port: envNumber('PROMETHEUS_PORT', 9090)
      },
      grafana: {
        enabled: envBoolean('GRAFANA_ENABLED', isDevelopment),
        port: envNumber('GRAFANA_PORT', 3002),
        adminUser: env('GRAFANA_ADMIN_USER', 'admin'),
        adminPassword: env('GRAFANA_ADMIN_PASSWORD', 'admin')
      },
      sentry: {
        enabled: envBoolean('SENTRY_ENABLED', isProduction),
        dsn: env('SENTRY_DSN', ''),
        environment: environment,
        tracesSampleRate: parseFloat(env('SENTRY_TRACES_SAMPLE_RATE', '1.0'))
      }
    },

    // Feature Flags
    features: {
      enableVoiceAssistant: envBoolean('ENABLE_VOICE_ASSISTANT', false),
      enableBlockchain: envBoolean('ENABLE_BLOCKCHAIN', false),
      enableQuantum: envBoolean('ENABLE_QUANTUM', false),
      enableFederatedLearning: envBoolean('ENABLE_FEDERATED_LEARNING', false),
      enableMobileSDK: envBoolean('ENABLE_MOBILE_SDK', true),
      enableEdgeComputing: envBoolean('ENABLE_EDGE_COMPUTING', true)
    },

    // Compliance
    compliance: {
      gdprEnabled: envBoolean('GDPR_ENABLED', true),
      lgpdEnabled: envBoolean('LGPD_ENABLED', true),
      hipaaEnabled: envBoolean('HIPAA_ENABLED', false),
      dataRetentionDays: envNumber('DATA_RETENTION_DAYS', 2555),
      auditLogEnabled: envBoolean('AUDIT_LOG_ENABLED', true)
    }
  }

  return config
}

/**
 * Validate configuration
 */
export function validateBackendConfig(config: BackendRuntimeConfig): void {
  const errors: string[] = []

  // Required fields
  if (!config.sofia.anthropicApiKey && config.sofia.enabled) {
    errors.push('ANTHROPIC_API_KEY is required when Sofia AI is enabled')
  }

  if (!config.jwt.secret || config.jwt.secret.includes('changeme')) {
    errors.push('JWT_SECRET must be set to a secure value')
  }

  if (!config.security.encryptionKey || config.security.encryptionKey.includes('changeme')) {
    errors.push('ENCRYPTION_KEY must be set to a secure value')
  }

  if (config.isProduction) {
    if (config.directus.adminPassword.includes('changeme') || config.directus.adminPassword === 'Admin123!') {
      errors.push('DIRECTUS_ADMIN_PASSWORD must be changed for production')
    }

    if (!config.observability.sentry.dsn && config.observability.sentry.enabled) {
      errors.push('SENTRY_DSN is required when Sentry is enabled in production')
    }
  }

  if (errors.length > 0) {
    console.error('❌ Configuration validation failed:')
    errors.forEach(error => console.error(`   - ${error}`))

    if (config.isProduction) {
      throw new Error('Invalid production configuration')
    } else {
      console.warn('⚠️  Running with invalid configuration (development mode)')
    }
  }
}

/**
 * Singleton instance
 */
let _backendConfig: BackendRuntimeConfig | null = null

/**
 * Get Backend Runtime Configuration
 */
export function getBackendRuntimeConfig(): BackendRuntimeConfig {
  if (!_backendConfig) {
    _backendConfig = createBackendRuntimeConfig()

    // Validate
    validateBackendConfig(_backendConfig)

    // Log in development
    if (_backendConfig.isDevelopment) {
      console.log('🌸 Backend Runtime Configuration:')
      console.log(`   Environment: ${_backendConfig.environment}`)
      console.log(`   Server: ${_backendConfig.server.protocol}://${_backendConfig.server.host}:${_backendConfig.server.port}`)
      console.log(`   Database: ${_backendConfig.database.host}:${_backendConfig.database.port}/${_backendConfig.database.name}`)
      console.log(`   Redis: ${_backendConfig.redis.host}:${_backendConfig.redis.port}`)
      console.log(`   Sofia AI: ${_backendConfig.sofia.enabled ? 'Enabled' : 'Disabled'}`)
    }
  }

  return _backendConfig
}

/**
 * Reset config (for testing)
 */
export function resetBackendConfig(): void {
  _backendConfig = null
}

export default getBackendRuntimeConfig
