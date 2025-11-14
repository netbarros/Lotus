import { describe, it, expect, beforeAll } from 'vitest';
import axios from 'axios';

const API_URL = process.env.API_URL || 'http://localhost:8055';
const api = axios.create({ baseURL: API_URL });

describe('Restaurant Inventory Endpoint', () => {
  let authToken: string;

  beforeAll(async () => {
    const response = await api.post('/auth/login', {
      email: 'admin@example.com',
      password: 'password',
    });
    authToken = response.data.data.access_token;
    api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
  });

  it('should get inventory items', async () => {
    const response = await api.get('/inventory');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.data.data)).toBe(true);
  });

  it('should update inventory quantity', async () => {
    const response = await api.post('/inventory/1/adjust', { quantity: 50, reason: 'Restock' });
    expect(response.status).toBe(200);
    expect(response.data.data).toHaveProperty('newQuantity');
  });

  it('should get low stock items', async () => {
    const response = await api.get('/inventory/low-stock');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.data.data)).toBe(true);
  });

  it('should track inventory usage', async () => {
    const response = await api.post('/inventory/track-usage', {
      itemId: 1,
      quantity: 2,
      orderId: 1,
    });
    expect(response.status).toBe(200);
  });
});
