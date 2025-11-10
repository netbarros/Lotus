import { describe, it, expect } from 'vitest';

describe('Menu Items Hook', () => {
  it('should generate slug from name', () => {
    const result = processMenuItemCreate({ name: 'Caesar Salad', price: 12.99 });
    expect(result.slug).toBe('caesar-salad');
  });

  it('should validate price', () => {
    expect(() => validatePrice({ price: -5 })).toThrow('Price must be positive');
    expect(() => validatePrice({ price: 0 })).toThrow('Price must be positive');
  });

  it('should mark as available by default', () => {
    const result = processMenuItemCreate({ name: 'Pizza', price: 15 });
    expect(result.available).toBe(true);
  });
});

function processMenuItemCreate(input: any) {
  input.slug = input.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  input.available = input.available !== undefined ? input.available : true;
  return input;
}

function validatePrice(input: any) {
  if (input.price <= 0) throw new Error('Price must be positive');
}
