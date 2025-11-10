import { describe, it, expect, beforeAll } from 'vitest';
import axios from 'axios';

const API_URL = process.env.API_URL || 'http://localhost:8055';
const api = axios.create({ baseURL: API_URL });

describe('Restaurant Reviews Endpoint', () => {
  let authToken: string;

  beforeAll(async () => {
    const response = await api.post('/auth/login', { email: 'customer@example.com', password: 'password' });
    authToken = response.data.data.access_token;
    api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
  });

  it('should create review', async () => {
    const response = await api.post('/reviews', { restaurantId: 1, rating: 5, comment: 'Great!' });
    expect(response.status).toBe(200);
    expect(response.data.data.rating).toBe(5);
  });

  it('should get reviews', async () => {
    const response = await api.get('/reviews/restaurant/1');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.data.data)).toBe(true);
  });

  it('should calculate average rating', async () => {
    const response = await api.get('/reviews/restaurant/1/average');
    expect(response.status).toBe(200);
    expect(response.data.data).toHaveProperty('averageRating');
  });
});
