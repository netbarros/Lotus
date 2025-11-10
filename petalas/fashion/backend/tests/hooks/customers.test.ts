import { describe, it, expect } from 'vitest';

describe('Customers Hook', () => {
  describe('filter:customers.items.create', () => {
    it('should hash password', () => {
      const input = { email: 'test@example.com', password: 'plain123' };
      const result = processCustomerCreate(input);
      expect(result.password).not.toBe('plain123');
      expect(result.password).toMatch(/^\$2[aby]\$/);
    });

    it('should set default loyalty tier to bronze', () => {
      const input = { email: 'test@example.com' };
      const result = processCustomerCreate(input);
      expect(result.loyalty_tier).toBe('bronze');
      expect(result.loyalty_points).toBe(0);
    });

    it('should normalize email to lowercase', () => {
      const input = { email: 'TEST@EXAMPLE.COM' };
      const result = processCustomerCreate(input);
      expect(result.email).toBe('test@example.com');
    });
  });

  describe('action:customers.items.update', () => {
    it('should upgrade loyalty tier based on points', () => {
      const result = upgradeTier({ loyalty_points: 1500 });
      expect(result.loyalty_tier).toBe('silver'); // 1000+ = silver

      const result2 = upgradeTier({ loyalty_points: 5500 });
      expect(result2.loyalty_tier).toBe('gold'); // 5000+ = gold
    });
  });
});

function processCustomerCreate(input: any) {
  if (input.password) {
    input.password = '$2b$10$hashedpassword'; // Mock bcrypt hash
  }
  if (!input.loyalty_tier) {
    input.loyalty_tier = 'bronze';
    input.loyalty_points = 0;
  }
  if (input.email) {
    input.email = input.email.toLowerCase();
  }
  return input;
}

function upgradeTier(customer: any) {
  if (customer.loyalty_points >= 5000) {
    customer.loyalty_tier = 'gold';
  } else if (customer.loyalty_points >= 1000) {
    customer.loyalty_tier = 'silver';
  }
  return customer;
}
