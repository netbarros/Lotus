# 🌸 PÉTALAS - COMPLETE ARCHITECTURE SPECIFICATION

**Version:** 1.0.0
**Date:** 2025-11-06
**Status:** ✅ **PRODUCTION-READY SPECIFICATION**
**Compliance:** 100% State-of-the-Art Enterprise Global

---

## 📋 EXECUTIVE SUMMARY

This document defines the **complete production-ready architecture** for all **13 Pétalas** (vertical SaaS solutions) in the MagicSaaS System-∞ ecosystem.

**Key Principles:**

1. ✅ **100% Production-Ready** - All Pétalas ready for real-world commercialization
2. ✅ **State-of-the-Art** - Modern tech stack, best practices, enterprise patterns
3. ✅ **Cognitive Mesh Integrated** - Full integration with all 11 layers
4. ✅ **Metronic-Based** - Consistent UX/UI across all Pétalas (ADR-006)
5. ✅ **Multi-Tenant** - Row-Level Security, isolated data (ADR-004)
6. ✅ **Event-Sourced** - Immutable audit trail (ADR-005)
7. ✅ **Modular** - Composed of reusable modules + micro-pétalas
8. ✅ **Observable** - Prometheus metrics, Grafana dashboards, distributed tracing
9. ✅ **Tested** - Unit, integration, E2E, load tests
10. ✅ **Documented** - API docs, user guides, deployment guides

---

## 🏗️ STANDARDIZED PÉTALA STRUCTURE

Every Pétala follows this **exact structure** to ensure consistency, maintainability, and scalability:

```
petalas/{name}/
├── metadata.json                      # Pétala metadata (name, version, price, dependencies)
├── README.md                          # User-facing documentation
├── ARCHITECTURE.md                    # Technical architecture
├── CHANGELOG.md                       # Version history
├── LICENSE.md                         # Software license
│
├── backend/                           # Backend services (Directus integration)
│   ├── collections/                   # Directus collections (data models)
│   │   ├── {entity1}.yaml
│   │   ├── {entity2}.yaml
│   │   └── relationships.yaml
│   ├── flows/                         # Directus flows (automation)
│   │   ├── {workflow1}.json
│   │   └── {workflow2}.json
│   ├── panels/                        # Directus admin panels (Vue 3 + Metronic)
│   │   ├── {panel-name}/
│   │   │   ├── src/
│   │   │   │   ├── panel.vue
│   │   │   │   ├── types.ts
│   │   │   │   └── composables/
│   │   │   ├── package.json
│   │   │   └── tsconfig.json
│   │   └── ...
│   ├── hooks/                         # Directus hooks (business logic)
│   │   ├── {entity1}.ts
│   │   ├── {entity2}.ts
│   │   └── validation.ts
│   ├── endpoints/                     # Custom API endpoints
│   │   ├── {endpoint1}/
│   │   │   ├── index.ts
│   │   │   ├── handlers.ts
│   │   │   ├── validation.ts
│   │   │   └── types.ts
│   │   └── ...
│   └── migrations/                    # Database migrations
│       ├── 001_initial_schema.sql
│       ├── 002_add_feature_x.sql
│       └── ...
│
├── frontend/                          # Customer-facing app (Vue 3 + Metronic)
│   ├── src/
│   │   ├── main.ts                   # App entry point
│   │   ├── App.vue                   # Root component
│   │   ├── router/                   # Vue Router
│   │   │   ├── index.ts
│   │   │   └── routes.ts
│   │   ├── stores/                   # Pinia state management
│   │   │   ├── {entity1}.ts
│   │   │   ├── {entity2}.ts
│   │   │   └── auth.ts
│   │   ├── views/                    # Page components (Metronic layouts)
│   │   │   ├── Dashboard.vue         # Main dashboard
│   │   │   ├── {Entity}List.vue      # List views
│   │   │   ├── {Entity}Detail.vue    # Detail views
│   │   │   ├── {Entity}Form.vue      # Forms
│   │   │   └── ...
│   │   ├── components/               # Reusable components
│   │   │   ├── common/               # Generic components
│   │   │   │   ├── KtButton.vue
│   │   │   │   ├── KtCard.vue
│   │   │   │   └── ...
│   │   │   ├── domain/               # Domain-specific components
│   │   │   │   ├── {Component1}.vue
│   │   │   │   └── ...
│   │   │   └── micro-petalas/        # Micro-pétala integrations
│   │   │       ├── {MicroPetala1}.vue
│   │   │       └── ...
│   │   ├── composables/              # Vue composables (reusable logic)
│   │   │   ├── useAuth.ts
│   │   │   ├── useApi.ts
│   │   │   ├── use{Entity}.ts
│   │   │   └── ...
│   │   ├── services/                 # API clients
│   │   │   ├── api.ts                # Base API client
│   │   │   ├── {entity1}.service.ts
│   │   │   └── ...
│   │   ├── types/                    # TypeScript types
│   │   │   ├── {entity1}.types.ts
│   │   │   ├── api.types.ts
│   │   │   └── ...
│   │   ├── utils/                    # Utility functions
│   │   │   ├── format.ts
│   │   │   ├── validation.ts
│   │   │   └── ...
│   │   ├── assets/                   # Static assets
│   │   │   ├── images/
│   │   │   ├── fonts/
│   │   │   └── styles/
│   │   │       ├── main.scss
│   │   │       └── variables.scss
│   │   └── locales/                  # i18n translations
│   │       ├── en.json
│   │       ├── pt-BR.json
│   │       └── es.json
│   ├── public/
│   │   ├── favicon.ico
│   │   └── robots.txt
│   ├── package.json
│   ├── vite.config.ts                # Vite configuration
│   ├── tsconfig.json                 # TypeScript configuration
│   ├── tailwind.config.js            # Tailwind CSS configuration
│   └── .env.example                  # Environment variables template
│
├── tests/                             # Test suites
│   ├── unit/                          # Unit tests (Vitest)
│   │   ├── composables/
│   │   ├── services/
│   │   └── utils/
│   ├── integration/                   # Integration tests
│   │   ├── api/
│   │   └── flows/
│   ├── e2e/                           # E2E tests (Playwright)
│   │   ├── {feature1}.spec.ts
│   │   └── ...
│   └── load/                          # Load tests (K6)
│       └── {scenario}.js
│
├── infrastructure/                    # Deployment configs
│   ├── docker/
│   │   ├── Dockerfile
│   │   └── docker-compose.yml
│   ├── kubernetes/
│   │   ├── deployment.yaml
│   │   ├── service.yaml
│   │   ├── ingress.yaml
│   │   └── configmap.yaml
│   ├── monitoring/
│   │   ├── prometheus-rules.yaml
│   │   └── grafana-dashboard.json
│   └── scripts/
│       ├── deploy.sh
│       └── rollback.sh
│
├── docs/                              # Documentation
│   ├── api/                           # API documentation
│   │   ├── collections.md
│   │   ├── endpoints.md
│   │   └── webhooks.md
│   ├── user-guide/                    # User documentation
│   │   ├── getting-started.md
│   │   ├── features.md
│   │   └── faq.md
│   └── deployment/                    # Deployment guide
│       ├── installation.md
│       └── configuration.md
│
└── scripts/                           # Development scripts
    ├── build.sh
    ├── test.sh
    ├── seed-data.ts                  # Sample data for testing
    └── validate.sh                   # Pre-deployment validation
```

**Total Structure:** ~100-150 files per Pétala (depending on complexity)

---

## 🔌 COGNITIVE MESH INTEGRATION

Each Pétala integrates with **all 11 layers** of the Cognitive Mesh OS:

### Layer 01: Infrastructure
- **Metronic 9** framework (Vue 3)
- **PostgreSQL 17** + pgVector (multi-tenant RLS)
- **Redis 8** (caching, sessions, rate limiting)
- **TimescaleDB** (time-series metrics)

### Layer 02: Data Foundation
- **Directus CMS** - Collections, flows, permissions
- **Prisma ORM** - Type-safe database access
- **pgVector** - Embedding storage for AI features

### Layer 03: Integration Hub
- **API Gateway** - `/api/petalas/{name}/...`
- **GraphQL** - Directus GraphQL API
- **REST** - Custom endpoints for complex operations
- **WebSockets** - Real-time updates (订阅 events)

### Layer 04: API Gateway
- **Rate Limiting** - Per tenant (1000 req/min Professional, 5000 req/min Enterprise)
- **Authentication** - JWT (Layer 05 → Sofia AI validates)
- **Routing** - `/petalas/fashion/*`, `/petalas/restaurant/*`, etc.
- **CORS** - Configured per tenant domain

### Layer 05: Authentication & Authorization
- **JWT Tokens** - Issued by Sofia AI IntentionEngine
- **RBAC** - Roles: Owner, Admin, Editor, Viewer, API
- **RLS** - PostgreSQL Row-Level Security enforces tenant isolation
- **OAuth 2.0** - Social logins (Google, Facebook, Apple)

### Layer 06: Business Logic
- **Directus Hooks** - Pre/post create/update/delete
- **Directus Flows** - Automation (e.g., send notification on order)
- **Custom Endpoints** - Complex operations (e.g., calculate shipping)
- **Validation** - Zod schemas, business rules

### Layer 07: Event Sourcing
- **EventStore** - Immutable event log (TimescaleDB)
- **Event Types** - `petala.{name}.{entity}.{action}` (e.g., `petala.fashion.order.created`)
- **Event Schema:**
```typescript
interface PetalaEvent {
  id: string;                        // UUID
  type: string;                      // 'petala.fashion.order.created'
  aggregateId: string;               // Order ID
  tenantId: string;                  // Tenant ID
  userId: string;                    // User ID
  data: Record<string, any>;         // Event payload
  metadata: {
    timestamp: string;               // ISO 8601
    version: number;                 // Event version
    correlationId?: string;          // Request ID
    causationId?: string;            // Parent event ID
  };
}
```

### Layer 08: Analytics & Reporting
- **Prometheus Metrics** - Per Pétala:
  - `petala_{name}_requests_total{method, status}`
  - `petala_{name}_request_duration_seconds{route, percentile}`
  - `petala_{name}_active_users{plan}`
  - `petala_{name}_revenue_mrr{plan}`
- **Grafana Dashboards** - One per Pétala (e.g., `05-petala-fashion.json`)
- **BigQuery Export** - Daily event dumps for analytics

### Layer 09: AI/ML Services
- **Sofia AI IntentionEngine** - Generates Pétala configurations
- **Recommendations** - Product recommendations (Fashion, Retail)
- **Predictions** - Demand forecasting (Restaurant, Logistics)
- **NLP** - Sentiment analysis (reviews, feedback)
- **Computer Vision** - Image recognition (AR try-on, property photos)

### Layer 10: Intelligence Synthesis (Sofia AI)
- **SolutionArchitect** - Selects Metronic demo, layouts, components, micro-pétalas
- **UXValidator** - Ensures WCAG 2.1 AA compliance
- **SEOOptimizer** - Meta tags, structured data, sitemap
- **DecisionLogger** - Logs all AI decisions for auditability
- **DirectusOrchestrator** - Provisions collections, flows, panels

### Layer 11: Meta-Orchestration
- **Cross-Pétala Analytics** - Tenant using multiple Pétalas (e.g., Fashion + Retail)
- **Resource Allocation** - Auto-scaling based on usage
- **Cost Optimization** - Right-size infrastructure per tenant
- **Health Monitoring** - Uptime, error rate, SLO tracking

**Integration Points:**

```typescript
// Every Pétala exports this interface
export interface PetalaInterface {
  // Metadata
  name: string;                       // 'fashion'
  version: string;                    // '1.0.0'
  description: string;

  // Configuration
  config: {
    metronic: {
      demo: string;                   // 'demo1'
      theme: 'light' | 'dark';
      colorScheme: string;            // 'purple'
    };
    modules: string[];                // ['auth', 'payment', 'notifications']
    microPetalas: string[];           // ['ar-try-on', 'size-guide']
  };

  // Lifecycle hooks
  onInstall(tenantId: string): Promise<void>;
  onUninstall(tenantId: string): Promise<void>;
  onUpgrade(tenantId: string, fromVersion: string): Promise<void>;

  // Health check
  healthCheck(): Promise<{ status: 'healthy' | 'degraded' | 'down'; details: any }>;

  // Metrics
  getMetrics(tenantId: string): Promise<PetalaMetrics>;

  // API
  getApiSpec(): OpenAPISpec;
}

interface PetalaMetrics {
  activeUsers: number;
  requestsPerMinute: number;
  errorRate: number;
  p95Latency: number;
  storageUsed: number;              // bytes
  creditsConsumed: number;          // Créditos Lotus
}
```

---

## 📦 MICRO-PÉTALAS (REUSABLE COMPONENTS)

Micro-Pétalas are **standalone features** that can be added to any Pétala:

### Authentication & Security (5)
1. **auth-basic** - Email/password login
2. **auth-social** - OAuth (Google, Facebook, Apple, Microsoft)
3. **auth-2fa** - Two-factor authentication (TOTP, SMS)
4. **auth-sso** - Single Sign-On (SAML, OIDC)
5. **rbac-advanced** - Advanced RBAC (custom roles, permissions)

### Payment & Billing (6)
6. **payment-stripe** - Stripe integration (cards, wallets)
7. **payment-mercadopago** - Mercado Pago (Brazil, LATAM)
8. **payment-paypal** - PayPal integration
9. **payment-pix** - PIX instant payment (Brazil)
10. **subscriptions** - Recurring billing, trials, coupons
11. **invoicing** - PDF invoice generation, email delivery

### Communication (5)
12. **notifications-push** - Web push notifications (OneSignal)
13. **notifications-sms** - SMS (Twilio, AWS SNS)
14. **notifications-whatsapp** - WhatsApp Business API
15. **email-templates** - Transactional emails (SendGrid, Mailgun)
16. **chat-support** - Live chat widget (Intercom, Crisp)

### Analytics & Tracking (4)
17. **analytics-google** - Google Analytics 4 integration
18. **analytics-mixpanel** - Mixpanel events tracking
19. **analytics-segment** - Segment.io (unified analytics)
20. **heatmaps** - Hotjar/Clarity heatmaps

### Content & Media (5)
21. **file-upload** - File upload (Cloudinary, S3)
22. **image-optimization** - Auto WebP conversion, lazy loading
23. **video-player** - Video player (Vimeo, YouTube, self-hosted)
24. **pdf-generator** - PDF generation (reports, invoices)
25. **qr-code** - QR code generation/scanning

### E-commerce Specific (8)
26. **product-reviews** - Star ratings, reviews, moderation
27. **wishlist** - Save for later
28. **loyalty-points** - Gamification, rewards
29. **coupons-discounts** - Discount codes, promotions
30. **shipping-calculator** - Real-time shipping rates (Correios, UPS, FedEx)
31. **inventory-sync** - Real-time inventory tracking
32. **abandoned-cart** - Email recovery campaigns
33. **upsell-cross-sell** - AI-powered recommendations

### Industry-Specific (12)
34. **ar-try-on** - Augmented reality (Fashion, Retail)
35. **vr-tours** - Virtual reality tours (Real Estate, Travel)
36. **telemedicine-video** - Video consultation (Healthcare)
37. **appointment-booking** - Calendar scheduling (Healthcare, Fitness, Events)
38. **table-reservations** - Restaurant table booking
39. **menu-qr** - QR code menu (Restaurant)
40. **pos-integration** - Point of Sale integration (Retail, Restaurant)
41. **fleet-tracking** - GPS vehicle tracking (Logistics, Automotive)
42. **route-optimization** - Route planning (Logistics, Travel)
43. **e-signature** - Digital signatures (Legal, Real Estate)
44. **case-timeline** - Legal case management (Legal)
45. **ehr-integration** - Electronic Health Records (Healthcare)

### AI-Powered (5)
46. **ai-chatbot** - Customer service chatbot (GPT-4)
47. **ai-recommendations** - Product/content recommendations
48. **ai-search** - Semantic search (pgVector)
49. **ai-image-gen** - Image generation (DALL-E, Stable Diffusion)
50. **ai-text-gen** - Content generation (product descriptions, emails)

**Total Micro-Pétalas:** 50 components
**Implementation Status:** ALL must be 100% production-ready

---

## 🌸 COMPLETE PÉTALAS SPECIFICATIONS

### 1. PÉTALA FASHION (Moda & E-commerce)

**Target:** Fashion brands, online boutiques, clothing marketplaces
**Pricing:** Starter $79/mês, Professional $149/mês, Enterprise $399/mês

#### Tech Stack:
- **Frontend:** Vue 3 + Vite + Metronic demo1 (E-commerce)
- **Backend:** Directus + PostgreSQL + Redis
- **Payment:** Stripe + Mercado Pago + PIX
- **Media:** Cloudinary (image optimization, CDN)
- **Search:** Algolia (instant search)
- **AR:** 8th Wall (WebAR for try-on)

#### Core Features (23):
1. ✅ Product catalog (collections, categories, tags)
2. ✅ Advanced filters (size, color, price, brand, season)
3. ✅ Product variants (size, color, material)
4. ✅ Size guide (dynamic per product)
5. ✅ Lookbook (curated collections)
6. ✅ Shopping cart
7. ✅ Checkout (multi-step, guest checkout)
8. ✅ Payment gateway (Stripe, Mercado Pago, PIX)
9. ✅ Order tracking
10. ✅ Customer accounts
11. ✅ Wishlist
12. ✅ Product reviews (star ratings, photos)
13. ✅ Loyalty program (points, rewards)
14. ✅ Discount coupons
15. ✅ Abandoned cart recovery
16. ✅ Inventory management
17. ✅ Shipping calculator (Correios, multiple carriers)
18. ✅ Multi-language (EN, PT-BR, ES)
19. ✅ Multi-currency (USD, BRL, EUR)
20. ✅ Instagram integration (feed, shopping tags)
21. ✅ Email marketing (Mailchimp, SendGrid)
22. ✅ Analytics dashboard (sales, top products, conversion)
23. ✅ Mobile app (PWA - installable)

#### Micro-Pétalas Used (12):
- auth-basic
- auth-social
- payment-stripe
- payment-mercadopago
- payment-pix
- subscriptions
- email-templates
- analytics-google
- file-upload
- product-reviews
- wishlist
- **ar-try-on** ⭐ (exclusive feature)

#### Metronic Components:
- **Layouts:** layout-ecommerce-dashboard, layout-product-catalog, layout-product-detail, layout-checkout
- **Components:** kt-card-product, kt-table-orders, kt-form-checkout, kt-chart-sales, kt-datatable-customers

#### Data Models (9 collections):
```yaml
# collections/products.yaml
name: products
fields:
  - name: id
    type: uuid
    primary_key: true
  - name: tenant_id
    type: uuid
    required: true
  - name: name
    type: string
    required: true
  - name: slug
    type: string
    unique: true
  - name: description
    type: text
  - name: price
    type: decimal
    required: true
  - name: compare_at_price
    type: decimal
  - name: cost
    type: decimal
  - name: sku
    type: string
  - name: barcode
    type: string
  - name: track_inventory
    type: boolean
    default: true
  - name: inventory_quantity
    type: integer
    default: 0
  - name: images
    type: json                          # Array of {url, alt, order}
  - name: variants
    type: json                          # Array of {size, color, price, sku, inventory}
  - name: category_id
    type: uuid
  - name: brand_id
    type: uuid
  - name: tags
    type: json                          # Array of strings
  - name: seo
    type: json                          # {title, description, keywords}
  - name: status
    type: string
    default: 'draft'                    # draft | active | archived
  - name: created_at
    type: timestamp
  - name: updated_at
    type: timestamp
```

Other collections: `categories`, `brands`, `orders`, `order_items`, `customers`, `reviews`, `coupons`, `shipping_zones`

#### API Endpoints (15):
- `GET /api/petalas/fashion/products` - List products (paginated, filtered)
- `GET /api/petalas/fashion/products/:id` - Get product detail
- `POST /api/petalas/fashion/cart/add` - Add to cart
- `GET /api/petalas/fashion/cart` - Get cart
- `DELETE /api/petalas/fashion/cart/:id` - Remove from cart
- `POST /api/petalas/fashion/checkout` - Create order
- `POST /api/petalas/fashion/payment` - Process payment
- `GET /api/petalas/fashion/orders/:id` - Track order
- `POST /api/petalas/fashion/reviews` - Submit review
- `GET /api/petalas/fashion/recommendations` - AI recommendations
- `POST /api/petalas/fashion/ar/try-on` - AR try-on session
- `GET /api/petalas/fashion/shipping/calculate` - Calculate shipping
- `POST /api/petalas/fashion/coupons/validate` - Validate coupon
- `GET /api/petalas/fashion/analytics/dashboard` - Dashboard metrics
- `POST /api/petalas/fashion/instagram/sync` - Sync Instagram products

#### Prometheus Metrics (12):
- `petala_fashion_products_total{tenant_id, status}`
- `petala_fashion_orders_total{tenant_id, status}`
- `petala_fashion_revenue_total{tenant_id, currency}`
- `petala_fashion_cart_abandonment_rate{tenant_id}`
- `petala_fashion_conversion_rate{tenant_id}`
- `petala_fashion_avg_order_value{tenant_id, currency}`
- `petala_fashion_inventory_low{tenant_id, product_id}` (alert)
- `petala_fashion_ar_sessions_total{tenant_id}`
- `petala_fashion_reviews_total{tenant_id, rating}`
- `petala_fashion_shipping_calculation_duration_seconds{carrier, percentile}`
- `petala_fashion_api_requests_total{endpoint, method, status}`
- `petala_fashion_active_users{tenant_id, plan}`

#### Grafana Dashboard:
- **05-petala-fashion.json** (16 panels):
  - Revenue (MRR, daily sales)
  - Orders (total, by status, timeline)
  - Products (top sellers, inventory alerts)
  - Customers (new, returning, LTV)
  - Conversion funnel (views → cart → checkout → purchase)
  - Cart abandonment rate
  - AR try-on usage
  - Reviews (average rating, recent reviews)
  - API performance (p95, p99, error rate)
  - Geographic distribution (sales by country/state)

#### Tests (42):
- **Unit:** 15 tests (services, utils, validation)
- **Integration:** 12 tests (API endpoints, Directus flows)
- **E2E:** 10 tests (checkout flow, AR try-on, admin panel)
- **Load:** 5 scenarios (K6 - normal load, Black Friday spike, AR sessions)

#### Deployment:
- **VPS (Dev):** DigitalOcean Droplet 4GB RAM, 2 vCPUs
- **Cloud (Prod):** AWS EKS (3-15 pods, HPA based on CPU/requests)
- **CDN:** CloudFlare (images, CSS, JS)
- **Domain:** `{tenant}.softwarelotus.com.br/fashion` or custom domain

**Status:** ✅ Ready for production implementation

---

### 2. PÉTALA RESTAURANT (Food Delivery & Reservations)

**Target:** Restaurants, cafes, food delivery services
**Pricing:** Starter $79/mês, Professional $149/mês, Enterprise $349/mês

#### Tech Stack:
- **Frontend:** Vue 3 + Vite + Metronic demo6 (Food Delivery)
- **Backend:** Directus + PostgreSQL + Redis
- **Payment:** Stripe + Mercado Pago + PIX
- **Maps:** Google Maps API (delivery routing)
- **QR Codes:** QRCode.js (menu QR codes)
- **Reservations:** Custom booking engine

#### Core Features (25):
1. ✅ Digital menu (categories, items, modifiers)
2. ✅ QR code menu (contactless)
3. ✅ Table reservations (date, time, party size)
4. ✅ Online ordering (delivery, pickup, dine-in)
5. ✅ Shopping cart
6. ✅ Checkout (address, payment, tip)
7. ✅ Real-time order tracking
8. ✅ Kitchen display system (KDS)
9. ✅ Delivery driver app (routing, status updates)
10. ✅ Customer accounts
11. ✅ Order history
12. ✅ Favorites (reorder with 1 click)
13. ✅ Reviews & ratings (dishes, service)
14. ✅ Loyalty program (points, free items)
15. ✅ Discount coupons
16. ✅ Delivery zone management (radius, min order)
17. ✅ Estimated delivery time (AI-powered)
18. ✅ Multi-location support (chain restaurants)
19. ✅ Multi-language (EN, PT-BR, ES)
20. ✅ Allergen information
21. ✅ Nutritional facts
22. ✅ Instagram integration (food photos)
23. ✅ Analytics dashboard (sales, top dishes, peak hours)
24. ✅ WhatsApp ordering (optional)
25. ✅ Mobile app (PWA - installable)

#### Micro-Pétalas Used (13):
- auth-basic
- auth-social
- payment-stripe
- payment-mercadopago
- payment-pix
- email-templates
- notifications-sms (order updates)
- notifications-whatsapp
- analytics-google
- file-upload
- **menu-qr** ⭐
- **table-reservations** ⭐
- **pos-integration** ⭐

#### Metronic Components:
- **Layouts:** layout-food-delivery-dashboard, layout-menu, layout-order-tracking, layout-checkout
- **Components:** kt-card-dish, kt-table-orders, kt-map-delivery, kt-timeline-order-status, kt-calendar-reservations

#### Data Models (10 collections):
```yaml
# collections/menu_items.yaml
name: menu_items
fields:
  - name: id
    type: uuid
    primary_key: true
  - name: tenant_id
    type: uuid
    required: true
  - name: name
    type: string
    required: true
  - name: description
    type: text
  - name: price
    type: decimal
    required: true
  - name: image
    type: string                       # URL
  - name: category_id
    type: uuid
  - name: modifiers
    type: json                         # Array of {name, options: [{name, price}]}
  - name: allergens
    type: json                         # Array of strings
  - name: nutritional_facts
    type: json                         # {calories, protein, carbs, fat}
  - name: preparation_time
    type: integer                      # minutes
  - name: available
    type: boolean
    default: true
  - name: status
    type: string
    default: 'active'                  # active | out_of_stock | discontinued
  - name: created_at
    type: timestamp
  - name: updated_at
    type: timestamp
```

Other collections: `menu_categories`, `orders`, `order_items`, `reservations`, `delivery_zones`, `customers`, `reviews`, `coupons`, `locations`

#### API Endpoints (18):
- `GET /api/petalas/restaurant/menu` - Get full menu
- `GET /api/petalas/restaurant/menu/:id` - Get item detail
- `POST /api/petalas/restaurant/cart/add` - Add to cart
- `GET /api/petalas/restaurant/cart` - Get cart
- `POST /api/petalas/restaurant/checkout` - Create order
- `POST /api/petalas/restaurant/payment` - Process payment
- `GET /api/petalas/restaurant/orders/:id/track` - Track order
- `POST /api/petalas/restaurant/reservations` - Create reservation
- `GET /api/petalas/restaurant/reservations/availability` - Check availability
- `POST /api/petalas/restaurant/reviews` - Submit review
- `GET /api/petalas/restaurant/delivery/zones` - Get delivery zones
- `POST /api/petalas/restaurant/delivery/estimate` - Estimate delivery time
- `POST /api/petalas/restaurant/qr/generate` - Generate QR code
- `GET /api/petalas/restaurant/analytics/dashboard` - Dashboard metrics
- `POST /api/petalas/restaurant/whatsapp/order` - WhatsApp order webhook
- `GET /api/petalas/restaurant/kds` - Kitchen display data (WebSocket)
- `POST /api/petalas/restaurant/kds/update` - Update order status
- `GET /api/petalas/restaurant/driver/orders` - Driver app orders

#### Prometheus Metrics (14):
- `petala_restaurant_orders_total{tenant_id, type, status}` (type: delivery|pickup|dine_in)
- `petala_restaurant_revenue_total{tenant_id, type, currency}`
- `petala_restaurant_avg_order_value{tenant_id, currency}`
- `petala_restaurant_delivery_time_seconds{tenant_id, percentile}`
- `petala_restaurant_preparation_time_seconds{tenant_id, percentile}`
- `petala_restaurant_reservations_total{tenant_id, status}`
- `petala_restaurant_menu_items_total{tenant_id, status}`
- `petala_restaurant_top_dishes{tenant_id, dish_id, rank}`
- `petala_restaurant_peak_hours{tenant_id, hour}`
- `petala_restaurant_delivery_zones_total{tenant_id}`
- `petala_restaurant_qr_scans_total{tenant_id, table_id}`
- `petala_restaurant_whatsapp_orders_total{tenant_id}`
- `petala_restaurant_api_requests_total{endpoint, method, status}`
- `petala_restaurant_active_users{tenant_id, plan}`

#### Grafana Dashboard:
- **06-petala-restaurant.json** (18 panels)

#### Tests (45):
- **Unit:** 16 tests
- **Integration:** 14 tests
- **E2E:** 10 tests (full order flow, reservation flow, QR menu, KDS)
- **Load:** 5 scenarios (dinner rush, delivery spike)

**Status:** ✅ Ready for production implementation

---

### 3. PÉTALA HEALTHCARE (Telemedicine & EHR)

**Target:** Clinics, hospitals, telemedicine platforms, therapists
**Pricing:** Starter $149/mês, Professional $349/mês, Enterprise $799/mês

#### Tech Stack:
- **Frontend:** Vue 3 + Vite + Metronic demo8 (CRM/Healthcare)
- **Backend:** Directus + PostgreSQL + Redis
- **Video:** Twilio Video API (HIPAA-compliant)
- **Payment:** Stripe (PCI DSS compliant)
- **Storage:** AWS S3 (HIPAA-compliant bucket)
- **Encryption:** AES-256 (PHI data at rest)

#### Core Features (28):
1. ✅ Patient management (demographics, medical history)
2. ✅ Appointment scheduling (calendar, reminders)
3. ✅ Telemedicine video consultation (HD, recording)
4. ✅ Waiting room (virtual)
5. ✅ Electronic Health Records (EHR)
6. ✅ Medical notes (SOAP format)
7. ✅ Prescription management (e-prescription)
8. ✅ Lab results upload
9. ✅ Imaging viewer (DICOM support - X-ray, MRI, CT)
10. ✅ Billing & invoicing
11. ✅ Insurance claims
12. ✅ Payment processing (co-pays, deductibles)
13. ✅ Patient portal (view records, book appointments)
14. ✅ Consent forms (digital signature)
15. ✅ HIPAA compliance (audit logs, encryption)
16. ✅ Multi-location support (clinic chain)
17. ✅ Multi-provider (doctors, nurses, therapists)
18. ✅ Referral management
19. ✅ Medication interaction checker
20. ✅ Allergy alerts
21. ✅ Vaccination records
22. ✅ Health metrics tracking (BP, glucose, weight)
23. ✅ Wearable integration (Fitbit, Apple Health)
24. ✅ SMS/email reminders (appointments, medications)
25. ✅ Multi-language (EN, PT-BR, ES)
26. ✅ Analytics dashboard (patient volume, revenue, no-shows)
27. ✅ Reporting (quality metrics, outcomes)
28. ✅ Mobile app (PWA - patients & providers)

#### Micro-Pétalas Used (14):
- auth-basic
- auth-2fa (required for HIPAA)
- auth-sso (hospital systems)
- payment-stripe
- email-templates
- notifications-sms
- analytics-google
- file-upload (encrypted)
- **telemedicine-video** ⭐
- **appointment-booking** ⭐
- **ehr-integration** ⭐
- **e-signature** ⭐
- pdf-generator (prescriptions, reports)
- ai-chatbot (symptom checker)

#### Metronic Components:
- **Layouts:** layout-healthcare-dashboard, layout-patient-profile, layout-calendar, layout-video-call
- **Components:** kt-card-patient, kt-table-appointments, kt-timeline-medical-history, kt-chart-vitals, kt-calendar-schedule

#### Data Models (12 collections):
```yaml
# collections/patients.yaml (HIPAA-compliant)
name: patients
fields:
  - name: id
    type: uuid
    primary_key: true
  - name: tenant_id
    type: uuid
    required: true
  - name: mrn
    type: string                       # Medical Record Number (unique)
    unique: true
  - name: first_name
    type: string
    required: true
    encrypted: true                    # PHI - encrypted at rest
  - name: last_name
    type: string
    required: true
    encrypted: true
  - name: date_of_birth
    type: date
    encrypted: true
  - name: gender
    type: string
  - name: ssn
    type: string
    encrypted: true                    # Highly sensitive
  - name: phone
    type: string
    encrypted: true
  - name: email
    type: string
    encrypted: true
  - name: address
    type: json
    encrypted: true
  - name: emergency_contact
    type: json
    encrypted: true
  - name: insurance
    type: json                         # {provider, policy_number, group_number}
    encrypted: true
  - name: medical_history
    type: json
    encrypted: true
  - name: allergies
    type: json
    encrypted: true
  - name: medications
    type: json
    encrypted: true
  - name: created_at
    type: timestamp
  - name: updated_at
    type: timestamp
  - name: created_by
    type: uuid                         # Audit trail
  - name: updated_by
    type: uuid
```

Other collections: `appointments`, `medical_notes`, `prescriptions`, `lab_results`, `imaging`, `billing`, `insurance_claims`, `consents`, `providers`, `locations`, `health_metrics`

#### API Endpoints (22):
- `GET /api/petalas/healthcare/patients` - List patients (RLS enforced)
- `GET /api/petalas/healthcare/patients/:id` - Get patient detail
- `POST /api/petalas/healthcare/patients` - Create patient
- `PUT /api/petalas/healthcare/patients/:id` - Update patient
- `GET /api/petalas/healthcare/appointments` - List appointments
- `POST /api/petalas/healthcare/appointments` - Book appointment
- `PUT /api/petalas/healthcare/appointments/:id` - Reschedule
- `DELETE /api/petalas/healthcare/appointments/:id` - Cancel
- `POST /api/petalas/healthcare/telemedicine/session` - Start video call
- `GET /api/petalas/healthcare/telemedicine/session/:id` - Join call
- `POST /api/petalas/healthcare/notes` - Create SOAP note
- `GET /api/petalas/healthcare/notes/:patient_id` - Get patient notes
- `POST /api/petalas/healthcare/prescriptions` - Create e-prescription
- `POST /api/petalas/healthcare/lab-results/upload` - Upload lab results
- `POST /api/petalas/healthcare/imaging/upload` - Upload DICOM images
- `GET /api/petalas/healthcare/imaging/viewer/:id` - View imaging
- `POST /api/petalas/healthcare/billing` - Create invoice
- `POST /api/petalas/healthcare/payment` - Process payment
- `POST /api/petalas/healthcare/insurance/claim` - Submit claim
- `POST /api/petalas/healthcare/consent` - Sign consent form
- `GET /api/petalas/healthcare/analytics/dashboard` - Dashboard metrics
- `GET /api/petalas/healthcare/audit-log` - HIPAA audit log

#### Prometheus Metrics (16):
- `petala_healthcare_patients_total{tenant_id}`
- `petala_healthcare_appointments_total{tenant_id, status, type}`
- `petala_healthcare_telemedicine_sessions_total{tenant_id, duration_bucket}`
- `petala_healthcare_prescriptions_total{tenant_id}`
- `petala_healthcare_lab_results_total{tenant_id}`
- `petala_healthcare_revenue_total{tenant_id, currency}`
- `petala_healthcare_no_show_rate{tenant_id}`
- `petala_healthcare_avg_wait_time_seconds{tenant_id, percentile}`
- `petala_healthcare_patient_satisfaction{tenant_id, rating}`
- `petala_healthcare_encryption_operations_total{operation, status}`
- `petala_healthcare_audit_log_entries_total{tenant_id, action}`
- `petala_healthcare_hipaa_violations_total{tenant_id, type}` (alert)
- `petala_healthcare_consent_forms_signed_total{tenant_id}`
- `petala_healthcare_insurance_claims_total{tenant_id, status}`
- `petala_healthcare_api_requests_total{endpoint, method, status}`
- `petala_healthcare_active_users{tenant_id, plan}`

#### Grafana Dashboard:
- **07-petala-healthcare.json** (20 panels)

#### Tests (52):
- **Unit:** 18 tests (encryption, validation, HIPAA compliance)
- **Integration:** 16 tests (EHR workflows, telemedicine, billing)
- **E2E:** 12 tests (patient booking, video consultation, e-prescription)
- **Load:** 6 scenarios (appointment surge, telemedicine peak, EHR queries)

#### Compliance:
- ✅ **HIPAA** - PHI encryption, audit logs, access controls
- ✅ **SOC 2 Type II** - Security, availability, confidentiality
- ✅ **GDPR** - Right to erasure, data portability
- ✅ **PCI DSS** - Payment card security (Stripe handles)

**Status:** ✅ Ready for production implementation (requires HIPAA infrastructure)

---

### 4-13. REMAINING PÉTALAS (SUMMARY)

#### 4. PÉTALA REAL ESTATE
- **Target:** Real estate agencies, property management
- **Key Features:** Property listings, VR tours, lead management, mortgage calculator
- **Micro-Pétalas:** vr-tours, appointment-booking, e-signature
- **Metronic Demo:** demo1 (E-commerce adapted for properties)

#### 5. PÉTALA EDUCATION
- **Target:** Online courses, schools, training platforms
- **Key Features:** LMS, video lessons, quizzes, certificates, gamification
- **Micro-Pétalas:** video-player, quiz-engine, certificate-generator, gamification
- **Metronic Demo:** demo10 (LMS)

#### 6. PÉTALA FITNESS
- **Target:** Gyms, personal trainers, fitness apps
- **Key Features:** Class scheduling, member management, workout tracking, wearable sync
- **Micro-Pétalas:** appointment-booking, wearable-sync, video-on-demand
- **Metronic Demo:** demo7 (Project Management adapted for workouts)

#### 7. PÉTALA LEGAL
- **Target:** Law firms, legal tech platforms
- **Key Features:** Case management, document management, billing, e-signature
- **Micro-Pétalas:** e-signature, case-timeline, document-versioning, time-tracking
- **Metronic Demo:** demo3 (SaaS App adapted for legal)

#### 8. PÉTALA AUTOMOTIVE
- **Target:** Car dealerships, auto repair shops
- **Key Features:** Inventory management, service orders, CRM, test drive booking
- **Micro-Pétalas:** appointment-booking, inventory-sync, kanban-service-orders
- **Metronic Demo:** demo6 (Logistics adapted for automotive)

#### 9. PÉTALA FINANCE
- **Target:** Fintech, accounting, banking
- **Key Features:** Accounts, transactions, open banking, reports, compliance
- **Micro-Pétalas:** open-banking, invoice-generator, tax-calculator, audit-trail
- **Metronic Demo:** demo2 (Analytics)

#### 10. PÉTALA TRAVEL
- **Target:** Travel agencies, tour operators, hotel booking
- **Key Features:** Booking engine, itinerary builder, payment, reviews
- **Micro-Pétalas:** booking-calendar, payment-installments, maps-integration
- **Metronic Demo:** demo1 (E-commerce adapted for travel)

#### 11. PÉTALA EVENTS
- **Target:** Event organizers, ticketing platforms
- **Key Features:** Ticketing, QR check-in, seat maps, live streaming
- **Micro-Pétalas:** qr-code, ticket-generator, live-stream, seat-map
- **Metronic Demo:** demo5 (Ticketing)

#### 12. PÉTALA LOGISTICS
- **Target:** Shipping companies, fleet management
- **Key Features:** Order tracking, fleet GPS, route optimization, proof of delivery
- **Micro-Pétalas:** fleet-tracking, route-optimization, signature-capture
- **Metronic Demo:** demo6 (Fleet Management)

#### 13. PÉTALA RETAIL
- **Target:** Retail stores, POS systems, omnichannel
- **Key Features:** POS, inventory, e-commerce, omnichannel (online + offline)
- **Micro-Pétalas:** pos-integration, inventory-sync, omnichannel-orders
- **Metronic Demo:** demo1 (E-commerce) + POS interface

**All 13 Pétalas must be implemented to 100% production-ready state.**

---

## 🧪 TESTING REQUIREMENTS (ALL PÉTALAS)

Every Pétala MUST have:

### Unit Tests (15+ per Pétala):
- Services (API clients, business logic)
- Utils (formatters, validators, helpers)
- Composables (Vue composition functions)
- **Coverage:** 80%+ code coverage
- **Framework:** Vitest

### Integration Tests (12+ per Pétala):
- API endpoints (CRUD operations)
- Directus flows (automation)
- Database operations (RLS, constraints)
- **Coverage:** All critical paths
- **Framework:** Vitest + Supertest

### E2E Tests (10+ per Pétala):
- Happy path flows (checkout, booking, etc.)
- Error scenarios (payment failure, validation)
- Admin workflows (CRUD via panels)
- **Coverage:** All user-facing features
- **Framework:** Playwright

### Load Tests (5 scenarios per Pétala):
- **Smoke:** 1 user, 1 minute (sanity check)
- **Load:** 100 users, 10 minutes (normal traffic)
- **Stress:** 500 users, 20 minutes (peak traffic)
- **Spike:** 0→1000 users in 10s (Black Friday)
- **Soak:** 50 users, 2 hours (memory leaks)
- **Framework:** K6

**Total Tests per Pétala:** ~42+ tests
**Total Tests (13 Pétalas):** ~550+ tests

---

## 📊 OBSERVABILITY (ALL PÉTALAS)

Every Pétala MUST have:

### Prometheus Metrics (12-16 per Pétala):
- Business metrics (revenue, users, conversions)
- Technical metrics (API latency, error rate, throughput)
- Domain-specific (e.g., `petala_restaurant_delivery_time_seconds`)

### Grafana Dashboard (1 per Pétala):
- **16-20 panels** covering business + technical metrics
- **SLO tracking** (error budget, burn rate)
- **Alerts** configured (PagerDuty, Slack)

### Distributed Tracing:
- **Jaeger** - Trace requests across layers (01-11)
- **Correlation IDs** - Track request flow end-to-end

### Logging:
- **Structured logs** (JSON format)
- **Log levels:** DEBUG, INFO, WARN, ERROR, FATAL
- **Retention:** 30 days (dev), 90 days (prod)
- **Storage:** AWS CloudWatch Logs or ELK stack

---

## 🚀 DEPLOYMENT (ALL PÉTALAS)

### VPS (Development):
- **Provider:** DigitalOcean or Hetzner Cloud
- **Specs:** 4GB RAM, 2 vCPUs, 80GB SSD
- **OS:** Ubuntu 22.04 LTS
- **Stack:** Docker Compose (all services in containers)
- **Domain:** `dev-{tenant}.softwarelotus.com.br`

### Cloud (Production):
- **Provider:** AWS (EKS - Elastic Kubernetes Service)
- **Region:** us-east-1 (primary), sa-east-1 (Brazil) - multi-region
- **Nodes:** 3-15 (auto-scaling based on load)
- **Database:** RDS PostgreSQL 17 (Multi-AZ)
- **Cache:** ElastiCache Redis 8 (cluster mode)
- **Storage:** S3 (media), EFS (shared files)
- **CDN:** CloudFront (global edge caching)
- **DNS:** Route 53 (geo-routing)
- **SSL:** ACM (AWS Certificate Manager) - auto-renewal
- **Domain:** `{tenant}.softwarelotus.com.br` or custom domain

### CI/CD:
- **GitHub Actions** - Build, test, deploy on push to `main`
- **Environments:** dev → staging → production
- **Deployment Strategy:** Blue-Green (zero downtime)
- **Rollback:** Automated (if health checks fail)

---

## 📚 DOCUMENTATION (ALL PÉTALAS)

Every Pétala MUST have:

### Technical Docs:
- `README.md` - Overview, quick start
- `ARCHITECTURE.md` - Technical architecture
- `API.md` - API reference (OpenAPI spec)
- `DEPLOYMENT.md` - Deployment guide
- `CHANGELOG.md` - Version history

### User Docs:
- `docs/user-guide/getting-started.md`
- `docs/user-guide/features.md`
- `docs/user-guide/faq.md`
- `docs/user-guide/troubleshooting.md`

### Videos (Optional):
- Product demo (5 min)
- Setup tutorial (10 min)
- Feature walkthroughs (2-3 min each)

---

## ✅ PRODUCTION READINESS CHECKLIST

Before a Pétala can be marked as **100% production-ready**, it MUST pass:

### Code Quality:
- [ ] TypeScript strict mode enabled
- [ ] ESLint + Prettier configured
- [ ] No `any` types (type-safe)
- [ ] Code coverage 80%+

### Security:
- [ ] Input validation (Zod schemas)
- [ ] SQL injection prevention (Prisma ORM)
- [ ] XSS prevention (Vue template escaping)
- [ ] CSRF protection (tokens)
- [ ] Rate limiting (Redis)
- [ ] Authentication (JWT)
- [ ] Authorization (RBAC + RLS)
- [ ] Sensitive data encrypted (AES-256)
- [ ] HTTPS enforced
- [ ] Security headers (CSP, HSTS, X-Frame-Options)

### Performance:
- [ ] Lighthouse score 90+ (Performance, Accessibility, Best Practices, SEO)
- [ ] Core Web Vitals pass (FCP < 1.2s, LCP < 2.5s, CLS < 0.1)
- [ ] API p95 < 200ms, p99 < 500ms
- [ ] Database queries optimized (indexes, no N+1)
- [ ] Images optimized (WebP, lazy loading)
- [ ] Bundle size < 200KB (gzipped)
- [ ] CDN configured

### Observability:
- [ ] Prometheus metrics implemented
- [ ] Grafana dashboard created
- [ ] Alerts configured (PagerDuty/Slack)
- [ ] Distributed tracing enabled (Jaeger)
- [ ] Structured logging (JSON)
- [ ] Health check endpoint (`/health`)

### Testing:
- [ ] Unit tests 15+ (80% coverage)
- [ ] Integration tests 12+
- [ ] E2E tests 10+
- [ ] Load tests 5 scenarios
- [ ] All tests passing ✅

### Documentation:
- [ ] README complete
- [ ] ARCHITECTURE documented
- [ ] API reference (OpenAPI)
- [ ] Deployment guide
- [ ] User guide

### Compliance:
- [ ] GDPR compliant (data portability, right to erasure)
- [ ] LGPD compliant (Brazil data protection)
- [ ] Terms of Service
- [ ] Privacy Policy
- [ ] Cookie Policy
- [ ] Industry-specific (HIPAA for Healthcare, PCI DSS for payments)

### Deployment:
- [ ] Docker image built
- [ ] Kubernetes manifests created
- [ ] CI/CD pipeline configured
- [ ] Environment variables documented
- [ ] Database migrations tested
- [ ] Rollback procedure documented

**ONLY when ALL checkboxes are ✅ can a Pétala be marked production-ready.**

---

## 🎯 IMPLEMENTATION ROADMAP

### Phase 1: Foundation (Week 1-4)
- [ ] Set up monorepo structure (`/petalas/*`)
- [ ] Create shared packages (`@magicsaas/metronic-core`, `@magicsaas/common`)
- [ ] Implement SolutionArchitect component (Sofia AI Layer 10)
- [ ] Create Pétala scaffold generator (CLI tool)

### Phase 2: First 3 Pétalas (Week 5-12)
- [ ] **Pétala Fashion** (Week 5-7)
- [ ] **Pétala Restaurant** (Week 8-10)
- [ ] **Pétala Healthcare** (Week 11-12)

### Phase 3: Next 5 Pétalas (Week 13-22)
- [ ] **Pétala Real Estate** (Week 13-14)
- [ ] **Pétala Education** (Week 15-16)
- [ ] **Pétala Fitness** (Week 17-18)
- [ ] **Pétala Legal** (Week 19-20)
- [ ] **Pétala Automotive** (Week 21-22)

### Phase 4: Final 5 Pétalas (Week 23-32)
- [ ] **Pétala Finance** (Week 23-24)
- [ ] **Pétala Travel** (Week 25-26)
- [ ] **Pétala Events** (Week 27-28)
- [ ] **Pétala Logistics** (Week 29-30)
- [ ] **Pétala Retail** (Week 31-32)

### Phase 5: Marketplace & Infrastructure (Week 33-36)
- [ ] Marketplace frontend (Week 33-34)
- [ ] Software Lotus landing page (Week 35)
- [ ] Production deployment (AWS EKS) (Week 36)

**Total Timeline:** 36 weeks (9 months) to 100% production-ready

**Parallelization:**
- 3 developers can build 3 Pétalas in parallel (Week 5-7)
- Sofia AI generates 60-70% boilerplate, developers customize 30-40%
- Reduces timeline to ~12-16 weeks with team

---

## 🏆 SUCCESS METRICS

### Development:
- **Time to Build:** 2-3 weeks per Pétala (with Sofia AI assistance)
- **Code Reuse:** 75%+ across Pétalas
- **Test Coverage:** 80%+ (all Pétalas)

### Performance:
- **API p95:** < 200ms
- **API p99:** < 500ms
- **Lighthouse:** 90+ (all categories)
- **Core Web Vitals:** All pass

### Business:
- **Pétalas Launched:** 13/13 (100%)
- **Production-Ready:** 13/13 (100%)
- **Customer Satisfaction:** 4.5+ stars
- **Uptime:** 99.95%+

---

## 📖 CONCLUSION

This document defines the **complete architecture** for all **13 Pétalas** to achieve **100% state-of-the-art production-ready status**.

**Every Pétala** will:
1. ✅ Follow standardized structure (consistency)
2. ✅ Integrate with Cognitive Mesh OS (all 11 layers)
3. ✅ Use Metronic framework (professional UX/UI)
4. ✅ Include comprehensive tests (unit, integration, E2E, load)
5. ✅ Have observability (metrics, dashboards, alerts, tracing)
6. ✅ Be fully documented (technical + user docs)
7. ✅ Pass production readiness checklist (security, performance, compliance)

**This is the blueprint for building a world-class multi-vertical SaaS ecosystem.**

---

**Document Version:** 1.0.0
**Last Updated:** 2025-11-06
**Status:** ✅ **APPROVED - READY FOR IMPLEMENTATION**
**Next Review:** After first 3 Pétalas in production (Q2 2026)
