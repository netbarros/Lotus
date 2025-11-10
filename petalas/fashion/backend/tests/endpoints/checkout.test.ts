import { describe, it, expect, beforeAll } from 'vitest';
import axios from 'axios';

const API_URL = process.env.API_URL || 'http://localhost:8055';
const api = axios.create({ baseURL: API_URL });

describe('Checkout Endpoint', () => {
  let authToken: string;
  let sessionId: string;

  beforeAll(async () => {
    const response = await api.post('/auth/login', {
      email: 'customer@example.com',
      password: 'password'
    });
    authToken = response.data.data.access_token;
    api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
  });

  describe('POST /checkout/init', () => {
    it('should initialize checkout session', async () => {
      const response = await api.post('/checkout/init', {
        items: [
          { productId: 1, quantity: 2, price: 50 }
        ]
      });

      expect(response.status).toBe(200);
      expect(response.data.data).toHaveProperty('sessionId');
      expect(response.data.data).toHaveProperty('total');

      sessionId = response.data.data.sessionId;
    });
  });

  describe('POST /checkout/address', () => {
    it('should save shipping address', async () => {
      const response = await api.post('/checkout/address', {
        sessionId,
        address: {
          street: '123 Main St',
          city: 'Los Angeles',
          state: 'CA',
          zipCode: '90210',
          country: 'USA'
        }
      });

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
    });
  });

  describe('POST /checkout/payment', () => {
    it('should process payment', async () => {
      const response = await api.post('/checkout/payment', {
        sessionId,
        paymentMethod: 'stripe',
        paymentToken: 'tok_test123'
      });

      expect(response.status).toBe(200);
      expect(response.data.data).toHaveProperty('orderId');
      expect(response.data.data).toHaveProperty('status');
    });
  });

  describe('POST /checkout/validate-coupon', () => {
    it('should validate and apply coupon', async () => {
      const response = await api.post('/checkout/validate-coupon', {
        sessionId,
        couponCode: 'SAVE10'
      });

      expect(response.status).toBe(200);
      expect(response.data.data).toHaveProperty('discount');
    });
  });

  describe('GET /checkout/session/:id', () => {
    it('should retrieve checkout session', async () => {
      const response = await api.get(`/checkout/session/${sessionId}`);

      expect(response.status).toBe(200);
      expect(response.data.data).toHaveProperty('items');
      expect(response.data.data).toHaveProperty('total');
    });
  });
});
