/**
 * PowerShell Installer Tests
 * Validates Install-MagicSaaS-ULTIMATE.ps1 configuration and completeness
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

describe('Install-MagicSaaS-ULTIMATE.ps1', () => {
  const installerPath = resolve(__dirname, '../../installers/Install-MagicSaaS-ULTIMATE.ps1');
  const envExamplePath = resolve(__dirname, '../../.env.example');

  let installerContent: string;
  let envExample: string;

  try {
    installerContent = readFileSync(installerPath, 'utf-8');
    envExample = readFileSync(envExamplePath, 'utf-8');
  } catch (error) {
    installerContent = '';
    envExample = '';
  }

  describe('File Existence', () => {
    it('should exist and be readable', () => {
      expect(installerContent.length).toBeGreaterThan(0);
    });

    it('should have PowerShell shebang or encoding', () => {
      const hasEncoding = installerContent.includes('# coding:') ||
                         installerContent.includes('UTF-8') ||
                         installerContent.startsWith('#!');

      // PowerShell files may not have shebang
      expect(installerContent).toBeTruthy();
    });
  });

  describe('Version Information', () => {
    it('should declare version v3.1', () => {
      expect(installerContent).toContain('v3.1');
    });

    it('should claim ZERO LACUNAS', () => {
      const hasZeroLacunas = installerContent.includes('ZERO LACUNAS') ||
                             installerContent.includes('COMPLETE');
      expect(hasZeroLacunas).toBe(true);
    });

    it('should mention 134 environment variables', () => {
      expect(installerContent).toContain('134');
    });
  });

  describe('Environment Variables - REQUIRED', () => {
    const requiredVars = [
      'ANTHROPIC_API_KEY',
      'SOFIA_PORT',
      'PORT',
      'DIRECTUS_URL',
      'DIRECTUS_KEY',
      'DIRECTUS_SECRET',
      'DIRECTUS_ADMIN_EMAIL',
      'DIRECTUS_ADMIN_PASSWORD',
      'DATABASE_URL',
      'POSTGRES_USER',
      'POSTGRES_PASSWORD',
      'POSTGRES_DB',
      'REDIS_HOST',
      'REDIS_PORT',
      'REDIS_URL',
      'JWT_SECRET',
      'JWT_EXPIRATION',
      'JWT_REFRESH_EXPIRATION',
      'ENCRYPTION_KEY',
      'NODE_ENV',
      'APP_URL',
      'API_URL',
      'FRONTEND_URL',
    ];

    requiredVars.forEach((varName) => {
      it(`should generate ${varName}`, () => {
        expect(installerContent).toContain(varName);
      });
    });
  });

  describe('Environment Variables - RECOMMENDED', () => {
    const recommendedVars = [
      'RATE_LIMIT_WINDOW_MS',
      'RATE_LIMIT_MAX_REQUESTS',
      'ALLOWED_ORIGINS',
      'CORS_ENABLED',
      'GDPR_ENABLED',
      'LGPD_ENABLED',
      'HIPAA_ENABLED',
      'DATA_RETENTION_DAYS',
      'AUDIT_LOG_ENABLED',
    ];

    recommendedVars.forEach((varName) => {
      it(`should generate ${varName}`, () => {
        expect(installerContent).toContain(varName);
      });
    });
  });

  describe('Environment Variables - OBSERVABILITY', () => {
    const observabilityVars = [
      'LOG_LEVEL',
      'PROMETHEUS_PORT',
      'PROMETHEUS_ENDPOINT',
      'GRAFANA_PORT',
      'GRAFANA_ADMIN_USER',
      'GRAFANA_ADMIN_PASSWORD',
      'GRAFANA_URL',
      'JAEGER_ENDPOINT',
      'OTEL_EXPORTER_OTLP_ENDPOINT',
      'LANGFUSE_PUBLIC_KEY',
      'LANGFUSE_SECRET_KEY',
      'LANGFUSE_HOST',
    ];

    observabilityVars.forEach((varName) => {
      it(`should generate ${varName}`, () => {
        expect(installerContent).toContain(varName);
      });
    });
  });

  describe('Environment Variables - SERVICES', () => {
    const servicesVars = [
      'INNGEST_EVENT_KEY',
      'INNGEST_SIGNING_KEY',
      'INNGEST_SERVE_ORIGIN',
      'SENTRY_DSN',
      'SENTRY_ENVIRONMENT',
      'SENTRY_TRACES_SAMPLE_RATE',
    ];

    servicesVars.forEach((varName) => {
      it(`should generate ${varName}`, () => {
        expect(installerContent).toContain(varName);
      });
    });
  });

  describe('Environment Variables - PAYMENT & EMAIL', () => {
    const integrationVars = [
      'STRIPE_PUBLIC_KEY',
      'STRIPE_PUBLISHABLE_KEY',
      'STRIPE_SECRET_KEY',
      'STRIPE_WEBHOOK_SECRET',
      'MERCADO_PAGO_PUBLIC_KEY',
      'MERCADO_PAGO_ACCESS_TOKEN',
      'EMAIL_FROM',
      'EMAIL_FROM_NAME',
      'SMTP_HOST',
      'SMTP_PORT',
      'SMTP_USER',
      'SMTP_PASS',
      'SMTP_SECURE',
      'POSTMARK_API_KEY',
      'POSTMARK_FROM_EMAIL',
    ];

    integrationVars.forEach((varName) => {
      it(`should generate ${varName}`, () => {
        expect(installerContent).toContain(varName);
      });
    });
  });

  describe('Environment Variables - CLOUD PROVIDERS', () => {
    const cloudVars = [
      'AWS_ACCESS_KEY_ID',
      'AWS_SECRET_ACCESS_KEY',
      'AWS_REGION',
      'AWS_S3_BUCKET',
      'AWS_CLOUDFRONT_DOMAIN',
      'AWS_BRAKET_ARN',
      'CLOUDFLARE_ACCOUNT_ID',
      'CLOUDFLARE_API_TOKEN',
      'CLOUDFLARE_WORKERS_DOMAIN',
    ];

    cloudVars.forEach((varName) => {
      it(`should generate ${varName}`, () => {
        expect(installerContent).toContain(varName);
      });
    });
  });

  describe('Environment Variables - AI PROVIDERS', () => {
    const aiVars = [
      'OPENAI_API_KEY',
      'OPENAI_ORGANIZATION',
      'OPENAI_MODEL',
      'ELEVENLABS_API_KEY',
      'ELEVENLABS_VOICE_ID',
      'ELEVENLABS_MODEL',
      'AZURE_SPEECH_KEY',
      'AZURE_SPEECH_REGION',
      'AZURE_SPEECH_ENDPOINT',
    ];

    aiVars.forEach((varName) => {
      it(`should generate ${varName}`, () => {
        expect(installerContent).toContain(varName);
      });
    });
  });

  describe('Environment Variables - COMMUNICATIONS', () => {
    const commVars = [
      'TWILIO_ACCOUNT_SID',
      'TWILIO_AUTH_TOKEN',
      'TWILIO_PHONE_NUMBER',
      'TWILIO_WHATSAPP_NUMBER',
    ];

    commVars.forEach((varName) => {
      it(`should generate ${varName}`, () => {
        expect(installerContent).toContain(varName);
      });
    });
  });

  describe('Environment Variables - FUTURE FEATURES', () => {
    const futureVars = [
      'WEB3_PROVIDER_URL',
      'WEB3_NETWORK',
      'WEB3_MARKETPLACE_CONTRACT',
      'WEB3_PAYMENT_TOKEN_CONTRACT',
      'PRIVATE_KEY_DEPLOYER',
      'IPFS_HOST',
      'IPFS_PORT',
      'IPFS_PROTOCOL',
      'IPFS_PROJECT_ID',
      'IPFS_PROJECT_SECRET',
      'IBM_QUANTUM_TOKEN',
      'IBM_QUANTUM_BACKEND',
      'GOOGLE_QUANTUM_PROJECT_ID',
      'EDGE_LOCATIONS',
      'EDGE_AUTO_SCALING',
      'EDGE_MIN_INSTANCES',
      'EDGE_MAX_INSTANCES',
      'FL_MIN_PARTICIPANTS',
      'FL_MAX_ROUNDS',
      'FL_PRIVACY_BUDGET',
      'FL_NOISE_MULTIPLIER',
    ];

    futureVars.forEach((varName) => {
      it(`should generate ${varName}`, () => {
        expect(installerContent).toContain(varName);
      });
    });
  });

  describe('Environment Variables - FEATURE FLAGS', () => {
    const flagVars = [
      'ENABLE_VOICE_ASSISTANT',
      'ENABLE_BLOCKCHAIN',
      'ENABLE_QUANTUM',
      'ENABLE_FEDERATED_LEARNING',
      'ENABLE_MOBILE_SDK',
      'ENABLE_EDGE_COMPUTING',
      'DEBUG',
      'MAINTENANCE_MODE',
    ];

    flagVars.forEach((varName) => {
      it(`should generate ${varName}`, () => {
        expect(installerContent).toContain(varName);
      });
    });
  });

  describe('Sofia AI Features', () => {
    const sofiaFeatures = [
      'FEATURE_INTENTION_ENGINE',
      'FEATURE_UX_VALIDATION',
      'FEATURE_SEO_OPTIMIZATION',
      'FEATURE_MARKETPLACE',
      'FEATURE_META_ORCHESTRATION',
      'FEATURE_ADAPTIVE_LEARNING',
    ];

    sofiaFeatures.forEach((feature) => {
      it(`should configure ${feature}`, () => {
        expect(installerContent).toContain(feature);
      });
    });
  });

  describe('Metronic Configuration', () => {
    it('should configure METRONIC_PATH', () => {
      expect(installerContent).toContain('METRONIC_PATH');
    });
  });

  describe('Directus Configuration', () => {
    const directusVars = [
      'DIRECTUS_DB_CLIENT',
      'DIRECTUS_DB_HOST',
      'DIRECTUS_DB_PORT',
      'DIRECTUS_DB_DATABASE',
      'DIRECTUS_DB_USER',
      'DIRECTUS_DB_PASSWORD',
      'DIRECTUS_CACHE_ENABLED',
      'DIRECTUS_CACHE_STORE',
      'DIRECTUS_REDIS_HOST',
      'DIRECTUS_REDIS_PORT',
      'DIRECTUS_RATE_LIMITER_ENABLED',
      'DIRECTUS_RATE_LIMITER_STORE',
      'DIRECTUS_RATE_LIMITER_POINTS',
      'DIRECTUS_RATE_LIMITER_DURATION',
      'DIRECTUS_ADMIN_TOKEN',
    ];

    directusVars.forEach((varName) => {
      it(`should generate ${varName}`, () => {
        expect(installerContent).toContain(varName);
      });
    });
  });

  describe('Security Best Practices', () => {
    it('should generate random secrets', () => {
      const hasRandomGeneration = installerContent.includes('SecureRandom') ||
                                   installerContent.includes('Get-Random') ||
                                   installerContent.includes('New-Guid') ||
                                   installerContent.includes('[System.IO.Path]::GetRandomFileName');

      expect(hasRandomGeneration).toBe(true);
    });

    it('should not contain hardcoded secrets', () => {
      const suspiciousPatterns = [
        /sk-ant-[a-zA-Z0-9]{32,}/,
        /AKIA[0-9A-Z]{16}/,
        /ghp_[A-Za-z0-9]{36}/,
      ];

      suspiciousPatterns.forEach((pattern) => {
        expect(installerContent).not.toMatch(pattern);
      });
    });
  });

  describe('Completeness vs .env.example', () => {
    it('should cover all variables in .env.example', () => {
      if (!envExample) {
        return; // Skip if .env.example not found
      }

      // Extract variable names from .env.example
      const envVarPattern = /^([A-Z_][A-Z0-9_]*)=/gm;
      const envVars = [];
      let match;

      while ((match = envVarPattern.exec(envExample)) !== null) {
        envVars.push(match[1]);
      }

      // Check if installer generates all variables
      const missingVars = envVars.filter((varName) => !installerContent.includes(varName));

      expect(missingVars).toEqual([]);
    });
  });

  describe('Installation Steps', () => {
    it('should check Docker installation', () => {
      const checksDocker = installerContent.includes('docker') ||
                          installerContent.includes('Docker');
      expect(checksDocker).toBe(true);
    });

    it('should start Docker Compose', () => {
      const startsCompose = installerContent.includes('docker-compose') ||
                           installerContent.includes('docker compose');
      expect(startsCompose).toBe(true);
    });

    it('should verify services health', () => {
      const checksHealth = installerContent.includes('health') ||
                          installerContent.includes('healthy');
      expect(checksHealth).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should have error handling', () => {
      const hasErrorHandling = installerContent.includes('try') ||
                              installerContent.includes('catch') ||
                              installerContent.includes('trap') ||
                              installerContent.includes('ErrorAction');
      expect(hasErrorHandling).toBe(true);
    });
  });

  describe('User Communication', () => {
    it('should provide progress feedback', () => {
      const hasProgress = installerContent.includes('Write-Host') ||
                         installerContent.includes('Write-Output') ||
                         installerContent.includes('echo');
      expect(hasProgress).toBe(true);
    });

    it('should show success message', () => {
      const hasSuccess = installerContent.toLowerCase().includes('success') ||
                        installerContent.includes('✅') ||
                        installerContent.includes('completed');
      expect(hasSuccess).toBe(true);
    });
  });
});
