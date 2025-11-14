import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import axios from 'axios';

const API_URL = process.env.API_URL || 'http://localhost:8055';
const api = axios.create({ baseURL: API_URL });

describe('Reviews Endpoint', () => {
  let authToken: string;
  let testReviewId: string;

  beforeAll(async () => {
    const response = await api.post('/auth/login', {
      email: 'admin@example.com',
      password: 'password',
    });
    authToken = response.data.data.access_token;
    api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
  });

  afterAll(async () => {
    if (testReviewId) {
      await api.delete(`/items/reviews/${testReviewId}`).catch(() => {});
    }
  });

  describe('POST /reviews', () => {
    it('should create a new review', async () => {
      const reviewData = {
        product_id: 1,
        customer_id: 1,
        rating: 5,
        title: 'Great product!',
        comment: 'Excellent quality and fast shipping',
        verified_purchase: true,
      };

      const response = await api.post('/reviews', reviewData);

      expect(response.status).toBe(200);
      expect(response.data.data).toHaveProperty('id');
      expect(response.data.data.rating).toBe(5);
      expect(response.data.data.verified_purchase).toBe(true);

      testReviewId = response.data.data.id;
    });

    it('should validate rating range (1-5)', async () => {
      const invalidReview = {
        product_id: 1,
        customer_id: 1,
        rating: 6,
        comment: 'Invalid rating',
      };

      await expect(api.post('/reviews', invalidReview)).rejects.toThrow();
    });
  });

  describe('GET /reviews/product/:productId', () => {
    it('should retrieve reviews for a product', async () => {
      const response = await api.get('/reviews/product/1');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data.data)).toBe(true);
    });

    it('should filter by rating', async () => {
      const response = await api.get('/reviews/product/1?rating=5');

      expect(response.status).toBe(200);
      response.data.data.forEach((review: any) => {
        expect(review.rating).toBe(5);
      });
    });
  });

  describe('PATCH /reviews/:id', () => {
    it('should update review', async () => {
      const response = await api.patch(`/reviews/${testReviewId}`, {
        comment: 'Updated comment after more use',
      });

      expect(response.status).toBe(200);
      expect(response.data.data.comment).toContain('Updated comment');
    });
  });

  describe('POST /reviews/:id/helpful', () => {
    it('should mark review as helpful', async () => {
      const response = await api.post(`/reviews/${testReviewId}/helpful`);

      expect(response.status).toBe(200);
      expect(response.data.data.helpful_count).toBeGreaterThan(0);
    });
  });

  describe('POST /reviews/:id/moderate', () => {
    it('should moderate review', async () => {
      const response = await api.post(`/reviews/${testReviewId}/moderate`, {
        status: 'approved',
      });

      expect(response.status).toBe(200);
      expect(response.data.data.moderation_status).toBe('approved');
    });
  });

  describe('GET /reviews/analytics/:productId', () => {
    it('should return review analytics', async () => {
      const response = await api.get('/reviews/analytics/1');

      expect(response.status).toBe(200);
      expect(response.data.data).toHaveProperty('averageRating');
      expect(response.data.data).toHaveProperty('totalReviews');
      expect(response.data.data).toHaveProperty('ratingDistribution');
    });
  });
});
