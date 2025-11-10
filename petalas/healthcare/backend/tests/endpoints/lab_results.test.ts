import { describe, it, expect, beforeAll } from 'vitest';
import axios from 'axios';

const API_URL = process.env.API_URL || 'http://localhost:8055';
const api = axios.create({ baseURL: API_URL });

describe('Lab Results Endpoint', () => {
  let authToken: string;

  beforeAll(async () => {
    const response = await api.post('/auth/login', { email: 'lab@example.com', password: 'password' });
    authToken = response.data.data.access_token;
    api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
  });

  it('should upload lab results', async () => {
    const response = await api.post('/lab-results', { patientId: 1, testType: 'blood', results: {} });
    expect(response.status).toBe(200);
  });

  it('should get patient lab history', async () => {
    const response = await api.get('/lab-results/patient/1');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.data.data)).toBe(true);
  });

  it('should flag abnormal results', async () => {
    const response = await api.post('/lab-results/analyze', { resultId: 1 });
    expect(response.status).toBe(200);
    expect(response.data.data).toHaveProperty('flags');
  });
});
