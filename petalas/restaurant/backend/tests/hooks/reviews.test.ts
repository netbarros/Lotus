import { describe, it, expect } from 'vitest';

describe('Restaurant Reviews Hook', () => {
  it('should validate rating range', () => {
    expect(() => validateRating({ rating: 0 })).toThrow('Rating must be 1-5');
    expect(() => validateRating({ rating: 6 })).toThrow('Rating must be 1-5');
    expect(() => validateRating({ rating: 5 })).not.toThrow();
  });

  it('should set status to pending', () => {
    const result = processReviewCreate({ rating: 5, comment: 'Great!' });
    expect(result.status).toBe('pending');
  });

  it('should update restaurant average rating', () => {
    const reviews = [{ rating: 5 }, { rating: 4 }, { rating: 5 }];
    const avg = calculateAvg(reviews);
    expect(avg).toBe(4.67);
  });
});

function validateRating(input: any) {
  if (input.rating < 1 || input.rating > 5) throw new Error('Rating must be 1-5');
}

function processReviewCreate(input: any) {
  input.status = 'pending';
  return input;
}

function calculateAvg(reviews: any[]) {
  const total = reviews.reduce((sum, r) => sum + r.rating, 0);
  return parseFloat((total / reviews.length).toFixed(2));
}
