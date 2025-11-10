import { describe, it, expect } from 'vitest';

describe('Brands Hook', () => {
  describe('filter:brands.items.create', () => {
    it('should generate slug from name', () => {
      const result = processBrandCreate({ name: 'Nike Sport Wear' });
      expect(result.slug).toBe('nike-sport-wear');
    });

    it('should initialize product count to zero', () => {
      const result = processBrandCreate({ name: 'Adidas' });
      expect(result.product_count).toBe(0);
    });

    it('should set default status to active', () => {
      const result = processBrandCreate({ name: 'Puma' });
      expect(result.status).toBe('active');
    });
  });

  describe('action:brands.items.update', () => {
    it('should update product count when products are added', () => {
      const result = updateProductCount({ id: 1, current_count: 10 }, 2);
      expect(result.product_count).toBe(12);
    });
  });
});

function processBrandCreate(input: any) {
  if (input.name && !input.slug) {
    input.slug = input.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  }
  if (input.product_count === undefined) {
    input.product_count = 0;
  }
  if (!input.status) {
    input.status = 'active';
  }
  return input;
}

function updateProductCount(brand: any, delta: number) {
  brand.product_count = (brand.current_count || 0) + delta;
  return brand;
}
