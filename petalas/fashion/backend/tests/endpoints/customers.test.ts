import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import axios from 'axios';

const API_URL = process.env.API_URL || 'http://localhost:8055';
const api = axios.create({ baseURL: API_URL });

describe('Customers Endpoint', () => {
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
        email: 'newcustomer@example.com',
        first_name: 'John',
        last_name: 'Doe',
        phone: '+1234567890',
      };

      const response = await api.post('/customers', customerData);

      expect(response.status).toBe(200);
      expect(response.data.data).toHaveProperty('id');
      expect(response.data.data.email).toBe('newcustomer@example.com');

      testCustomerId = response.data.data.id;
    });

    it('should reject duplicate email', async () => {
      const customerData = {
        email: 'newcustomer@example.com',
        first_name: 'Jane',
        last_name: 'Doe',
      };

      await expect(api.post('/customers', customerData)).rejects.toThrow();
    });
  });

  describe('GET /customers/:id', () => {
    it('should retrieve customer by id', async () => {
      const response = await api.get(`/customers/${testCustomerId}`);

      expect(response.status).toBe(200);
      expect(response.data.data.id).toBe(testCustomerId);
    });
  });

  describe('PATCH /customers/:id', () => {
    it('should update customer', async () => {
      const response = await api.patch(`/customers/${testCustomerId}`, {
        phone: '+9876543210',
      });

      expect(response.status).toBe(200);
      expect(response.data.data.phone).toBe('+9876543210');
    });
  });

  describe('GET /customers/:id/orders', () => {
    it('should get customer orders', async () => {
      const response = await api.get(`/customers/${testCustomerId}/orders`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data.data)).toBe(true);
    });
  });

  describe('GET /customers/:id/lifetime-value', () => {
    it('should calculate customer lifetime value', async () => {
      const response = await api.get(`/customers/${testCustomerId}/lifetime-value`);

      expect(response.status).toBe(200);
      expect(response.data.data).toHaveProperty('totalSpent');
      expect(response.data.data).toHaveProperty('orderCount');
      expect(response.data.data).toHaveProperty('averageOrderValue');
    });
  });

  describe('POST /customers/:id/preferences', () => {
    it('should save customer preferences', async () => {
      const response = await api.post(`/customers/${testCustomerId}/preferences`, {
        preferredCategories: ['dresses', 'shoes'],
        emailNotifications: true,
        smsNotifications: false,
      });

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
    });
  });

  describe('GET /customers/search', () => {
    it('should search customers', async () => {
      const response = await api.get('/customers/search?q=john&limit=10');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data.data)).toBe(true);
    });
  });

  describe('GET /customers/segments', () => {
    it('should get customer segments', async () => {
      const response = await api.get('/customers/segments');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data.data)).toBe(true);
      expect(response.data.data.length).toBeGreaterThan(0);
    });
  });
});
