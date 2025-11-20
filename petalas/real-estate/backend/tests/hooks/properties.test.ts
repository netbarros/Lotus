import { describe, it, expect } from 'vitest';

describe('Properties Hook', () => {
  it('should generate slug', () => {
    const result = processPropertyCreate({ title: 'Beach House' });
    expect(result.slug).toBe('beach-house');
  });

  it('should calculate price per sqft', () => {
    const result = calculatePricePerSqft({ price: 500000, square_feet: 2000 });
    expect(result.price_per_sqft).toBe(250);
  });
});

function processPropertyCreate(input: any) {
  input.slug = input.title.toLowerCase().replace(/\s+/g, '-');
  return input;
}

function calculatePricePerSqft(input: any) {
  input.price_per_sqft = input.price / input.square_feet;
  return input;
}
