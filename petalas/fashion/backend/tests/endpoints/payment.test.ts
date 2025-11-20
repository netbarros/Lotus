import { describe, it, expect, beforeAll } from 'vitest';
import axios from 'axios';

const API_URL = process.env.API_URL || 'http://localhost:8055';
const api = axios.create({ baseURL: API_URL });

describe('Payment Endpoint', () => {
  let authToken: string;

  beforeAll(async () => {
    const response = await api.post('/auth/login', {
      email: 'customer@example.com',
      password: 'password',
    });
    authToken = response.data.data.access_token;
    api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
  });

  describe('POST /payment/create-intent', () => {
    it('should create payment intent', async () => {
      const response = await api.post('/payment/create-intent', {
        amount: 10000, // $100.00
        currency: 'usd',
        orderId: 1,
      });

      expect(response.status).toBe(200);
      expect(response.data.data).toHaveProperty('clientSecret');
      expect(response.data.data).toHaveProperty('paymentIntentId');
    });
  });

  describe('POST /payment/confirm', () => {
    it('should confirm payment', async () => {
      const response = await api.post('/payment/confirm', {
        paymentIntentId: 'pi_test123',
        paymentMethod: 'pm_test123',
      });

      expect(response.status).toBe(200);
      expect(response.data.data).toHaveProperty('status');
    });
  });

  describe('POST /payment/refund', () => {
    it('should process refund', async () => {
      const response = await api.post('/payment/refund', {
        paymentIntentId: 'pi_test123',
        amount: 5000, // $50.00
        reason: 'customer_request',
      });

      expect(response.status).toBe(200);
      expect(response.data.data).toHaveProperty('refundId');
      expect(response.data.data).toHaveProperty('status');
    });
  });

  describe('GET /payment/methods', () => {
    it('should get saved payment methods', async () => {
      const response = await api.get('/payment/methods');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data.data)).toBe(true);
    });
  });

  describe('POST /payment/save-method', () => {
    it('should save payment method', async () => {
      const response = await api.post('/payment/save-method', {
        paymentMethod: 'pm_test123',
        setDefault: true,
      });

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
    });
  });

  describe('DELETE /payment/method/:id', () => {
    it('should delete payment method', async () => {
      const response = await api.delete('/payment/method/pm_test123');

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
    });
  });
});
