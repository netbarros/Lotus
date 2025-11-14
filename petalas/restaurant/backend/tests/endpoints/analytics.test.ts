import { describe, it, expect, beforeAll } from 'vitest';
import axios from 'axios';

const API_URL = process.env.API_URL || 'http://localhost:8055';
const api = axios.create({ baseURL: API_URL });

describe('Restaurant Analytics Endpoint', () => {
  let authToken: string;

  beforeAll(async () => {
    const response = await api.post('/auth/login', {
      email: 'admin@example.com',
      password: 'password',
    });
    authToken = response.data.data.access_token;
    api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
  });

  describe('GET /analytics/sales', () => {
    it('should return sales analytics', async () => {
      const response = await api.get('/analytics/sales?from=2025-01-01&to=2025-12-31');

      expect(response.status).toBe(200);
      expect(response.data.data).toHaveProperty('totalRevenue');
      expect(response.data.data).toHaveProperty('orderCount');
      expect(response.data.data).toHaveProperty('averageOrderValue');
    });
  });

  describe('GET /analytics/menu-performance', () => {
    it('should return menu item performance', async () => {
      const response = await api.get('/analytics/menu-performance');

      expect(response.status).toBe(200);
      expect(response.data.data).toHaveProperty('topItems');
      expect(response.data.data).toHaveProperty('bottomItems');
      expect(Array.isArray(response.data.data.topItems)).toBe(true);
    });
  });

  describe('GET /analytics/peak-hours', () => {
    it('should return peak hours analysis', async () => {
      const response = await api.get('/analytics/peak-hours');

      expect(response.status).toBe(200);
      expect(response.data.data).toHaveProperty('hourlyDistribution');
      expect(response.data.data).toHaveProperty('peakHours');
      expect(response.data.data).toHaveProperty('slowHours');
    });
  });

  describe('GET /analytics/customer-retention', () => {
    it('should return customer retention metrics', async () => {
      const response = await api.get('/analytics/customer-retention');

      expect(response.status).toBe(200);
      expect(response.data.data).toHaveProperty('repeatCustomerRate');
      expect(response.data.data).toHaveProperty('avgVisitsPerCustomer');
    });
  });

  describe('GET /analytics/table-turnover', () => {
    it('should return table turnover analytics', async () => {
      const response = await api.get('/analytics/table-turnover');

      expect(response.status).toBe(200);
      expect(response.data.data).toHaveProperty('averageTurnoverTime');
      expect(response.data.data).toHaveProperty('turnsPerDay');
    });
  });
});
