import { describe, it, expect, beforeAll } from 'vitest';
import axios from 'axios';

const API_URL = process.env.API_URL || 'http://localhost:8055';
const api = axios.create({ baseURL: API_URL });

describe('Shipping Endpoint', () => {
  let authToken: string;

  beforeAll(async () => {
    const response = await api.post('/auth/login', {
      email: 'admin@example.com',
      password: 'password',
    });
    authToken = response.data.data.access_token;
    api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
  });

  describe('POST /shipping/calculate', () => {
    it('should calculate shipping cost', async () => {
      const response = await api.post('/shipping/calculate', {
        zipCode: '90210',
        weight: 2.5,
        items: [{ id: 1, quantity: 2 }],
      });

      expect(response.status).toBe(200);
      expect(response.data.data).toHaveProperty('cost');
      expect(response.data.data).toHaveProperty('estimatedDays');
      expect(response.data.data).toHaveProperty('carrier');
    });
  });

  describe('POST /shipping/track', () => {
    it('should track shipment', async () => {
      const response = await api.post('/shipping/track', {
        trackingNumber: 'TRACK123456',
      });

      expect(response.status).toBe(200);
      expect(response.data.data).toHaveProperty('status');
      expect(response.data.data).toHaveProperty('events');
    });
  });

  describe('GET /shipping/zones', () => {
    it('should get shipping zones', async () => {
      const response = await api.get('/shipping/zones');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data.data)).toBe(true);
    });
  });

  describe('POST /shipping/label', () => {
    it('should generate shipping label', async () => {
      const response = await api.post('/shipping/label', {
        orderId: 1,
        carrier: 'ups',
      });

      expect(response.status).toBe(200);
      expect(response.data.data).toHaveProperty('labelUrl');
      expect(response.data.data).toHaveProperty('trackingNumber');
    });
  });
});
