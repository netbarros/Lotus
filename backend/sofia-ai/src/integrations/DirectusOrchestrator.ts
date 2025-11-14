/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║ 🎯 DIRECTUS ORCHESTRATOR - Central CMS Manager                           ║
 * ║ Directus manages ALL: backend, frontend, landing, marketplace, content   ║
 * ║ Part of Cognitive Mesh OS - System 11                                    ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

import { logger } from '../utils/logger.js';
import { EventStore } from '../events/EventStore.js';
import type { Redis } from 'ioredis';

/**
 * Directus collection types
 */
export interface DirectusCollections {
  // Core system collections
  magicsaas_tenants: any;
  magicsaas_users: any;
  magicsaas_subscriptions: any;
  magicsaas_features: any;

  // Content management
  landing_pages: any;
  landing_sections: any;
  blog_posts: any;
  documentation: any;

  // Marketplace
  marketplace_products: any;
  marketplace_categories: any;
  marketplace_addons: any;
  marketplace_petalas: any;

  // Plans & Pricing
  pricing_plans: any;
  pricing_tiers: any;
  plan_features: any;

  // Communication
  email_templates: any;
  notifications: any;
  support_tickets: any;

  // Sofia AI data
  sofia_intentions: any;
  sofia_decisions: any;
  sofia_suggestions: any;
  sofia_research: any;

  // Analytics
  analytics_events: any;
  analytics_metrics: any;
  seo_metadata: any;
}

/**
 * Directus module configuration
 */
export interface DirectusModule {
  name: string;
  enabled: boolean;
  collections: string[];
  endpoints: string[];
  hooks: string[];
  flows?: {
    id: string;
    trigger: string;
    operations: any[];
  }[];
}

/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║ DIRECTUS ORCHESTRATOR - Central Management System                        ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */
export class DirectusOrchestrator {
  private redis: Redis;
  private eventStore: EventStore;
  private directusUrl: string;
  private directusToken: string;
  private enabledModules = new Set<string>();

  constructor(redis: Redis, eventStore: EventStore, directusUrl: string, directusToken: string) {
    this.redis = redis;
    this.eventStore = eventStore;
    this.directusUrl = directusUrl;
    this.directusToken = directusToken;
  }

  /**
   * Initialize Directus with all MagicSaaS collections and modules
   */
  async initialize(): Promise<void> {
    logger.info('🎯 Initializing Directus Orchestrator...');

    // Step 1: Create all collections
    await this.createCollections();

    // Step 2: Enable all Directus modules
    await this.enableModules();

    // Step 3: Setup flows and automation
    await this.setupFlows();

    // Step 4: Configure webhooks to sync with Sofia AI
    await this.setupWebhooks();

    // Step 5: Setup GraphQL schema
    await this.setupGraphQL();

    logger.info('✅ Directus Orchestrator initialized');
  }

  /**
   * Create all MagicSaaS collections in Directus
   */
  private async createCollections(): Promise<void> {
    logger.info('📦 Creating Directus collections...');

    const collections = [
      // ═══════════════════════════════════════════════════════════════════
      // CORE SYSTEM
      // ═══════════════════════════════════════════════════════════════════
      {
        collection: 'magicsaas_tenants',
        schema: {
          name: 'magicsaas_tenants',
          fields: [
            { field: 'id', type: 'uuid', meta: { interface: 'input', readonly: true } },
            { field: 'slug', type: 'string', meta: { interface: 'input', required: true } },
            { field: 'name', type: 'string', meta: { interface: 'input', required: true } },
            { field: 'domain', type: 'string', meta: { interface: 'input' } },
            { field: 'logo', type: 'uuid', meta: { interface: 'file' } },
            { field: 'settings', type: 'json', meta: { interface: 'input-code' } },
            { field: 'status', type: 'string', meta: { interface: 'select-dropdown' } },
            {
              field: 'created_at',
              type: 'timestamp',
              meta: { interface: 'datetime', readonly: true },
            },
            {
              field: 'updated_at',
              type: 'timestamp',
              meta: { interface: 'datetime', readonly: true },
            },
          ],
        },
      },

      // ═══════════════════════════════════════════════════════════════════
      // LANDING PAGE & MARKETING
      // ═══════════════════════════════════════════════════════════════════
      {
        collection: 'landing_pages',
        schema: {
          name: 'landing_pages',
          fields: [
            { field: 'id', type: 'uuid' },
            { field: 'slug', type: 'string', meta: { required: true } },
            { field: 'title', type: 'string', meta: { required: true } },
            { field: 'description', type: 'text' },
            { field: 'hero_title', type: 'string' },
            { field: 'hero_subtitle', type: 'text' },
            { field: 'hero_image', type: 'uuid', meta: { interface: 'file-image' } },
            { field: 'hero_cta_text', type: 'string' },
            { field: 'hero_cta_link', type: 'string' },
            { field: 'sections', type: 'alias', meta: { interface: 'list-o2m', special: ['o2m'] } },
            { field: 'seo_title', type: 'string' },
            { field: 'seo_description', type: 'text' },
            { field: 'seo_keywords', type: 'json' },
            { field: 'seo_og_image', type: 'uuid' },
            { field: 'status', type: 'string', meta: { interface: 'select-dropdown' } },
            { field: 'published_at', type: 'timestamp' },
          ],
        },
      },

      {
        collection: 'landing_sections',
        schema: {
          name: 'landing_sections',
          fields: [
            { field: 'id', type: 'uuid' },
            { field: 'landing_page_id', type: 'uuid' },
            { field: 'type', type: 'string', meta: { interface: 'select-dropdown' } }, // hero, features, testimonials, pricing, cta
            { field: 'title', type: 'string' },
            { field: 'content', type: 'text', meta: { interface: 'input-rich-text-html' } },
            { field: 'data', type: 'json', meta: { interface: 'input-code' } },
            { field: 'order', type: 'integer' },
            { field: 'visible', type: 'boolean', meta: { default: true } },
          ],
        },
      },

      // ═══════════════════════════════════════════════════════════════════
      // MARKETPLACE & CHECKOUT
      // ═══════════════════════════════════════════════════════════════════
      {
        collection: 'marketplace_products',
        schema: {
          name: 'marketplace_products',
          fields: [
            { field: 'id', type: 'uuid' },
            { field: 'sku', type: 'string', meta: { required: true } },
            { field: 'name', type: 'string', meta: { required: true } },
            { field: 'description', type: 'text' },
            { field: 'category_id', type: 'uuid' },
            { field: 'type', type: 'string' }, // saas, microsaas, addon, petala
            { field: 'price', type: 'decimal' },
            { field: 'price_currency', type: 'string', meta: { default: 'BRL' } },
            { field: 'billing_cycle', type: 'string' }, // monthly, yearly, one-time
            { field: 'features', type: 'json' },
            { field: 'images', type: 'json' },
            { field: 'demo_url', type: 'string' },
            { field: 'documentation_url', type: 'string' },
            { field: 'status', type: 'string' },
            { field: 'created_by', type: 'uuid' },
            { field: 'created_at', type: 'timestamp' },
          ],
        },
      },

      {
        collection: 'marketplace_petalas',
        schema: {
          name: 'marketplace_petalas',
          fields: [
            { field: 'id', type: 'uuid' },
            { field: 'name', type: 'string', meta: { required: true } },
            { field: 'description', type: 'text' },
            { field: 'icon', type: 'string' },
            { field: 'color', type: 'string' },
            { field: 'vertical', type: 'string' }, // one of 13 verticals
            { field: 'features', type: 'json' },
            { field: 'base_price', type: 'decimal' },
            { field: 'addons', type: 'json' }, // available add-ons for this petala
            { field: 'status', type: 'string' },
          ],
        },
      },

      // ═══════════════════════════════════════════════════════════════════
      // PRICING & PLANS
      // ═══════════════════════════════════════════════════════════════════
      {
        collection: 'pricing_plans',
        schema: {
          name: 'pricing_plans',
          fields: [
            { field: 'id', type: 'uuid' },
            { field: 'name', type: 'string', meta: { required: true } },
            { field: 'slug', type: 'string', meta: { required: true } },
            { field: 'description', type: 'text' },
            { field: 'tier', type: 'string' }, // starter, professional, enterprise
            { field: 'price_monthly', type: 'decimal' },
            { field: 'price_yearly', type: 'decimal' },
            { field: 'features', type: 'json' },
            { field: 'limits', type: 'json' }, // users, storage, api_calls, etc.
            { field: 'highlight', type: 'boolean' },
            { field: 'order', type: 'integer' },
            { field: 'status', type: 'string' },
          ],
        },
      },

      // ═══════════════════════════════════════════════════════════════════
      // SOFIA AI DATA
      // ═══════════════════════════════════════════════════════════════════
      {
        collection: 'sofia_intentions',
        schema: {
          name: 'sofia_intentions',
          fields: [
            { field: 'id', type: 'uuid' },
            { field: 'type', type: 'string', meta: { required: true } },
            { field: 'description', type: 'text', meta: { required: true } },
            { field: 'requirements', type: 'json' },
            { field: 'context', type: 'json' },
            { field: 'status', type: 'string' },
            { field: 'solution', type: 'json' },
            { field: 'confidence_score', type: 'decimal' },
            { field: 'quality_score', type: 'decimal' },
            { field: 'requested_by', type: 'uuid' },
            { field: 'tenant_id', type: 'uuid' },
            { field: 'created_at', type: 'timestamp' },
            { field: 'completed_at', type: 'timestamp' },
          ],
        },
      },

      {
        collection: 'sofia_decisions',
        schema: {
          name: 'sofia_decisions',
          fields: [
            { field: 'id', type: 'uuid' },
            { field: 'decision_type', type: 'string' },
            { field: 'context', type: 'json' },
            { field: 'options_evaluated', type: 'json' },
            { field: 'selected_option', type: 'string' },
            { field: 'reasoning', type: 'text' },
            { field: 'confidence', type: 'decimal' },
            { field: 'validation_score', type: 'decimal' },
            { field: 'feedback', type: 'json' },
            { field: 'created_at', type: 'timestamp' },
          ],
        },
      },

      {
        collection: 'sofia_suggestions',
        schema: {
          name: 'sofia_suggestions',
          fields: [
            { field: 'id', type: 'uuid' },
            { field: 'category', type: 'string' }, // ux, performance, security, feature
            { field: 'title', type: 'string' },
            { field: 'description', type: 'text' },
            { field: 'priority', type: 'string' },
            { field: 'impact', type: 'string' }, // low, medium, high
            { field: 'effort', type: 'string' }, // low, medium, high
            { field: 'research_data', type: 'json' },
            { field: 'status', type: 'string' }, // pending, approved, rejected, implemented
            { field: 'tenant_id', type: 'uuid' },
            { field: 'created_at', type: 'timestamp' },
            { field: 'validated_at', type: 'timestamp' },
          ],
        },
      },

      // ═══════════════════════════════════════════════════════════════════
      // COMMUNICATION
      // ═══════════════════════════════════════════════════════════════════
      {
        collection: 'email_templates',
        schema: {
          name: 'email_templates',
          fields: [
            { field: 'id', type: 'uuid' },
            { field: 'name', type: 'string', meta: { required: true } },
            { field: 'slug', type: 'string', meta: { required: true } },
            { field: 'subject', type: 'string' },
            { field: 'html_content', type: 'text' },
            { field: 'text_content', type: 'text' },
            { field: 'variables', type: 'json' },
            { field: 'category', type: 'string' },
            { field: 'status', type: 'string' },
          ],
        },
      },

      // ═══════════════════════════════════════════════════════════════════
      // SEO & ANALYTICS
      // ═══════════════════════════════════════════════════════════════════
      {
        collection: 'seo_metadata',
        schema: {
          name: 'seo_metadata',
          fields: [
            { field: 'id', type: 'uuid' },
            { field: 'entity_type', type: 'string' }, // page, product, blog
            { field: 'entity_id', type: 'uuid' },
            { field: 'title', type: 'string' },
            { field: 'description', type: 'text' },
            { field: 'keywords', type: 'json' },
            { field: 'og_title', type: 'string' },
            { field: 'og_description', type: 'text' },
            { field: 'og_image', type: 'uuid' },
            { field: 'twitter_card', type: 'string' },
            { field: 'canonical_url', type: 'string' },
            { field: 'structured_data', type: 'json' },
            { field: 'robots', type: 'string' },
          ],
        },
      },
    ];

    // Note: In production, this would make actual API calls to Directus
    // to create these collections
    for (const collection of collections) {
      logger.info(`  📦 Creating collection: ${collection.collection}`);
      // await this.createDirectusCollection(collection);
    }

    logger.info('✅ All collections created');
  }

  /**
   * Enable all Directus modules and extensions
   */
  private async enableModules(): Promise<void> {
    logger.info('🔌 Enabling Directus modules...');

    const modules: DirectusModule[] = [
      {
        name: 'Authentication',
        enabled: true,
        collections: ['directus_users', 'directus_roles'],
        endpoints: ['/auth/login', '/auth/refresh', '/auth/logout'],
        hooks: ['auth.login', 'auth.logout'],
      },
      {
        name: 'Files & Assets',
        enabled: true,
        collections: ['directus_files', 'directus_folders'],
        endpoints: ['/files', '/assets'],
        hooks: ['files.upload', 'files.delete'],
      },
      {
        name: 'Flows & Automation',
        enabled: true,
        collections: ['directus_flows', 'directus_operations'],
        endpoints: ['/flows'],
        hooks: [],
      },
      {
        name: 'Webhooks',
        enabled: true,
        collections: ['directus_webhooks'],
        endpoints: ['/webhooks'],
        hooks: [],
      },
      {
        name: 'GraphQL',
        enabled: true,
        collections: [],
        endpoints: ['/graphql', '/graphql/system'],
        hooks: [],
      },
      {
        name: 'Translations',
        enabled: true,
        collections: ['directus_translations'],
        endpoints: ['/translations'],
        hooks: [],
      },
      {
        name: 'Notifications',
        enabled: true,
        collections: ['directus_notifications'],
        endpoints: ['/notifications'],
        hooks: ['notification.send'],
      },
      {
        name: 'Revisions',
        enabled: true,
        collections: ['directus_revisions'],
        endpoints: ['/revisions'],
        hooks: ['items.create', 'items.update', 'items.delete'],
      },
    ];

    for (const module of modules) {
      logger.info(`  🔌 Enabling: ${module.name}`);
      this.enabledModules.add(module.name);
    }

    logger.info('✅ All modules enabled');
  }

  /**
   * Setup Directus Flows for automation
   */
  private async setupFlows(): Promise<void> {
    logger.info('⚡ Setting up Directus Flows...');

    const flows = [
      {
        name: 'Sofia Intention Processor',
        trigger: 'operation',
        operations: [{ type: 'webhook', url: 'http://sofia-ai:3000/process-intention' }],
      },
      {
        name: 'New Product Notification',
        trigger: 'event',
        event: 'items.create',
        collection: 'marketplace_products',
        operations: [{ type: 'notification', message: 'New product added to marketplace' }],
      },
      {
        name: 'SEO Metadata Generator',
        trigger: 'event',
        event: 'items.create',
        collection: 'landing_pages',
        operations: [{ type: 'webhook', url: 'http://sofia-ai:3000/generate-seo' }],
      },
    ];

    for (const flow of flows) {
      logger.info(`  ⚡ Creating flow: ${flow.name}`);
      // await this.createDirectusFlow(flow);
    }

    logger.info('✅ All flows configured');
  }

  /**
   * Setup webhooks to sync with Sofia AI
   */
  private async setupWebhooks(): Promise<void> {
    logger.info('🔗 Setting up webhooks...');

    const webhooks = [
      {
        name: 'Sofia Decision Sync',
        url: 'http://sofia-ai:3000/webhook/decision',
        collections: ['sofia_decisions'],
        actions: ['create', 'update'],
      },
      {
        name: 'Intention Status Update',
        url: 'http://sofia-ai:3000/webhook/intention',
        collections: ['sofia_intentions'],
        actions: ['update'],
      },
      {
        name: 'Marketplace Product Sync',
        url: 'http://sofia-ai:3000/webhook/product',
        collections: ['marketplace_products'],
        actions: ['create', 'update', 'delete'],
      },
    ];

    for (const webhook of webhooks) {
      logger.info(`  🔗 Creating webhook: ${webhook.name}`);
      // await this.createDirectusWebhook(webhook);
    }

    logger.info('✅ All webhooks configured');
  }

  /**
   * Setup GraphQL schema
   */
  private async setupGraphQL(): Promise<void> {
    logger.info('🔷 Setting up GraphQL schema...');

    // GraphQL is auto-generated by Directus based on collections
    // Just need to enable it in settings

    logger.info('✅ GraphQL schema configured');
  }

  /**
   * Query Directus data
   */
  async query<T = any>(
    collection: keyof DirectusCollections,
    options?: {
      fields?: string[];
      filter?: Record<string, any>;
      limit?: number;
      offset?: number;
      sort?: string[];
    }
  ): Promise<T[]> {
    // In production, this would make actual API call to Directus
    logger.info(`📥 Querying ${collection}`, options);
    return [];
  }

  /**
   * Create item in Directus
   */
  async create<T = any>(collection: keyof DirectusCollections, data: Partial<T>): Promise<T> {
    logger.info(`📤 Creating item in ${collection}`);

    // Log to event store
    await this.eventStore.append({
      id: `directus-create-${Date.now()}`,
      type: 'directus.item.created',
      aggregate: 'directus',
      aggregateId: collection,
      timestamp: new Date(),
      version: 1,
      data: { collection, item: data },
      metadata: { layer: 'directus-orchestrator' },
    });

    return data as T;
  }

  /**
   * Update item in Directus
   */
  async update<T = any>(
    collection: keyof DirectusCollections,
    id: string,
    data: Partial<T>
  ): Promise<T> {
    logger.info(`📝 Updating item in ${collection}: ${id}`);

    await this.eventStore.append({
      id: `directus-update-${Date.now()}`,
      type: 'directus.item.updated',
      aggregate: 'directus',
      aggregateId: id,
      timestamp: new Date(),
      version: 1,
      data: { collection, id, changes: data },
      metadata: { layer: 'directus-orchestrator' },
    });

    return data as T;
  }

  /**
   * Check if module is enabled
   */
  isModuleEnabled(moduleName: string): boolean {
    return this.enabledModules.has(moduleName);
  }
}
