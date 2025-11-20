#!/usr/bin/env ts-node

/**
 * 🔧 Universal Config Generator for MagicSaaS Pétalas
 *
 * Generates complete config.json files for each pétala with all settings:
 * - Database configuration
 * - Sofia AI settings
 * - Security configuration
 * - Monitoring & observability
 * - Performance optimization
 * - Integrations
 * - Deployment settings
 * - Compliance requirements
 *
 * Usage:
 *   npm run generate:config -- --petala fashion
 *   npm run generate:config -- --all
 */

import * as fs from 'fs';
import * as path from 'path';

interface ConfigTemplate {
  petala: {
    name: string;
    displayName: string;
    version: string;
    status: string;
    icon: string;
    category: string;
  };
  environment: Record<string, string>;
  database: any;
  cache: any;
  sofia: any;
  features: any;
  security: any;
  monitoring: any;
  performance: any;
  integrations: any;
  deployment: any;
  compliance: any;
  backup: any;
  meta: any;
}

const PETALA_CONFIGS: Record<string, Partial<ConfigTemplate>> = {
  fashion: {
    petala: {
      name: 'fashion',
      displayName: 'Fashion & E-commerce',
      version: '1.0.0',
      status: 'production',
      icon: '🛍️',
      category: 'ecommerce',
    },
    integrations: {
      stripe: { enabled: true },
      cloudinary: { enabled: true },
      algolia: { enabled: true },
      instagram: { enabled: true, syncInterval: 3600 },
      '8thWall': { enabled: true },
    },
  },
  restaurant: {
    petala: {
      name: 'restaurant',
      displayName: 'Restaurant & Food Delivery',
      version: '1.0.0',
      status: 'production',
      icon: '🍽️',
      category: 'food-tech',
    },
    integrations: {
      stripe: { enabled: true },
      mercadoPago: { enabled: true },
      googleMaps: { enabled: true },
      whatsapp: { enabled: true },
      twilio: { enabled: true },
    },
  },
  healthcare: {
    petala: {
      name: 'healthcare',
      displayName: 'Healthcare & Telemedicine',
      version: '1.0.0',
      status: 'production',
      icon: '🏥',
      category: 'health-tech',
    },
    compliance: {
      hipaa: { enabled: true },
      gdpr: { enabled: true },
      encryption: { required: true, algorithm: 'aes-256-gcm' },
    },
    integrations: {
      twilio: { enabled: true, video: true },
      stripe: { enabled: true },
      aws: { enabled: true, s3Encryption: true },
    },
  },
  'real-estate': {
    petala: {
      name: 'real-estate',
      displayName: 'Real Estate & Property Management',
      version: '1.0.0',
      status: 'production',
      icon: '🏘️',
      category: 'prop-tech',
    },
    integrations: {
      matterport: { enabled: true },
      googleMaps: { enabled: true },
      docusign: { enabled: true },
      stripe: { enabled: true },
    },
  },
  education: {
    petala: {
      name: 'education',
      displayName: 'Education & LMS',
      version: '1.0.0',
      status: 'production',
      icon: '🎓',
      category: 'ed-tech',
    },
    integrations: {
      vimeo: { enabled: true },
      zoom: { enabled: true },
      stripe: { enabled: true },
      scorm: { enabled: true },
    },
  },
  fitness: {
    petala: {
      name: 'fitness',
      displayName: 'Fitness & Wellness',
      version: '1.0.0',
      status: 'production',
      icon: '💪',
      category: 'fitness-tech',
    },
    integrations: {
      fitbit: { enabled: true },
      appleHealth: { enabled: true },
      googleFit: { enabled: true },
      stripe: { enabled: true },
    },
  },
  legal: {
    petala: {
      name: 'legal',
      displayName: 'Legal Practice Management',
      version: '1.0.0',
      status: 'production',
      icon: '⚖️',
      category: 'legal-tech',
    },
    integrations: {
      docusign: { enabled: true },
      stripe: { enabled: true },
      aws: { enabled: true },
    },
  },
  automotive: {
    petala: {
      name: 'automotive',
      displayName: 'Automotive Dealership',
      version: '1.0.0',
      status: 'production',
      icon: '🚗',
      category: 'auto-tech',
    },
    integrations: {
      stripe: { enabled: true },
      cloudinary: { enabled: true },
    },
  },
  finance: {
    petala: {
      name: 'finance',
      displayName: 'FinTech & Accounting',
      version: '1.0.0',
      status: 'production',
      icon: '💰',
      category: 'fin-tech',
    },
    compliance: {
      pciDss: { enabled: true, level: 'SAQ-A' },
      soc2: { enabled: true, type: 'II' },
      kycAml: { enabled: true },
    },
    integrations: {
      plaid: { enabled: true },
      stripe: { enabled: true },
    },
  },
  travel: {
    petala: {
      name: 'travel',
      displayName: 'Travel & Booking',
      version: '1.0.0',
      status: 'production',
      icon: '✈️',
      category: 'travel-tech',
    },
    integrations: {
      amadeus: { enabled: true },
      booking: { enabled: true },
      stripe: { enabled: true },
    },
  },
  events: {
    petala: {
      name: 'events',
      displayName: 'Events & Ticketing',
      version: '1.0.0',
      status: 'production',
      icon: '🎫',
      category: 'event-tech',
    },
    integrations: {
      stripe: { enabled: true },
      vimeo: { enabled: true },
      mailchimp: { enabled: true },
    },
  },
  logistics: {
    petala: {
      name: 'logistics',
      displayName: 'Logistics & Fleet',
      version: '1.0.0',
      status: 'production',
      icon: '🚚',
      category: 'logistics-tech',
    },
    integrations: {
      googleMaps: { enabled: true },
      stripe: { enabled: true },
      gps: { enabled: true },
    },
  },
  retail: {
    petala: {
      name: 'retail',
      displayName: 'Retail & Omnichannel',
      version: '1.0.0',
      status: 'production',
      icon: '🏪',
      category: 'retail-tech',
    },
    integrations: {
      stripe: { enabled: true },
      square: { enabled: true },
      shopify: { enabled: true },
    },
  },
};

function generateBaseConfig(): ConfigTemplate {
  return {
    petala: {
      name: '',
      displayName: '',
      version: '1.0.0',
      status: 'production',
      icon: '',
      category: '',
    },
    environment: {
      NODE_ENV: 'production',
      API_URL: 'https://api.softwarelotus.com.br',
      APP_URL: '',
      CDN_URL: 'https://cdn.softwarelotus.com.br',
    },
    database: {
      type: 'postgresql',
      host: 'localhost',
      port: 5432,
      name: '',
      user: '',
      ssl: true,
      poolSize: 20,
      extensions: ['uuid-ossp', 'pgcrypto', 'vector'],
    },
    cache: {
      type: 'redis',
      host: 'localhost',
      port: 6379,
      db: 0,
      ttl: 3600,
      keyPrefix: '',
    },
    sofia: {
      enabled: true,
      intentionEngine: {
        enabled: true,
        model: 'gpt-4',
        temperature: 0.7,
        maxTokens: 2000,
      },
      scraping: {
        enabled: true,
        anonymous: true,
        proxyRotation: true,
        userAgentRotation: true,
        respectRobotsTxt: true,
        rateLimit: 1000,
        sources: [],
      },
      recommendations: {
        enabled: true,
        algorithm: 'hybrid',
        collaborativeFiltering: true,
        contentBased: true,
        minConfidence: 0.7,
      },
      chatbot: {
        enabled: true,
        model: 'gpt-4',
        languages: ['en', 'pt-BR', 'es'],
        fallbackToHuman: true,
      },
    },
    features: {
      auth: {
        jwt: true,
        oauth: ['google', 'facebook'],
        twoFactor: false,
        sso: false,
      },
      payment: {
        stripe: {
          enabled: true,
          webhookSecret: '${STRIPE_WEBHOOK_SECRET}',
          currency: 'USD',
        },
      },
      storage: {
        provider: 'cloudinary',
        bucket: '',
        cdn: true,
        imageOptimization: true,
        maxFileSize: 10485760,
      },
      email: {
        provider: 'sendgrid',
        from: 'noreply@softwarelotus.com.br',
        templates: true,
      },
      analytics: {
        google: {
          enabled: true,
          trackingId: '${GA_TRACKING_ID}',
        },
      },
    },
    security: {
      rateLimit: {
        enabled: true,
        windowMs: 900000,
        max: 100,
      },
      cors: {
        enabled: true,
        origin: [],
        credentials: true,
      },
      helmet: {
        enabled: true,
        contentSecurityPolicy: true,
        hsts: true,
        frameguard: true,
      },
      encryption: {
        algorithm: 'aes-256-gcm',
        keyRotation: true,
        keyRotationDays: 90,
      },
      rbac: {
        enabled: true,
        roles: ['owner', 'admin', 'editor', 'viewer', 'api'],
        defaultRole: 'viewer',
      },
      rls: {
        enabled: true,
        tenantColumn: 'tenant_id',
      },
    },
    monitoring: {
      prometheus: {
        enabled: true,
        port: 9090,
        path: '/metrics',
        prefix: '',
      },
      grafana: {
        enabled: true,
        port: 3000,
        dashboards: [],
      },
      jaeger: {
        enabled: true,
        agentHost: 'localhost',
        agentPort: 6831,
        samplingRate: 0.1,
      },
      logging: {
        level: 'info',
        format: 'json',
        destination: 'stdout',
        retention: 30,
      },
      alerts: {
        enabled: true,
        channels: ['slack'],
        thresholds: {
          errorRate: 0.05,
          latencyP95: 500,
          latencyP99: 1000,
          uptime: 0.9995,
        },
      },
    },
    performance: {
      caching: {
        enabled: true,
        strategies: ['memory', 'redis', 'cdn'],
        ttl: {
          default: 3600,
        },
      },
      compression: {
        enabled: true,
        level: 6,
        threshold: 1024,
      },
      cdn: {
        enabled: true,
        provider: 'cloudflare',
        purgeOnUpdate: true,
      },
    },
    integrations: {},
    deployment: {
      platform: 'kubernetes',
      replicas: 3,
      autoScaling: {
        enabled: true,
        minReplicas: 3,
        maxReplicas: 15,
        targetCPUUtilization: 70,
        targetMemoryUtilization: 80,
      },
      resources: {
        requests: {
          cpu: '500m',
          memory: '512Mi',
        },
        limits: {
          cpu: '2000m',
          memory: '2Gi',
        },
      },
      healthCheck: {
        enabled: true,
        path: '/health',
        interval: 30,
        timeout: 5,
        failureThreshold: 3,
      },
    },
    compliance: {
      gdpr: {
        enabled: true,
        dataRetention: 2555,
        rightToErasure: true,
        dataPortability: true,
      },
      lgpd: {
        enabled: true,
      },
    },
    backup: {
      enabled: true,
      schedule: '0 2 * * *',
      retention: 30,
      destination: '',
      encryption: true,
    },
    meta: {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      installedBy: 'config-generator',
      installerVersion: '1.0.0',
    },
  };
}

function generateConfig(petalaName: string): ConfigTemplate {
  const base = generateBaseConfig();
  const specific = PETALA_CONFIGS[petalaName] || {};

  // Merge configurations
  const config: ConfigTemplate = {
    ...base,
    ...specific,
    petala: {
      ...base.petala,
      ...specific.petala,
    },
  };

  // Set pétala-specific values
  config.environment.APP_URL = `https://${petalaName}.softwarelotus.com.br`;
  config.database.name = `magicsaas_${petalaName.replace(/-/g, '_')}`;
  config.database.user = `magicsaas_${petalaName.replace(/-/g, '_')}`;
  config.cache.keyPrefix = `${petalaName}:`;
  config.monitoring.prometheus.prefix = `petala_${petalaName.replace(/-/g, '_')}_`;
  config.monitoring.grafana.dashboards = [`petala-${petalaName}.json`];
  config.security.cors.origin = [`https://${petalaName}.softwarelotus.com.br`];
  config.features.storage.bucket = `magicsaas-${petalaName}`;
  config.backup.destination = `s3://magicsaas-backups/${petalaName}/`;

  return config;
}

function writeConfig(petalaName: string, config: ConfigTemplate): void {
  const configPath = path.join(process.cwd(), 'petalas', petalaName, 'config.json');

  // Ensure directory exists
  const dir = path.dirname(configPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Write config file
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

  console.log(`✅ Config generated: ${configPath}`);
}

// Main execution
const args = process.argv.slice(2);
const petalaArg = args.find((arg) => arg.startsWith('--petala='))?.split('=')[1];

if (petalaArg) {
  const config = generateConfig(petalaArg);
  writeConfig(petalaArg, config);
} else if (args.includes('--all')) {
  Object.keys(PETALA_CONFIGS).forEach((petalaName) => {
    const config = generateConfig(petalaName);
    writeConfig(petalaName, config);
  });
  console.log('\n✅ All configs generated successfully!');
} else {
  console.log('\n🔧 MagicSaaS Config Generator\n');
  console.log('Usage:');
  console.log('  npm run generate:config -- --petala=<name>');
  console.log('  npm run generate:config -- --all\n');
  console.log('Available pétalas:');
  Object.keys(PETALA_CONFIGS).forEach((name) => {
    console.log(`  - ${name}`);
  });
  console.log('');
}
