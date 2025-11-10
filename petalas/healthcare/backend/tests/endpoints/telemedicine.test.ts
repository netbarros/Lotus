import { describe, it, expect, beforeAll } from 'vitest';
import axios from 'axios';

const API_URL = process.env.API_URL || 'http://localhost:8055';
const api = axios.create({ baseURL: API_URL });

describe('Telemedicine Endpoint', () => {
  let authToken: string;

  beforeAll(async () => {
    const response = await api.post('/auth/login', { email: 'doctor@example.com', password: 'password' });
    authToken = response.data.data.access_token;
    api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
  });

  it('should create video consultation session', async () => {
    const response = await api.post('/telemedicine/session', { patientId: 1, providerId: 1 });
    expect(response.status).toBe(200);
    expect(response.data.data).toHaveProperty('roomUrl');
  });

  it('should get consultation history', async () => {
    const response = await api.get('/telemedicine/history/patient/1');
    expect(response.status).toBe(200);
  });
});
