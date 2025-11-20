import { describe, it, expect, beforeAll } from 'vitest';
import axios from 'axios';

const API_URL = process.env.API_URL || 'http://localhost:8055';
const api = axios.create({ baseURL: API_URL });

describe('Restaurant Payment Endpoint', () => {
  let authToken: string;

  beforeAll(async () => {
    const response = await api.post('/auth/login', {
      email: 'customer@example.com',
      password: 'password',
    });
    authToken = response.data.data.access_token;
    api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
  });

  it('should create payment intent', async () => {
    const response = await api.post('/payment/create-intent', { orderId: 1, amount: 5000 });
    expect(response.status).toBe(200);
    expect(response.data.data).toHaveProperty('clientSecret');
  });

  it('should process payment', async () => {
    const response = await api.post('/payment/process', {
      paymentIntentId: 'pi_test123',
      paymentMethod: 'pm_test',
    });
    expect(response.status).toBe(200);
  });

  it('should split bill', async () => {
    const response = await api.post('/payment/split-bill', {
      orderId: 1,
      splits: [
        { customerId: 1, amount: 2500 },
        { customerId: 2, amount: 2500 },
      ],
    });
    expect(response.status).toBe(200);
  });

  it('should process tip', async () => {
    const response = await api.post('/payment/tip', { orderId: 1, amount: 500 });
    expect(response.status).toBe(200);
  });

  it('should refund payment', async () => {
    const response = await api.post('/payment/refund', {
      orderId: 1,
      amount: 5000,
      reason: 'customer_request',
    });
    expect(response.status).toBe(200);
  });
});
