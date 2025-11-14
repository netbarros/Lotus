import { describe, it, expect, beforeAll } from 'vitest';
import axios from 'axios';

const API_URL = process.env.API_URL || 'http://localhost:8055';
const api = axios.create({ baseURL: API_URL });

describe('Loyalty Endpoint', () => {
  let authToken: string;

  beforeAll(async () => {
    const response = await api.post('/auth/login', {
      email: 'customer@example.com',
      password: 'password',
    });
    authToken = response.data.data.access_token;
    api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
  });

  describe('GET /loyalty/points', () => {
    it('should get customer loyalty points', async () => {
      const response = await api.get('/loyalty/points');

      expect(response.status).toBe(200);
      expect(response.data.data).toHaveProperty('totalPoints');
      expect(response.data.data).toHaveProperty('tier');
      expect(response.data.data).toHaveProperty('nextTier');
    });
  });

  describe('POST /loyalty/redeem', () => {
    it('should redeem loyalty points', async () => {
      const response = await api.post('/loyalty/redeem', {
        points: 100,
        rewardId: 1,
      });

      expect(response.status).toBe(200);
      expect(response.data.data).toHaveProperty('couponCode');
    });

    it('should reject insufficient points', async () => {
      await expect(
        api.post('/loyalty/redeem', {
          points: 999999,
          rewardId: 1,
        })
      ).rejects.toThrow();
    });
  });

  describe('GET /loyalty/history', () => {
    it('should get loyalty points history', async () => {
      const response = await api.get('/loyalty/history');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data.data)).toBe(true);
    });
  });

  describe('GET /loyalty/rewards', () => {
    it('should get available rewards', async () => {
      const response = await api.get('/loyalty/rewards');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data.data)).toBe(true);
    });
  });

  describe('POST /loyalty/refer', () => {
    it('should generate referral code', async () => {
      const response = await api.post('/loyalty/refer');

      expect(response.status).toBe(200);
      expect(response.data.data).toHaveProperty('referralCode');
      expect(response.data.data).toHaveProperty('referralUrl');
    });
  });
});
