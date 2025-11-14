-- ═══════════════════════════════════════════════════════════════════════════
-- MAGICSAAS SYSTEM-∞ - ALL 13 PÉTALAS UNIVERSAL TABLES
-- Complete Schema for All Vertical Solutions
-- Sofia AI v4.0 Integrated - The Brain Present in Every Dimension
-- ═══════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════════
-- UNIVERSAL CUSTOMERS TABLE - Shared Across All Pétalas
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS petala_customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    petala_id UUID NOT NULL REFERENCES petalas_registry(id) ON DELETE CASCADE,

    -- Customer Type (varies by pétala)
    customer_type VARCHAR(50) NOT NULL CHECK (customer_type IN (
        'individual', 'business', 'patient', 'student', 'member',
        'guest', 'client', 'subscriber', 'attendee', 'tenant'
    )),

    -- Basic Information
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    full_name VARCHAR(200) GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED,

    -- Business (optional)
    company_name VARCHAR(200),

    -- Identification
    document_type VARCHAR(50), -- CPF, CNPJ, Passport, etc.
    document_number VARCHAR(50),

    -- Contact
    email VARCHAR(255),
    phone VARCHAR(50) NOT NULL,
    mobile VARCHAR(50),

    -- Address
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(50),
    zip_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'Brasil',

    -- Preferences
    preferences JSONB DEFAULT '{}'::JSONB,
    tags TEXT[],

    -- Sofia AI Integration
    ai_customer_score DECIMAL(5, 4) CHECK (ai_customer_score BETWEEN 0 AND 1),
    ai_lifetime_value_prediction DECIMAL(12, 2),
    ai_churn_risk DECIMAL(5, 4) CHECK (ai_churn_risk BETWEEN 0 AND 1),
    ai_segment VARCHAR(100),
    ai_insights JSONB DEFAULT '{}'::JSONB,
    ai_last_analysis TIMESTAMP WITH TIME ZONE,

    -- Statistics
    total_orders INTEGER DEFAULT 0,
    total_spent DECIMAL(12, 2) DEFAULT 0,
    last_purchase_date TIMESTAMP WITH TIME ZONE,
    first_purchase_date TIMESTAMP WITH TIME ZONE,

    -- Status
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'blocked', 'vip')),

    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_petala_customers_tenant ON petala_customers(tenant_id);
CREATE INDEX idx_petala_customers_petala ON petala_customers(petala_id);
CREATE INDEX idx_petala_customers_email ON petala_customers(email) WHERE email IS NOT NULL;
CREATE INDEX idx_petala_customers_document ON petala_customers(document_number) WHERE document_number IS NOT NULL;
CREATE INDEX idx_petala_customers_status ON petala_customers(status);
CREATE INDEX idx_petala_customers_ai_score ON petala_customers(ai_customer_score) WHERE ai_customer_score IS NOT NULL;

ALTER TABLE petala_customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY petala_customers_tenant_isolation ON petala_customers
    FOR ALL USING (tenant_id = current_setting('app.current_tenant_id', TRUE)::UUID);

-- ═══════════════════════════════════════════════════════════════════════════
-- UNIVERSAL PRODUCTS/SERVICES TABLE - Shared Across All Pétalas
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS petala_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    petala_id UUID NOT NULL REFERENCES petalas_registry(id) ON DELETE CASCADE,

    -- Product Type
    product_type VARCHAR(50) NOT NULL CHECK (product_type IN (
        'physical_product', 'digital_product', 'service', 'course',
        'membership', 'appointment', 'rental', 'event_ticket', 'booking'
    )),

    -- Basic Information
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(200),
    description TEXT,
    short_description VARCHAR(500),

    -- SKU & Identifiers
    sku VARCHAR(100),
    barcode VARCHAR(100),

    -- Pricing
    base_price DECIMAL(10, 2) NOT NULL,
    sale_price DECIMAL(10, 2),
    cost_price DECIMAL(10, 2),
    currency VARCHAR(10) DEFAULT 'BRL',

    -- Inventory (for physical products)
    track_inventory BOOLEAN DEFAULT FALSE,
    stock_quantity INTEGER DEFAULT 0,
    low_stock_threshold INTEGER,

    -- Attributes (flexible)
    attributes JSONB DEFAULT '{}'::JSONB, -- {size, color, duration, capacity, etc.}

    -- Media
    images JSONB DEFAULT '[]'::JSONB, -- [{url, alt, order}]
    videos JSONB DEFAULT '[]'::JSONB,

    -- SEO
    meta_title VARCHAR(200),
    meta_description VARCHAR(500),
    meta_keywords TEXT[],

    -- Sofia AI Integration
    ai_demand_forecast INTEGER,
    ai_optimal_price DECIMAL(10, 2),
    ai_recommended_products UUID[],
    ai_performance_score DECIMAL(5, 4),
    ai_insights JSONB DEFAULT '{}'::JSONB,

    -- Statistics
    total_sales INTEGER DEFAULT 0,
    total_revenue DECIMAL(12, 2) DEFAULT 0,
    average_rating DECIMAL(3, 2) DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,

    -- Status
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'out_of_stock', 'discontinued')),
    is_featured BOOLEAN DEFAULT FALSE,

    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_petala_products_tenant ON petala_products(tenant_id);
CREATE INDEX idx_petala_products_petala ON petala_products(petala_id);
CREATE INDEX idx_petala_products_sku ON petala_products(sku) WHERE sku IS NOT NULL;
CREATE INDEX idx_petala_products_status ON petala_products(status);
CREATE INDEX idx_petala_products_type ON petala_products(product_type);
CREATE INDEX idx_petala_products_featured ON petala_products(is_featured) WHERE is_featured = TRUE;

ALTER TABLE petala_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY petala_products_tenant_isolation ON petala_products
    FOR ALL USING (tenant_id = current_setting('app.current_tenant_id', TRUE)::UUID);

-- ═══════════════════════════════════════════════════════════════════════════
-- UNIVERSAL ORDERS/BOOKINGS TABLE - Shared Across All Pétalas
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS petala_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    petala_id UUID NOT NULL REFERENCES petalas_registry(id) ON DELETE CASCADE,

    -- Order Type
    order_type VARCHAR(50) NOT NULL CHECK (order_type IN (
        'sale', 'booking', 'reservation', 'appointment', 'subscription',
        'rental', 'enrollment', 'registration', 'ticket'
    )),

    -- Customer
    customer_id UUID NOT NULL REFERENCES petala_customers(id) ON DELETE CASCADE,

    -- Order Number
    order_number VARCHAR(50) NOT NULL UNIQUE,

    -- Items (flexible JSONB)
    items JSONB NOT NULL, -- [{product_id, name, quantity, price, subtotal, attributes}]

    -- Totals
    subtotal DECIMAL(12, 2) NOT NULL,
    discount_amount DECIMAL(12, 2) DEFAULT 0,
    tax_amount DECIMAL(12, 2) DEFAULT 0,
    shipping_amount DECIMAL(12, 2) DEFAULT 0,
    total_amount DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'BRL',

    -- Payment
    payment_method VARCHAR(50),
    payment_status VARCHAR(50) DEFAULT 'pending' CHECK (payment_status IN (
        'pending', 'processing', 'paid', 'failed', 'refunded', 'partially_refunded'
    )),
    paid_at TIMESTAMP WITH TIME ZONE,
    payment_details JSONB DEFAULT '{}'::JSONB,

    -- Fulfillment/Service Delivery
    fulfillment_status VARCHAR(50) DEFAULT 'pending' CHECK (fulfillment_status IN (
        'pending', 'processing', 'ready', 'in_transit', 'delivered',
        'completed', 'cancelled', 'failed'
    )),
    scheduled_date TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,

    -- Shipping (for physical products)
    shipping_address JSONB DEFAULT '{}'::JSONB,
    tracking_number VARCHAR(100),

    -- Notes
    customer_notes TEXT,
    internal_notes TEXT,

    -- Sofia AI Integration
    ai_fraud_score DECIMAL(5, 4) CHECK (ai_fraud_score BETWEEN 0 AND 1),
    ai_priority_score DECIMAL(5, 4),
    ai_estimated_delivery TIMESTAMP WITH TIME ZONE,
    ai_recommendations JSONB DEFAULT '[]'::JSONB,

    -- Status
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN (
        'pending', 'confirmed', 'processing', 'completed', 'cancelled', 'refunded'
    )),

    -- Cancellation
    cancelled_at TIMESTAMP WITH TIME ZONE,
    cancellation_reason TEXT,

    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_petala_orders_tenant ON petala_orders(tenant_id);
CREATE INDEX idx_petala_orders_petala ON petala_orders(petala_id);
CREATE INDEX idx_petala_orders_customer ON petala_orders(customer_id);
CREATE INDEX idx_petala_orders_number ON petala_orders(order_number);
CREATE INDEX idx_petala_orders_status ON petala_orders(status);
CREATE INDEX idx_petala_orders_payment_status ON petala_orders(payment_status);
CREATE INDEX idx_petala_orders_date ON petala_orders(created_at);

ALTER TABLE petala_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY petala_orders_tenant_isolation ON petala_orders
    FOR ALL USING (tenant_id = current_setting('app.current_tenant_id', TRUE)::UUID);

-- ═══════════════════════════════════════════════════════════════════════════
-- UNIVERSAL APPOINTMENTS/BOOKINGS TABLE - For Service-Based Pétalas
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS petala_appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    petala_id UUID NOT NULL REFERENCES petalas_registry(id) ON DELETE CASCADE,

    -- Customer
    customer_id UUID NOT NULL REFERENCES petala_customers(id) ON DELETE CASCADE,

    -- Service Provider (could be staff, professional, resource)
    provider_type VARCHAR(50), -- 'staff', 'professional', 'resource', 'room', 'equipment'
    provider_id UUID, -- Reference to provider in specific pétala tables
    provider_name VARCHAR(200),

    -- Service/Product
    service_id UUID REFERENCES petala_products(id) ON DELETE SET NULL,
    service_name VARCHAR(200) NOT NULL,

    -- Scheduling
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    duration_minutes INTEGER NOT NULL DEFAULT 60,
    end_time TIME GENERATED ALWAYS AS (appointment_time + (duration_minutes || ' minutes')::INTERVAL) STORED,

    -- Details
    notes TEXT,
    customer_notes TEXT,
    internal_notes TEXT,

    -- Pricing
    price DECIMAL(10, 2),
    paid_amount DECIMAL(10, 2) DEFAULT 0,
    payment_status VARCHAR(50) DEFAULT 'pending',

    -- Check-in/Check-out
    checked_in_at TIMESTAMP WITH TIME ZONE,
    checked_out_at TIMESTAMP WITH TIME ZONE,
    actual_duration_minutes INTEGER,

    -- Sofia AI Integration
    ai_optimal_time TIMESTAMP WITH TIME ZONE,
    ai_resource_optimization JSONB DEFAULT '{}'::JSONB,
    ai_no_show_risk DECIMAL(5, 4),

    -- Status
    status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN (
        'scheduled', 'confirmed', 'in_progress', 'completed',
        'cancelled', 'no_show', 'rescheduled'
    )),

    -- Reminders
    reminder_sent_at TIMESTAMP WITH TIME ZONE,
    confirmation_sent_at TIMESTAMP WITH TIME ZONE,

    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_petala_appointments_tenant ON petala_appointments(tenant_id);
CREATE INDEX idx_petala_appointments_petala ON petala_appointments(petala_id);
CREATE INDEX idx_petala_appointments_customer ON petala_appointments(customer_id);
CREATE INDEX idx_petala_appointments_date ON petala_appointments(appointment_date);
CREATE INDEX idx_petala_appointments_datetime ON petala_appointments(appointment_date, appointment_time);
CREATE INDEX idx_petala_appointments_status ON petala_appointments(status);

ALTER TABLE petala_appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY petala_appointments_tenant_isolation ON petala_appointments
    FOR ALL USING (tenant_id = current_setting('app.current_tenant_id', TRUE)::UUID);

-- ═══════════════════════════════════════════════════════════════════════════
-- UNIVERSAL REVIEWS/RATINGS TABLE - Shared Across All Pétalas
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS petala_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    petala_id UUID NOT NULL REFERENCES petalas_registry(id) ON DELETE CASCADE,

    -- Review Target
    target_type VARCHAR(50) NOT NULL, -- 'product', 'service', 'provider', 'facility', 'order'
    target_id UUID NOT NULL,

    -- Reviewer
    customer_id UUID REFERENCES petala_customers(id) ON DELETE SET NULL,
    reviewer_name VARCHAR(200),
    reviewer_email VARCHAR(255),

    -- Rating & Review
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    title VARCHAR(200),
    review_text TEXT,

    -- Media
    images JSONB DEFAULT '[]'::JSONB,
    videos JSONB DEFAULT '[]'::JSONB,

    -- Verification
    is_verified_purchase BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMP WITH TIME ZONE,

    -- Response
    response_text TEXT,
    responded_at TIMESTAMP WITH TIME ZONE,
    responded_by UUID REFERENCES users(id) ON DELETE SET NULL,

    -- Sofia AI Integration
    ai_sentiment_score DECIMAL(5, 4), -- -1 to 1
    ai_sentiment_label VARCHAR(50), -- 'positive', 'neutral', 'negative'
    ai_key_topics TEXT[],
    ai_suggestions TEXT,

    -- Moderation
    moderation_status VARCHAR(50) DEFAULT 'pending' CHECK (moderation_status IN (
        'pending', 'approved', 'rejected', 'flagged'
    )),
    moderated_at TIMESTAMP WITH TIME ZONE,
    moderated_by UUID REFERENCES users(id) ON DELETE SET NULL,

    -- Helpfulness
    helpful_count INTEGER DEFAULT 0,
    not_helpful_count INTEGER DEFAULT 0,

    -- Status
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'hidden', 'deleted')),

    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_petala_reviews_tenant ON petala_reviews(tenant_id);
CREATE INDEX idx_petala_reviews_petala ON petala_reviews(petala_id);
CREATE INDEX idx_petala_reviews_target ON petala_reviews(target_type, target_id);
CREATE INDEX idx_petala_reviews_customer ON petala_reviews(customer_id);
CREATE INDEX idx_petala_reviews_rating ON petala_reviews(rating);
CREATE INDEX idx_petala_reviews_status ON petala_reviews(status);

ALTER TABLE petala_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY petala_reviews_tenant_isolation ON petala_reviews
    FOR ALL USING (tenant_id = current_setting('app.current_tenant_id', TRUE)::UUID);

-- ═══════════════════════════════════════════════════════════════════════════
-- TIMESCALEDB HYPERTABLES for Analytics
-- ═══════════════════════════════════════════════════════════════════════════

SELECT create_hypertable(
    'petala_orders',
    'created_at',
    chunk_time_interval => INTERVAL '1 month',
    if_not_exists => TRUE
);

SELECT create_hypertable(
    'petala_appointments',
    'appointment_date',
    chunk_time_interval => INTERVAL '1 month',
    if_not_exists => TRUE
);

-- ═══════════════════════════════════════════════════════════════════════════
-- COMMENTS for Documentation
-- ═══════════════════════════════════════════════════════════════════════════

COMMENT ON TABLE petala_customers IS 'Universal customers table for all 13 pétalas. Sofia AI tracks customer score, LTV, churn risk, and segmentation.';
COMMENT ON TABLE petala_products IS 'Universal products/services table for all pétalas. Supports physical products, digital products, services, courses, memberships, and more. Sofia AI provides demand forecasting and optimal pricing.';
COMMENT ON TABLE petala_orders IS 'Universal orders/bookings table for all pétalas. Handles sales, bookings, reservations, appointments, subscriptions. Sofia AI detects fraud and optimizes delivery.';
COMMENT ON TABLE petala_appointments IS 'Universal appointments/bookings table for service-based pétalas (Healthcare, Beauty, Fitness, Legal, etc.). Sofia AI optimizes scheduling and predicts no-shows.';
COMMENT ON TABLE petala_reviews IS 'Universal reviews and ratings for products, services, providers across all pétalas. Sofia AI analyzes sentiment and extracts key topics.';

-- ═══════════════════════════════════════════════════════════════════════════
-- SUCCESS MESSAGE
-- ═══════════════════════════════════════════════════════════════════════════

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '╔══════════════════════════════════════════════════════════════════════════╗';
    RAISE NOTICE '║                                                                          ║';
    RAISE NOTICE '║  ✅ ALL 13 PÉTALAS UNIVERSAL TABLES CREATED!                            ║';
    RAISE NOTICE '║                                                                          ║';
    RAISE NOTICE '║  🌸 Complete System for All Verticals:                                  ║';
    RAISE NOTICE '║     • petala_customers: Universal customer management                   ║';
    RAISE NOTICE '║     • petala_products: Products/services for all pétalas                ║';
    RAISE NOTICE '║     • petala_orders: Orders/bookings/reservations                       ║';
    RAISE NOTICE '║     • petala_appointments: Scheduling for services                      ║';
    RAISE NOTICE '║     • petala_reviews: Ratings & feedback                                ║';
    RAISE NOTICE '║                                                                          ║';
    RAISE NOTICE '║  🧠 Sofia AI v4.0 Integration:                                          ║';
    RAISE NOTICE '║     ✓ Customer: Score, LTV, Churn Risk, Segmentation                    ║';
    RAISE NOTICE '║     ✓ Products: Demand Forecast, Optimal Pricing                        ║';
    RAISE NOTICE '║     ✓ Orders: Fraud Detection, Delivery Optimization                    ║';
    RAISE NOTICE '║     ✓ Appointments: Schedule Optimization, No-show Prediction           ║';
    RAISE NOTICE '║     ✓ Reviews: Sentiment Analysis, Topic Extraction                     ║';
    RAISE NOTICE '║                                                                          ║';
    RAISE NOTICE '║  📊 TimescaleDB: Hypertables for time-series analytics                  ║';
    RAISE NOTICE '║  🔒 RLS: Complete multi-tenancy isolation                               ║';
    RAISE NOTICE '║                                                                          ║';
    RAISE NOTICE '║  Ready for ALL 13 Pétalas! 🚀                                           ║';
    RAISE NOTICE '║                                                                          ║';
    RAISE NOTICE '╚══════════════════════════════════════════════════════════════════════════╝';
    RAISE NOTICE '';
END $$;
