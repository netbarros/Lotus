import request from 'supertest';
import { describe, it, expect, beforeAll } from '@jest/globals';

const API_URL = process.env.API_URL || 'http://localhost:8055';

describe('Orders Endpoints - Restaurant', () => {
  let authToken: string;
  let testOrderId: string;

  beforeAll(async () => {
    const response = await request(API_URL)
      .post('/auth/login')
      .send({ email: 'test@restaurant.com', password: 'test123456' });
    authToken = response.body.data.access_token;
  });

  describe('POST /petalas/restaurant/orders', () => {
    it('should create order', async () => {
      const response = await request(API_URL)
        .post('/petalas/restaurant/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          tenant_id: 'test-tenant',
          restaurant_id: 'rest-123',
          table_id: 'table-5',
          items: [{ menu_item_id: 'item-1', quantity: 2 }],
          order_type: 'dine_in',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      testOrderId = response.body.order_id;
    });
  });

  describe('GET /petalas/restaurant/orders/:id', () => {
    it('should get order details', async () => {
      if (!testOrderId) return;

      const response = await request(API_URL)
        .get(`/petalas/restaurant/orders/${testOrderId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data).toHaveProperty('id');
    });
  });

  describe('PATCH /petalas/restaurant/orders/:id/status', () => {
    it('should update order status', async () => {
      if (!testOrderId) return;

      const response = await request(API_URL)
        .patch(`/petalas/restaurant/orders/${testOrderId}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'confirmed' })
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });
});
