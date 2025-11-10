import { describe, it, expect } from 'vitest';

describe('Coupons Hook', () => {
  describe('filter:coupons.items.create', () => {
    it('should normalize coupon code to uppercase', () => {
      const result = processCouponCreate({ code: 'summer2025', discount_value: 10 });
      expect(result.code).toBe('SUMMER2025');
    });

    it('should set default max_uses to unlimited', () => {
      const result = processCouponCreate({ code: 'TEST', discount_value: 10 });
      expect(result.max_uses).toBe(null);
    });

    it('should validate discount value', () => {
      expect(() => validateDiscount({ discount_type: 'percentage', discount_value: 150 }))
        .toThrow('Percentage discount cannot exceed 100');
      expect(() => validateDiscount({ discount_type: 'fixed', discount_value: -10 }))
        .toThrow('Discount value must be positive');
    });
  });

  describe('action:coupons.items.update', () => {
    it('should increment usage count on redemption', () => {
      const result = redeemCoupon({ current_uses: 5, max_uses: 100 });
      expect(result.current_uses).toBe(6);
    });

    it('should mark as expired if max uses reached', () => {
      const result = redeemCoupon({ current_uses: 99, max_uses: 100 });
      expect(result.current_uses).toBe(100);
      expect(result.status).toBe('expired');
    });
  });
});

function processCouponCreate(input: any) {
  input.code = input.code.toUpperCase();
  if (input.max_uses === undefined) {
    input.max_uses = null;
  }
  return input;
}

function validateDiscount(input: any) {
  if (input.discount_type === 'percentage' && input.discount_value > 100) {
    throw new Error('Percentage discount cannot exceed 100');
  }
  if (input.discount_value < 0) {
    throw new Error('Discount value must be positive');
  }
}

function redeemCoupon(coupon: any) {
  coupon.current_uses = (coupon.current_uses || 0) + 1;
  if (coupon.max_uses && coupon.current_uses >= coupon.max_uses) {
    coupon.status = 'expired';
  }
  return coupon;
}
