import { describe, it, expect, beforeAll } from 'vitest';
import axios from 'axios';

const API_URL = process.env.API_URL || 'http://localhost:8055';
const api = axios.create({ baseURL: API_URL });

describe('AR Try-On Endpoint', () => {
  let authToken: string;

  beforeAll(async () => {
    const response = await api.post('/auth/login', {
      email: 'customer@example.com',
      password: 'password'
    });
    authToken = response.data.data.access_token;
    api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
  });

  describe('POST /ar-tryon/session', () => {
    it('should create AR try-on session', async () => {
      const response = await api.post('/ar-tryon/session', {
        productId: 1,
        deviceType: 'mobile'
      });

      expect(response.status).toBe(200);
      expect(response.data.data).toHaveProperty('sessionId');
      expect(response.data.data).toHaveProperty('arModelUrl');
    });
  });

  describe('POST /ar-tryon/upload-photo', () => {
    it('should upload customer photo for AR', async () => {
      const formData = new FormData();
      formData.append('sessionId', 'ar_session_123');
      formData.append('photo', new Blob(['test']), 'photo.jpg');

      const response = await api.post('/ar-tryon/upload-photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      expect(response.status).toBe(200);
      expect(response.data.data).toHaveProperty('photoId');
    });
  });

  describe('POST /ar-tryon/process', () => {
    it('should process AR try-on', async () => {
      const response = await api.post('/ar-tryon/process', {
        sessionId: 'ar_session_123',
        productId: 1,
        photoId: 'photo_123'
      });

      expect(response.status).toBe(200);
      expect(response.data.data).toHaveProperty('resultImageUrl');
      expect(response.data.data).toHaveProperty('processingTime');
    });
  });

  describe('GET /ar-tryon/history', () => {
    it('should get AR try-on history', async () => {
      const response = await api.get('/ar-tryon/history');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data.data)).toBe(true);
    });
  });

  describe('GET /ar-tryon/compatible-products', () => {
    it('should get AR-compatible products', async () => {
      const response = await api.get('/ar-tryon/compatible-products');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data.data)).toBe(true);
    });
  });
});
