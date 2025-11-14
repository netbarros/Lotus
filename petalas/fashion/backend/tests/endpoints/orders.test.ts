import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import axios from 'axios';

const API_URL = process.env.API_URL || 'http://localhost:8055';
const api = axios.create({ baseURL: API_URL });

describe('Orders Endpoint', () => {
  let authToken: string;
  let testOrderId: string;

  beforeAll(async () => {
    // Authenticate
    const response = await api.post('/auth/login', {
      email: 'admin@example.com',
      password: 'password',
    });
    authToken = response.data.data.access_token;
    api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
  });

  afterAll(async () => {
    // Cleanup test data
    if (testOrderId) {
      await api.delete(`/items/orders/${testOrderId}`).catch(() => {});
    }
  });

  describe('POST /orders', () => {
    it('should create a new order', async () => {
      const orderData = {
        customer_id: 1,
        status: 'pending',
        total: 150.0,
        items: [{ product_id: 1, quantity: 2, price: 75.0 }],
      };

      const response = await api.post('/orders', orderData);

      expect(response.status).toBe(200);
      expect(response.data.data).toHaveProperty('id');
      expect(response.data.data.status).toBe('pending');
      expect(response.data.data.total).toBe(150.0);

      testOrderId = response.data.data.id;
    });

    it('should validate required fields', async () => {
      const invalidOrder = { status: 'pending' };

      await expect(api.post('/orders', invalidOrder)).rejects.toThrow();
    });
  });

  describe('GET /orders/:id', () => {
    it('should retrieve order by id', async () => {
      const response = await api.get(`/orders/${testOrderId}`);

      expect(response.status).toBe(200);
      expect(response.data.data.id).toBe(testOrderId);
    });

    it('should return 404 for non-existent order', async () => {
      await expect(api.get('/orders/99999')).rejects.toThrow();
    });
  });

  describe('PATCH /orders/:id', () => {
    it('should update order status', async () => {
      const response = await api.patch(`/orders/${testOrderId}`, {
        status: 'processing',
      });

      expect(response.status).toBe(200);
      expect(response.data.data.status).toBe('processing');
    });
  });

  describe('GET /orders/customer/:customerId', () => {
    it('should retrieve orders by customer', async () => {
      const response = await api.get('/orders/customer/1');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data.data)).toBe(true);
    });
  });

  describe('POST /orders/:id/cancel', () => {
    it('should cancel an order', async () => {
      const response = await api.post(`/orders/${testOrderId}/cancel`);

      expect(response.status).toBe(200);
      expect(response.data.data.status).toBe('cancelled');
    });
  });

  describe('GET /orders/analytics', () => {
    it('should return order analytics', async () => {
      const response = await api.get('/orders/analytics');

      expect(response.status).toBe(200);
      expect(response.data.data).toHaveProperty('totalOrders');
      expect(response.data.data).toHaveProperty('totalRevenue');
      expect(response.data.data).toHaveProperty('averageOrderValue');
    });
  });
});
