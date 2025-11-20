import request from 'supertest';
import { describe, it, expect, beforeAll } from '@jest/globals';

const API_URL = process.env.API_URL || 'http://localhost:8055';

describe('Appointments Endpoints - Healthcare', () => {
  let authToken: string;

  beforeAll(async () => {
    const response = await request(API_URL)
      .post('/auth/login')
      .send({ email: 'test@healthcare.com', password: 'test123456' });
    authToken = response.body.data.access_token;
  });

  describe('POST /petalas/healthcare/appointments', () => {
    it('should create appointment', async () => {
      const response = await request(API_URL)
        .post('/petalas/healthcare/appointments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          tenant_id: 'test-tenant',
          patient_id: 'patient-123',
          provider_id: 'provider-123',
          appointment_date: '2025-12-01',
          appointment_time: '14:00',
          appointment_type: 'checkup',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty('appointment_id');
    });
  });
});
