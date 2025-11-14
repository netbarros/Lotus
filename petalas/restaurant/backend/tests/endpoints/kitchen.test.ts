import { describe, it, expect, beforeAll } from 'vitest';
import axios from 'axios';

const API_URL = process.env.API_URL || 'http://localhost:8055';
const api = axios.create({ baseURL: API_URL });

describe('Kitchen Display System Endpoint', () => {
  let authToken: string;

  beforeAll(async () => {
    const response = await api.post('/auth/login', {
      email: 'chef@example.com',
      password: 'password',
    });
    authToken = response.data.data.access_token;
    api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
  });

  describe('GET /kitchen/orders', () => {
    it('should get active kitchen orders', async () => {
      const response = await api.get('/kitchen/orders?status=pending');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data.data)).toBe(true);
    });
  });

  describe('POST /kitchen/orders/:id/start', () => {
    it('should start preparing order', async () => {
      const response = await api.post('/kitchen/orders/1/start', {
        station: 'grill',
      });

      expect(response.status).toBe(200);
      expect(response.data.data.status).toBe('preparing');
    });
  });

  describe('POST /kitchen/orders/:id/complete', () => {
    it('should mark order as ready', async () => {
      const response = await api.post('/kitchen/orders/1/complete');

      expect(response.status).toBe(200);
      expect(response.data.data.status).toBe('ready');
      expect(response.data.data).toHaveProperty('completedAt');
    });
  });

  describe('GET /kitchen/stations', () => {
    it('should get kitchen stations status', async () => {
      const response = await api.get('/kitchen/stations');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data.data)).toBe(true);
    });
  });

  describe('GET /kitchen/analytics', () => {
    it('should get kitchen performance metrics', async () => {
      const response = await api.get('/kitchen/analytics');

      expect(response.status).toBe(200);
      expect(response.data.data).toHaveProperty('avgPrepTime');
      expect(response.data.data).toHaveProperty('ordersInProgress');
    });
  });
});
