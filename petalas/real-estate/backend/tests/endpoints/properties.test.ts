import { describe, it, expect, beforeAll } from 'vitest';
import axios from 'axios';

const API_URL = process.env.API_URL || 'http://localhost:8055';
const api = axios.create({ baseURL: API_URL });

describe('Properties Endpoint', () => {
  let authToken: string;

  beforeAll(async () => {
    const response = await api.post('/auth/login', {
      email: 'agent@example.com',
      password: 'password',
    });
    authToken = response.data.data.access_token;
    api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
  });

  it('should create property listing', async () => {
    const response = await api.post('/properties', {
      title: 'Beach House',
      price: 500000,
      type: 'sale',
    });
    expect(response.status).toBe(200);
    expect(response.data.data).toHaveProperty('id');
  });

  it('should search properties', async () => {
    const response = await api.get('/properties?price_max=600000&type=sale');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.data.data)).toBe(true);
  });

  it('should get property details', async () => {
    const response = await api.get('/properties/1');
    expect(response.status).toBe(200);
    expect(response.data.data).toHaveProperty('title');
  });

  it('should update property', async () => {
    const response = await api.patch('/properties/1', { price: 550000 });
    expect(response.status).toBe(200);
  });
});
