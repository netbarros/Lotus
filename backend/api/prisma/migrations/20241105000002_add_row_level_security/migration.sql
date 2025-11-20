-- ═══════════════════════════════════════════════════════════════════════════
-- ROW-LEVEL SECURITY (RLS) IMPLEMENTATION
-- Ensures perfect tenant isolation at database level
-- Critical for multi-tenancy security
-- ═══════════════════════════════════════════════════════════════════════════

-- Enable RLS on all tenant-scoped tables
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE plugin_installations ENABLE ROW LEVEL SECURITY;
ALTER TABLE federated_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE quantum_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ═══════════════════════════════════════════════════════════════════════════
-- TENANTS TABLE POLICIES
-- ═══════════════════════════════════════════════════════════════════════════

CREATE POLICY tenant_isolation_policy ON tenants
  FOR ALL
  USING (id = current_setting('app.current_tenant_id', true)::text);

-- ═══════════════════════════════════════════════════════════════════════════
-- USERS TABLE POLICIES
-- ═══════════════════════════════════════════════════════════════════════════

CREATE POLICY user_tenant_isolation_policy ON users
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant_id', true)::text);

-- ═══════════════════════════════════════════════════════════════════════════
-- ROLES TABLE POLICIES
-- ═══════════════════════════════════════════════════════════════════════════

CREATE POLICY role_tenant_isolation_policy ON roles
  FOR ALL
  USING (
    tenant_id = current_setting('app.current_tenant_id', true)::text
    OR tenant_id IS NULL  -- Allow access to global/system roles
  );

-- ═══════════════════════════════════════════════════════════════════════════
-- CREDIT WALLETS POLICIES
-- ═══════════════════════════════════════════════════════════════════════════

CREATE POLICY wallet_tenant_isolation_policy ON credit_wallets
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant_id', true)::text);

-- ═══════════════════════════════════════════════════════════════════════════
-- USAGE RECORDS POLICIES
-- ═══════════════════════════════════════════════════════════════════════════

CREATE POLICY usage_tenant_isolation_policy ON usage_records
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant_id', true)::text);

-- ═══════════════════════════════════════════════════════════════════════════
-- WORKFLOWS POLICIES
-- ═══════════════════════════════════════════════════════════════════════════

CREATE POLICY workflow_tenant_isolation_policy ON workflows
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant_id', true)::text);

-- ═══════════════════════════════════════════════════════════════════════════
-- VOICE SESSIONS POLICIES
-- ═══════════════════════════════════════════════════════════════════════════

CREATE POLICY voice_session_tenant_isolation_policy ON voice_sessions
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant_id', true)::text);

-- ═══════════════════════════════════════════════════════════════════════════
-- PLUGIN INSTALLATIONS POLICIES
-- ═══════════════════════════════════════════════════════════════════════════

CREATE POLICY plugin_installation_tenant_isolation_policy ON plugin_installations
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant_id', true)::text);

-- ═══════════════════════════════════════════════════════════════════════════
-- FEDERATED PARTICIPANTS POLICIES
-- ═══════════════════════════════════════════════════════════════════════════

CREATE POLICY federated_participant_tenant_isolation_policy ON federated_participants
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant_id', true)::text);

-- ═══════════════════════════════════════════════════════════════════════════
-- QUANTUM JOBS POLICIES
-- ═══════════════════════════════════════════════════════════════════════════

CREATE POLICY quantum_job_tenant_isolation_policy ON quantum_jobs
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant_id', true)::text);

-- ═══════════════════════════════════════════════════════════════════════════
-- AUDIT LOGS POLICIES
-- ═══════════════════════════════════════════════════════════════════════════

CREATE POLICY audit_log_tenant_isolation_policy ON audit_logs
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant_id', true)::text);

-- ═══════════════════════════════════════════════════════════════════════════
-- HELPER FUNCTIONS FOR TENANT CONTEXT
-- ═══════════════════════════════════════════════════════════════════════════

-- Function to set current tenant context
CREATE OR REPLACE FUNCTION set_current_tenant(tenant_id TEXT)
RETURNS VOID AS $$
BEGIN
  PERFORM set_config('app.current_tenant_id', tenant_id, false);
END;
$$ LANGUAGE plpgsql;

-- Function to get current tenant context
CREATE OR REPLACE FUNCTION get_current_tenant()
RETURNS TEXT AS $$
BEGIN
  RETURN current_setting('app.current_tenant_id', true);
END;
$$ LANGUAGE plpgsql;

-- Function to clear tenant context
CREATE OR REPLACE FUNCTION clear_current_tenant()
RETURNS VOID AS $$
BEGIN
  PERFORM set_config('app.current_tenant_id', '', false);
END;
$$ LANGUAGE plpgsql;

-- ═══════════════════════════════════════════════════════════════════════════
-- BYPASS POLICIES FOR ADMIN/SYSTEM OPERATIONS
-- ═══════════════════════════════════════════════════════════════════════════

-- Create a role for system/admin operations that bypass RLS
-- DO NOT use this role for regular application queries!
CREATE ROLE magicsaas_admin;
ALTER ROLE magicsaas_admin BYPASSRLS;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO magicsaas_admin;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO magicsaas_admin;
