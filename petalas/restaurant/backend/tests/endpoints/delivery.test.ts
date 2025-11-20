import { describe, it, expect, beforeAll } from 'vitest';
import axios from 'axios';

const API_URL = process.env.API_URL || 'http://localhost:8055';
const api = axios.create({ baseURL: API_URL });

describe('Delivery Endpoint', () => {
  let authToken: string;

  beforeAll(async () => {
    const response = await api.post('/auth/login', {
      email: 'admin@example.com',
      password: 'password',
    });
    authToken = response.data.data.access_token;
    api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
  });

  describe('POST /delivery/assign', () => {
    it('should assign order to driver', async () => {
      const response = await api.post('/delivery/assign', {
        orderId: 1,
        driverId: 1,
      });

      expect(response.status).toBe(200);
      expect(response.data.data).toHaveProperty('assigned');
    });
  });

  describe('GET /delivery/:id/track', () => {
    it('should track delivery status', async () => {
      const response = await api.get('/delivery/1/track');

      expect(response.status).toBe(200);
      expect(response.data.data).toHaveProperty('status');
      expect(response.data.data).toHaveProperty('location');
      expect(response.data.data).toHaveProperty('estimatedArrival');
    });
  });

  describe('POST /delivery/:id/update-status', () => {
    it('should update delivery status', async () => {
      const response = await api.post('/delivery/1/update-status', {
        status: 'en_route',
      });

      expect(response.status).toBe(200);
      expect(response.data.data.status).toBe('en_route');
    });
  });

  describe('GET /delivery/zones', () => {
    it('should get delivery zones', async () => {
      const response = await api.get('/delivery/zones');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data.data)).toBe(true);
    });
  });

  describe('POST /delivery/calculate-fee', () => {
    it('should calculate delivery fee', async () => {
      const response = await api.post('/delivery/calculate-fee', {
        address: '123 Main St',
        zipCode: '90210',
      });

      expect(response.status).toBe(200);
      expect(response.data.data).toHaveProperty('fee');
      expect(response.data.data).toHaveProperty('estimatedTime');
    });
  });
});
