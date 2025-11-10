import { describe, it, expect, beforeAll } from 'vitest';
import axios from 'axios';

const API_URL = process.env.API_URL || 'http://localhost:8055';
const api = axios.create({ baseURL: API_URL });

describe('Instagram Sync Endpoint', () => {
  let authToken: string;

  beforeAll(async () => {
    const response = await api.post('/auth/login', {
      email: 'admin@example.com',
      password: 'password'
    });
    authToken = response.data.data.access_token;
    api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
  });

  describe('POST /instagram/connect', () => {
    it('should connect Instagram account', async () => {
      const response = await api.post('/instagram/connect', {
        accessToken: 'ig_access_token_123',
        username: 'fashion_brand'
      });

      expect(response.status).toBe(200);
      expect(response.data.data).toHaveProperty('connected');
      expect(response.data.data).toHaveProperty('username');
    });
  });

  describe('POST /instagram/sync-products', () => {
    it('should sync products from Instagram', async () => {
      const response = await api.post('/instagram/sync-products');

      expect(response.status).toBe(200);
      expect(response.data.data).toHaveProperty('synced');
      expect(response.data.data).toHaveProperty('productsCount');
    });
  });

  describe('POST /instagram/tag-product', () => {
    it('should tag product in Instagram post', async () => {
      const response = await api.post('/instagram/tag-product', {
        postId: 'ig_post_123',
        productId: 1,
        coordinates: { x: 0.5, y: 0.5 }
      });

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
    });
  });

  describe('GET /instagram/posts', () => {
    it('should get Instagram posts', async () => {
      const response = await api.get('/instagram/posts');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data.data)).toBe(true);
    });
  });

  describe('GET /instagram/analytics', () => {
    it('should get Instagram analytics', async () => {
      const response = await api.get('/instagram/analytics');

      expect(response.status).toBe(200);
      expect(response.data.data).toHaveProperty('followers');
      expect(response.data.data).toHaveProperty('engagement');
      expect(response.data.data).toHaveProperty('sales');
    });
  });

  describe('POST /instagram/publish-product', () => {
    it('should publish product to Instagram', async () => {
      const response = await api.post('/instagram/publish-product', {
        productId: 1,
        caption: 'New arrival! 🔥',
        hashtags: ['fashion', 'style', 'ootd']
      });

      expect(response.status).toBe(200);
      expect(response.data.data).toHaveProperty('postId');
      expect(response.data.data).toHaveProperty('postUrl');
    });
  });
});
