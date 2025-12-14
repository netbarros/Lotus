
import { Pool } from 'pg';
import { Redis } from 'ioredis';
import { Transaction } from '../ERPCore';

export class FinancialModule {
    constructor(private db: Pool, private redis: Redis, private tenantId: string) { }

    async createTransaction(transaction: Omit<Transaction, 'id'>): Promise<Transaction> {
        const result = await this.db.query(
            `INSERT INTO erp_transactions (tenant_id, type, category, amount, currency, date, description, status, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
            [
                this.tenantId,
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
        await this.redis.del(`financial:summary:${this.tenantId}`);

        return this.mapTransaction(result.rows[0]);
    }

    async getFinancialSummary(startDate: Date, endDate: Date) {
        const cacheKey = `financial:summary:${this.tenantId}:${startDate.toISOString()}:${endDate.toISOString()}`;
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
            [this.tenantId, startDate, endDate]
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
            [this.tenantId]
        );
        return parseFloat(result.rows[0].total || 0);
    }

    async getAccountsPayable(): Promise<number> {
        const result = await this.db.query(
            `SELECT SUM(amount) as total
       FROM erp_transactions
       WHERE tenant_id = $1 AND type = 'expense' AND status = 'pending'`,
            [this.tenantId]
        );
        return parseFloat(result.rows[0].total || 0);
    }

    private calculateNetProfit(transactions: any[]): number {
        const income = transactions
            .filter((t) => t.type === 'income')
            .reduce((sum, t) => sum + parseFloat(t.total), 0);
        const expenses = transactions
            .filter((t) => t.type === 'expense')
            .reduce((sum, t) => sum + parseFloat(t.total), 0);
        return income - expenses;
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
}
