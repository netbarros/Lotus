/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║ 💼 ERP CORE - Complete Enterprise Resource Planning                     ║
 * ║ Financial + Inventory + HR + CRM + Projects Management                  ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */
import { Pool } from 'pg';
import { Redis } from 'ioredis';
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
export declare class ERPCore {
  private _config;
  private db;
  private _redis;
  financial: any;
  inventory: any;
  hr: any;
  crm: any;
  projects: any;
  constructor(redis: Redis, db: Pool, config?: ERPConfig);
  private get config();
  private get redis();
  initialize(): Promise<void>;
  getStatus(): Promise<{
    tenantId: string;
    modules: {
      financial: boolean;
      inventory: boolean;
      hr: boolean;
      crm: boolean;
      projects: boolean;
    };
    metrics: {
      inventory:
        | {
            cost: number;
            retail: number;
          }
        | {
            cost: number;
            retail: number;
          };
      payroll: number;
      accountsReceivable: number;
      accountsPayable: number;
    };
    timestamp: string;
  }>;
  createTransaction(transaction: Omit<Transaction, 'id'>): Promise<Transaction>;
  getFinancialSummary(startDate: Date, endDate: Date): Promise<any>;
  getAccountsReceivable(): Promise<number>;
  getAccountsPayable(): Promise<number>;
  createInventoryItem(item: Omit<InventoryItem, 'id' | 'status'>): Promise<InventoryItem>;
  updateInventoryQuantity(itemId: string, quantity: number, reason: string): Promise<void>;
  getLowStockItems(): Promise<InventoryItem[]>;
  getInventoryValue(): Promise<{
    cost: number;
    retail: number;
  }>;
  createEmployee(employee: Omit<Employee, 'id'>): Promise<Employee>;
  getPayrollSummary(
    month: number,
    year: number
  ): Promise<{
    month: number;
    year: number;
    departments: any[];
    totalPayroll: any;
  }>;
  updateEmployeeSalary(employeeId: string, newSalary: number): Promise<void>;
  getTotalPayroll(): Promise<number>;
  trackAttendance(
    employeeId: string,
    date: Date,
    status: 'present' | 'absent' | 'leave'
  ): Promise<void>;
  createCustomer(customer: Omit<Customer, 'id' | 'totalRevenue'>): Promise<Customer>;
  updateCustomerRevenue(customerId: string, amount: number): Promise<void>;
  getTopCustomers(limit?: number): Promise<Customer[]>;
  trackCustomerInteraction(customerId: string, type: string, notes: string): Promise<void>;
  createProject(project: Omit<Project, 'id' | 'spent'>): Promise<Project>;
  trackProjectExpense(projectId: string, amount: number, description: string): Promise<void>;
  getProjectProgress(projectId: string): Promise<{
    project: Project;
    budgetUsed: number;
    timeProgress: number;
    isOverBudget: boolean;
    isOverdue: boolean;
  }>;
  private calculateNetProfit;
  private calculateInventoryStatus;
  private sendLowStockAlert;
  private getInventoryItem;
  private getProject;
  private mapTransaction;
  private mapInventoryItem;
  private mapEmployee;
  private mapCustomer;
  private mapProject;
}
export default ERPCore;
//# sourceMappingURL=ERPCore.d.ts.map
