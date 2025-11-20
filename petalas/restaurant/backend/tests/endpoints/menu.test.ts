import request from 'supertest';
import { describe, it, expect, beforeAll } from '@jest/globals';

const API_URL = process.env.API_URL || 'http://localhost:8055';

describe('Menu Endpoints - Restaurant', () => {
  let authToken: string;

  beforeAll(async () => {
    const response = await request(API_URL)
      .post('/auth/login')
      .send({ email: 'test@restaurant.com', password: 'test123456' });
    authToken = response.body.data.access_token;
  });

  describe('GET /petalas/restaurant/menu', () => {
    it('should list menus', async () => {
      const response = await request(API_URL)
        .get('/petalas/restaurant/menu?tenant_id=test-tenant')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toBeInstanceOf(Array);
    });
  });

  describe('GET /petalas/restaurant/menu/:id/items', () => {
    it('should list menu items', async () => {
      const response = await request(API_URL)
        .get('/petalas/restaurant/menu/menu-123/items')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
    });

    it('should filter available items', async () => {
      const response = await request(API_URL)
        .get('/petalas/restaurant/menu/menu-123/items?available_only=true')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      response.body.data.forEach((item: any) => {
        expect(item.available).toBe(true);
      });
    });
  });

  describe('GET /petalas/restaurant/menu/items/search', () => {
    it('should search menu items', async () => {
      const response = await request(API_URL)
        .get('/petalas/restaurant/menu/items/search?q=pizza&tenant_id=test')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data).toBeInstanceOf(Array);
    });
  });
});
