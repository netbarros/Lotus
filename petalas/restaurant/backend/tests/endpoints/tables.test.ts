import { describe, it, expect, beforeAll } from 'vitest';
import axios from 'axios';

const API_URL = process.env.API_URL || 'http://localhost:8055';
const api = axios.create({ baseURL: API_URL });

describe('Tables Endpoint', () => {
  let authToken: string;

  beforeAll(async () => {
    const response = await api.post('/auth/login', {
      email: 'admin@example.com',
      password: 'password',
    });
    authToken = response.data.data.access_token;
    api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
  });

  it('should get available tables', async () => {
    const response = await api.get('/tables/available?date=2025-12-01&time=19:00&partySize=4');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.data.data)).toBe(true);
  });

  it('should update table status', async () => {
    const response = await api.patch('/tables/1', { status: 'occupied' });
    expect(response.status).toBe(200);
    expect(response.data.data.status).toBe('occupied');
  });

  it('should get table layout', async () => {
    const response = await api.get('/tables/layout');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.data.data)).toBe(true);
  });

  it('should assign order to table', async () => {
    const response = await api.post('/tables/1/assign-order', { orderId: 1 });
    expect(response.status).toBe(200);
  });
});
