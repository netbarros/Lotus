import { describe, it, expect, beforeAll } from 'vitest';
import axios from 'axios';

const API_URL = process.env.API_URL || 'http://localhost:8055';
const api = axios.create({ baseURL: API_URL });

describe('Healthcare Scheduler', () => {
  let authToken: string;
  beforeAll(async () => {
    const response = await api.post('/auth/login', { email: 'admin@example.com', password: 'password' });
    authToken = response.data.data.access_token;
    api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
  });
  it('should get provider schedule', async () => {
    const response = await api.get('/scheduler/provider/1');
    expect(response.status).toBe(200);
  });
});
