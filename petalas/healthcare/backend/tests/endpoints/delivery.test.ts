import { describe, it, expect, beforeAll } from 'vitest';
import axios from 'axios';

const API_URL = process.env.API_URL || 'http://localhost:8055';
const api = axios.create({ baseURL: API_URL });

describe('Healthcare Delivery', () => {
  let authToken: string;
  beforeAll(async () => {
    const response = await api.post('/auth/login', {
      email: 'admin@example.com',
      password: 'password',
    });
    authToken = response.data.data.access_token;
    api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
  });
  it('should schedule delivery', async () => {
    const response = await api.post('/delivery/schedule', {
      prescriptionId: 1,
      address: '123 Main St',
    });
    expect(response.status).toBe(200);
  });
});
