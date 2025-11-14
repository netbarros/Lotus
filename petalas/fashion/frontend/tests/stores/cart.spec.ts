import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useCartStore } from '@/stores/cart';
import { cartApi } from '@/services/api';

vi.mock('@/services/api', () => ({
  cartApi: {
    get: vi.fn(),
    add: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
    clear: vi.fn(),
  },
}));

describe('Cart Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('initializes with empty cart', () => {
    const store = useCartStore();

    expect(store.items).toEqual([]);
    expect(store.itemsCount).toBe(0);
    expect(store.subtotal).toBe(0);
    expect(store.total).toBe(0);
  });

  it('fetches cart successfully', async () => {
    const store = useCartStore();
    const mockCart = {
      data: {
        data: {
          items: [
            { id: '1', product_id: 'p1', quantity: 2, price: 50, product: { name: 'Product 1' } },
          ],
          totals: {
            subtotal: 100,
            shipping: 5.99,
            tax: 10.5,
            discount: 0,
            total: 116.49,
          },
        },
      },
    };

    vi.mocked(cartApi.get).mockResolvedValueOnce(mockCart);

    await store.fetchCart();

    expect(store.items).toHaveLength(1);
    expect(store.items[0].product_id).toBe('p1');
    expect(store.subtotal).toBe(100);
    expect(store.total).toBe(116.49);
    expect(store.itemsCount).toBe(2);
  });

  it('adds item to cart', async () => {
    const store = useCartStore();
    const mockResponse = {
      data: {
        data: {
          id: '1',
          product_id: 'p1',
          quantity: 1,
          price: 50,
        },
      },
    };

    vi.mocked(cartApi.add).mockResolvedValueOnce(mockResponse);

    await store.addItem('p1', 1);

    expect(cartApi.add).toHaveBeenCalledWith('p1', 1, undefined);
  });

  it('updates item quantity', async () => {
    const store = useCartStore();
    store.items = [
      { id: '1', product_id: 'p1', quantity: 2, price: 50, product: { name: 'Product 1' } },
    ];

    const mockResponse = {
      data: {
        data: { id: '1', quantity: 3 },
      },
    };

    vi.mocked(cartApi.update).mockResolvedValueOnce(mockResponse);

    await store.updateQuantity('1', 3);

    expect(cartApi.update).toHaveBeenCalledWith('1', 3);
  });

  it('removes item from cart', async () => {
    const store = useCartStore();
    store.items = [
      { id: '1', product_id: 'p1', quantity: 2, price: 50, product: { name: 'Product 1' } },
      { id: '2', product_id: 'p2', quantity: 1, price: 30, product: { name: 'Product 2' } },
    ];

    vi.mocked(cartApi.remove).mockResolvedValueOnce({ data: { success: true } });

    await store.removeItem('1');

    expect(store.items).toHaveLength(1);
    expect(store.items[0].id).toBe('2');
    expect(cartApi.remove).toHaveBeenCalledWith('1');
  });

  it('clears cart', async () => {
    const store = useCartStore();
    store.items = [
      { id: '1', product_id: 'p1', quantity: 2, price: 50, product: { name: 'Product 1' } },
    ];

    vi.mocked(cartApi.clear).mockResolvedValueOnce({ data: { success: true } });

    await store.clearCart();

    expect(store.items).toEqual([]);
    expect(store.itemsCount).toBe(0);
    expect(store.subtotal).toBe(0);
    expect(cartApi.clear).toHaveBeenCalled();
  });

  it('calculates items count correctly', () => {
    const store = useCartStore();
    store.items = [
      { id: '1', product_id: 'p1', quantity: 2, price: 50, product: { name: 'Product 1' } },
      { id: '2', product_id: 'p2', quantity: 3, price: 30, product: { name: 'Product 2' } },
    ];

    expect(store.itemsCount).toBe(5);
  });

  it('calculates subtotal correctly', () => {
    const store = useCartStore();
    store.items = [
      { id: '1', product_id: 'p1', quantity: 2, price: 50, product: { name: 'Product 1' } },
      { id: '2', product_id: 'p2', quantity: 3, price: 30, product: { name: 'Product 2' } },
    ];

    expect(store.subtotal).toBe(190); // (2 * 50) + (3 * 30)
  });

  it('handles free shipping threshold', () => {
    const store = useCartStore();

    // Below threshold
    store.totals.subtotal = 40;
    expect(store.freeShippingRemaining).toBe(10); // 50 - 40

    // Above threshold
    store.totals.subtotal = 60;
    expect(store.freeShippingRemaining).toBe(0);
  });
});
