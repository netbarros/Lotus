import request from 'supertest';
import { describe, it, expect, beforeAll } from '@jest/globals';

const API_URL = process.env.API_URL || 'http://localhost:8055';

describe('Patients Endpoints - Healthcare', () => {
  let authToken: string;

  beforeAll(async () => {
    const response = await request(API_URL)
      .post('/auth/login')
      .send({ email: 'test@healthcare.com', password: 'test123456' });
    authToken = response.body.data.access_token;
  });

  describe('GET /petalas/healthcare/patients/:id', () => {
    it('should get patient details', async () => {
      const response = await request(API_URL)
        .get('/petalas/healthcare/patients/patient-123')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data).toHaveProperty('mrn');
    });
  });
});
