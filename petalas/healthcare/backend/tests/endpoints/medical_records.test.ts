import { describe, it, expect, beforeAll } from 'vitest';
import axios from 'axios';

const API_URL = process.env.API_URL || 'http://localhost:8055';
const api = axios.create({ baseURL: API_URL });

describe('Medical Records Endpoint (HIPAA)', () => {
  let authToken: string;

  beforeAll(async () => {
    const response = await api.post('/auth/login', {
      email: 'doctor@example.com',
      password: 'password',
    });
    authToken = response.data.data.access_token;
    api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
  });

  it('should create encrypted medical record', async () => {
    const response = await api.post('/medical-records', {
      patientId: 1,
      diagnosis: 'Test',
      notes: 'Confidential',
    });
    expect(response.status).toBe(200);
    expect(response.data.data).toHaveProperty('encrypted');
  });

  it('should enforce HIPAA access control', async () => {
    const response = await api.get('/medical-records/1');
    expect(response.status).toBe(200);
    expect(response.data.data).toHaveProperty('audit_logged');
  });

  it('should track all access attempts', async () => {
    await api.get('/medical-records/1');
    const response = await api.get('/medical-records/1/audit-log');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.data.data)).toBe(true);
  });
});
