import request from 'supertest'
import { describe, it, expect, beforeAll } from '@jest/globals'

const API_URL = process.env.API_URL || 'http://localhost:8055'

describe('Prescriptions Endpoints - Healthcare', () => {
  let authToken: string

  beforeAll(async () => {
    const response = await request(API_URL)
      .post('/auth/login')
      .send({ email: 'test@healthcare.com', password: 'test123456' })
    authToken = response.body.data.access_token
  })

  describe('POST /petalas/healthcare/prescriptions', () => {
    it('should create prescription', async () => {
      const response = await request(API_URL)
        .post('/petalas/healthcare/prescriptions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          tenant_id: 'test-tenant',
          patient_id: 'patient-123',
          provider_id: 'provider-123',
          medication_name: 'Amoxicillin',
          dosage: '500mg',
          quantity: 30
        })
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body).toHaveProperty('prescription_id')
    })
  })
})
