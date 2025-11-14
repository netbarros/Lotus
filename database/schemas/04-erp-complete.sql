/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║ 📄 ERP DATABASE SCHEMA - Complete tables for all modules                ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

-- ═══════════════════════════════════════════════════════════════════════════
-- FINANCIAL MODULE
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS erp_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('income', 'expense')),
  category VARCHAR(100) NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'BRL',
  date TIMESTAMP NOT NULL,
  description TEXT,
  status VARCHAR(50) NOT NULL CHECK (status IN ('pending', 'completed', 'cancelled')),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_erp_transactions_tenant ON erp_transactions(tenant_id);
CREATE INDEX idx_erp_transactions_date ON erp_transactions(date);
CREATE INDEX idx_erp_transactions_status ON erp_transactions(status);

-- ═══════════════════════════════════════════════════════════════════════════
-- INVENTORY MODULE
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS erp_inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id VARCHAR(255) NOT NULL,
  sku VARCHAR(100) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  quantity INTEGER NOT NULL DEFAULT 0,
  unit VARCHAR(50) NOT NULL,
  cost DECIMAL(15, 2) NOT NULL,
  price DECIMAL(15, 2) NOT NULL,
  location VARCHAR(255),
  supplier VARCHAR(255),
  reorder_level INTEGER DEFAULT 10,
  status VARCHAR(50) NOT NULL CHECK (status IN ('in_stock', 'low_stock', 'out_of_stock')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(tenant_id, sku)
);

CREATE INDEX idx_erp_inventory_tenant ON erp_inventory(tenant_id);
CREATE INDEX idx_erp_inventory_status ON erp_inventory(status);
CREATE INDEX idx_erp_inventory_sku ON erp_inventory(sku);

CREATE TABLE IF NOT EXISTS erp_inventory_movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id VARCHAR(255) NOT NULL,
  item_id UUID NOT NULL REFERENCES erp_inventory(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  reason VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_erp_inventory_movements_item ON erp_inventory_movements(item_id);

-- ═══════════════════════════════════════════════════════════════════════════
-- HR MODULE
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS erp_employees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id VARCHAR(255) NOT NULL,
  employee_number VARCHAR(50) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  position VARCHAR(100) NOT NULL,
  department VARCHAR(100) NOT NULL,
  hire_date DATE NOT NULL,
  salary DECIMAL(15, 2) NOT NULL,
  status VARCHAR(50) NOT NULL CHECK (status IN ('active', 'inactive', 'terminated')),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(tenant_id, employee_number)
);

CREATE INDEX idx_erp_employees_tenant ON erp_employees(tenant_id);
CREATE INDEX idx_erp_employees_status ON erp_employees(status);
CREATE INDEX idx_erp_employees_department ON erp_employees(department);

CREATE TABLE IF NOT EXISTS erp_attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id VARCHAR(255) NOT NULL,
  employee_id UUID NOT NULL REFERENCES erp_employees(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status VARCHAR(50) NOT NULL CHECK (status IN ('present', 'absent', 'leave')),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(tenant_id, employee_id, date)
);

CREATE INDEX idx_erp_attendance_employee ON erp_attendance(employee_id);
CREATE INDEX idx_erp_attendance_date ON erp_attendance(date);

-- ═══════════════════════════════════════════════════════════════════════════
-- CRM MODULE
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS erp_customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  company VARCHAR(255),
  status VARCHAR(50) NOT NULL CHECK (status IN ('active', 'inactive')),
  total_revenue DECIMAL(15, 2) DEFAULT 0,
  last_contact TIMESTAMP,
  tags JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(tenant_id, email)
);

CREATE INDEX idx_erp_customers_tenant ON erp_customers(tenant_id);
CREATE INDEX idx_erp_customers_status ON erp_customers(status);
CREATE INDEX idx_erp_customers_revenue ON erp_customers(total_revenue DESC);

CREATE TABLE IF NOT EXISTS erp_customer_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id VARCHAR(255) NOT NULL,
  customer_id UUID NOT NULL REFERENCES erp_customers(id) ON DELETE CASCADE,
  type VARCHAR(100) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_erp_customer_interactions_customer ON erp_customer_interactions(customer_id);

-- ═══════════════════════════════════════════════════════════════════════════
-- PROJECTS MODULE
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS erp_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) NOT NULL CHECK (status IN ('planning', 'active', 'on_hold', 'completed', 'cancelled')),
  start_date DATE NOT NULL,
  end_date DATE,
  budget DECIMAL(15, 2) NOT NULL,
  spent DECIMAL(15, 2) DEFAULT 0,
  customer_id UUID REFERENCES erp_customers(id) ON DELETE SET NULL,
  team_members JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_erp_projects_tenant ON erp_projects(tenant_id);
CREATE INDEX idx_erp_projects_status ON erp_projects(status);
CREATE INDEX idx_erp_projects_customer ON erp_projects(customer_id);

CREATE TABLE IF NOT EXISTS erp_project_expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id VARCHAR(255) NOT NULL,
  project_id UUID NOT NULL REFERENCES erp_projects(id) ON DELETE CASCADE,
  amount DECIMAL(15, 2) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_erp_project_expenses_project ON erp_project_expenses(project_id);

-- ═══════════════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS)
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE erp_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE erp_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE erp_employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE erp_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE erp_projects ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (example for transactions)
CREATE POLICY erp_transactions_tenant_isolation ON erp_transactions
  USING (tenant_id = current_setting('app.current_tenant')::text);

-- ═══════════════════════════════════════════════════════════════════════════
-- VIEWS FOR REPORTING
-- ═══════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE VIEW erp_financial_overview AS
SELECT
  tenant_id,
  DATE_TRUNC('month', date) as month,
  type,
  currency,
  SUM(amount) as total_amount,
  COUNT(*) as transaction_count
FROM erp_transactions
WHERE status = 'completed'
GROUP BY tenant_id, DATE_TRUNC('month', date), type, currency;

CREATE OR REPLACE VIEW erp_inventory_value AS
SELECT
  tenant_id,
  SUM(quantity * cost) as total_cost_value,
  SUM(quantity * price) as total_retail_value,
  COUNT(*) as total_items,
  SUM(CASE WHEN status = 'low_stock' OR status = 'out_of_stock' THEN 1 ELSE 0 END) as low_stock_count
FROM erp_inventory
GROUP BY tenant_id;

CREATE OR REPLACE VIEW erp_hr_summary AS
SELECT
  tenant_id,
  department,
  COUNT(*) as employee_count,
  SUM(salary) as total_payroll,
  AVG(salary) as average_salary
FROM erp_employees
WHERE status = 'active'
GROUP BY tenant_id, department;
