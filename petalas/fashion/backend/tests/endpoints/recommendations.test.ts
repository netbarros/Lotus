import { describe, it, expect, beforeAll } from 'vitest';
import axios from 'axios';

const API_URL = process.env.API_URL || 'http://localhost:8055';
const api = axios.create({ baseURL: API_URL });

describe('Recommendations Endpoint', () => {
  let authToken: string;

  beforeAll(async () => {
    const response = await api.post('/auth/login', {
      email: 'customer@example.com',
      password: 'password'
    });
    authToken = response.data.data.access_token;
    api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
  });

  describe('GET /recommendations/personalized', () => {
    it('should get personalized recommendations', async () => {
      const response = await api.get('/recommendations/personalized');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data.data)).toBe(true);
      expect(response.data.data.length).toBeGreaterThan(0);
    });
  });

  describe('GET /recommendations/product/:id', () => {
    it('should get product-based recommendations', async () => {
      const response = await api.get('/recommendations/product/1');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data.data)).toBe(true);
    });
  });

  describe('GET /recommendations/trending', () => {
    it('should get trending products', async () => {
      const response = await api.get('/recommendations/trending?limit=10');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data.data)).toBe(true);
      expect(response.data.data.length).toBeLessThanOrEqual(10);
    });
  });

  describe('POST /recommendations/feedback', () => {
    it('should record recommendation feedback', async () => {
      const response = await api.post('/recommendations/feedback', {
        productId: 1,
        action: 'clicked',
        recommendationType: 'personalized'
      });

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
    });
  });

  describe('GET /recommendations/similar/:id', () => {
    it('should get similar products', async () => {
      const response = await api.get('/recommendations/similar/1');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data.data)).toBe(true);
    });
  });
});
