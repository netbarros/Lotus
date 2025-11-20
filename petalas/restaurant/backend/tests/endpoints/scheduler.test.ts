import { describe, it, expect, beforeAll } from 'vitest';
import axios from 'axios';

const API_URL = process.env.API_URL || 'http://localhost:8055';
const api = axios.create({ baseURL: API_URL });

describe('Scheduler Endpoint', () => {
  let authToken: string;

  beforeAll(async () => {
    const response = await api.post('/auth/login', {
      email: 'admin@example.com',
      password: 'password',
    });
    authToken = response.data.data.access_token;
    api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
  });

  it('should create staff schedule', async () => {
    const response = await api.post('/scheduler/shifts', {
      staffId: 1,
      date: '2025-12-01',
      startTime: '09:00',
      endTime: '17:00',
    });
    expect(response.status).toBe(200);
  });

  it('should get staff schedule', async () => {
    const response = await api.get('/scheduler/shifts?date=2025-12-01');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.data.data)).toBe(true);
  });

  it('should mark staff availability', async () => {
    const response = await api.post('/scheduler/availability', {
      staffId: 1,
      date: '2025-12-01',
      available: true,
    });
    expect(response.status).toBe(200);
  });
});
