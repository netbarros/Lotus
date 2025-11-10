import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import axios from 'axios';

const API_URL = process.env.API_URL || 'http://localhost:8055';
const api = axios.create({ baseURL: API_URL });

describe('Coupons Endpoint', () => {
  let authToken: string;
  let testCouponId: string;

  beforeAll(async () => {
    const response = await api.post('/auth/login', {
      email: 'admin@example.com',
      password: 'password'
    });
    authToken = response.data.data.access_token;
    api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
  });

  afterAll(async () => {
    if (testCouponId) {
      await api.delete(`/items/coupons/${testCouponId}`).catch(() => {});
    }
  });

  describe('POST /coupons', () => {
    it('should create a new coupon', async () => {
      const couponData = {
        code: 'SUMMER2025',
        discount_type: 'percentage',
        discount_value: 20,
        min_purchase: 100,
        max_uses: 100,
        valid_from: '2025-06-01',
        valid_until: '2025-08-31'
      };

      const response = await api.post('/coupons', couponData);

      expect(response.status).toBe(200);
      expect(response.data.data.code).toBe('SUMMER2025');
      testCouponId = response.data.data.id;
    });
  });

  describe('POST /coupons/validate', () => {
    it('should validate coupon code', async () => {
      const response = await api.post('/coupons/validate', {
        code: 'SUMMER2025',
        cartTotal: 150
      });

      expect(response.status).toBe(200);
      expect(response.data.valid).toBe(true);
      expect(response.data.discount).toBe(30); // 20% of 150
    });

    it('should reject invalid coupon', async () => {
      await expect(api.post('/coupons/validate', {
        code: 'INVALID',
        cartTotal: 150
      })).rejects.toThrow();
    });
  });

  describe('POST /coupons/:id/apply', () => {
    it('should apply coupon to order', async () => {
      const response = await api.post(`/coupons/${testCouponId}/apply`, {
        orderId: 1
      });

      expect(response.status).toBe(200);
      expect(response.data.data).toHaveProperty('discountApplied');
    });
  });

  describe('GET /coupons/analytics', () => {
    it('should return coupon analytics', async () => {
      const response = await api.get('/coupons/analytics');

      expect(response.status).toBe(200);
      expect(response.data.data).toHaveProperty('totalCoupons');
      expect(response.data.data).toHaveProperty('redemptionRate');
    });
  });
});
