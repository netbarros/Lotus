import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import axios from 'axios';

const API_URL = process.env.API_URL || 'http://localhost:8055';
const api = axios.create({ baseURL: API_URL });

describe('Restaurant Customers Endpoint', () => {
  let authToken: string;
  let testCustomerId: string;

  beforeAll(async () => {
    const response = await api.post('/auth/login', {
      email: 'admin@example.com',
      password: 'password',
    });
    authToken = response.data.data.access_token;
    api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
  });

  afterAll(async () => {
    if (testCustomerId) {
      await api.delete(`/items/customers/${testCustomerId}`).catch(() => {});
    }
  });

  describe('POST /customers', () => {
    it('should create a new customer', async () => {
      const customerData = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        dietary_preferences: ['vegetarian'],
      };

      const response = await api.post('/customers', customerData);

      expect(response.status).toBe(200);
      expect(response.data.data).toHaveProperty('id');
      expect(response.data.data.email).toBe('john@example.com');

      testCustomerId = response.data.data.id;
    });
  });

  describe('GET /customers/:id/history', () => {
    it('should get customer order history', async () => {
      const response = await api.get(`/customers/${testCustomerId}/history`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data.data)).toBe(true);
    });
  });

  describe('POST /customers/:id/preferences', () => {
    it('should save customer preferences', async () => {
      const response = await api.post(`/customers/${testCustomerId}/preferences`, {
        dietary_restrictions: ['gluten-free'],
        favoriteItems: [1, 2, 3],
        preferredSeating: 'outdoor',
      });

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
    });
  });

  describe('GET /customers/:id/loyalty', () => {
    it('should get customer loyalty points', async () => {
      const response = await api.get(`/customers/${testCustomerId}/loyalty`);

      expect(response.status).toBe(200);
      expect(response.data.data).toHaveProperty('points');
      expect(response.data.data).toHaveProperty('tier');
    });
  });
});
