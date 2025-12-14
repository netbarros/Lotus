
import { Pool } from 'pg';
import { Customer } from '../ERPCore';

export class CRMModule {
    constructor(private db: Pool, private tenantId: string) { }

    async createCustomer(customer: Omit<Customer, 'id' | 'totalRevenue'>): Promise<Customer> {
        const result = await this.db.query(
            `INSERT INTO erp_customers (tenant_id, name, email, phone, company, status, total_revenue, last_contact, tags)
       VALUES ($1, $2, $3, $4, $5, $6, 0, $7, $8)
       RETURNING *`,
            [
                this.tenantId,
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
            [amount, customerId, this.tenantId]
        );
    }

    async getTopCustomers(limit: number = 10): Promise<Customer[]> {
        const result = await this.db.query(
            `SELECT * FROM erp_customers
       WHERE tenant_id = $1 AND status = 'active'
       ORDER BY total_revenue DESC
       LIMIT $2`,
            [this.tenantId, limit]
        );
        return result.rows.map(this.mapCustomer);
    }

    async trackCustomerInteraction(customerId: string, type: string, notes: string): Promise<void> {
        await this.db.query(
            `INSERT INTO erp_customer_interactions (tenant_id, customer_id, type, notes, created_at)
       VALUES ($1, $2, $3, $4, NOW())`,
            [this.tenantId, customerId, type, notes]
        );

        await this.db.query(
            `UPDATE erp_customers SET last_contact = NOW() WHERE id = $1 AND tenant_id = $2`,
            [customerId, this.tenantId]
        );
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
}
