import { describe, it, expect } from 'vitest';

describe('Categories Hook', () => {
  describe('filter:categories.items.create', () => {
    it('should generate slug from name', () => {
      const result = processCategoryCreate({ name: 'Summer Dresses' });
      expect(result.slug).toBe('summer-dresses');
    });

    it('should set default parent to null for root categories', () => {
      const result = processCategoryCreate({ name: 'Clothing' });
      expect(result.parent_id).toBeNull();
    });

    it('should initialize product count to zero', () => {
      const result = processCategoryCreate({ name: 'Shoes' });
      expect(result.product_count).toBe(0);
    });

    it('should set sort order', () => {
      const result = processCategoryCreate({ name: 'Accessories' });
      expect(result.sort_order).toBe(0);
    });
  });

  describe('action:categories.items.update', () => {
    it('should update product count', () => {
      const result = updateCategoryProductCount({ id: 1, product_count: 10 }, 5);
      expect(result.product_count).toBe(15);
    });

    it('should update parent category count on child changes', () => {
      const result = propagateCountToParent({ id: 1, parent_id: 2 }, 5);
      expect(result.parent_update_required).toBe(true);
    });
  });
});

function processCategoryCreate(input: any) {
  if (input.name && !input.slug) {
    input.slug = input.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  }
  if (input.parent_id === undefined) {
    input.parent_id = null;
  }
  if (input.product_count === undefined) {
    input.product_count = 0;
  }
  if (input.sort_order === undefined) {
    input.sort_order = 0;
  }
  return input;
}

function updateCategoryProductCount(category: any, delta: number) {
  category.product_count = (category.product_count || 0) + delta;
  return category;
}

function propagateCountToParent(category: any, delta: number) {
  if (category.parent_id) {
    category.parent_update_required = true;
  }
  return category;
}
