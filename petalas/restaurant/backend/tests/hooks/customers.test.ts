import { describe, it, expect } from 'vitest';

describe('Restaurant Customers Hook', () => {
  it('should normalize email', () => {
    const result = processCustomerCreate({ email: 'TEST@EXAMPLE.COM', name: 'John' });
    expect(result.email).toBe('test@example.com');
  });

  it('should initialize loyalty points', () => {
    const result = processCustomerCreate({ email: 'test@example.com', name: 'John' });
    expect(result.loyaltyPoints).toBe(0);
  });

  it('should validate phone format', () => {
    expect(() => validatePhone({ phone: 'invalid' })).toThrow();
    expect(() => validatePhone({ phone: '+1234567890' })).not.toThrow();
  });
});

function processCustomerCreate(input: any) {
  input.email = input.email.toLowerCase();
  input.loyaltyPoints = input.loyaltyPoints || 0;
  return input;
}

function validatePhone(input: any) {
  if (input.phone && !/^\+\d{10,15}$/.test(input.phone)) {
    throw new Error('Invalid phone format');
  }
}
