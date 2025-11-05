-- ═══════════════════════════════════════════════════════════════════════════
-- COMPOSITE INDEXES FOR PERFORMANCE OPTIMIZATION
-- Optimizes common query patterns for enterprise-grade performance
-- ═══════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════════
-- USERS TABLE - Composite Indexes
-- ═══════════════════════════════════════════════════════════════════════════

-- Optimize tenant + email lookups (login queries)
CREATE INDEX idx_users_tenant_email ON users(tenant_id, email);

-- Optimize tenant + role queries (permission checks)
CREATE INDEX idx_users_tenant_role ON users(tenant_id, role_id);

-- Optimize tenant + last login queries (analytics)
CREATE INDEX idx_users_tenant_last_login ON users(tenant_id, last_login_at DESC NULLS LAST);

-- ═══════════════════════════════════════════════════════════════════════════
-- USAGE RECORDS - Composite Indexes
-- ═══════════════════════════════════════════════════════════════════════════

-- Optimize tenant + service type + date range queries (billing)
CREATE INDEX idx_usage_tenant_service_date ON usage_records(tenant_id, service_type, created_at DESC);

-- Optimize tenant + user queries (user analytics)
CREATE INDEX idx_usage_tenant_user_date ON usage_records(tenant_id, user_id, created_at DESC);

-- ═══════════════════════════════════════════════════════════════════════════
-- WORKFLOWS - Composite Indexes
-- ═══════════════════════════════════════════════════════════════════════════

-- Optimize tenant + status queries (active workflows)
CREATE INDEX idx_workflows_tenant_status ON workflows(tenant_id, status) WHERE status = 'ACTIVE';

-- Optimize tenant + last execution queries (monitoring)
CREATE INDEX idx_workflows_tenant_last_exec ON workflows(tenant_id, last_executed_at DESC NULLS LAST);

-- ═══════════════════════════════════════════════════════════════════════════
-- WORKFLOW EXECUTIONS - Composite Indexes
-- ═══════════════════════════════════════════════════════════════════════════

-- Optimize workflow + status + date queries (execution history)
CREATE INDEX idx_exec_workflow_status_date ON workflow_executions(workflow_id, status, started_at DESC);

-- Optimize failed executions queries (error monitoring)
CREATE INDEX idx_exec_failed ON workflow_executions(workflow_id, started_at DESC) WHERE status = 'FAILED';

-- ═══════════════════════════════════════════════════════════════════════════
-- VOICE SESSIONS - Composite Indexes
-- ═══════════════════════════════════════════════════════════════════════════

-- Optimize tenant + user + date queries (session history)
CREATE INDEX idx_voice_tenant_user_date ON voice_sessions(tenant_id, user_id, started_at DESC);

-- Optimize tenant + session type queries (analytics)
CREATE INDEX idx_voice_tenant_type ON voice_sessions(tenant_id, session_type, started_at DESC);

-- ═══════════════════════════════════════════════════════════════════════════
-- CREDIT TRANSACTIONS - Composite Indexes
-- ═══════════════════════════════════════════════════════════════════════════

-- Optimize wallet + type + date queries (transaction history)
CREATE INDEX idx_tx_wallet_type_date ON credit_transactions(wallet_id, type, created_at DESC);

-- Optimize wallet + category queries (spending analytics)
CREATE INDEX idx_tx_wallet_category_date ON credit_transactions(wallet_id, category, created_at DESC);

-- ═══════════════════════════════════════════════════════════════════════════
-- AUDIT LOGS - Composite Indexes
-- ═══════════════════════════════════════════════════════════════════════════

-- Optimize tenant + action + date queries (audit queries)
CREATE INDEX idx_audit_tenant_action_date ON audit_logs(tenant_id, action, created_at DESC);

-- Optimize tenant + user + date queries (user activity)
CREATE INDEX idx_audit_tenant_user_date ON audit_logs(tenant_id, user_id, created_at DESC);

-- Optimize tenant + resource queries (resource history)
CREATE INDEX idx_audit_tenant_resource ON audit_logs(tenant_id, resource_type, resource_id, created_at DESC);

-- Optimize failed actions queries (security monitoring)
CREATE INDEX idx_audit_failed ON audit_logs(tenant_id, created_at DESC) WHERE status = 'FAILURE';

-- ═══════════════════════════════════════════════════════════════════════════
-- MARKETPLACE PLUGINS - Composite Indexes
-- ═══════════════════════════════════════════════════════════════════════════

-- Optimize category + verified + rating queries (marketplace listing)
CREATE INDEX idx_plugins_category_verified_rating ON marketplace_plugins(category, verified, rating_avg DESC);

-- Optimize search queries (trending plugins)
CREATE INDEX idx_plugins_installs_rating ON marketplace_plugins(installs_count DESC, rating_avg DESC) WHERE verified = true;

-- ═══════════════════════════════════════════════════════════════════════════
-- PLUGIN PURCHASES - Composite Indexes
-- ═══════════════════════════════════════════════════════════════════════════

-- Optimize buyer + plugin queries (purchase history)
CREATE INDEX idx_purchases_buyer_plugin ON plugin_purchases(buyer_tenant_id, plugin_id, purchased_at DESC);

-- Optimize plugin sales queries (seller analytics)
CREATE INDEX idx_purchases_plugin_date ON plugin_purchases(plugin_id, purchased_at DESC) WHERE status = 'COMPLETED';

-- ═══════════════════════════════════════════════════════════════════════════
-- QUANTUM JOBS - Composite Indexes
-- ═══════════════════════════════════════════════════════════════════════════

-- Optimize tenant + status queries (job monitoring)
CREATE INDEX idx_quantum_tenant_status ON quantum_jobs(tenant_id, status, submitted_at DESC);

-- Optimize tenant + job type queries (analytics)
CREATE INDEX idx_quantum_tenant_type ON quantum_jobs(tenant_id, job_type, submitted_at DESC);

-- ═══════════════════════════════════════════════════════════════════════════
-- PARTIAL INDEXES FOR COMMON FILTERS
-- ═══════════════════════════════════════════════════════════════════════════

-- Active tenants only (exclude churned)
CREATE INDEX idx_tenants_active ON tenants(id, created_at DESC) WHERE status IN ('ACTIVE', 'TRIAL');

-- Verified plugins only (marketplace)
CREATE INDEX idx_plugins_verified ON marketplace_plugins(category, rating_avg DESC, created_at DESC) WHERE verified = true;

-- Completed purchases only (revenue analytics)
CREATE INDEX idx_purchases_completed ON plugin_purchases(plugin_id, purchased_at DESC, amount_paid_usd) WHERE status = 'COMPLETED';

-- ═══════════════════════════════════════════════════════════════════════════
-- JSONB GIN INDEXES FOR FLEXIBLE QUERIES
-- ═══════════════════════════════════════════════════════════════════════════

-- Enable fast JSONB queries on metadata columns
CREATE INDEX idx_tenants_branding_gin ON tenants USING GIN (branding);
CREATE INDEX idx_tenants_limits_gin ON tenants USING GIN (limits);
CREATE INDEX idx_plans_pricing_gin ON plans USING GIN (pricing);
CREATE INDEX idx_plans_limits_gin ON plans USING GIN (limits);
CREATE INDEX idx_workflows_trigger_gin ON workflows USING GIN (trigger);
CREATE INDEX idx_workflows_steps_gin ON workflows USING GIN (steps);

-- ═══════════════════════════════════════════════════════════════════════════
-- FULL-TEXT SEARCH INDEXES
-- ═══════════════════════════════════════════════════════════════════════════

-- Enable full-text search on plugin descriptions
CREATE INDEX idx_plugins_description_fts ON marketplace_plugins USING GIN (to_tsvector('english', description));

-- Enable full-text search on plugin names
CREATE INDEX idx_plugins_name_fts ON marketplace_plugins USING GIN (to_tsvector('english', name));

-- ═══════════════════════════════════════════════════════════════════════════
-- BTREE-GIST INDEXES FOR RANGE QUERIES
-- ═══════════════════════════════════════════════════════════════════════════

-- Optimize date range queries with exclusion constraints
CREATE INDEX idx_usage_records_date_range ON usage_records USING GIST (tenant_id, created_at);
CREATE INDEX idx_audit_logs_date_range ON audit_logs USING GIST (tenant_id, created_at);
CREATE INDEX idx_voice_sessions_date_range ON voice_sessions USING GIST (tenant_id, started_at);
