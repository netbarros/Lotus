
import { z } from 'zod';

// ═══════════════════════════════════════════════════════════════════════════
// FINANCIAL
// ═══════════════════════════════════════════════════════════════════════════

export const CurrencySchema = z.enum(['USD', 'EUR', 'BRL', 'GBP']);
export type Currency = z.infer<typeof CurrencySchema>;

export const InvoiceSchema = z.object({
    id: z.string().uuid(),
    tenant_id: z.string().uuid(),
    customer_id: z.string().uuid(),
    amount: z.number().positive(),
    currency: CurrencySchema,
    status: z.enum(['draft', 'sent', 'paid', 'overdue', 'cancelled']),
    due_date: z.date(),
    items: z.array(z.object({
        description: z.string(),
        quantity: z.number().positive(),
        unit_price: z.number(),
    })),
});

export type Invoice = z.infer<typeof InvoiceSchema>;

export const LedgerEntrySchema = z.object({
    id: z.string().uuid(),
    tenant_id: z.string().uuid(),
    type: z.enum(['credit', 'debit']),
    amount: z.number().positive(),
    description: z.string(),
    chart_of_account_id: z.string().uuid(),
    transaction_date: z.date(),
});

export type LedgerEntry = z.infer<typeof LedgerEntrySchema>;

// ═══════════════════════════════════════════════════════════════════════════
// INVENTORY
// ═══════════════════════════════════════════════════════════════════════════

export const InventoryItemSchema = z.object({
    id: z.string().uuid(),
    tenant_id: z.string().uuid(),
    sku: z.string(),
    name: z.string(),
    quantity: z.number().min(0),
    unit: z.string(), // e.g., 'pcs', 'kg'
    location_id: z.string().uuid().optional(),
    reorder_level: z.number().min(0).optional(),
});

export type InventoryItem = z.infer<typeof InventoryItemSchema>;

// ═══════════════════════════════════════════════════════════════════════════
// HR
// ═══════════════════════════════════════════════════════════════════════════

export const EmployeeSchema = z.object({
    id: z.string().uuid(),
    tenant_id: z.string().uuid(),
    first_name: z.string(),
    last_name: z.string(),
    email: z.string().email(),
    role: z.string(),
    department_id: z.string().uuid().optional(),
});

export type Employee = z.infer<typeof EmployeeSchema>;
