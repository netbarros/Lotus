-- ═══════════════════════════════════════════════════════════════════════════
-- MAGICSAAS SYSTEM-∞ - BILLING & LOTUS CREDITS
-- Sofia AI v4.0 - Complete Billing System
-- ═══════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════════
-- CREDIT WALLETS
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS credit_wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL UNIQUE REFERENCES tenants(id) ON DELETE CASCADE,

    -- Balance
    balance DECIMAL(20, 8) NOT NULL DEFAULT 0 CHECK (balance >= 0),
    reserved DECIMAL(20, 8) NOT NULL DEFAULT 0 CHECK (reserved >= 0),
    currency VARCHAR(20) DEFAULT 'LOTUS_CREDITS',

    -- Lifetime stats
    lifetime_earned DECIMAL(20, 8) NOT NULL DEFAULT 0,
    lifetime_spent DECIMAL(20, 8) NOT NULL DEFAULT 0,

    -- Auto-recharge
    auto_recharge_enabled BOOLEAN DEFAULT FALSE,
    auto_recharge_threshold DECIMAL(20, 8),
    auto_recharge_amount DECIMAL(20, 8),
    last_recharge_at TIMESTAMP WITH TIME ZONE,

    -- Metadata
    metadata JSONB DEFAULT '{}'::JSONB,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_credit_wallets_tenant ON credit_wallets(tenant_id);
CREATE INDEX idx_credit_wallets_balance ON credit_wallets(balance);

-- ═══════════════════════════════════════════════════════════════════════════
-- CREDIT TRANSACTIONS
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS credit_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_id UUID NOT NULL REFERENCES credit_wallets(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    -- Amount
    amount DECIMAL(20, 8) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('credit', 'debit', 'refund', 'bonus', 'transfer')),

    -- Category
    category VARCHAR(100) NOT NULL,
    subcategory VARCHAR(100),

    -- Balance snapshot
    balance_before DECIMAL(20, 8) NOT NULL,
    balance_after DECIMAL(20, 8) NOT NULL,

    -- Reference
    reference_type VARCHAR(100),
    reference_id VARCHAR(255),
    description TEXT,

    -- Metadata
    metadata JSONB DEFAULT '{}'::JSONB,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_credit_trans_wallet ON credit_transactions(wallet_id);
CREATE INDEX idx_credit_trans_tenant ON credit_transactions(tenant_id);
CREATE INDEX idx_credit_trans_type ON credit_transactions(type);
CREATE INDEX idx_credit_trans_category ON credit_transactions(category);
CREATE INDEX idx_credit_trans_created ON credit_transactions(created_at DESC);

SELECT create_hypertable('credit_transactions', 'created_at', if_not_exists => TRUE);

-- ═══════════════════════════════════════════════════════════════════════════
-- USAGE RECORDS
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS usage_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,

    -- Service
    service_type VARCHAR(100) NOT NULL,
    service_provider VARCHAR(100),

    -- Usage
    quantity DECIMAL(20, 4) NOT NULL,
    unit VARCHAR(50) NOT NULL,

    -- Cost
    cost_credits DECIMAL(20, 8) NOT NULL DEFAULT 0,
    cost_usd DECIMAL(20, 4),

    -- Reference
    reference_type VARCHAR(100),
    reference_id VARCHAR(255),

    -- Metadata
    metadata JSONB DEFAULT '{}'::JSONB,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_usage_tenant ON usage_records(tenant_id);
CREATE INDEX idx_usage_user ON usage_records(user_id);
CREATE INDEX idx_usage_service ON usage_records(service_type);
CREATE INDEX idx_usage_created ON usage_records(created_at DESC);

SELECT create_hypertable('usage_records', 'created_at', if_not_exists => TRUE);

-- ═══════════════════════════════════════════════════════════════════════════
-- SUBSCRIPTIONS
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE RESTRICT,

    -- Status
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN (
        'trial', 'active', 'past_due', 'cancelled', 'expired', 'paused'
    )),

    -- Billing cycle
    billing_cycle VARCHAR(20) NOT NULL CHECK (billing_cycle IN ('monthly', 'annual')),
    current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,

    -- Pricing
    price_usd DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    discount_percent DECIMAL(5, 2) DEFAULT 0,

    -- Payment
    payment_method_id VARCHAR(255),
    next_billing_date TIMESTAMP WITH TIME ZONE,

    -- Trial
    trial_start TIMESTAMP WITH TIME ZONE,
    trial_end TIMESTAMP WITH TIME ZONE,

    -- Cancellation
    cancel_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    cancellation_reason TEXT,

    -- Metadata
    metadata JSONB DEFAULT '{}'::JSONB,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_tenant ON subscriptions(tenant_id);
CREATE INDEX idx_subscriptions_plan ON subscriptions(plan_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_billing ON subscriptions(next_billing_date);

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ═══════════════════════════════════════════════════════════════════════════
-- INVOICES
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,

    -- Invoice number
    invoice_number VARCHAR(100) UNIQUE NOT NULL,

    -- Status
    status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN (
        'draft', 'open', 'paid', 'void', 'uncollectible'
    )),

    -- Amounts
    subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0,
    tax_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    discount_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    total DECIMAL(10, 2) NOT NULL DEFAULT 0,
    amount_paid DECIMAL(10, 2) NOT NULL DEFAULT 0,
    amount_due DECIMAL(10, 2) NOT NULL DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'USD',

    -- Dates
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    paid_at TIMESTAMP WITH TIME ZONE,

    -- Line items
    line_items JSONB DEFAULT '[]'::JSONB,

    -- Billing details
    billing_email VARCHAR(255),
    billing_address JSONB,

    -- Payment
    payment_method VARCHAR(100),
    payment_reference VARCHAR(255),

    -- PDF
    pdf_url TEXT,

    -- Metadata
    metadata JSONB DEFAULT '{}'::JSONB,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_invoices_tenant ON invoices(tenant_id);
CREATE INDEX idx_invoices_subscription ON invoices(subscription_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);
CREATE INDEX idx_invoices_number ON invoices(invoice_number);

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ═══════════════════════════════════════════════════════════════════════════
-- PAYMENT METHODS
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS payment_methods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    -- Type
    type VARCHAR(50) NOT NULL CHECK (type IN (
        'credit_card', 'pix', 'boleto', 'crypto', 'bank_transfer'
    )),

    -- Provider
    provider VARCHAR(100) NOT NULL,
    provider_payment_method_id VARCHAR(255),

    -- Card details (encrypted or tokenized)
    card_brand VARCHAR(50),
    card_last4 VARCHAR(4),
    card_exp_month INTEGER,
    card_exp_year INTEGER,

    -- PIX details
    pix_key VARCHAR(255),
    pix_key_type VARCHAR(50),

    -- Crypto details
    crypto_currency VARCHAR(20),
    crypto_address VARCHAR(255),

    -- Default
    is_default BOOLEAN DEFAULT FALSE,

    -- Status
    is_active BOOLEAN DEFAULT TRUE,

    -- Metadata
    metadata JSONB DEFAULT '{}'::JSONB,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_payment_methods_tenant ON payment_methods(tenant_id);
CREATE INDEX idx_payment_methods_type ON payment_methods(type);
CREATE INDEX idx_payment_methods_default ON payment_methods(tenant_id, is_default);

CREATE TRIGGER update_payment_methods_updated_at BEFORE UPDATE ON payment_methods
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ═══════════════════════════════════════════════════════════════════════════
-- COUPONS & DISCOUNTS
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(100) UNIQUE NOT NULL,

    -- Type
    discount_type VARCHAR(50) NOT NULL CHECK (discount_type IN (
        'percentage', 'fixed_amount', 'free_credits', 'free_trial_extension'
    )),
    discount_value DECIMAL(10, 2) NOT NULL,

    -- Constraints
    minimum_amount DECIMAL(10, 2),
    maximum_discount DECIMAL(10, 2),

    -- Usage limits
    usage_limit INTEGER,
    usage_limit_per_tenant INTEGER,
    usage_count INTEGER DEFAULT 0,

    -- Validity
    valid_from TIMESTAMP WITH TIME ZONE,
    valid_until TIMESTAMP WITH TIME ZONE,

    -- Applies to
    applies_to VARCHAR(50) DEFAULT 'all' CHECK (applies_to IN (
        'all', 'specific_plans', 'new_customers', 'renewals'
    )),
    plan_ids JSONB,

    -- Status
    is_active BOOLEAN DEFAULT TRUE,

    -- Metadata
    metadata JSONB DEFAULT '{}'::JSONB,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_coupons_code ON coupons(code);
CREATE INDEX idx_coupons_active ON coupons(is_active);
CREATE INDEX idx_coupons_validity ON coupons(valid_from, valid_until);

CREATE TRIGGER update_coupons_updated_at BEFORE UPDATE ON coupons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Success message
DO $$
BEGIN
    RAISE NOTICE '═══════════════════════════════════════════════════════';
    RAISE NOTICE 'Billing & Lotus Credits Tables - Created Successfully';
    RAISE NOTICE '═══════════════════════════════════════════════════════';
    RAISE NOTICE '';
    RAISE NOTICE '✅ credit_wallets     - Lotus Credits balance';
    RAISE NOTICE '✅ credit_transactions - Credit movements';
    RAISE NOTICE '✅ usage_records      - Service usage tracking';
    RAISE NOTICE '✅ subscriptions      - Plan subscriptions';
    RAISE NOTICE '✅ invoices           - Billing invoices';
    RAISE NOTICE '✅ payment_methods    - Payment options';
    RAISE NOTICE '✅ coupons            - Discounts & promotions';
    RAISE NOTICE '';
    RAISE NOTICE 'TimescaleDB hypertables for transactions & usage';
    RAISE NOTICE '═══════════════════════════════════════════════════════';
END $$;
