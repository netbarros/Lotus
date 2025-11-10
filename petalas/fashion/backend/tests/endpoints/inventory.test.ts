import { describe, it, expect, beforeAll } from 'vitest';
import axios from 'axios';

const API_URL = process.env.API_URL || 'http://localhost:8055';
const api = axios.create({ baseURL: API_URL });

describe('Inventory Endpoint', () => {
  let authToken: string;

  beforeAll(async () => {
    const response = await api.post('/auth/login', {
      email: 'admin@example.com',
      password: 'password'
    });
    authToken = response.data.data.access_token;
    api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
  });

  describe('GET /inventory/:productId', () => {
    it('should get product inventory', async () => {
      const response = await api.get('/inventory/1');

      expect(response.status).toBe(200);
      expect(response.data.data).toHaveProperty('available');
      expect(response.data.data).toHaveProperty('reserved');
      expect(response.data.data).toHaveProperty('total');
    });
  });

  describe('POST /inventory/adjust', () => {
    it('should adjust inventory quantity', async () => {
      const response = await api.post('/inventory/adjust', {
        productId: 1,
        quantity: 50,
        reason: 'Restock'
      });

      expect(response.status).toBe(200);
      expect(response.data.data).toHaveProperty('newQuantity');
    });
  });

  describe('POST /inventory/reserve', () => {
    it('should reserve inventory for order', async () => {
      const response = await api.post('/inventory/reserve', {
        productId: 1,
        quantity: 2,
        orderId: 1
      });

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
    });

    it('should reject insufficient inventory', async () => {
      await expect(api.post('/inventory/reserve', {
        productId: 1,
        quantity: 999999,
        orderId: 1
      })).rejects.toThrow();
    });
  });

  describe('GET /inventory/low-stock', () => {
    it('should get low stock products', async () => {
      const response = await api.get('/inventory/low-stock?threshold=10');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data.data)).toBe(true);
    });
  });

  describe('POST /inventory/transfer', () => {
    it('should transfer inventory between locations', async () => {
      const response = await api.post('/inventory/transfer', {
        productId: 1,
        fromLocation: 'warehouse-1',
        toLocation: 'warehouse-2',
        quantity: 10
      });

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
    });
  });
});
