
import { PrismaClient } from '@prisma/client';
import { Redis } from 'ioredis';
import { Invoice, LedgerEntry } from '@magicsaas/erp-bridge';

export class FinancialModule {
    constructor(private prisma: PrismaClient, private redis: Redis, private tenantId: string) { }

    async createInvoice(invoice: Omit<Invoice, 'id'>): Promise<Invoice> {
        // Mock implementation using Prisma (assuming schema handles JSON for now or maps fields)
        // In a real scenario, we would map to actual Prisma tables
        const created = await this.prisma.invoice.create({
            data: {
                tenantId: this.tenantId,
                customerId: invoice.customer_id,
                amount: invoice.amount,
                currency: invoice.currency,
                status: invoice.status,
                dueDate: invoice.due_date,
                items: JSON.stringify(invoice.items) // Storing intricate items as JSON for flexibility
            }
        });

        return {
            id: created.id,
            tenant_id: created.tenantId,
            customer_id: created.customerId,
            amount: created.amount,
            currency: created.currency as any,
            status: created.status as any,
            due_date: created.dueDate,
            items: JSON.parse(created.items as string),
        };
    }

    async addLedgerEntry(entry: Omit<LedgerEntry, 'id'>): Promise<LedgerEntry> {
        const created = await this.prisma.ledgerEntry.create({
            data: {
                tenantId: this.tenantId,
                type: entry.type,
                amount: entry.amount,
                description: entry.description,
                chartOfAccountId: entry.chart_of_account_id,
                transactionDate: entry.transaction_date,
            }
        });

        return {
            id: created.id,
            tenant_id: created.tenantId,
            type: created.type as any,
            amount: created.amount,
            description: created.description,
            chart_of_account_id: created.chartOfAccountId,
            transaction_date: created.transactionDate,
        };
    }

    async getFinancialSummary(startDate: Date, endDate: Date) {
        const cacheKey = `financial:summary:${this.tenantId}:${startDate.toISOString()}:${endDate.toISOString()}`;
        const cached = await this.redis.get(cacheKey);
        if (cached) return JSON.parse(cached);

        const entries = await this.prisma.ledgerEntry.findMany({
            where: {
                tenantId: this.tenantId,
                transactionDate: {
                    gte: startDate,
                    lte: endDate,
                }
            }
        });

        const income = entries
            .filter(e => e.type === 'credit') // Assuming credit is income for simplicity in this context
            .reduce((sum, e) => sum + e.amount, 0);

        const expenses = entries
            .filter(e => e.type === 'debit')
            .reduce((sum, e) => sum + e.amount, 0);

        const summary = {
            income,
            expenses,
            netProfit: income - expenses,
            period: { start: startDate, end: endDate },
        };

        await this.redis.set(cacheKey, JSON.stringify(summary), 'EX', 3600);
        return summary;
    }
}
