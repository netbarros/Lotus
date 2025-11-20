import { describe, it, expect, beforeAll } from 'vitest';
import axios from 'axios';

const API_URL = process.env.API_URL || 'http://localhost:8055';
const api = axios.create({ baseURL: API_URL });

describe('Restaurants Endpoint', () => {
  let authToken: string;

  beforeAll(async () => {
    const response = await api.post('/auth/login', {
      email: 'admin@example.com',
      password: 'password',
    });
    authToken = response.data.data.access_token;
    api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
  });

  it('should get restaurant info', async () => {
    const response = await api.get('/restaurants/1');
    expect(response.status).toBe(200);
    expect(response.data.data).toHaveProperty('name');
  });

  it('should update restaurant settings', async () => {
    const response = await api.patch('/restaurants/1', { openingHours: '9:00-22:00' });
    expect(response.status).toBe(200);
  });

  it('should get operating hours', async () => {
    const response = await api.get('/restaurants/1/hours');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.data.data)).toBe(true);
  });
});
