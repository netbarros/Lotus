import { describe, it, expect, beforeAll } from 'vitest';
import axios from 'axios';

const API_URL = process.env.API_URL || 'http://localhost:8055';
const api = axios.create({ baseURL: API_URL });

describe('Analytics Endpoint', () => {
  let authToken: string;

  beforeAll(async () => {
    const response = await api.post('/auth/login', {
      email: 'admin@example.com',
      password: 'password',
    });
    authToken = response.data.data.access_token;
    api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
  });

  describe('GET /analytics/dashboard', () => {
    it('should return dashboard analytics', async () => {
      const response = await api.get('/analytics/dashboard');

      expect(response.status).toBe(200);
      expect(response.data.data).toHaveProperty('totalRevenue');
      expect(response.data.data).toHaveProperty('totalOrders');
      expect(response.data.data).toHaveProperty('newCustomers');
      expect(response.data.data).toHaveProperty('conversionRate');
    });

    it('should filter by date range', async () => {
      const response = await api.get('/analytics/dashboard?from=2025-01-01&to=2025-12-31');

      expect(response.status).toBe(200);
      expect(response.data.data).toHaveProperty('period');
    });
  });

  describe('GET /analytics/products/top', () => {
    it('should return top selling products', async () => {
      const response = await api.get('/analytics/products/top?limit=10');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data.data)).toBe(true);
      expect(response.data.data.length).toBeLessThanOrEqual(10);
    });
  });

  describe('GET /analytics/customers/cohort', () => {
    it('should return customer cohort analysis', async () => {
      const response = await api.get('/analytics/customers/cohort');

      expect(response.status).toBe(200);
      expect(response.data.data).toHaveProperty('cohorts');
      expect(Array.isArray(response.data.data.cohorts)).toBe(true);
    });
  });

  describe('GET /analytics/revenue/forecast', () => {
    it('should return revenue forecast', async () => {
      const response = await api.get('/analytics/revenue/forecast?months=6');

      expect(response.status).toBe(200);
      expect(response.data.data).toHaveProperty('forecast');
      expect(response.data.data).toHaveProperty('confidence');
    });
  });

  describe('GET /analytics/inventory/trends', () => {
    it('should return inventory trends', async () => {
      const response = await api.get('/analytics/inventory/trends');

      expect(response.status).toBe(200);
      expect(response.data.data).toHaveProperty('lowStock');
      expect(response.data.data).toHaveProperty('fastMoving');
      expect(response.data.data).toHaveProperty('slowMoving');
    });
  });

  describe('POST /analytics/export', () => {
    it('should export analytics data', async () => {
      const response = await api.post('/analytics/export', {
        type: 'sales',
        format: 'csv',
        from: '2025-01-01',
        to: '2025-12-31',
      });

      expect(response.status).toBe(200);
      expect(response.data.data).toHaveProperty('downloadUrl');
    });
  });
});
