import { describe, it, expect, beforeAll } from 'vitest';
import axios from 'axios';

const API_URL = process.env.API_URL || 'http://localhost:8055';
const api = axios.create({ baseURL: API_URL });

describe('Providers', () => {
  let authToken: string;
  beforeAll(async () => {
    const response = await api.post('/auth/login', { email: 'admin@example.com', password: 'password' });
    authToken = response.data.data.access_token;
    api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
  });
  it('should create provider', async () => {
    const response = await api.post('/providers', { name: 'Dr. Smith', specialty: 'Cardiology' });
    expect(response.status).toBe(200);
  });
});
