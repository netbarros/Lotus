import { describe, it, expect } from 'vitest';

describe('Inventory Hook', () => {
  describe('action:inventory.items.update', () => {
    it('should send low stock alert', () => {
      const result = checkLowStock({ quantity: 5, low_stock_threshold: 10, product_id: 1 });
      expect(result.alert_sent).toBe(true);
    });

    it('should update stock status', () => {
      expect(updateStockStatus({ quantity: 0 }).stock_status).toBe('out_of_stock');
      expect(updateStockStatus({ quantity: 5, low_stock_threshold: 10 }).stock_status).toBe('low_stock');
      expect(updateStockStatus({ quantity: 50 }).stock_status).toBe('in_stock');
    });

    it('should log inventory changes', () => {
      const log = logInventoryChange({ product_id: 1, quantity: 10, previous_quantity: 5, reason: 'restock' });
      expect(log.change_amount).toBe(5);
      expect(log.change_type).toBe('increase');
    });
  });
});

function checkLowStock(inventory: any) {
  if (inventory.quantity < (inventory.low_stock_threshold || 10)) {
    inventory.alert_sent = true;
  }
  return inventory;
}

function updateStockStatus(inventory: any) {
  if (inventory.quantity === 0) {
    inventory.stock_status = 'out_of_stock';
  } else if (inventory.quantity < (inventory.low_stock_threshold || 10)) {
    inventory.stock_status = 'low_stock';
  } else {
    inventory.stock_status = 'in_stock';
  }
  return inventory;
}

function logInventoryChange(data: any) {
  const change = data.quantity - (data.previous_quantity || 0);
  return {
    change_amount: Math.abs(change),
    change_type: change > 0 ? 'increase' : 'decrease',
    ...data
  };
}
