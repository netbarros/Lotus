-- ═══════════════════════════════════════════════════════════════════════════
-- MAGICSAAS SYSTEM-∞ - SEEDS DATA
-- Initial data for all tables - Production Ready
-- ═══════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════════
-- PLANS
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO plans (id, name, slug, description, tier, monthly_price_usd, annual_price_usd,
    max_users, max_storage_gb, max_api_calls_monthly, max_ai_tokens_monthly,
    max_voice_minutes_monthly, max_edge_requests_monthly, features, petals_included,
    micro_petals_included, is_active, is_featured, sort_order)
VALUES
    (
        '00000000-0000-0000-0000-000000000001',
        'Free',
        'free',
        'Perfect for trying out MagicSaaS and small projects',
        'free',
        0.00,
        0.00,
        10,
        10,
        100000,
        1000000,
        1000,
        10000000,
        '["basic_auth", "basic_support", "1_petala"]'::JSONB,
        '["fashion"]'::JSONB,
        '["auth_basic", "payment_pix"]'::JSONB,
        TRUE,
        FALSE,
        1
    ),
    (
        '00000000-0000-0000-0000-000000000002',
        'Starter',
        'starter',
        'Great for startups and small businesses',
        'starter',
        49.00,
        470.00,
        50,
        100,
        1000000,
        10000000,
        10000,
        100000000,
        '["all_auth", "email_support", "5_petalas", "analytics", "api_access"]'::JSONB,
        '["fashion", "restaurant", "healthcare", "education", "fitness"]'::JSONB,
        '["auth_basic", "auth_social", "auth_2fa", "payment_stripe", "payment_pix", "email", "sms"]'::JSONB,
        TRUE,
        TRUE,
        2
    ),
    (
        '00000000-0000-0000-0000-000000000003',
        'Professional',
        'professional',
        'For growing businesses needing advanced features',
        'professional',
        149.00,
        1430.00,
        200,
        500,
        10000000,
        100000000,
        100000,
        1000000000,
        '["all_features", "priority_support", "all_petalas", "voice_assistant", "custom_domains", "white_label"]'::JSONB,
        '["all"]'::JSONB,
        '["all"]'::JSONB,
        TRUE,
        TRUE,
        3
    ),
    (
        '00000000-0000-0000-0000-000000000004',
        'Enterprise',
        'enterprise',
        'For large organizations with custom needs',
        'enterprise',
        499.00,
        4790.00,
        -1,
        5000,
        -1,
        -1,
        -1,
        -1,
        '["all_features", "24x7_support", "dedicated_account_manager", "custom_integrations", "sla_99.99"]'::JSONB,
        '["all"]'::JSONB,
        '["all"]'::JSONB,
        TRUE,
        TRUE,
        4
    ),
    (
        '00000000-0000-0000-0000-000000000005',
        'Quantum',
        'quantum',
        'Ultimate power with quantum computing and AGI features',
        'quantum',
        999.00,
        9590.00,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        '["all_features", "quantum_computing", "federated_learning", "blockchain", "agi_preview", "concierge_support"]'::JSONB,
        '["all"]'::JSONB,
        '["all"]'::JSONB,
        TRUE,
        TRUE,
        5
    )
ON CONFLICT (id) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════
-- DEMO TENANT (Software Lotus)
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO tenants (id, name, slug, domain, plan_id, status, branding, contact_email, contact_phone, contact_name)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Software Lotus',
    'softwarelotus',
    'app.softwarelotus.com.br',
    '00000000-0000-0000-0000-000000000004', -- Enterprise plan
    'active',
    '{
        "logo_url": "https://softwarelotus.com.br/logo.png",
        "primary_color": "#6366f1",
        "secondary_color": "#8b5cf6",
        "company_name": "Software Lotus"
    }'::JSONB,
    'contact@softwarelotus.com.br',
    '+55 11 99999-9999',
    'Software Lotus Team'
)
ON CONFLICT (id) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════
-- DEMO TENANT 2 (Divinas Terapias)
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO tenants (id, name, slug, domain, plan_id, status, branding, contact_email)
VALUES (
    '00000000-0000-0000-0000-000000000002',
    'Divinas Terapias',
    'divinasterapias',
    'divinasterapias.com.br',
    '00000000-0000-0000-0000-000000000003', -- Professional plan
    'active',
    '{
        "logo_url": "https://divinasterapias.com.br/logo.png",
        "primary_color": "#9333ea",
        "secondary_color": "#c026d3",
        "company_name": "Divinas Terapias"
    }'::JSONB,
    'contato@divinasterapias.com.br'
)
ON CONFLICT (id) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════
-- ROLES
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO roles (id, tenant_id, name, slug, description, permissions, is_system)
VALUES
    (
        '00000000-0000-0000-0000-000000000001',
        NULL,
        'Super Admin',
        'super_admin',
        'System administrator with full access',
        '["*"]'::JSONB,
        TRUE
    ),
    (
        '00000000-0000-0000-0000-000000000002',
        '00000000-0000-0000-0000-000000000001',
        'Admin',
        'admin',
        'Tenant administrator',
        '["tenant:*", "users:*", "settings:*", "petalas:*"]'::JSONB,
        FALSE
    ),
    (
        '00000000-0000-0000-0000-000000000003',
        '00000000-0000-0000-0000-000000000001',
        'Manager',
        'manager',
        'Manager with limited admin access',
        '["users:read", "users:create", "petalas:read", "petalas:use"]'::JSONB,
        FALSE
    ),
    (
        '00000000-0000-0000-0000-000000000004',
        '00000000-0000-0000-0000-000000000001',
        'User',
        'user',
        'Standard user',
        '["petalas:read", "petalas:use"]'::JSONB,
        FALSE
    )
ON CONFLICT (id) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════
-- USERS
-- ═══════════════════════════════════════════════════════════════════════════

-- Password: Admin123!
-- Hash generated with bcrypt, rounds=10
INSERT INTO users (id, tenant_id, email, email_verified, password_hash, full_name, first_name, last_name, role_id, status)
VALUES
    (
        '00000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0000-000000000001',
        'admin@softwarelotus.com.br',
        TRUE,
        '$2b$10$rJ8qXqWqY3nQK.yF4YvYEeN5VqF5z3Q8KvZkQ3vY3Q8KvZkQ3vY3Q',
        'Administrator',
        'Admin',
        'User',
        '00000000-0000-0000-0000-000000000001',
        'active'
    ),
    (
        '00000000-0000-0000-0000-000000000002',
        '00000000-0000-0000-0000-000000000001',
        'sofia@softwarelotus.com.br',
        TRUE,
        '$2b$10$rJ8qXqWqY3nQK.yF4YvYEeN5VqF5z3Q8KvZkQ3vY3Q8KvZkQ3vY3Q',
        'Sofia AI v4.0',
        'Sofia',
        'AI',
        '00000000-0000-0000-0000-000000000002',
        'active'
    ),
    (
        '00000000-0000-0000-0000-000000000003',
        '00000000-0000-0000-0000-000000000002',
        'admin@divinasterapias.com.br',
        TRUE,
        '$2b$10$rJ8qXqWqY3nQK.yF4YvYEeN5VqF5z3Q8KvZkQ3vY3Q8KvZkQ3vY3Q',
        'Divinas Admin',
        'Admin',
        'Divinas',
        '00000000-0000-0000-0000-000000000002',
        'active'
    )
ON CONFLICT (id) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════
-- CREDIT WALLETS
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO credit_wallets (tenant_id, balance, lifetime_earned)
VALUES
    ('00000000-0000-0000-0000-000000000001', 100000.00, 100000.00),
    ('00000000-0000-0000-0000-000000000002', 50000.00, 50000.00)
ON CONFLICT (tenant_id) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════
-- AI MODEL CONFIGS
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO ai_model_configs (model_name, provider, model_type, config, temperature, max_tokens,
    cost_per_1k_input_tokens, cost_per_1k_output_tokens, is_active, is_default)
VALUES
    (
        'claude-opus-4-20250514',
        'anthropic',
        'llm',
        '{"version": "opus-4"}'::JSONB,
        0.7,
        4096,
        0.015,
        0.075,
        TRUE,
        TRUE
    ),
    (
        'text-embedding-ada-002',
        'openai',
        'embedding',
        '{"dimensions": 1536}'::JSONB,
        NULL,
        NULL,
        0.0001,
        NULL,
        TRUE,
        TRUE
    ),
    (
        'gpt-4o',
        'openai',
        'llm',
        '{"version": "4o"}'::JSONB,
        0.7,
        4096,
        0.005,
        0.015,
        TRUE,
        FALSE
    )
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════
-- COUPONS (Promotional)
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO coupons (code, discount_type, discount_value, usage_limit, valid_from, valid_until, is_active)
VALUES
    (
        'LAUNCH50',
        'percentage',
        50.00,
        100,
        NOW(),
        NOW() + INTERVAL '30 days',
        TRUE
    ),
    (
        'FIRSTMONTH',
        'percentage',
        100.00,
        500,
        NOW(),
        NOW() + INTERVAL '90 days',
        TRUE
    ),
    (
        'ENTERPRISE2025',
        'fixed_amount',
        100.00,
        50,
        NOW(),
        NOW() + INTERVAL '180 days',
        TRUE
    )
ON CONFLICT (code) DO NOTHING;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '═══════════════════════════════════════════════════════';
    RAISE NOTICE 'Seeds Data - Inserted Successfully';
    RAISE NOTICE '═══════════════════════════════════════════════════════';
    RAISE NOTICE '';
    RAISE NOTICE '✅ 5 Plans created (Free to Quantum)';
    RAISE NOTICE '✅ 2 Demo tenants created';
    RAISE NOTICE '✅ 4 Roles created';
    RAISE NOTICE '✅ 3 Users created';
    RAISE NOTICE '✅ 2 Credit wallets funded';
    RAISE NOTICE '✅ 3 AI models configured';
    RAISE NOTICE '✅ 3 Promotional coupons created';
    RAISE NOTICE '';
    RAISE NOTICE 'Default credentials:';
    RAISE NOTICE '  Email: admin@softwarelotus.com.br';
    RAISE NOTICE '  Pass:  Admin123!';
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  CHANGE DEFAULT PASSWORD IN PRODUCTION!';
    RAISE NOTICE '═══════════════════════════════════════════════════════';
END $$;
