import { describe, it, expect, beforeAll } from 'vitest';
import axios from 'axios';

const API_URL = process.env.API_URL || 'http://localhost:8055';
const api = axios.create({ baseURL: API_URL });

describe('Waitlist Endpoint', () => {
  let authToken: string;
  let waitlistId: string;

  beforeAll(async () => {
    const response = await api.post('/auth/login', {
      email: 'customer@example.com',
      password: 'password',
    });
    authToken = response.data.data.access_token;
    api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
  });

  it('should add to waitlist', async () => {
    const response = await api.post('/waitlist', {
      name: 'John Doe',
      partySize: 4,
      phone: '+1234567890',
    });
    expect(response.status).toBe(200);
    expect(response.data.data).toHaveProperty('id');
    expect(response.data.data).toHaveProperty('estimatedWait');
    waitlistId = response.data.data.id;
  });

  it('should get waitlist position', async () => {
    const response = await api.get(`/waitlist/${waitlistId}/position`);
    expect(response.status).toBe(200);
    expect(response.data.data).toHaveProperty('position');
  });

  it('should notify customer', async () => {
    const response = await api.post(`/waitlist/${waitlistId}/notify`);
    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
  });

  it('should remove from waitlist', async () => {
    const response = await api.delete(`/waitlist/${waitlistId}`);
    expect(response.status).toBe(200);
  });

  it('should get current waitlist', async () => {
    const response = await api.get('/waitlist/current');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.data.data)).toBe(true);
  });
});
