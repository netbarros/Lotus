import request from 'supertest';
import { describe, it, expect, beforeAll } from '@jest/globals';

const API_URL = process.env.API_URL || 'http://localhost:8055';

describe('Reservations Endpoints - Restaurant', () => {
  let authToken: string;

  beforeAll(async () => {
    const response = await request(API_URL)
      .post('/auth/login')
      .send({ email: 'test@restaurant.com', password: 'test123456' });
    authToken = response.body.data.access_token;
  });

  describe('POST /petalas/restaurant/reservations', () => {
    it('should create reservation', async () => {
      const response = await request(API_URL)
        .post('/petalas/restaurant/reservations')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          tenant_id: 'test-tenant',
          restaurant_id: 'rest-123',
          customer_name: 'John Doe',
          customer_email: 'john@example.com',
          customer_phone: '+1234567890',
          reservation_date: '2025-12-01',
          reservation_time: '19:00',
          party_size: 4,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty('reservation_id');
    });

    it('should fail without required fields', async () => {
      await request(API_URL)
        .post('/petalas/restaurant/reservations')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ party_size: 2 })
        .expect(400);
    });
  });

  describe('POST /petalas/restaurant/reservations/check-availability', () => {
    it('should check table availability', async () => {
      const response = await request(API_URL)
        .post('/petalas/restaurant/reservations/check-availability')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          restaurant_id: 'rest-123',
          reservation_date: '2025-12-01',
          reservation_time: '19:00',
          party_size: 4,
        })
        .expect(200);

      expect(response.body).toHaveProperty('available');
    });
  });
});
