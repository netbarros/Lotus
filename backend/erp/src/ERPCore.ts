/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║ 💼 ERP CORE - Complete Enterprise Resource Planning                     ║
 * ║ Financial + Inventory + HR + CRM + Projects Management                  ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

import { Pool } from 'pg';
import { Redis } from 'ioredis';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface ERPConfig {
  tenantId: string;
  modules: {
    financial: boolean;
    inventory: boolean;
    hr: boolean;
    crm: boolean;
    projects: boolean;
  };
}

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  currency: string;
  date: Date;
  description: string;
  status: 'pending' | 'completed' | 'cancelled';
  metadata?: Record<string, any>;
}

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  description?: string;
  quantity: number;
  unit: string;
  cost: number;
  price: number;
  location: string;
  supplier?: string;
  reorderLevel: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
}

export interface Employee {
  id: string;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  position: string;
  department: string;
  hireDate: Date;
  salary: number;
  status: 'active' | 'inactive' | 'terminated';
  metadata?: Record<string, any>;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  status: 'active' | 'inactive';
  totalRevenue: number;
  lastContact?: Date;
  tags: string[];
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
  startDate: Date;
  endDate?: Date;
  budget: number;
  spent: number;
  customerId?: string;
  teamMembers: string[];
}

// ═══════════════════════════════════════════════════════════════════════════
// ERP CORE CLASS
// ═══════════════════════════════════════════════════════════════════════════

export class ERPCore {
  private _config: ERPConfig;
  private db: Pool;
  private _redis: Redis;

  // Facade properties for server.ts API compatibility
  public financial: any;
  public inventory: any;
  public hr: any;
  public crm: any;
  public projects: any;

  constructor(redis: Redis, db: Pool, config?: ERPConfig) {
    // Handle both old and new constructor signatures
    this._redis = redis;
    this.db = db;
    this._config = config || {
      tenantId: process.env.TENANT_ID || 'default',
      modules: {
        financial: true,
        inventory: true,
        hr: true,
        crm: true,
        projects: true,
      },
    };

    // Initialize facade properties
    this.financial = {
      createTransaction: this.createTransaction.bind(this),
      getFinancialSummary: this.getFinancialSummary.bind(this),
      getAccountsReceivable: this.getAccountsReceivable.bind(this),
      getAccountsPayable: this.getAccountsPayable.bind(this),
    };

    this.inventory = {
      createInventoryItem: this.createInventoryItem.bind(this),
      updateInventoryQuantity: this.updateInventoryQuantity.bind(this),
      getLowStockItems: this.getLowStockItems.bind(this),
      getInventoryValue: this.getInventoryValue.bind(this),
    };

    this.hr = {
      createEmployee: this.createEmployee.bind(this),
      updateEmployeeSalary: this.updateEmployeeSalary.bind(this),
      getTotalPayroll: this.getTotalPayroll.bind(this),
    };

    this.crm = {
      createCustomer: this.createCustomer.bind(this),
      updateCustomerRevenue: this.updateCustomerRevenue.bind(this),
      getTopCustomers: this.getTopCustomers.bind(this),
    };

    this.projects = {
      createProject: this.createProject.bind(this),
      trackProjectExpense: this.trackProjectExpense.bind(this),
      getProjectProgress: this.getProjectProgress.bind(this),
    };
  }

  private get config(): ERPConfig {
    return this._config;
  }

  private get redis(): Redis {
    return this._redis;
  }

  async initialize(): Promise<void> {
    console.log(`   📊 Initializing ERP for tenant: ${this.config.tenantId}`);
    console.log(`   📦 Enabled modules: ${Object.keys(this.config.modules).filter(k => this.config.modules[k as keyof typeof this.config.modules]).join(', ')}`);
    // Could add schema validation, cache warming, etc. here
  }

  async getStatus() {
    const [
      inventoryValue,
      totalPayroll,
      accountsReceivable,
      accountsPayable,
    ] = await Promise.all([
      this.getInventoryValue().catch(() => ({ cost: 0, retail: 0 })),
      this.getTotalPayroll().catch(() => 0),
      this.getAccountsReceivable().catch(() => 0),
      this.getAccountsPayable().catch(() => 0),
    ]);

    return {
      tenantId: this.config.tenantId,
      modules: this.config.modules,
      metrics: {
        inventory: inventoryValue,
        payroll: totalPayroll,
        accountsReceivable,
        accountsPayable,
      },
      timestamp: new Date().toISOString(),
    };
  }

  // ═════════════════════════════════════════════════════════════════════════
  // FINANCIAL MODULE
  // ═════════════════════════════════════════════════════════════════════════

  async createTransaction(transaction: Omit<Transaction, 'id'>): Promise<Transaction> {
    const result = await this.db.query(
      `INSERT INTO erp_transactions (tenant_id, type, category, amount, currency, date, description, status, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        this.config.tenantId,
        transaction.type,
        transaction.category,
        transaction.amount,
        transaction.currency,
        transaction.date,
        transaction.description,
        transaction.status,
        JSON.stringify(transaction.metadata || {}),
      ]
    );

    // Invalidate cache
    await this.redis.del(`financial:summary:${this.config.tenantId}`);

    return this.mapTransaction(result.rows[0]);
  }

  async getFinancialSummary(startDate: Date, endDate: Date) {
    const cacheKey = `financial:summary:${this.config.tenantId}:${startDate.toISOString()}:${endDate.toISOString()}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const result = await this.db.query(
      `SELECT
        type,
        currency,
        SUM(amount) as total,
        COUNT(*) as count,
        AVG(amount) as average
       FROM erp_transactions
       WHERE tenant_id = $1 AND date BETWEEN $2 AND $3 AND status = 'completed'
       GROUP BY type, currency`,
      [this.config.tenantId, startDate, endDate]
    );

    const summary = {
      income: result.rows.filter((r) => r.type === 'income'),
      expenses: result.rows.filter((r) => r.type === 'expense'),
      netProfit: this.calculateNetProfit(result.rows),
      period: { start: startDate, end: endDate },
    };

    await this.redis.set(cacheKey, JSON.stringify(summary), 'EX', 3600);
    return summary;
  }

  async getAccountsReceivable(): Promise<number> {
    const result = await this.db.query(
      `SELECT SUM(amount) as total
       FROM erp_transactions
       WHERE tenant_id = $1 AND type = 'income' AND status = 'pending'`,
      [this.config.tenantId]
    );
    return parseFloat(result.rows[0].total || 0);
  }

  async getAccountsPayable(): Promise<number> {
    const result = await this.db.query(
      `SELECT SUM(amount) as total
       FROM erp_transactions
       WHERE tenant_id = $1 AND type = 'expense' AND status = 'pending'`,
      [this.config.tenantId]
    );
    return parseFloat(result.rows[0].total || 0);
  }

  // ═════════════════════════════════════════════════════════════════════════
  // INVENTORY MODULE
  // ═════════════════════════════════════════════════════════════════════════

  async createInventoryItem(item: Omit<InventoryItem, 'id' | 'status'>): Promise<InventoryItem> {
    const status = this.calculateInventoryStatus(item.quantity, item.reorderLevel);

    const result = await this.db.query(
      `INSERT INTO erp_inventory (tenant_id, sku, name, description, quantity, unit, cost, price, location, supplier, reorder_level, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [
        this.config.tenantId,
        item.sku,
        item.name,
        item.description,
        item.quantity,
        item.unit,
        item.cost,
        item.price,
        item.location,
        item.supplier,
        item.reorderLevel,
        status,
      ]
    );

    return this.mapInventoryItem(result.rows[0]);
  }

  async updateInventoryQuantity(itemId: string, quantity: number, reason: string): Promise<void> {
    const item = await this.getInventoryItem(itemId);
    const newQuantity = item.quantity + quantity;
    const status = this.calculateInventoryStatus(newQuantity, item.reorderLevel);

    await this.db.query(
      `UPDATE erp_inventory
       SET quantity = $1, status = $2, updated_at = NOW()
       WHERE id = $3 AND tenant_id = $4`,
      [newQuantity, status, itemId, this.config.tenantId]
    );

    // Log inventory movement
    await this.db.query(
      `INSERT INTO erp_inventory_movements (tenant_id, item_id, quantity, reason, created_at)
       VALUES ($1, $2, $3, $4, NOW())`,
      [this.config.tenantId, itemId, quantity, reason]
    );

    // Alert if low stock
    if (status === 'low_stock') {
      await this.sendLowStockAlert(item);
    }
  }

  async getLowStockItems(): Promise<InventoryItem[]> {
    const result = await this.db.query(
      `SELECT * FROM erp_inventory
       WHERE tenant_id = $1 AND (status = 'low_stock' OR status = 'out_of_stock')
       ORDER BY status DESC, quantity ASC`,
      [this.config.tenantId]
    );
    return result.rows.map(this.mapInventoryItem);
  }

  async getInventoryValue(): Promise<{ cost: number; retail: number }> {
    const result = await this.db.query(
      `SELECT
        SUM(quantity * cost) as total_cost,
        SUM(quantity * price) as total_retail
       FROM erp_inventory
       WHERE tenant_id = $1`,
      [this.config.tenantId]
    );

    return {
      cost: parseFloat(result.rows[0].total_cost || 0),
      retail: parseFloat(result.rows[0].total_retail || 0),
    };
  }

  // ═════════════════════════════════════════════════════════════════════════
  // HR MODULE
  // ═════════════════════════════════════════════════════════════════════════

  async createEmployee(employee: Omit<Employee, 'id'>): Promise<Employee> {
    const result = await this.db.query(
      `INSERT INTO erp_employees (tenant_id, employee_number, first_name, last_name, email, position, department, hire_date, salary, status, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        this.config.tenantId,
        employee.employeeNumber,
        employee.firstName,
        employee.lastName,
        employee.email,
        employee.position,
        employee.department,
        employee.hireDate,
        employee.salary,
        employee.status,
        JSON.stringify(employee.metadata || {}),
      ]
    );

    return this.mapEmployee(result.rows[0]);
  }

  async getPayrollSummary(month: number, year: number) {
    const result = await this.db.query(
      `SELECT
        department,
        COUNT(*) as employees,
        SUM(salary) as total_salary,
        AVG(salary) as average_salary
       FROM erp_employees
       WHERE tenant_id = $1 AND status = 'active'
       GROUP BY department
       ORDER BY total_salary DESC`,
      [this.config.tenantId]
    );

    return {
      month,
      year,
      departments: result.rows,
      totalPayroll: result.rows.reduce((sum, dept) => sum + parseFloat(dept.total_salary), 0),
    };
  }

  async updateEmployeeSalary(employeeId: string, newSalary: number): Promise<void> {
    await this.db.query(
      `UPDATE erp_employees
       SET salary = $1, updated_at = NOW()
       WHERE id = $2 AND tenant_id = $3`,
      [newSalary, employeeId, this.config.tenantId]
    );
  }

  async getTotalPayroll(): Promise<number> {
    const result = await this.db.query(
      `SELECT SUM(salary) as total
       FROM erp_employees
       WHERE tenant_id = $1 AND status = 'active'`,
      [this.config.tenantId]
    );
    return parseFloat(result.rows[0].total || 0);
  }

  async trackAttendance(
    employeeId: string,
    date: Date,
    status: 'present' | 'absent' | 'leave'
  ): Promise<void> {
    await this.db.query(
      `INSERT INTO erp_attendance (tenant_id, employee_id, date, status)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (tenant_id, employee_id, date) DO UPDATE SET status = $4`,
      [this.config.tenantId, employeeId, date, status]
    );
  }

  // ═════════════════════════════════════════════════════════════════════════
  // CRM MODULE
  // ═════════════════════════════════════════════════════════════════════════

  async createCustomer(customer: Omit<Customer, 'id' | 'totalRevenue'>): Promise<Customer> {
    const result = await this.db.query(
      `INSERT INTO erp_customers (tenant_id, name, email, phone, company, status, total_revenue, last_contact, tags)
       VALUES ($1, $2, $3, $4, $5, $6, 0, $7, $8)
       RETURNING *`,
      [
        this.config.tenantId,
        customer.name,
        customer.email,
        customer.phone,
        customer.company,
        customer.status,
        customer.lastContact,
        JSON.stringify(customer.tags),
      ]
    );

    return this.mapCustomer(result.rows[0]);
  }

  async updateCustomerRevenue(customerId: string, amount: number): Promise<void> {
    await this.db.query(
      `UPDATE erp_customers
       SET total_revenue = total_revenue + $1, last_contact = NOW()
       WHERE id = $2 AND tenant_id = $3`,
      [amount, customerId, this.config.tenantId]
    );
  }

  async getTopCustomers(limit: number = 10): Promise<Customer[]> {
    const result = await this.db.query(
      `SELECT * FROM erp_customers
       WHERE tenant_id = $1 AND status = 'active'
       ORDER BY total_revenue DESC
       LIMIT $2`,
      [this.config.tenantId, limit]
    );
    return result.rows.map(this.mapCustomer);
  }

  async trackCustomerInteraction(customerId: string, type: string, notes: string): Promise<void> {
    await this.db.query(
      `INSERT INTO erp_customer_interactions (tenant_id, customer_id, type, notes, created_at)
       VALUES ($1, $2, $3, $4, NOW())`,
      [this.config.tenantId, customerId, type, notes]
    );

    await this.db.query(
      `UPDATE erp_customers SET last_contact = NOW() WHERE id = $1 AND tenant_id = $2`,
      [customerId, this.config.tenantId]
    );
  }

  // ═════════════════════════════════════════════════════════════════════════
  // PROJECTS MODULE
  // ═════════════════════════════════════════════════════════════════════════

  async createProject(project: Omit<Project, 'id' | 'spent'>): Promise<Project> {
    const result = await this.db.query(
      `INSERT INTO erp_projects (tenant_id, name, description, status, start_date, end_date, budget, spent, customer_id, team_members)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 0, $8, $9)
       RETURNING *`,
      [
        this.config.tenantId,
        project.name,
        project.description,
        project.status,
        project.startDate,
        project.endDate,
        project.budget,
        project.customerId,
        JSON.stringify(project.teamMembers),
      ]
    );

    return this.mapProject(result.rows[0]);
  }

  async trackProjectExpense(projectId: string, amount: number, description: string): Promise<void> {
    await this.db.query(
      `UPDATE erp_projects
       SET spent = spent + $1
       WHERE id = $2 AND tenant_id = $3`,
      [amount, projectId, this.config.tenantId]
    );

    await this.db.query(
      `INSERT INTO erp_project_expenses (tenant_id, project_id, amount, description, created_at)
       VALUES ($1, $2, $3, $4, NOW())`,
      [this.config.tenantId, projectId, amount, description]
    );
  }

  async getProjectProgress(projectId: string) {
    const project = await this.getProject(projectId);
    const budgetUsed = (project.spent / project.budget) * 100;
    const now = new Date();
    const totalDays = project.endDate
      ? (project.endDate.getTime() - project.startDate.getTime()) / (1000 * 60 * 60 * 24)
      : 0;
    const daysElapsed = (now.getTime() - project.startDate.getTime()) / (1000 * 60 * 60 * 24);
    const timeProgress = totalDays > 0 ? (daysElapsed / totalDays) * 100 : 0;

    return {
      project,
      budgetUsed: Math.min(budgetUsed, 100),
      timeProgress: Math.min(timeProgress, 100),
      isOverBudget: project.spent > project.budget,
      isOverdue: project.endDate ? now > project.endDate : false,
    };
  }

  // ═════════════════════════════════════════════════════════════════════════
  // HELPER METHODS
  // ═════════════════════════════════════════════════════════════════════════

  private calculateNetProfit(transactions: any[]): number {
    const income = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.total), 0);
    const expenses = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.total), 0);
    return income - expenses;
  }

  private calculateInventoryStatus(
    quantity: number,
    reorderLevel: number
  ): InventoryItem['status'] {
    if (quantity === 0) return 'out_of_stock';
    if (quantity <= reorderLevel) return 'low_stock';
    return 'in_stock';
  }

  private async sendLowStockAlert(item: InventoryItem): Promise<void> {
    // Integration with notification service
    await this.redis.publish(
      'erp:alerts',
      JSON.stringify({
        type: 'low_stock',
        item: { id: item.id, name: item.name, quantity: item.quantity },
        timestamp: new Date().toISOString(),
      })
    );
  }

  private async getInventoryItem(id: string): Promise<InventoryItem> {
    const result = await this.db.query(
      `SELECT * FROM erp_inventory WHERE id = $1 AND tenant_id = $2`,
      [id, this.config.tenantId]
    );
    if (result.rows.length === 0) throw new Error('Inventory item not found');
    return this.mapInventoryItem(result.rows[0]);
  }

  private async getProject(id: string): Promise<Project> {
    const result = await this.db.query(
      `SELECT * FROM erp_projects WHERE id = $1 AND tenant_id = $2`,
      [id, this.config.tenantId]
    );
    if (result.rows.length === 0) throw new Error('Project not found');
    return this.mapProject(result.rows[0]);
  }

  private mapTransaction(row: any): Transaction {
    return {
      id: row.id,
      type: row.type,
      category: row.category,
      amount: parseFloat(row.amount),
      currency: row.currency,
      date: new Date(row.date),
      description: row.description,
      status: row.status,
      metadata: row.metadata,
    };
  }

  private mapInventoryItem(row: any): InventoryItem {
    return {
      id: row.id,
      sku: row.sku,
      name: row.name,
      description: row.description,
      quantity: parseInt(row.quantity),
      unit: row.unit,
      cost: parseFloat(row.cost),
      price: parseFloat(row.price),
      location: row.location,
      supplier: row.supplier,
      reorderLevel: parseInt(row.reorder_level),
      status: row.status,
    };
  }

  private mapEmployee(row: any): Employee {
    return {
      id: row.id,
      employeeNumber: row.employee_number,
      firstName: row.first_name,
      lastName: row.last_name,
      email: row.email,
      position: row.position,
      department: row.department,
      hireDate: new Date(row.hire_date),
      salary: parseFloat(row.salary),
      status: row.status,
      metadata: row.metadata,
    };
  }

  private mapCustomer(row: any): Customer {
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      company: row.company,
      status: row.status,
      totalRevenue: parseFloat(row.total_revenue),
      lastContact: row.last_contact ? new Date(row.last_contact) : undefined,
      tags: JSON.parse(row.tags || '[]'),
    };
  }

  private mapProject(row: any): Project {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      status: row.status,
      startDate: new Date(row.start_date),
      endDate: row.end_date ? new Date(row.end_date) : undefined,
      budget: parseFloat(row.budget),
      spent: parseFloat(row.spent),
      customerId: row.customer_id,
      teamMembers: JSON.parse(row.team_members || '[]'),
    };
  }
}

export default ERPCore;
