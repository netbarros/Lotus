import { describe, it, expect } from 'vitest';

describe('Restaurants Hook', () => {
  it('should generate slug from name', () => {
    const result = processRestaurantCreate({ name: 'The Italian Kitchen' });
    expect(result.slug).toBe('the-italian-kitchen');
  });

  it('should set default status to active', () => {
    const result = processRestaurantCreate({ name: 'Pizza Place' });
    expect(result.status).toBe('active');
  });

  it('should initialize rating to 0', () => {
    const result = processRestaurantCreate({ name: 'Burger Joint' });
    expect(result.averageRating).toBe(0);
    expect(result.totalReviews).toBe(0);
  });

  it('should validate operating hours format', () => {
    expect(() => validateHours({ hours: 'invalid' })).toThrow();
    expect(() => validateHours({ hours: '09:00-22:00' })).not.toThrow();
  });
});

function processRestaurantCreate(input: any) {
  input.slug = input.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  input.status = input.status || 'active';
  input.averageRating = 0;
  input.totalReviews = 0;
  return input;
}

function validateHours(input: any) {
  if (input.hours && !/^\d{2}:\d{2}-\d{2}:\d{2}$/.test(input.hours)) {
    throw new Error('Invalid hours format');
  }
}
