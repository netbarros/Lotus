/**
 * OpenAPI/Swagger Configuration
 * Complete API documentation for MagicSaaS System-∞
 */

// @ts-expect-error - swagger-jsdoc types not available
import swaggerJsdoc from 'swagger-jsdoc';
// @ts-expect-error - openapi-types not available
import type { OpenAPIV3 } from 'openapi-types';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'MagicSaaS System-∞ API',
      version: '∞.2026.1.0',
      description: `
# MagicSaaS System-∞ REST API

The world's first Cognitive Mesh Operating System API powered by Sofia AI v3.0.

## Features

- 🧠 **Sofia AI Integration**: Generate SaaS by intention
- 🎨 **UX Validation**: Automatic UX/UI validation and optimization
- 🚀 **SEO Optimization**: State-of-the-art SEO automation
- 🏪 **Marketplace**: Complete e-commerce with Pétalas system
- 🔐 **Multi-tenancy**: Row-level security and tenant isolation
- 📊 **Observability**: Prometheus, Grafana, Jaeger integration
- ✅ **Compliance**: GDPR, LGPD, HIPAA ready

## Authentication

All endpoints require JWT Bearer token authentication:

\`\`\`
Authorization: Bearer <your_jwt_token>
\`\`\`

## Rate Limiting

- 100 requests per minute per IP
- 1000 requests per hour per user

## Base URL

- **Development**: http://localhost:3001/api
- **Staging**: https://staging.softwarelotus.com.br/api
- **Production**: https://api.softwarelotus.com.br
      `,
      contact: {
        name: 'Software Lotus',
        email: 'contato@softwarelotus.com.br',
        url: 'https://softwarelotus.com.br',
      },
      license: {
        name: 'Proprietary',
        url: 'https://softwarelotus.com.br/license',
      },
    },
    servers: [
      {
        url: 'http://localhost:3001/api',
        description: 'Development server',
      },
      {
        url: 'https://staging.softwarelotus.com.br/api',
        description: 'Staging server',
      },
      {
        url: 'https://api.softwarelotus.com.br',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token',
        },
        apiKey: {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-Key',
          description: 'API Key for service-to-service authentication',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error message',
            },
            code: {
              type: 'string',
              description: 'Error code',
            },
            details: {
              type: 'object',
              description: 'Additional error details',
            },
          },
          required: ['error'],
        },
        Tenant: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            slug: { type: 'string' },
            domain: { type: 'string', nullable: true },
            plan_id: { type: 'string', format: 'uuid' },
            status: {
              type: 'string',
              enum: ['ACTIVE', 'TRIAL', 'SUSPENDED', 'CHURNED'],
            },
            branding: { type: 'object' },
            features: { type: 'array', items: { type: 'string' } },
            limits: { type: 'object' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            tenant_id: { type: 'string', format: 'uuid' },
            email: { type: 'string', format: 'email' },
            full_name: { type: 'string' },
            avatar_url: { type: 'string', format: 'uri', nullable: true },
            role_id: { type: 'string', format: 'uuid' },
            permissions: { type: 'array', items: { type: 'string' } },
            twofa_enabled: { type: 'boolean' },
            last_login_at: { type: 'string', format: 'date-time', nullable: true },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        IntentionRequest: {
          type: 'object',
          required: ['type', 'description'],
          properties: {
            type: {
              type: 'string',
              enum: [
                'generate-saas',
                'generate-microsaas',
                'generate-api',
                'generate-module',
                'generate-component',
                'generate-workflow',
                'generate-integration',
                'optimize-ux',
                'optimize-performance',
                'validate-solution',
              ],
            },
            description: { type: 'string', minLength: 10 },
            requirements: {
              type: 'object',
              properties: {
                features: { type: 'array', items: { type: 'string' } },
                technologies: { type: 'array', items: { type: 'string' } },
                constraints: { type: 'array', items: { type: 'string' } },
                targets: {
                  type: 'object',
                  properties: {
                    vertical: { type: 'string' },
                    audience: { type: 'string' },
                    scale: {
                      type: 'string',
                      enum: ['startup', 'enterprise', 'global'],
                    },
                  },
                },
              },
            },
          },
        },
        IntentionResponse: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            status: {
              type: 'string',
              enum: ['processing', 'completed', 'failed'],
            },
            solution: {
              type: 'object',
              properties: {
                files: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      path: { type: 'string' },
                      content: { type: 'string' },
                    },
                  },
                },
                documentation: { type: 'string' },
              },
            },
            metadata: {
              type: 'object',
              properties: {
                estimatedQuality: { type: 'number', minimum: 0, maximum: 100 },
                processingTimeMs: { type: 'number' },
              },
            },
          },
        },
        Plugin: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            slug: { type: 'string' },
            description: { type: 'string' },
            category: { type: 'string' },
            price_usd: { type: 'number' },
            rating_avg: { type: 'number', minimum: 0, maximum: 5 },
            installs_count: { type: 'number' },
            verified: { type: 'boolean' },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication and authorization',
      },
      {
        name: 'Sofia AI',
        description: 'Sofia AI intention processing endpoints',
      },
      {
        name: 'Tenants',
        description: 'Multi-tenancy management',
      },
      {
        name: 'Users',
        description: 'User management',
      },
      {
        name: 'Marketplace',
        description: 'Plugin marketplace operations',
      },
      {
        name: 'Workflows',
        description: 'Workflow automation (Inngest)',
      },
      {
        name: 'Observability',
        description: 'Metrics, logs, and health checks',
      },
    ],
    paths: {
      '/health': {
        get: {
          summary: 'Health check',
          description: 'Check API health status',
          tags: ['Observability'],
          security: [],
          responses: {
            '200': {
              description: 'API is healthy',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status: { type: 'string', example: 'ok' },
                      timestamp: { type: 'string', format: 'date-time' },
                      uptime: { type: 'number' },
                      version: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/v1/auth/login': {
        post: {
          summary: 'User login',
          description: 'Authenticate user and return JWT token',
          tags: ['Authentication'],
          security: [],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string', format: 'password', minLength: 8 },
                  },
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'Login successful',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      token: { type: 'string' },
                      refresh_token: { type: 'string' },
                      expires_in: { type: 'number' },
                      user: { $ref: '#/components/schemas/User' },
                    },
                  },
                },
              },
            },
            '401': {
              description: 'Invalid credentials',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' },
                },
              },
            },
          },
        },
      },
      '/v1/sofia/intentions': {
        post: {
          summary: 'Process intention',
          description: 'Submit an intention to Sofia AI for processing',
          tags: ['Sofia AI'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/IntentionRequest' },
              },
            },
          },
          responses: {
            '202': {
              description: 'Intention accepted for processing',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/IntentionResponse' },
                },
              },
            },
            '400': {
              description: 'Invalid request',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' },
                },
              },
            },
          },
        },
      },
      '/v1/tenants': {
        get: {
          summary: 'List tenants',
          description: 'Get all tenants (admin only)',
          tags: ['Tenants'],
          parameters: [
            {
              in: 'query',
              name: 'page',
              schema: { type: 'integer', minimum: 1, default: 1 },
            },
            {
              in: 'query',
              name: 'limit',
              schema: { type: 'integer', minimum: 1, maximum: 100, default: 50 },
            },
          ],
          responses: {
            '200': {
              description: 'List of tenants',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      data: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/Tenant' },
                      },
                      total: { type: 'number' },
                      page: { type: 'number' },
                      limit: { type: 'number' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/v1/marketplace/plugins': {
        get: {
          summary: 'List marketplace plugins',
          description: 'Browse available plugins in the marketplace',
          tags: ['Marketplace'],
          parameters: [
            {
              in: 'query',
              name: 'category',
              schema: { type: 'string' },
            },
            {
              in: 'query',
              name: 'verified',
              schema: { type: 'boolean' },
            },
            {
              in: 'query',
              name: 'sort',
              schema: {
                type: 'string',
                enum: ['rating', 'installs', 'price', 'recent'],
                default: 'rating',
              },
            },
          ],
          responses: {
            '200': {
              description: 'List of plugins',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Plugin' },
                  },
                },
              },
            },
          },
        },
      },
    },
  } as OpenAPIV3.Document,
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
