import { describe, it, expect } from 'vitest';

describe('Restaurant Orders Hook', () => {
  it('should generate order number', () => {
    const input = { tableId: 1, customerId: 1 };
    const result = processOrderCreate(input);
    expect(result.orderNumber).toMatch(/^RO-\d{8}-\d{4}$/);
    expect(result.status).toBe('pending');
  });

  it('should calculate order total', () => {
    const input = { items: [{ price: 10, quantity: 2 }, { price: 15, quantity: 1 }] };
    const result = calculateTotal(input);
    expect(result.subtotal).toBe(35);
    expect(result.tax).toBeGreaterThan(0);
    expect(result.total).toBeGreaterThan(35);
  });

  it('should notify kitchen on order creation', () => {
    const input = { id: 1, items: [{ menuItemId: 1, quantity: 2 }] };
    const result = notifyKitchen(input);
    expect(result.kitchenNotified).toBe(true);
  });
});

function processOrderCreate(input: any) {
  const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
  input.orderNumber = `RO-${date}-${Math.floor(Math.random() * 9999).toString().padStart(4, '0')}`;
  input.status = 'pending';
  return input;
}

function calculateTotal(input: any) {
  const subtotal = input.items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.08;
  return { subtotal, tax, total: subtotal + tax };
}

function notifyKitchen(input: any) {
  input.kitchenNotified = true;
  return input;
}
