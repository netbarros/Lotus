
import { Pool } from 'pg';
import { Redis } from 'ioredis';
import { InventoryItem } from '../ERPCore';

export class InventoryModule {
    constructor(private db: Pool, private redis: Redis, private tenantId: string) { }

    async createInventoryItem(item: Omit<InventoryItem, 'id' | 'status'>): Promise<InventoryItem> {
        const status = this.calculateInventoryStatus(item.quantity, item.reorderLevel);

        const result = await this.db.query(
            `INSERT INTO erp_inventory (tenant_id, sku, name, description, quantity, unit, cost, price, location, supplier, reorder_level, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
            [
                this.tenantId,
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
            [newQuantity, status, itemId, this.tenantId]
        );

        // Log inventory movement
        await this.db.query(
            `INSERT INTO erp_inventory_movements (tenant_id, item_id, quantity, reason, created_at)
       VALUES ($1, $2, $3, $4, NOW())`,
            [this.tenantId, itemId, quantity, reason]
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
            [this.tenantId]
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
            [this.tenantId]
        );

        return {
            cost: parseFloat(result.rows[0].total_cost || 0),
            retail: parseFloat(result.rows[0].total_retail || 0),
        };
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
            [id, this.tenantId]
        );
        if (result.rows.length === 0) throw new Error('Inventory item not found');
        return this.mapInventoryItem(result.rows[0]);
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
}
