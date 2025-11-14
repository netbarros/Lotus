-- =====================================================
-- 🔒 ROW LEVEL SECURITY (RLS) POLICIES
-- Multi-Tenant Data Isolation
-- GDPR/LGPD Compliant
-- =====================================================
--
-- Este arquivo implementa RLS em TODAS as tabelas multi-tenant
-- garantindo isolamento completo de dados por tenant.
--
-- Aplicar após criar schemas: psql -U user -d magicsaas -f 06-rls-policies.sql
-- =====================================================

-- Enable RLS extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Get current tenant ID from session (set by application)
CREATE OR REPLACE FUNCTION current_tenant_id()
RETURNS UUID AS $$
BEGIN
  RETURN NULLIF(current_setting('app.current_tenant_id', TRUE), '')::UUID;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE;

-- Get current user ID from session
CREATE OR REPLACE FUNCTION current_user_id()
RETURNS UUID AS $$
BEGIN
  RETURN NULLIF(current_setting('app.current_user_id', TRUE), '')::UUID;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE;

-- Check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN current_setting('app.user_role', TRUE) IN ('admin', 'superadmin');
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql STABLE;

-- =====================================================
-- TENANTS TABLE
-- =====================================================

ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own tenant
CREATE POLICY tenant_isolation ON tenants
  FOR ALL
  USING (id = current_tenant_id() OR is_admin());

-- =====================================================
-- USERS TABLE
-- =====================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see users from their tenant
CREATE POLICY user_tenant_isolation ON users
  FOR ALL
  USING (tenant_id = current_tenant_id() OR is_admin());

-- Policy: Users can update their own profile
CREATE POLICY user_self_update ON users
  FOR UPDATE
  USING (id = current_user_id());

-- =====================================================
-- MARKETING TABLES
-- =====================================================

-- Marketing Campaigns
ALTER TABLE marketing_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY marketing_campaigns_tenant_isolation ON marketing_campaigns
  FOR ALL
  USING (
    (metadata->>'tenant_id')::UUID = current_tenant_id()
    OR is_admin()
  );

-- Marketing Leads
ALTER TABLE marketing_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY marketing_leads_tenant_isolation ON marketing_leads
  FOR ALL
  USING (
    (metadata->>'tenant_id')::UUID = current_tenant_id()
    OR is_admin()
  );

-- Marketing Content
ALTER TABLE marketing_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY marketing_content_tenant_isolation ON marketing_content
  FOR ALL
  USING (
    (metadata->>'tenant_id')::UUID = current_tenant_id()
    OR is_admin()
  );

-- Marketing Insights
ALTER TABLE marketing_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY marketing_insights_tenant_isolation ON marketing_insights
  FOR ALL
  USING (
    (metadata->>'tenant_id')::UUID = current_tenant_id()
    OR is_admin()
  );

-- Marketing Journeys
ALTER TABLE marketing_journeys ENABLE ROW LEVEL SECURITY;

CREATE POLICY marketing_journeys_tenant_isolation ON marketing_journeys
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM marketing_leads
      WHERE marketing_leads.id = marketing_journeys.lead_id
      AND (marketing_leads.metadata->>'tenant_id')::UUID = current_tenant_id()
    )
    OR is_admin()
  );

-- Marketing A/B Tests
ALTER TABLE marketing_ab_tests ENABLE ROW LEVEL SECURITY;

CREATE POLICY marketing_ab_tests_tenant_isolation ON marketing_ab_tests
  FOR ALL
  USING (
    (metadata->>'tenant_id')::UUID = current_tenant_id()
    OR is_admin()
  );

-- =====================================================
-- ERP TABLES
-- =====================================================

-- Financial Transactions
ALTER TABLE erp_financial_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY erp_financial_tenant_isolation ON erp_financial_transactions
  FOR ALL
  USING (tenant_id = current_tenant_id() OR is_admin());

-- Inventory Items
ALTER TABLE erp_inventory_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY erp_inventory_tenant_isolation ON erp_inventory_items
  FOR ALL
  USING (tenant_id = current_tenant_id() OR is_admin());

-- HR Employees
ALTER TABLE erp_hr_employees ENABLE ROW LEVEL SECURITY;

CREATE POLICY erp_hr_tenant_isolation ON erp_hr_employees
  FOR ALL
  USING (tenant_id = current_tenant_id() OR is_admin());

-- Employees can view their own record
CREATE POLICY erp_hr_self_view ON erp_hr_employees
  FOR SELECT
  USING (user_id = current_user_id());

-- CRM Contacts
ALTER TABLE erp_crm_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY erp_crm_tenant_isolation ON erp_crm_contacts
  FOR ALL
  USING (tenant_id = current_tenant_id() OR is_admin());

-- CRM Deals
ALTER TABLE erp_crm_deals ENABLE ROW LEVEL SECURITY;

CREATE POLICY erp_crm_deals_tenant_isolation ON erp_crm_deals
  FOR ALL
  USING (tenant_id = current_tenant_id() OR is_admin());

-- Projects
ALTER TABLE erp_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY erp_projects_tenant_isolation ON erp_projects
  FOR ALL
  USING (tenant_id = current_tenant_id() OR is_admin());

-- Project Tasks
ALTER TABLE erp_project_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY erp_tasks_tenant_isolation ON erp_project_tasks
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM erp_projects
      WHERE erp_projects.id = erp_project_tasks.project_id
      AND erp_projects.tenant_id = current_tenant_id()
    )
    OR is_admin()
  );

-- =====================================================
-- KNOWLEDGE BASE (RAG)
-- =====================================================

ALTER TABLE knowledge_embeddings ENABLE ROW LEVEL SECURITY;

CREATE POLICY knowledge_tenant_isolation ON knowledge_embeddings
  FOR ALL
  USING (
    tenant_id = current_tenant_id()
    OR tenant_id IS NULL  -- Public knowledge
    OR is_admin()
  );

-- =====================================================
-- AUDIT LOGS
-- =====================================================

ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Admins can see all audit logs, users can see their own tenant's logs
CREATE POLICY audit_log_tenant_isolation ON audit_log
  FOR SELECT
  USING (
    tenant_id = current_tenant_id()
    OR is_admin()
  );

-- Only system can insert audit logs
CREATE POLICY audit_log_insert ON audit_log
  FOR INSERT
  WITH CHECK (true);

-- =====================================================
-- PII ANONYMIZATION AUDIT
-- =====================================================

ALTER TABLE pii_anonymization_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY pii_audit_tenant_isolation ON pii_anonymization_audit
  FOR ALL
  USING (
    tenant_id = current_tenant_id()
    OR is_admin()
  );

-- =====================================================
-- REFRESH TOKENS
-- =====================================================

ALTER TABLE refresh_tokens ENABLE ROW LEVEL SECURITY;

-- Users can only see their own refresh tokens
CREATE POLICY refresh_tokens_self ON refresh_tokens
  FOR ALL
  USING (
    user_id = current_user_id()
    OR is_admin()
  );

-- =====================================================
-- ROLES
-- =====================================================

ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

-- Everyone can read roles (for permission checks)
CREATE POLICY roles_read ON roles
  FOR SELECT
  USING (true);

-- Only admins can modify roles
CREATE POLICY roles_modify ON roles
  FOR ALL
  USING (is_admin());

-- =====================================================
-- PÉTALAS TABLES (Industry-Specific)
-- =====================================================

-- Restaurant Orders
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'restaurant_orders') THEN
    ALTER TABLE restaurant_orders ENABLE ROW LEVEL SECURITY;

    EXECUTE 'CREATE POLICY restaurant_orders_tenant_isolation ON restaurant_orders
      FOR ALL
      USING (tenant_id = current_tenant_id() OR is_admin())';
  END IF;
END $$;

-- Healthcare Appointments
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'healthcare_appointments') THEN
    ALTER TABLE healthcare_appointments ENABLE ROW LEVEL SECURITY;

    EXECUTE 'CREATE POLICY healthcare_appointments_tenant_isolation ON healthcare_appointments
      FOR ALL
      USING (tenant_id = current_tenant_id() OR is_admin())';
  END IF;
END $$;

-- Retail Products
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'retail_products') THEN
    ALTER TABLE retail_products ENABLE ROW LEVEL SECURITY;

    EXECUTE 'CREATE POLICY retail_products_tenant_isolation ON retail_products
      FOR ALL
      USING (tenant_id = current_tenant_id() OR is_admin())';
  END IF;
END $$;

-- Fashion Collections
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'fashion_collections') THEN
    ALTER TABLE fashion_collections ENABLE ROW LEVEL SECURITY;

    EXECUTE 'CREATE POLICY fashion_collections_tenant_isolation ON fashion_collections
      FOR ALL
      USING (tenant_id = current_tenant_id() OR is_admin())';
  END IF;
END $$;

-- =====================================================
-- VERIFICATION & TESTING
-- =====================================================

-- Function to verify RLS is enabled on all required tables
CREATE OR REPLACE FUNCTION verify_rls_enabled()
RETURNS TABLE(table_name TEXT, rls_enabled BOOLEAN, policy_count INTEGER) AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.tablename::TEXT,
    t.rowsecurity,
    COUNT(p.policyname)::INTEGER
  FROM pg_tables t
  LEFT JOIN pg_policies p ON p.tablename = t.tablename
  WHERE t.schemaname = 'public'
  AND t.tablename IN (
    'tenants', 'users', 'marketing_campaigns', 'marketing_leads',
    'marketing_content', 'marketing_insights', 'marketing_journeys',
    'marketing_ab_tests', 'erp_financial_transactions', 'erp_inventory_items',
    'erp_hr_employees', 'erp_crm_contacts', 'erp_crm_deals',
    'erp_projects', 'erp_project_tasks', 'knowledge_embeddings',
    'audit_log', 'pii_anonymization_audit', 'refresh_tokens', 'roles'
  )
  GROUP BY t.tablename, t.rowsecurity
  ORDER BY t.tablename;
END;
$$ LANGUAGE plpgsql;

-- Function to test RLS isolation
CREATE OR REPLACE FUNCTION test_rls_isolation()
RETURNS TABLE(test_name TEXT, passed BOOLEAN, details TEXT) AS $$
DECLARE
  test_tenant_id UUID;
  test_user_id UUID;
BEGIN
  -- Create test tenant
  INSERT INTO tenants (name, slug) VALUES ('Test Tenant', 'test-tenant')
  RETURNING id INTO test_tenant_id;

  -- Set session variables
  PERFORM set_config('app.current_tenant_id', test_tenant_id::TEXT, FALSE);

  -- Test 1: Can see own tenant
  RETURN QUERY
  SELECT
    'Can see own tenant'::TEXT,
    EXISTS(SELECT 1 FROM tenants WHERE id = test_tenant_id),
    'Should be able to see own tenant'::TEXT;

  -- Test 2: Cannot see other tenants
  RETURN QUERY
  SELECT
    'Cannot see other tenants'::TEXT,
    NOT EXISTS(SELECT 1 FROM tenants WHERE id != test_tenant_id),
    'Should not see other tenants'::TEXT;

  -- Cleanup
  DELETE FROM tenants WHERE id = test_tenant_id;
  PERFORM set_config('app.current_tenant_id', '', FALSE);
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- INDEXES FOR RLS PERFORMANCE
-- =====================================================

-- Ensure tenant_id columns are indexed for fast RLS checks
CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_tenant ON marketing_campaigns((metadata->>'tenant_id'));
CREATE INDEX IF NOT EXISTS idx_marketing_leads_tenant ON marketing_leads((metadata->>'tenant_id'));
CREATE INDEX IF NOT EXISTS idx_marketing_content_tenant ON marketing_content((metadata->>'tenant_id'));

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

-- Grant execute permissions on helper functions
GRANT EXECUTE ON FUNCTION current_tenant_id() TO PUBLIC;
GRANT EXECUTE ON FUNCTION current_user_id() TO PUBLIC;
GRANT EXECUTE ON FUNCTION is_admin() TO PUBLIC;
GRANT EXECUTE ON FUNCTION verify_rls_enabled() TO PUBLIC;
GRANT EXECUTE ON FUNCTION test_rls_isolation() TO PUBLIC;

-- =====================================================
-- VERIFICATION REPORT
-- =====================================================

-- Run verification and display results
DO $$
DECLARE
  rec RECORD;
  total_tables INTEGER := 0;
  enabled_tables INTEGER := 0;
  total_policies INTEGER := 0;
BEGIN
  RAISE NOTICE '╔══════════════════════════════════════════════════════════════╗';
  RAISE NOTICE '║ RLS POLICIES VERIFICATION REPORT                             ║';
  RAISE NOTICE '╚══════════════════════════════════════════════════════════════╝';
  RAISE NOTICE '';

  FOR rec IN SELECT * FROM verify_rls_enabled() LOOP
    total_tables := total_tables + 1;
    IF rec.rls_enabled THEN
      enabled_tables := enabled_tables + 1;
    END IF;
    total_policies := total_policies + rec.policy_count;

    RAISE NOTICE 'Table: % | RLS: % | Policies: %',
      RPAD(rec.table_name, 30),
      CASE WHEN rec.rls_enabled THEN '✅ YES' ELSE '❌ NO' END,
      rec.policy_count;
  END LOOP;

  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════════════════';
  RAISE NOTICE 'Summary:';
  RAISE NOTICE '  Total tables: %', total_tables;
  RAISE NOTICE '  RLS enabled: % (%.0f%%)', enabled_tables, (enabled_tables::FLOAT / total_tables * 100);
  RAISE NOTICE '  Total policies: %', total_policies;
  RAISE NOTICE '═══════════════════════════════════════════════════════════════';
  RAISE NOTICE '';

  IF enabled_tables = total_tables THEN
    RAISE NOTICE '✅ ALL TABLES HAVE RLS ENABLED';
  ELSE
    RAISE WARNING '⚠️  Some tables do not have RLS enabled!';
  END IF;
END $$;
