import { describe, it, expect, beforeAll } from 'vitest';
import axios from 'axios';

const API_URL = process.env.API_URL || 'http://localhost:8055';
const api = axios.create({ baseURL: API_URL });

describe('Healthcare Payment', () => {
  let authToken: string;
  beforeAll(async () => {
    const response = await api.post('/auth/login', { email: 'patient@example.com', password: 'password' });
    authToken = response.data.data.access_token;
    api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
  });
  it('should process payment', async () => {
    const response = await api.post('/payment/process', { appointmentId: 1, amount: 100 });
    expect(response.status).toBe(200);
  });
});
