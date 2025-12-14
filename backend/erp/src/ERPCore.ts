/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║ 💼 ERP CORE - Complete Enterprise Resource Planning                     ║
 * ║ Financial + Inventory + HR + CRM + Projects Management                  ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

import { Pool } from 'pg';
import { Redis } from 'ioredis';
import { FinancialModule } from './modules/FinancialModule';
import { InventoryModule } from './modules/InventoryModule';
import { HRModule } from './modules/HRModule';
import { CRMModule } from './modules/CRMModule';
import { ProjectsModule } from './modules/ProjectsModule';

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
  public financial: FinancialModule;
  public inventory: InventoryModule;
  public hr: HRModule;
  public crm: CRMModule;
  public projects: ProjectsModule;

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
    this.financial = new FinancialModule(this.db, this._redis, this._config.tenantId);
    this.inventory = new InventoryModule(this.db, this._redis, this._config.tenantId);
    this.hr = new HRModule(this.db, this._config.tenantId);
    this.crm = new CRMModule(this.db, this._config.tenantId);
    this.projects = new ProjectsModule(this.db, this._config.tenantId);
  }

  private get config(): ERPConfig {
    return this._config;
  }

  private get redis(): Redis {
    return this._redis;
  }

  async initialize(): Promise<void> {
    console.log(`   📊 Initializing ERP for tenant: ${this.config.tenantId}`);
    console.log(
      `   📦 Enabled modules: ${Object.keys(this.config.modules)
        .filter((k) => this.config.modules[k as keyof typeof this.config.modules])
        .join(', ')}`
    );
    // Could add schema validation, cache warming, etc. here
  }

  async getStatus() {
    const [inventoryValue, totalPayroll, accountsReceivable, accountsPayable] = await Promise.all([
      this.inventory.getInventoryValue().catch(() => ({ cost: 0, retail: 0 })),
      this.hr.getTotalPayroll().catch(() => 0),
      this.financial.getAccountsReceivable().catch(() => 0),
      this.financial.getAccountsPayable().catch(() => 0),
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

}

export default ERPCore;
