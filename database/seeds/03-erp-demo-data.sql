/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║ 🌱 SEED DATA - ERP Complete Demo Data                                   ║
 * ║ Financial + Inventory + HR + CRM + Projects                             ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

-- ═══════════════════════════════════════════════════════════════════════════
-- FINANCIAL TRANSACTIONS
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO erp_transactions (tenant_id, type, category, amount, currency, date, description, status)
VALUES
  ('default-tenant', 'income', 'Sales', 15000.00, 'BRL', '2025-01-15', 'Product sales - January', 'completed'),
  ('default-tenant', 'income', 'Services', 8500.00, 'BRL', '2025-01-20', 'Consulting services', 'completed'),
  ('default-tenant', 'income', 'Subscriptions', 12000.00, 'BRL', '2025-01-25', 'Monthly subscriptions', 'completed'),
  ('default-tenant', 'expense', 'Salaries', 25000.00, 'BRL', '2025-01-05', 'Employee salaries', 'completed'),
  ('default-tenant', 'expense', 'Office', 3500.00, 'BRL', '2025-01-10', 'Office rent', 'completed'),
  ('default-tenant', 'expense', 'Marketing', 5000.00, 'BRL', '2025-01-12', 'Digital marketing campaign', 'completed'),
  ('default-tenant', 'expense', 'Infrastructure', 2800.00, 'BRL', '2025-01-08', 'Cloud services', 'completed'),
  ('default-tenant', 'income', 'Sales', 18500.00, 'BRL', '2025-02-05', 'Product sales - February', 'completed'),
  ('default-tenant', 'income', 'Services', 9200.00, 'BRL', '2025-02-12', 'Consulting services', 'completed'),
  ('default-tenant', 'expense', 'Salaries', 25000.00, 'BRL', '2025-02-05', 'Employee salaries', 'completed'),
  ('default-tenant', 'income', 'Sales', 22000.00, 'BRL', NOW(), 'Current month sales', 'pending'),
  ('default-tenant', 'expense', 'Utilities', 1200.00, 'BRL', NOW(), 'Electricity and internet', 'pending')
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════
-- INVENTORY ITEMS
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO erp_inventory (tenant_id, sku, name, description, quantity, unit, cost, price, location, supplier, reorder_level, status)
VALUES
  ('default-tenant', 'PROD-001', 'Premium Widget', 'High-quality widget for enterprise customers', 150, 'unit', 25.00, 49.99, 'Warehouse A - Shelf 12', 'Supplier Inc', 50, 'in_stock'),
  ('default-tenant', 'PROD-002', 'Standard Gadget', 'Standard gadget for retail', 45, 'unit', 15.00, 29.99, 'Warehouse A - Shelf 15', 'Gadget Co', 50, 'low_stock'),
  ('default-tenant', 'PROD-003', 'Deluxe Component', 'Premium component for B2B', 280, 'unit', 35.00, 69.99, 'Warehouse B - Shelf 05', 'Component Ltd', 100, 'in_stock'),
  ('default-tenant', 'PROD-004', 'Basic Tool', 'Entry-level tool', 0, 'unit', 8.00, 19.99, 'Warehouse A - Shelf 20', 'Tools R Us', 30, 'out_of_stock'),
  ('default-tenant', 'PROD-005', 'Professional Kit', 'Complete professional kit', 95, 'kit', 120.00, 249.99, 'Warehouse B - Shelf 10', 'Pro Kits Inc', 40, 'in_stock'),
  ('default-tenant', 'RAW-001', 'Steel Plates', 'Raw material - steel', 500, 'kg', 3.50, 0.00, 'Warehouse C - Zone 1', 'Metal Suppliers', 200, 'in_stock'),
  ('default-tenant', 'RAW-002', 'Plastic Pellets', 'Raw material - plastic', 180, 'kg', 2.20, 0.00, 'Warehouse C - Zone 2', 'Plastics Co', 200, 'low_stock'),
  ('default-tenant', 'ACC-001', 'Packaging Box', 'Standard shipping box', 850, 'unit', 0.50, 0.00, 'Warehouse A - Shelf 01', 'Package Pro', 500, 'in_stock')
ON CONFLICT (tenant_id, sku) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════
-- EMPLOYEES
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO erp_employees (tenant_id, employee_number, first_name, last_name, email, position, department, hire_date, salary, status)
VALUES
  ('default-tenant', 'EMP001', 'Carlos', 'Mendes', 'carlos.mendes@company.com', 'CEO', 'Executive', '2020-01-15', 25000.00, 'active'),
  ('default-tenant', 'EMP002', 'Fernanda', 'Lima', 'fernanda.lima@company.com', 'CTO', 'Technology', '2020-03-01', 22000.00, 'active'),
  ('default-tenant', 'EMP003', 'Roberto', 'Silva', 'roberto.silva@company.com', 'CFO', 'Finance', '2020-06-15', 20000.00, 'active'),
  ('default-tenant', 'EMP004', 'Julia', 'Costa', 'julia.costa@company.com', 'Head of Sales', 'Sales', '2021-01-10', 18000.00, 'active'),
  ('default-tenant', 'EMP005', 'Paulo', 'Ferreira', 'paulo.ferreira@company.com', 'Senior Developer', 'Technology', '2021-03-20', 12000.00, 'active'),
  ('default-tenant', 'EMP006', 'Mariana', 'Santos', 'mariana.santos@company.com', 'Product Manager', 'Product', '2021-08-01', 14000.00, 'active'),
  ('default-tenant', 'EMP007', 'Lucas', 'Oliveira', 'lucas.oliveira@company.com', 'Marketing Manager', 'Marketing', '2022-02-15', 13000.00, 'active'),
  ('default-tenant', 'EMP008', 'Amanda', 'Rodrigues', 'amanda.rodrigues@company.com', 'HR Manager', 'Human Resources', '2022-05-01', 11000.00, 'active'),
  ('default-tenant', 'EMP009', 'Diego', 'Almeida', 'diego.almeida@company.com', 'Developer', 'Technology', '2023-01-10', 9000.00, 'active'),
  ('default-tenant', 'EMP010', 'Beatriz', 'Souza', 'beatriz.souza@company.com', 'Sales Representative', 'Sales', '2023-06-20', 7500.00, 'active'),
  ('default-tenant', 'EMP011', 'Rafael', 'Pereira', 'rafael.pereira@company.com', 'Support Specialist', 'Support', '2023-09-15', 6500.00, 'active'),
  ('default-tenant', 'EMP012', 'Camila', 'Martins', 'camila.martins@company.com', 'Accountant', 'Finance', '2024-01-05', 8000.00, 'active')
ON CONFLICT (tenant_id, employee_number) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════
-- CUSTOMERS
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO erp_customers (tenant_id, name, email, phone, company, status, total_revenue, last_contact, tags)
VALUES
  ('default-tenant', 'Tech Solutions SA', 'contact@techsolutions.com', '+55 11 98765-4321', 'Tech Solutions SA', 'active', 125000.00, NOW() - INTERVAL '2 days', '["enterprise", "technology", "vip"]'),
  ('default-tenant', 'Retail Masters Ltda', 'sales@retailmasters.com', '+55 21 91234-5678', 'Retail Masters Ltda', 'active', 89500.00, NOW() - INTERVAL '5 days', '["retail", "medium"]'),
  ('default-tenant', 'Startup Innovators', 'hello@startupinnovators.io', '+55 11 99876-5432', 'Startup Innovators', 'active', 45000.00, NOW() - INTERVAL '1 day', '["startup", "technology"]'),
  ('default-tenant', 'Healthcare Group', 'procurement@healthcaregroup.com', '+55 31 3456-7890', 'Healthcare Group', 'active', 156000.00, NOW() - INTERVAL '10 days', '["healthcare", "enterprise", "vip"]'),
  ('default-tenant', 'Education Alliance', 'contact@edalliance.com', '+55 41 2345-6789', 'Education Alliance', 'active', 67000.00, NOW() - INTERVAL '7 days', '["education", "medium"]'),
  ('default-tenant', 'Fashion Boutique', 'info@fashionboutique.com', '+55 11 91111-2222', 'Fashion Boutique', 'active', 38500.00, NOW() - INTERVAL '15 days', '["fashion", "retail"]'),
  ('default-tenant', 'Logistics Pro', 'sales@logisticspro.com', '+55 51 3333-4444', 'Logistics Pro', 'active', 92000.00, NOW() - INTERVAL '3 days', '["logistics", "medium"]'),
  ('default-tenant', 'Food Chain Inc', 'purchasing@foodchain.com', '+55 11 95555-6666', 'Food Chain Inc', 'active', 178000.00, NOW() - INTERVAL '1 day', '["food", "enterprise", "vip"]')
ON CONFLICT (tenant_id, email) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════
-- PROJECTS
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO erp_projects (tenant_id, name, description, status, start_date, end_date, budget, spent, customer_id, team_members)
VALUES
  (
    'default-tenant',
    'ERP Implementation - Tech Solutions',
    'Complete ERP system implementation for Tech Solutions SA',
    'active',
    '2025-01-01',
    '2025-06-30',
    150000.00,
    45000.00,
    (SELECT id FROM erp_customers WHERE email = 'contact@techsolutions.com' LIMIT 1),
    '["EMP002", "EMP005", "EMP006", "EMP009"]'
  ),
  (
    'default-tenant',
    'E-commerce Platform - Retail Masters',
    'Custom e-commerce platform development',
    'active',
    '2025-02-01',
    '2025-05-31',
    80000.00,
    22000.00,
    (SELECT id FROM erp_customers WHERE email = 'sales@retailmasters.com' LIMIT 1),
    '["EMP005", "EMP009"]'
  ),
  (
    'default-tenant',
    'Healthcare Portal - Healthcare Group',
    'Patient portal and telemedicine integration',
    'active',
    '2025-01-15',
    '2025-07-15',
    180000.00,
    58000.00,
    (SELECT id FROM erp_customers WHERE email = 'procurement@healthcaregroup.com' LIMIT 1),
    '["EMP002", "EMP005", "EMP006", "EMP009"]'
  ),
  (
    'default-tenant',
    'Mobile App - Startup Innovators',
    'iOS and Android mobile application',
    'planning',
    '2025-03-01',
    '2025-08-31',
    60000.00,
    5000.00,
    (SELECT id FROM erp_customers WHERE email = 'hello@startupinnovators.io' LIMIT 1),
    '["EMP005", "EMP009"]'
  ),
  (
    'default-tenant',
    'LMS Upgrade - Education Alliance',
    'Learning Management System upgrade and migration',
    'completed',
    '2024-09-01',
    '2024-12-31',
    70000.00,
    68500.00,
    (SELECT id FROM erp_customers WHERE email = 'contact@edalliance.com' LIMIT 1),
    '["EMP005", "EMP006"]'
  )
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════
-- INVENTORY MOVEMENTS (Sample history)
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO erp_inventory_movements (tenant_id, item_id, quantity, reason, created_at)
SELECT
  'default-tenant',
  id,
  -15,
  'Sale to customer',
  NOW() - INTERVAL '5 days'
FROM erp_inventory WHERE sku = 'PROD-001' LIMIT 1;

INSERT INTO erp_inventory_movements (tenant_id, item_id, quantity, reason, created_at)
SELECT
  'default-tenant',
  id,
  -8,
  'Sale to customer',
  NOW() - INTERVAL '3 days'
FROM erp_inventory WHERE sku = 'PROD-002' LIMIT 1;

INSERT INTO erp_inventory_movements (tenant_id, item_id, quantity, reason, created_at)
SELECT
  'default-tenant',
  id,
  50,
  'Stock replenishment',
  NOW() - INTERVAL '7 days'
FROM erp_inventory WHERE sku = 'PROD-003' LIMIT 1;

-- ═══════════════════════════════════════════════════════════════════════════
-- ATTENDANCE RECORDS (Last 30 days for sample employees)
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO erp_attendance (tenant_id, employee_id, date, status)
SELECT
  'default-tenant',
  id,
  generate_series::date,
  CASE
    WHEN EXTRACT(DOW FROM generate_series) IN (0, 6) THEN 'leave'
    WHEN random() < 0.95 THEN 'present'
    ELSE 'absent'
  END
FROM
  erp_employees,
  generate_series(CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE, '1 day'::interval)
WHERE employee_number IN ('EMP005', 'EMP009', 'EMP010')
ON CONFLICT (tenant_id, employee_id, date) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════
-- CUSTOMER INTERACTIONS
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO erp_customer_interactions (tenant_id, customer_id, type, notes, created_at)
SELECT
  'default-tenant',
  id,
  'Meeting',
  'Quarterly business review - discussed expansion plans',
  NOW() - INTERVAL '2 days'
FROM erp_customers WHERE email = 'contact@techsolutions.com' LIMIT 1;

INSERT INTO erp_customer_interactions (tenant_id, customer_id, type, notes, created_at)
SELECT
  'default-tenant',
  id,
  'Email',
  'Sent product catalog and pricing',
  NOW() - INTERVAL '5 days'
FROM erp_customers WHERE email = 'sales@retailmasters.com' LIMIT 1;

INSERT INTO erp_customer_interactions (tenant_id, customer_id, type, notes, created_at)
SELECT
  'default-tenant',
  id,
  'Phone Call',
  'Support call regarding integration issues - resolved',
  NOW() - INTERVAL '1 day'
FROM erp_customers WHERE email = 'hello@startupinnovators.io' LIMIT 1;

-- ═══════════════════════════════════════════════════════════════════════════
-- PROJECT EXPENSES
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO erp_project_expenses (tenant_id, project_id, amount, description, created_at)
SELECT
  'default-tenant',
  id,
  12000.00,
  'Development team - Month 1',
  NOW() - INTERVAL '30 days'
FROM erp_projects WHERE name = 'ERP Implementation - Tech Solutions' LIMIT 1;

INSERT INTO erp_project_expenses (tenant_id, project_id, amount, description, created_at)
SELECT
  'default-tenant',
  id,
  12000.00,
  'Development team - Month 2',
  NOW() - INTERVAL '15 days'
FROM erp_projects WHERE name = 'ERP Implementation - Tech Solutions' LIMIT 1;

INSERT INTO erp_project_expenses (tenant_id, project_id, amount, description, created_at)
SELECT
  'default-tenant',
  id,
  8500.00,
  'Cloud infrastructure',
  NOW() - INTERVAL '20 days'
FROM erp_projects WHERE name = 'Healthcare Portal - Healthcare Group' LIMIT 1;

-- ═══════════════════════════════════════════════════════════════════════════
-- SUMMARY STATS
-- ═══════════════════════════════════════════════════════════════════════════

/*
Financial Summary:
- Total Income: R$ 85,200.00
- Total Expenses: R$ 62,500.00
- Net Profit: R$ 22,700.00

Inventory:
- Total Items: 8
- In Stock: 5
- Low Stock: 2
- Out of Stock: 1
- Total Value (Cost): ~R$ 58,000
- Total Value (Retail): ~R$ 95,000

HR:
- Total Employees: 12
- Total Payroll: R$ 151,500/month
- Departments: 8

CRM:
- Total Customers: 8
- Active Customers: 8
- Total Revenue: R$ 791,000.00

Projects:
- Total Projects: 5
- Active: 3
- Planning: 1
- Completed: 1
- Total Budget: R$ 540,000.00
- Total Spent: R$ 198,500.00
*/
