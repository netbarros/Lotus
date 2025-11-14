import request from 'supertest';
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';

const API_URL = process.env.API_URL || 'http://localhost:8055';
const TEST_TENANT = 'test-tenant';

describe('Sofia AI Assistant Endpoints - Fashion', () => {
  let conversationId: string;
  let authToken: string;

  beforeAll(async () => {
    // Get auth token for tests
    const response = await request(API_URL).post('/auth/login').send({
      email: 'test@fashion.com',
      password: 'test123456',
    });

    authToken = response.body.data.access_token;
  });

  describe('POST /petalas/fashion/sofia/session', () => {
    it('should initialize Sofia session', async () => {
      const response = await request(API_URL)
        .post('/petalas/fashion/sofia/session')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          tenant_id: TEST_TENANT,
          user_id: 'test-user-123',
        })
        .expect(200);

      expect(response.body).toHaveProperty('conversation_id');
      expect(response.body).toHaveProperty('context');
      expect(response.body.conversation_id).toContain(TEST_TENANT);

      conversationId = response.body.conversation_id;
    });

    it('should fail without tenant_id', async () => {
      const response = await request(API_URL)
        .post('/petalas/fashion/sofia/session')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          user_id: 'test-user-123',
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('tenant_id');
    });

    it('should work with guest user (no user_id)', async () => {
      const response = await request(API_URL)
        .post('/petalas/fashion/sofia/session')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          tenant_id: TEST_TENANT,
        })
        .expect(200);

      expect(response.body).toHaveProperty('conversation_id');
      expect(response.body.conversation_id).toContain('guest');
    });
  });

  describe('POST /petalas/fashion/sofia/message', () => {
    it('should process natural language message', async () => {
      const response = await request(API_URL)
        .post('/petalas/fashion/sofia/message')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          conversation_id: conversationId,
          message: 'Show me red dresses under $100',
          context: {
            current_view: 'catalog',
          },
        })
        .expect(200);

      expect(response.body).toHaveProperty('message_id');
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('intent');
      expect(response.body.intent.intent).toBe('search_products');
      expect(response.body.intent.entities).toHaveProperty('color');
      expect(response.body.intent.entities.color).toBe('red');
    });

    it('should fail without conversation_id', async () => {
      const response = await request(API_URL)
        .post('/petalas/fashion/sofia/message')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          message: 'Hello',
        })
        .expect(400);

      expect(response.body.error).toContain('conversation_id');
    });

    it('should fail without message', async () => {
      const response = await request(API_URL)
        .post('/petalas/fashion/sofia/message')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          conversation_id: conversationId,
        })
        .expect(400);

      expect(response.body.error).toContain('message');
    });

    it('should handle order tracking intent', async () => {
      const response = await request(API_URL)
        .post('/petalas/fashion/sofia/message')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          conversation_id: conversationId,
          message: "Where's my order?",
          context: {
            customer_email: 'test@fashion.com',
          },
        })
        .expect(200);

      expect(response.body.intent.intent).toBe('track_order');
    });

    it('should handle add to cart intent', async () => {
      const response = await request(API_URL)
        .post('/petalas/fashion/sofia/message')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          conversation_id: conversationId,
          message: 'Add this to cart',
          context: {
            current_view: 'product_detail',
            current_product_id: 'prod-123',
          },
        })
        .expect(200);

      expect(response.body.intent.intent).toBe('add_to_cart');
      expect(response.body).toHaveProperty('actions');
    });
  });

  describe('POST /petalas/fashion/sofia/intent', () => {
    it('should classify search intent correctly', async () => {
      const response = await request(API_URL)
        .post('/petalas/fashion/sofia/intent')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          message: 'Find blue jeans',
        })
        .expect(200);

      expect(response.body.intent).toBe('search_products');
      expect(response.body.entities).toHaveProperty('category');
      expect(response.body.entities).toHaveProperty('color');
      expect(response.body.confidence).toBeGreaterThan(0.7);
    });

    it('should classify recommendation intent', async () => {
      const response = await request(API_URL)
        .post('/petalas/fashion/sofia/intent')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          message: 'What do you recommend?',
        })
        .expect(200);

      expect(response.body.intent).toBe('get_recommendations');
      expect(response.body.confidence).toBeGreaterThan(0.8);
    });

    it('should handle complex queries', async () => {
      const response = await request(API_URL)
        .post('/petalas/fashion/sofia/intent')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          message: 'I need a formal black dress for a wedding, budget around $150',
          context: {
            occasion: 'wedding',
          },
        })
        .expect(200);

      expect(response.body.intent).toBe('search_products');
      expect(response.body.entities).toMatchObject({
        category: 'dresses',
        color: 'black',
        style: 'formal',
        price_range: { max: 150 },
      });
    });
  });

  describe('POST /petalas/fashion/sofia/search', () => {
    it('should return products matching natural language query', async () => {
      const response = await request(API_URL)
        .post('/petalas/fashion/sofia/search')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          query: 'summer dresses',
          context: {
            tenant_id: TEST_TENANT,
          },
        })
        .expect(200);

      expect(response.body).toHaveProperty('products');
      expect(response.body.products).toBeInstanceOf(Array);
      expect(response.body).toHaveProperty('intent');
      expect(response.body.enhanced).toBe(true);
    });

    it('should apply filters from natural language', async () => {
      const response = await request(API_URL)
        .post('/petalas/fashion/sofia/search')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          query: 'red shoes under $50',
          context: {
            tenant_id: TEST_TENANT,
          },
        })
        .expect(200);

      expect(response.body.products).toBeInstanceOf(Array);
      expect(response.body.intent.entities).toMatchObject({
        category: 'shoes',
        color: 'red',
        price_range: { max: 50 },
      });
    });
  });

  describe('POST /petalas/fashion/sofia/recommendations', () => {
    it('should return personalized recommendations', async () => {
      const response = await request(API_URL)
        .post('/petalas/fashion/sofia/recommendations')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          conversation_id: conversationId,
          type: 'trending',
          context: {
            tenant_id: TEST_TENANT,
            viewed_products: ['prod-1', 'prod-2'],
            preferred_style: ['casual', 'sporty'],
          },
        })
        .expect(200);

      expect(response.body).toHaveProperty('recommendations');
      expect(response.body.recommendations).toBeInstanceOf(Array);
      expect(response.body.context.personalized).toBe(true);
    });

    it('should filter by price range preference', async () => {
      const response = await request(API_URL)
        .post('/petalas/fashion/sofia/recommendations')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          conversation_id: conversationId,
          context: {
            tenant_id: TEST_TENANT,
            price_range: { min: 20, max: 100 },
          },
        })
        .expect(200);

      expect(response.body.recommendations).toBeInstanceOf(Array);
      response.body.recommendations.forEach((product: any) => {
        expect(product.price).toBeGreaterThanOrEqual(20);
        expect(product.price).toBeLessThanOrEqual(100);
      });
    });
  });

  describe('POST /petalas/fashion/sofia/outfits', () => {
    it('should suggest complete outfit from base product', async () => {
      const response = await request(API_URL)
        .post('/petalas/fashion/sofia/outfits')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          product_id: 'dress-123',
          context: {
            tenant_id: TEST_TENANT,
          },
        })
        .expect(200);

      expect(response.body).toHaveProperty('base_product');
      expect(response.body).toHaveProperty('outfit_items');
      expect(response.body.outfit_items).toBeInstanceOf(Array);
      expect(response.body.complete_the_look).toBe(true);
    });

    it('should fail with invalid product_id', async () => {
      const response = await request(API_URL)
        .post('/petalas/fashion/sofia/outfits')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          product_id: 'invalid-id',
          context: {
            tenant_id: TEST_TENANT,
          },
        })
        .expect(404);

      expect(response.body.error).toContain('not found');
    });
  });

  describe('POST /petalas/fashion/sofia/track', () => {
    it('should track order by order_id', async () => {
      const response = await request(API_URL)
        .post('/petalas/fashion/sofia/track')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          order_id: 'order-123',
          context: {
            tenant_id: TEST_TENANT,
          },
        })
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('order_found');
      if (response.body.order_found) {
        expect(response.body).toHaveProperty('order');
        expect(response.body.order).toHaveProperty('status');
      }
    });

    it('should find recent order by email', async () => {
      const response = await request(API_URL)
        .post('/petalas/fashion/sofia/track')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          context: {
            tenant_id: TEST_TENANT,
            customer_email: 'test@fashion.com',
          },
        })
        .expect(200);

      expect(response.body).toHaveProperty('order_found');
    });
  });

  describe('POST /petalas/fashion/sofia/cart-assist', () => {
    it('should provide cart assistance', async () => {
      const response = await request(API_URL)
        .post('/petalas/fashion/sofia/cart-assist')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          context: {
            cart_items: [{ id: 1 }, { id: 2 }],
            cart_total: 45,
          },
        })
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('suggestions');
      expect(response.body.cart_summary.free_shipping).toBe(false);
      expect(response.body.message).toContain('frete grátis');
    });

    it('should congratulate on free shipping', async () => {
      const response = await request(API_URL)
        .post('/petalas/fashion/sofia/cart-assist')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          context: {
            cart_items: [{ id: 1 }, { id: 2 }, { id: 3 }],
            cart_total: 75,
          },
        })
        .expect(200);

      expect(response.body.cart_summary.free_shipping).toBe(true);
      expect(response.body.message).toContain('frete grátis');
    });

    it('should handle empty cart', async () => {
      const response = await request(API_URL)
        .post('/petalas/fashion/sofia/cart-assist')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          context: {
            cart_items: [],
            cart_total: 0,
          },
        })
        .expect(200);

      expect(response.body.message).toContain('vazio');
      expect(response.body.suggestions).toContain('Ver novidades');
    });
  });

  describe('POST /petalas/fashion/sofia/checkout-assist', () => {
    it('should provide step-specific guidance', async () => {
      const steps = ['shipping', 'payment', 'review', 'confirmation'];

      for (const step of steps) {
        const response = await request(API_URL)
          .post('/petalas/fashion/sofia/checkout-assist')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            step,
            context: {
              tenant_id: TEST_TENANT,
            },
          })
          .expect(200);

        expect(response.body).toHaveProperty('message');
        expect(response.body).toHaveProperty('step');
        expect(response.body.step).toBe(step);
        expect(response.body).toHaveProperty('suggestions');
      }
    });
  });

  describe('POST /petalas/fashion/sofia/action', () => {
    it('should execute navigate action', async () => {
      const response = await request(API_URL)
        .post('/petalas/fashion/sofia/action')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          action_type: 'navigate',
          payload: { path: '/products' },
          context: {},
        })
        .expect(200);

      expect(response.body.action_type).toBe('navigate');
      expect(response.body.path).toBe('/products');
      expect(response.body.success).toBe(true);
    });

    it('should execute search action', async () => {
      const response = await request(API_URL)
        .post('/petalas/fashion/sofia/action')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          action_type: 'search_products',
          payload: { query: 'summer dresses' },
          context: {},
        })
        .expect(200);

      expect(response.body.action_type).toBe('search_products');
      expect(response.body).toHaveProperty('path');
      expect(response.body.path).toContain('summer%20dresses');
    });
  });

  describe('DELETE /petalas/fashion/sofia/session/:conversation_id', () => {
    it('should clear conversation', async () => {
      const response = await request(API_URL)
        .delete(`/petalas/fashion/sofia/session/${conversationId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.message).toContain('cleared');
      expect(response.body.conversation_id).toBe(conversationId);
    });
  });

  afterAll(async () => {
    // Cleanup
  });
});
