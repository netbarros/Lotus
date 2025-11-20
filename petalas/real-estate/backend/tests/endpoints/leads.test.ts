import { describe, it, expect, beforeAll } from 'vitest';
import axios from 'axios';

const API_URL = process.env.API_URL || 'http://localhost:8055';
const api = axios.create({ baseURL: API_URL });

describe('Leads Endpoint', () => {
  let authToken: string;

  beforeAll(async () => {
    const response = await api.post('/auth/login', {
      email: 'agent@example.com',
      password: 'password',
    });
    authToken = response.data.data.access_token;
    api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
  });

  it('should create lead', async () => {
    const response = await api.post('/leads', {
      name: 'John Doe',
      email: 'john@example.com',
      propertyId: 1,
    });
    expect(response.status).toBe(200);
  });

  it('should get agent leads', async () => {
    const response = await api.get('/leads/agent/1');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.data.data)).toBe(true);
  });

  it('should update lead status', async () => {
    const response = await api.patch('/leads/1', { status: 'qualified' });
    expect(response.status).toBe(200);
  });
});
