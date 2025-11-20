import { describe, it, expect, beforeAll } from 'vitest';
import axios from 'axios';

const API_URL = process.env.API_URL || 'http://localhost:8055';
const api = axios.create({ baseURL: API_URL });

describe('Notifications Endpoint', () => {
  let authToken: string;

  beforeAll(async () => {
    const response = await api.post('/auth/login', {
      email: 'admin@example.com',
      password: 'password',
    });
    authToken = response.data.data.access_token;
    api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
  });

  it('should send reservation confirmation', async () => {
    const response = await api.post('/notifications/reservation-confirmation', {
      reservationId: 1,
    });
    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
  });

  it('should send order status update', async () => {
    const response = await api.post('/notifications/order-status', { orderId: 1, status: 'ready' });
    expect(response.status).toBe(200);
  });

  it('should send SMS notification', async () => {
    const response = await api.post('/notifications/sms', {
      phone: '+1234567890',
      message: 'Test',
    });
    expect(response.status).toBe(200);
  });

  it('should send email notification', async () => {
    const response = await api.post('/notifications/email', {
      to: 'test@example.com',
      subject: 'Test',
      body: 'Test',
    });
    expect(response.status).toBe(200);
  });
});
