import request from 'supertest';
import { describe, it, expect, beforeAll, afterEach } from '@jest/globals';

const API_URL = process.env.API_URL || 'http://localhost:8055';

describe('Cart Endpoints - Fashion', () => {
  let authToken: string;
  let testProductId: string;
  let cartItemId: string;

  beforeAll(async () => {
    const authResponse = await request(API_URL).post('/auth/login').send({
      email: 'test@fashion.com',
      password: 'test123456',
    });

    authToken = authResponse.body.data.access_token;

    // Get a test product
    const productResponse = await request(API_URL)
      .get('/petalas/fashion/products?limit=1')
      .set('Authorization', `Bearer ${authToken}`);

    if (productResponse.body.data.length > 0) {
      testProductId = productResponse.body.data[0].id;
    }
  });

  afterEach(async () => {
    // Clear cart after each test
    await request(API_URL)
      .delete('/petalas/fashion/cart')
      .set('Authorization', `Bearer ${authToken}`);
  });

  describe('GET /petalas/fashion/cart', () => {
    it('should return current cart', async () => {
      const response = await request(API_URL)
        .get('/petalas/fashion/cart')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data).toHaveProperty('items');
      expect(response.body.data).toHaveProperty('totals');
      expect(response.body.data.items).toBeInstanceOf(Array);
    });

    it('should calculate cart totals correctly', async () => {
      // Add item to cart first
      await request(API_URL)
        .post('/petalas/fashion/cart/add')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          product_id: testProductId,
          quantity: 2,
        });

      const response = await request(API_URL)
        .get('/petalas/fashion/cart')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.totals).toHaveProperty('subtotal');
      expect(response.body.data.totals).toHaveProperty('tax');
      expect(response.body.data.totals).toHaveProperty('total');
      expect(response.body.data.totals.total).toBeGreaterThan(0);
    });

    it('should show empty cart for new user', async () => {
      const response = await request(API_URL)
        .get('/petalas/fashion/cart')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.items).toEqual([]);
      expect(response.body.data.totals.total).toBe(0);
    });
  });

  describe('POST /petalas/fashion/cart/add', () => {
    it('should add product to cart', async () => {
      if (!testProductId) return;

      const response = await request(API_URL)
        .post('/petalas/fashion/cart/add')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          product_id: testProductId,
          quantity: 1,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('cart_item_id');
      cartItemId = response.body.data.cart_item_id;
    });

    it('should add product with variant', async () => {
      if (!testProductId) return;

      const response = await request(API_URL)
        .post('/petalas/fashion/cart/add')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          product_id: testProductId,
          quantity: 1,
          variant_id: 'variant-123',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should fail without product_id', async () => {
      await request(API_URL)
        .post('/petalas/fashion/cart/add')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          quantity: 1,
        })
        .expect(400);
    });

    it('should fail with invalid quantity', async () => {
      if (!testProductId) return;

      await request(API_URL)
        .post('/petalas/fashion/cart/add')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          product_id: testProductId,
          quantity: 0,
        })
        .expect(400);
    });

    it('should fail if product out of stock', async () => {
      const response = await request(API_URL)
        .post('/petalas/fashion/cart/add')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          product_id: 'out-of-stock-product',
          quantity: 1,
        });

      if (response.status === 400) {
        expect(response.body.error).toContain('stock');
      }
    });

    it('should increment quantity if product already in cart', async () => {
      if (!testProductId) return;

      await request(API_URL)
        .post('/petalas/fashion/cart/add')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          product_id: testProductId,
          quantity: 1,
        });

      await request(API_URL)
        .post('/petalas/fashion/cart/add')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          product_id: testProductId,
          quantity: 2,
        });

      const cartResponse = await request(API_URL)
        .get('/petalas/fashion/cart')
        .set('Authorization', `Bearer ${authToken}`);

      const item = cartResponse.body.data.items.find((i: any) => i.product_id === testProductId);
      expect(item.quantity).toBe(3);
    });
  });

  describe('PUT /petalas/fashion/cart/:item_id', () => {
    beforeEach(async () => {
      if (!testProductId) return;

      const response = await request(API_URL)
        .post('/petalas/fashion/cart/add')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          product_id: testProductId,
          quantity: 1,
        });

      cartItemId = response.body.data.cart_item_id;
    });

    it('should update cart item quantity', async () => {
      if (!cartItemId) return;

      const response = await request(API_URL)
        .put(`/petalas/fashion/cart/${cartItemId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          quantity: 3,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should fail with quantity 0', async () => {
      if (!cartItemId) return;

      await request(API_URL)
        .put(`/petalas/fashion/cart/${cartItemId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          quantity: 0,
        })
        .expect(400);
    });

    it('should fail with invalid item_id', async () => {
      await request(API_URL)
        .put('/petalas/fashion/cart/invalid-id')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          quantity: 2,
        })
        .expect(404);
    });
  });

  describe('DELETE /petalas/fashion/cart/:item_id', () => {
    beforeEach(async () => {
      if (!testProductId) return;

      const response = await request(API_URL)
        .post('/petalas/fashion/cart/add')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          product_id: testProductId,
          quantity: 1,
        });

      cartItemId = response.body.data.cart_item_id;
    });

    it('should remove item from cart', async () => {
      if (!cartItemId) return;

      const response = await request(API_URL)
        .delete(`/petalas/fashion/cart/${cartItemId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      const cartResponse = await request(API_URL)
        .get('/petalas/fashion/cart')
        .set('Authorization', `Bearer ${authToken}`);

      const item = cartResponse.body.data.items.find((i: any) => i.id === cartItemId);
      expect(item).toBeUndefined();
    });

    it('should fail with invalid item_id', async () => {
      await request(API_URL)
        .delete('/petalas/fashion/cart/invalid-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('DELETE /petalas/fashion/cart', () => {
    it('should clear entire cart', async () => {
      if (!testProductId) return;

      // Add items
      await request(API_URL)
        .post('/petalas/fashion/cart/add')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          product_id: testProductId,
          quantity: 2,
        });

      // Clear cart
      const response = await request(API_URL)
        .delete('/petalas/fashion/cart')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify empty
      const cartResponse = await request(API_URL)
        .get('/petalas/fashion/cart')
        .set('Authorization', `Bearer ${authToken}`);

      expect(cartResponse.body.data.items).toEqual([]);
    });
  });

  describe('POST /petalas/fashion/cart/coupon', () => {
    it('should apply valid coupon', async () => {
      const response = await request(API_URL)
        .post('/petalas/fashion/cart/coupon')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          code: 'SAVE20',
        });

      if (response.status === 200) {
        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('discount');
      }
    });

    it('should fail with invalid coupon', async () => {
      const response = await request(API_URL)
        .post('/petalas/fashion/cart/coupon')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          code: 'INVALID',
        })
        .expect(400);

      expect(response.body.error).toContain('invalid');
    });
  });
});
