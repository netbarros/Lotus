-- ═══════════════════════════════════════════════════════════════════════════
-- MAGICSAAS SYSTEM-∞ - CORE TABLES
-- Sofia AI v4.0 - The Brain - Complete Schema
-- ═══════════════════════════════════════════════════════════════════════════
--
-- Core tables for multi-tenancy, authentication, and system management
-- Supports all 13 Pétalas + 50 Micro-Pétalas
--
-- ═══════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════════
-- PLANS & PRICING
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    tier VARCHAR(50) NOT NULL CHECK (tier IN ('free', 'starter', 'professional', 'enterprise', 'quantum')),

    -- Pricing
    monthly_price_usd DECIMAL(10, 2) NOT NULL DEFAULT 0,
    annual_price_usd DECIMAL(10, 2) NOT NULL DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'USD',

    -- Limits
    max_users INTEGER NOT NULL DEFAULT 10,
    max_storage_gb INTEGER NOT NULL DEFAULT 10,
    max_api_calls_monthly BIGINT NOT NULL DEFAULT 100000,
    max_ai_tokens_monthly BIGINT NOT NULL DEFAULT 1000000,
    max_voice_minutes_monthly INTEGER NOT NULL DEFAULT 1000,
    max_edge_requests_monthly BIGINT NOT NULL DEFAULT 10000000,

    -- Features (JSONB for flexibility)
    features JSONB DEFAULT '[]'::JSONB,
    petals_included JSONB DEFAULT '[]'::JSONB,
    micro_petals_included JSONB DEFAULT '[]'::JSONB,

    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,

    -- Metadata
    metadata JSONB DEFAULT '{}'::JSONB,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_plans_tier ON plans(tier);
CREATE INDEX idx_plans_active ON plans(is_active);
CREATE INDEX idx_plans_features ON plans USING GIN(features);

-- ═══════════════════════════════════════════════════════════════════════════
-- TENANTS (Multi-tenancy)
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(200) UNIQUE NOT NULL,
    domain VARCHAR(255),

    -- Plan
    plan_id UUID REFERENCES plans(id) ON DELETE RESTRICT,

    -- Status
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('trial', 'active', 'suspended', 'cancelled', 'churned')),
    trial_ends_at TIMESTAMP WITH TIME ZONE,

    -- Branding
    branding JSONB DEFAULT '{}'::JSONB,
    logo_url TEXT,
    primary_color VARCHAR(7),
    secondary_color VARCHAR(7),
    custom_css TEXT,

    -- Configuration
    features JSONB DEFAULT '[]'::JSONB,
    settings JSONB DEFAULT '{}'::JSONB,
    limits JSONB DEFAULT '{}'::JSONB,

    -- Contact
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    contact_name VARCHAR(200),

    -- Billing
    billing_email VARCHAR(255),
    billing_address JSONB,
    tax_id VARCHAR(100),

    -- Usage tracking
    usage_current_period JSONB DEFAULT '{}'::JSONB,
    usage_last_reset_at TIMESTAMP WITH TIME ZONE,

    -- Metadata
    metadata JSONB DEFAULT '{}'::JSONB,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_tenants_slug ON tenants(slug);
CREATE INDEX idx_tenants_domain ON tenants(domain);
CREATE INDEX idx_tenants_status ON tenants(status);
CREATE INDEX idx_tenants_plan ON tenants(plan_id);
CREATE INDEX idx_tenants_active ON tenants(status) WHERE deleted_at IS NULL;

-- ═══════════════════════════════════════════════════════════════════════════
-- USERS & AUTHENTICATION
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    description TEXT,
    permissions JSONB DEFAULT '[]'::JSONB,
    is_system BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (tenant_id, slug)
);

CREATE INDEX idx_roles_tenant ON roles(tenant_id);
CREATE INDEX idx_roles_system ON roles(is_system);

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    -- Authentication
    email VARCHAR(255) NOT NULL,
    email_verified BOOLEAN DEFAULT FALSE,
    email_verified_at TIMESTAMP WITH TIME ZONE,
    password_hash TEXT,

    -- Profile
    full_name VARCHAR(200),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    avatar_url TEXT,
    phone VARCHAR(50),

    -- Role & Permissions
    role_id UUID REFERENCES roles(id) ON DELETE SET NULL,
    permissions JSONB DEFAULT '[]'::JSONB,

    -- Two-Factor Authentication
    twofa_enabled BOOLEAN DEFAULT FALSE,
    twofa_secret TEXT,
    twofa_backup_codes JSONB,

    -- Login tracking
    last_login_at TIMESTAMP WITH TIME ZONE,
    last_login_ip INET,
    login_count INTEGER DEFAULT 0,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE,

    -- Preferences
    language VARCHAR(10) DEFAULT 'en',
    timezone VARCHAR(50) DEFAULT 'UTC',
    preferences JSONB DEFAULT '{}'::JSONB,

    -- Status
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'deleted')),

    -- Metadata
    metadata JSONB DEFAULT '{}'::JSONB,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,

    UNIQUE (tenant_id, email)
);

CREATE INDEX idx_users_tenant ON users(tenant_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role_id);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_active ON users(tenant_id, status) WHERE deleted_at IS NULL;

-- ═══════════════════════════════════════════════════════════════════════════
-- SESSIONS
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    -- Token
    access_token TEXT NOT NULL UNIQUE,
    refresh_token TEXT UNIQUE,

    -- Session data
    ip_address INET,
    user_agent TEXT,
    device_info JSONB,

    -- Expiration
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    refresh_expires_at TIMESTAMP WITH TIME ZONE,

    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_sessions_tenant ON sessions(tenant_id);
CREATE INDEX idx_sessions_access_token ON sessions(access_token);
CREATE INDEX idx_sessions_active ON sessions(is_active, expires_at);

-- ═══════════════════════════════════════════════════════════════════════════
-- AUDIT LOG
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,

    -- Action
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    resource_id VARCHAR(255),

    -- Changes
    changes JSONB,
    old_values JSONB,
    new_values JSONB,

    -- Context
    ip_address INET,
    user_agent TEXT,

    -- Status
    status VARCHAR(50) DEFAULT 'success' CHECK (status IN ('success', 'failure', 'error')),
    error_message TEXT,

    -- Metadata
    metadata JSONB DEFAULT '{}'::JSONB,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_audit_tenant ON audit_logs(tenant_id);
CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at DESC);

-- Convert to hypertable for time-series optimization
SELECT create_hypertable('audit_logs', 'created_at', if_not_exists => TRUE);

-- ═══════════════════════════════════════════════════════════════════════════
-- UPDATED_AT TRIGGER FUNCTION
-- ═══════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_plans_updated_at BEFORE UPDATE ON plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON roles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ═══════════════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS)
-- ═══════════════════════════════════════════════════════════════════════════

-- Enable RLS
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Policies will be created per tenant context
-- This is a placeholder - actual policies depend on application logic

-- Success message
DO $$
BEGIN
    RAISE NOTICE '═══════════════════════════════════════════════════════';
    RAISE NOTICE 'MagicSaaS Core Tables - Created Successfully';
    RAISE NOTICE '═══════════════════════════════════════════════════════';
    RAISE NOTICE '';
    RAISE NOTICE '✅ plans         - Pricing & features';
    RAISE NOTICE '✅ tenants       - Multi-tenancy';
    RAISE NOTICE '✅ roles         - RBAC';
    RAISE NOTICE '✅ users         - Authentication';
    RAISE NOTICE '✅ sessions      - JWT tokens';
    RAISE NOTICE '✅ audit_logs    - Complete audit trail';
    RAISE NOTICE '';
    RAISE NOTICE 'RLS enabled for data isolation';
    RAISE NOTICE 'TimescaleDB hypertable for audit_logs';
    RAISE NOTICE '═══════════════════════════════════════════════════════';
END $$;
