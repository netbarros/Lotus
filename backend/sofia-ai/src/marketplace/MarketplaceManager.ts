/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║ 🏪 MARKETPLACE MANAGER - E-commerce & Subscription Management            ║
 * ║ Manages products, checkout, plans, add-ons, and pétalas                  ║
 * ║ Part of Cognitive Mesh OS - System 11                                    ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

import { logger } from '../utils/logger.js';
import { EventStore } from '../events/EventStore.js';
import type { Redis } from 'ioredis';
import type { DirectusOrchestrator } from '../integrations/DirectusOrchestrator.js';

/**
 * Product types in marketplace
 */
export type ProductType = 'saas' | 'microsaas' | 'addon' | 'petala' | 'template' | 'service';

/**
 * Product in marketplace
 */
export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  type: ProductType;
  category: string;
  price: {
    amount: number;
    currency: string;
    billingCycle: 'monthly' | 'yearly' | 'one-time';
  };
  features: string[];
  images: string[];
  demoUrl?: string;
  documentationUrl?: string;
  status: 'draft' | 'active' | 'archived';
  metadata: {
    vertical?: string;
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    supportLevel?: 'community' | 'standard' | 'premium';
    license?: string;
  };
}

/**
 * Pétala (add-on module) for MagicSaaS
 */
export interface Petala {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  vertical: string; // One of 13 verticals
  features: string[];
  basePrice: number;
  addons: string[]; // IDs of compatible add-ons
  dependencies?: string[]; // Other pétalas required
  status: 'active' | 'beta' | 'deprecated';
}

/**
 * Pricing plan
 */
export interface PricingPlan {
  id: string;
  name: string;
  slug: string;
  description: string;
  tier: 'starter' | 'professional' | 'enterprise' | 'custom';
  pricing: {
    monthly: number;
    yearly: number;
    currency: string;
  };
  features: Array<{
    name: string;
    included: boolean;
    limit?: number | string;
  }>;
  limits: {
    users?: number;
    storage?: string;
    apiCalls?: number;
    projects?: number;
    [key: string]: any;
  };
  highlight?: boolean;
  order: number;
  status: 'active' | 'hidden' | 'archived';
}

/**
 * Checkout session
 */
export interface CheckoutSession {
  id: string;
  tenantId: string;
  userId: string;
  items: Array<{
    productId: string;
    productType: ProductType;
    name: string;
    quantity: number;
    price: number;
    billingCycle?: string;
  }>;
  subtotal: number;
  discount?: {
    code: string;
    amount: number;
    type: 'percentage' | 'fixed';
  };
  tax?: number;
  total: number;
  currency: string;
  paymentMethod?: 'credit_card' | 'pix' | 'boleto' | 'crypto';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  metadata?: Record<string, any>;
  createdAt: Date;
  expiresAt: Date;
}

/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║ MARKETPLACE MANAGER - Complete E-commerce Solution                       ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */
export class MarketplaceManager {
  private redis: Redis;
  private eventStore: EventStore;
  private directus: DirectusOrchestrator;

  constructor(redis: Redis, eventStore: EventStore, directus: DirectusOrchestrator) {
    this.redis = redis;
    this.eventStore = eventStore;
    this.directus = directus;
  }

  /**
   * Initialize marketplace
   */
  async initialize(): Promise<void> {
    logger.info('🏪 Initializing Marketplace Manager...');

    // Load products, pétalas, and plans from Directus
    await this.loadProducts();
    await this.loadPetalas();
    await this.loadPlans();

    logger.info('✅ Marketplace Manager initialized');
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PRODUCTS MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Load all products from Directus
   */
  private async loadProducts(): Promise<void> {
    logger.info('📦 Loading products...');

    // In production, fetch from Directus
    const products = await this.directus.query('marketplace_products', {
      filter: { status: { _eq: 'active' } },
    });

    // Cache in Redis
    for (const product of products) {
      await this.redis.setex(
        `marketplace:product:${product.id}`,
        3600, // 1 hour
        JSON.stringify(product)
      );
    }

    logger.info(`✅ Loaded ${products.length} products`);
  }

  /**
   * Get product by ID
   */
  async getProduct(productId: string): Promise<Product | null> {
    // Check cache first
    const cached = await this.redis.get(`marketplace:product:${productId}`);
    if (cached) {
      return JSON.parse(cached);
    }

    // Fetch from Directus
    const products = await this.directus.query('marketplace_products', {
      filter: { id: { _eq: productId } },
      limit: 1,
    });

    if (products.length === 0) {
      return null;
    }

    const product = products[0];

    // Cache for 1 hour
    await this.redis.setex(`marketplace:product:${productId}`, 3600, JSON.stringify(product));

    return product;
  }

  /**
   * Search products
   */
  async searchProducts(query: {
    keyword?: string;
    category?: string;
    type?: ProductType;
    vertical?: string;
    minPrice?: number;
    maxPrice?: number;
    limit?: number;
    offset?: number;
  }): Promise<Product[]> {
    logger.info('🔍 Searching products', query);

    // Build filter
    const filter: any = { status: { _eq: 'active' } };

    if (query.category) filter.category_id = { _eq: query.category };
    if (query.type) filter.type = { _eq: query.type };
    if (query.vertical) filter.vertical = { _eq: query.vertical };
    if (query.minPrice) filter.price = { _gte: query.minPrice };
    if (query.maxPrice) filter.price = { _lte: query.maxPrice };

    // Fetch from Directus
    const products = await this.directus.query('marketplace_products', {
      filter,
      limit: query.limit || 20,
      offset: query.offset || 0,
      sort: ['-created_at'],
    });

    // If keyword search, filter in-memory (in production, use full-text search)
    if (query.keyword) {
      const keyword = query.keyword.toLowerCase();
      return products.filter(
        (p: any) =>
          p.name.toLowerCase().includes(keyword) || p.description?.toLowerCase().includes(keyword)
      );
    }

    return products;
  }

  /**
   * Create new product
   */
  async createProduct(product: Omit<Product, 'id'>): Promise<Product> {
    logger.info('📦 Creating new product', { name: product.name });

    // Create in Directus
    const created = await this.directus.create('marketplace_products', product);

    // Log event
    await this.eventStore.append({
      id: `product-created-${Date.now()}`,
      type: 'marketplace.product.created',
      aggregate: 'product',
      aggregateId: created.id,
      timestamp: new Date(),
      version: 1,
      data: { product: created },
      metadata: { layer: 'marketplace-manager' },
    });

    // Cache
    await this.redis.setex(`marketplace:product:${created.id}`, 3600, JSON.stringify(created));

    return created;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PÉTALAS MANAGEMENT (Add-on Modules)
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Load all pétalas
   */
  private async loadPetalas(): Promise<void> {
    logger.info('🌸 Loading pétalas...');

    const petalas = await this.directus.query('marketplace_petalas', {
      filter: { status: { _eq: 'active' } },
    });

    // Cache in Redis
    await this.redis.setex('marketplace:petalas:all', 3600, JSON.stringify(petalas));

    logger.info(`✅ Loaded ${petalas.length} pétalas`);
  }

  /**
   * Get all pétalas
   */
  async getPetalas(): Promise<Petala[]> {
    const cached = await this.redis.get('marketplace:petalas:all');
    if (cached) {
      return JSON.parse(cached);
    }

    await this.loadPetalas();
    const fresh = await this.redis.get('marketplace:petalas:all');
    return fresh ? JSON.parse(fresh) : [];
  }

  /**
   * Get pétalas by vertical
   */
  async getPetalasByVertical(vertical: string): Promise<Petala[]> {
    const allPetalas = await this.getPetalas();
    return allPetalas.filter((p) => p.vertical === vertical);
  }

  /**
   * Create custom pétala using Sofia AI
   */
  async createCustomPetala(request: {
    name: string;
    description: string;
    vertical: string;
    features: string[];
    tenantId: string;
  }): Promise<Petala> {
    logger.info('🌸 Creating custom pétala', { name: request.name });

    // In production, this would use IntentionEngine to generate the pétala
    // including code, documentation, and integration

    const petala: Petala = {
      id: `petala-${Date.now()}`,
      name: request.name,
      description: request.description,
      icon: '🌸',
      color: '#FF69B4',
      vertical: request.vertical,
      features: request.features,
      basePrice: 99.0,
      addons: [],
      status: 'active',
    };

    // Save to Directus
    await this.directus.create('marketplace_petalas', petala);

    // Log event
    await this.eventStore.append({
      id: `petala-created-${Date.now()}`,
      type: 'marketplace.petala.created',
      aggregate: 'petala',
      aggregateId: petala.id,
      timestamp: new Date(),
      version: 1,
      data: { petala, tenantId: request.tenantId },
      metadata: { layer: 'marketplace-manager' },
    });

    return petala;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PRICING PLANS MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Load all pricing plans
   */
  private async loadPlans(): Promise<void> {
    logger.info('💰 Loading pricing plans...');

    const plans = await this.directus.query('pricing_plans', {
      filter: { status: { _eq: 'active' } },
      sort: ['order'],
    });

    await this.redis.setex('marketplace:plans:all', 3600, JSON.stringify(plans));

    logger.info(`✅ Loaded ${plans.length} pricing plans`);
  }

  /**
   * Get all pricing plans
   */
  async getPricingPlans(): Promise<PricingPlan[]> {
    const cached = await this.redis.get('marketplace:plans:all');
    if (cached) {
      return JSON.parse(cached);
    }

    await this.loadPlans();
    const fresh = await this.redis.get('marketplace:plans:all');
    return fresh ? JSON.parse(fresh) : [];
  }

  /**
   * Get plan by slug
   */
  async getPlanBySlug(slug: string): Promise<PricingPlan | null> {
    const plans = await this.getPricingPlans();
    return plans.find((p) => p.slug === slug) || null;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CHECKOUT & PAYMENTS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Create checkout session
   */
  async createCheckout(request: {
    tenantId: string;
    userId: string;
    items: Array<{
      productId: string;
      quantity?: number;
    }>;
    discountCode?: string;
  }): Promise<CheckoutSession> {
    logger.info('🛒 Creating checkout session', {
      tenantId: request.tenantId,
      itemsCount: request.items.length,
    });

    // Fetch products
    const items = await Promise.all(
      request.items.map(async (item) => {
        const product = await this.getProduct(item.productId);
        if (!product) {
          throw new Error(`Product not found: ${item.productId}`);
        }

        return {
          productId: product.id,
          productType: product.type,
          name: product.name,
          quantity: item.quantity || 1,
          price: product.price.amount,
          billingCycle: product.price.billingCycle,
        };
      })
    );

    // Calculate subtotal
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Apply discount if provided
    let discount: CheckoutSession['discount'];
    if (request.discountCode) {
      // In production, validate discount code
      discount = {
        code: request.discountCode,
        amount: subtotal * 0.1, // 10% discount
        type: 'percentage',
      };
    }

    // Calculate tax (simplified - in production, use proper tax calculation)
    const tax = subtotal * 0.1; // 10% tax

    // Calculate total
    const total = subtotal - (discount?.amount || 0) + tax;

    // Create session
    const session: CheckoutSession = {
      id: `checkout-${Date.now()}`,
      tenantId: request.tenantId,
      userId: request.userId,
      items,
      subtotal,
      discount,
      tax,
      total,
      currency: 'BRL',
      status: 'pending',
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 3600000), // 1 hour
    };

    // Store in Redis
    await this.redis.setex(`checkout:session:${session.id}`, 3600, JSON.stringify(session));

    // Log event
    await this.eventStore.append({
      id: `checkout-created-${Date.now()}`,
      type: 'marketplace.checkout.created',
      aggregate: 'checkout',
      aggregateId: session.id,
      timestamp: new Date(),
      version: 1,
      data: { session },
      metadata: {
        tenantId: request.tenantId,
        userId: request.userId,
        layer: 'marketplace-manager',
      },
    });

    logger.info('✅ Checkout session created', { sessionId: session.id });

    return session;
  }

  /**
   * Process payment
   */
  async processPayment(
    sessionId: string,
    paymentMethod: CheckoutSession['paymentMethod'],
    paymentData: any
  ): Promise<{ success: boolean; transactionId?: string; error?: string }> {
    logger.info('💳 Processing payment', { sessionId, paymentMethod });

    // Get session
    const sessionData = await this.redis.get(`checkout:session:${sessionId}`);
    if (!sessionData) {
      return { success: false, error: 'Session not found or expired' };
    }

    const session: CheckoutSession = JSON.parse(sessionData);

    // Update status
    session.status = 'processing';
    await this.redis.setex(`checkout:session:${sessionId}`, 3600, JSON.stringify(session));

    try {
      // In production, integrate with payment gateway:
      // - Credit Card: Stripe, Mercado Pago
      // - PIX: Mercado Pago, PagSeguro
      // - Boleto: PagBank, Asaas
      // - Crypto: Coinbase Commerce, BitPay

      const transactionId = `txn-${Date.now()}`;

      // Update session
      session.status = 'completed';
      await this.redis.setex(`checkout:session:${sessionId}`, 86400, JSON.stringify(session));

      // Log event
      await this.eventStore.append({
        id: `payment-completed-${Date.now()}`,
        type: 'marketplace.payment.completed',
        aggregate: 'payment',
        aggregateId: transactionId,
        timestamp: new Date(),
        version: 1,
        data: {
          sessionId,
          transactionId,
          amount: session.total,
          currency: session.currency,
          paymentMethod,
        },
        metadata: {
          tenantId: session.tenantId,
          userId: session.userId,
          layer: 'marketplace-manager',
        },
      });

      // Provision purchased products
      await this.provisionProducts(session);

      logger.info('✅ Payment processed successfully', { transactionId });

      return { success: true, transactionId };
    } catch (error) {
      logger.error('❌ Payment processing failed', error);

      session.status = 'failed';
      await this.redis.setex(`checkout:session:${sessionId}`, 86400, JSON.stringify(session));

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment failed',
      };
    }
  }

  /**
   * Provision purchased products to tenant
   */
  private async provisionProducts(session: CheckoutSession): Promise<void> {
    logger.info('📦 Provisioning products', { sessionId: session.id });

    for (const item of session.items) {
      // In production, this would:
      // 1. Enable product/pétala for tenant
      // 2. Update tenant limits
      // 3. Send welcome email
      // 4. Trigger onboarding flow
      // 5. Notify admin

      logger.info(`  ✅ Provisioned: ${item.name}`);
    }

    await this.eventStore.append({
      id: `products-provisioned-${Date.now()}`,
      type: 'marketplace.products.provisioned',
      aggregate: 'provisioning',
      aggregateId: session.id,
      timestamp: new Date(),
      version: 1,
      data: {
        tenantId: session.tenantId,
        products: session.items.map((i) => ({
          id: i.productId,
          type: i.productType,
          name: i.name,
        })),
      },
      metadata: {
        tenantId: session.tenantId,
        layer: 'marketplace-manager',
      },
    });
  }

  /**
   * Get checkout session
   */
  async getCheckoutSession(sessionId: string): Promise<CheckoutSession | null> {
    const data = await this.redis.get(`checkout:session:${sessionId}`);
    return data ? JSON.parse(data) : null;
  }

  /**
   * Cancel checkout session
   */
  async cancelCheckout(sessionId: string): Promise<void> {
    const session = await this.getCheckoutSession(sessionId);
    if (!session) return;

    session.status = 'cancelled';
    await this.redis.setex(`checkout:session:${sessionId}`, 86400, JSON.stringify(session));

    await this.eventStore.append({
      id: `checkout-cancelled-${Date.now()}`,
      type: 'marketplace.checkout.cancelled',
      aggregate: 'checkout',
      aggregateId: sessionId,
      timestamp: new Date(),
      version: 1,
      data: { sessionId },
      metadata: { layer: 'marketplace-manager' },
    });
  }
}
