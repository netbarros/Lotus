import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useAuthStore } from '@/stores/auth';
import axios from 'axios';

vi.mock('axios');

describe('Auth Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('initializes with default state', () => {
    const store = useAuthStore();

    expect(store.user).toBeNull();
    expect(store.token).toBeNull();
    expect(store.isAuthenticated).toBe(false);
  });

  it('loads user from localStorage on init', () => {
    const mockUser = { id: '1', email: 'test@test.com', name: 'Test User' };
    localStorage.setItem('auth_user', JSON.stringify(mockUser));
    localStorage.setItem('auth_token', 'test-token');

    const store = useAuthStore();

    expect(store.user).toEqual(mockUser);
    expect(store.token).toBe('test-token');
    expect(store.isAuthenticated).toBe(true);
  });

  it('logs in successfully', async () => {
    const store = useAuthStore();
    const mockResponse = {
      data: {
        data: {
          access_token: 'new-token',
          user: { id: '1', email: 'test@test.com', name: 'Test User' },
        },
      },
    };

    vi.mocked(axios.post).mockResolvedValueOnce(mockResponse);

    await store.login('test@test.com', 'password123');

    expect(store.token).toBe('new-token');
    expect(store.user).toEqual(mockResponse.data.data.user);
    expect(store.isAuthenticated).toBe(true);
    expect(localStorage.getItem('auth_token')).toBe('new-token');
    expect(localStorage.getItem('auth_user')).toBe(JSON.stringify(mockResponse.data.data.user));
  });

  it('handles login failure', async () => {
    const store = useAuthStore();

    vi.mocked(axios.post).mockRejectedValueOnce(new Error('Invalid credentials'));

    await expect(store.login('test@test.com', 'wrong')).rejects.toThrow();

    expect(store.token).toBeNull();
    expect(store.user).toBeNull();
    expect(store.isAuthenticated).toBe(false);
  });

  it('registers new user successfully', async () => {
    const store = useAuthStore();
    const mockResponse = {
      data: {
        data: {
          access_token: 'new-token',
          user: { id: '2', email: 'new@test.com', name: 'New User' },
        },
      },
    };

    vi.mocked(axios.post).mockResolvedValueOnce(mockResponse);

    await store.register('New User', 'new@test.com', 'password123');

    expect(store.token).toBe('new-token');
    expect(store.user?.email).toBe('new@test.com');
    expect(store.isAuthenticated).toBe(true);
  });

  it('logs out successfully', async () => {
    const store = useAuthStore();

    // Setup authenticated state
    store.user = { id: '1', email: 'test@test.com', name: 'Test' };
    store.token = 'test-token';
    localStorage.setItem('auth_token', 'test-token');
    localStorage.setItem('auth_user', JSON.stringify(store.user));

    await store.logout();

    expect(store.user).toBeNull();
    expect(store.token).toBeNull();
    expect(store.isAuthenticated).toBe(false);
    expect(localStorage.getItem('auth_token')).toBeNull();
    expect(localStorage.getItem('auth_user')).toBeNull();
  });

  it('updates user profile', async () => {
    const store = useAuthStore();
    store.user = { id: '1', email: 'test@test.com', name: 'Test' };

    const updatedData = { name: 'Updated Name', phone: '123456789' };
    const mockResponse = {
      data: {
        data: { ...store.user, ...updatedData },
      },
    };

    vi.mocked(axios.put).mockResolvedValueOnce(mockResponse);

    await store.updateProfile(updatedData);

    expect(store.user?.name).toBe('Updated Name');
    expect(localStorage.getItem('auth_user')).toContain('Updated Name');
  });
});
