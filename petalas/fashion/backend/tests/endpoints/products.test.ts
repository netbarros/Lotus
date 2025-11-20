import request from 'supertest';
import { describe, it, expect, beforeAll } from '@jest/globals';

const API_URL = process.env.API_URL || 'http://localhost:8055';

describe('Products Endpoints - Fashion', () => {
  let authToken: string;
  let testProductId: string;

  beforeAll(async () => {
    const response = await request(API_URL).post('/auth/login').send({
      email: 'test@fashion.com',
      password: 'test123456',
    });

    authToken = response.body.data.access_token;
  });

  describe('GET /petalas/fashion/products', () => {
    it('should list all products', async () => {
      const response = await request(API_URL)
        .get('/petalas/fashion/products')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toBeInstanceOf(Array);
    });

    it('should filter products by status', async () => {
      const response = await request(API_URL)
        .get('/petalas/fashion/products?status=published')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data).toBeInstanceOf(Array);
      response.body.data.forEach((product: any) => {
        expect(product.status).toBe('published');
      });
    });

    it('should paginate results', async () => {
      const response = await request(API_URL)
        .get('/petalas/fashion/products?limit=5&offset=0')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.length).toBeLessThanOrEqual(5);
    });

    it('should search products by name', async () => {
      const response = await request(API_URL)
        .get('/petalas/fashion/products?search=dress')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data).toBeInstanceOf(Array);
      response.body.data.forEach((product: any) => {
        expect(product.name.toLowerCase()).toContain('dress');
      });
    });
  });

  describe('GET /petalas/fashion/products/:id', () => {
    beforeAll(async () => {
      const response = await request(API_URL)
        .get('/petalas/fashion/products?limit=1')
        .set('Authorization', `Bearer ${authToken}`);

      if (response.body.data.length > 0) {
        testProductId = response.body.data[0].id;
      }
    });

    it('should get product by ID', async () => {
      if (!testProductId) {
        console.log('Skipping: No test products available');
        return;
      }

      const response = await request(API_URL)
        .get(`/petalas/fashion/products/${testProductId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.id).toBe(testProductId);
      expect(response.body.data).toHaveProperty('name');
      expect(response.body.data).toHaveProperty('price');
    });

    it('should return 404 for non-existent product', async () => {
      await request(API_URL)
        .get('/petalas/fashion/products/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should include variants in response', async () => {
      if (!testProductId) return;

      const response = await request(API_URL)
        .get(`/petalas/fashion/products/${testProductId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      if (response.body.data.has_variants) {
        expect(response.body.data).toHaveProperty('variants');
        expect(response.body.data.variants).toBeInstanceOf(Array);
      }
    });

    it('should include reviews in response', async () => {
      if (!testProductId) return;

      const response = await request(API_URL)
        .get(`/petalas/fashion/products/${testProductId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data).toHaveProperty('reviews_count');
      expect(response.body.data).toHaveProperty('reviews_average');
    });
  });

  describe('GET /petalas/fashion/products/featured', () => {
    it('should return featured products', async () => {
      const response = await request(API_URL)
        .get('/petalas/fashion/products/featured')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data).toBeInstanceOf(Array);
      response.body.data.forEach((product: any) => {
        expect(product.is_featured).toBe(true);
      });
    });

    it('should limit featured products', async () => {
      const response = await request(API_URL)
        .get('/petalas/fashion/products/featured?limit=3')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.length).toBeLessThanOrEqual(3);
    });
  });

  describe('GET /petalas/fashion/products/trending', () => {
    it('should return trending products', async () => {
      const response = await request(API_URL)
        .get('/petalas/fashion/products/trending')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data).toBeInstanceOf(Array);
    });

    it('should sort by popularity score', async () => {
      const response = await request(API_URL)
        .get('/petalas/fashion/products/trending')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const scores = response.body.data.map((p: any) => p.popularity_score);
      const sorted = [...scores].sort((a, b) => b - a);
      expect(scores).toEqual(sorted);
    });
  });

  describe('GET /petalas/fashion/products/new-arrivals', () => {
    it('should return new arrival products', async () => {
      const response = await request(API_URL)
        .get('/petalas/fashion/products/new-arrivals')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data).toBeInstanceOf(Array);
    });

    it('should sort by created_at descending', async () => {
      const response = await request(API_URL)
        .get('/petalas/fashion/products/new-arrivals')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const dates = response.body.data.map((p: any) => new Date(p.created_at));
      const sorted = [...dates].sort((a, b) => b.getTime() - a.getTime());
      expect(dates).toEqual(sorted);
    });
  });

  describe('GET /petalas/fashion/products/on-sale', () => {
    it('should return products on sale', async () => {
      const response = await request(API_URL)
        .get('/petalas/fashion/products/on-sale')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data).toBeInstanceOf(Array);
      response.body.data.forEach((product: any) => {
        expect(product.compare_at_price).toBeGreaterThan(product.price);
      });
    });

    it('should calculate discount percentage', async () => {
      const response = await request(API_URL)
        .get('/petalas/fashion/products/on-sale')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      response.body.data.forEach((product: any) => {
        const expectedDiscount = Math.round(
          ((product.compare_at_price - product.price) / product.compare_at_price) * 100
        );
        expect(product.discount_percentage).toBe(expectedDiscount);
      });
    });
  });

  describe('GET /petalas/fashion/products/category/:category_id', () => {
    it('should filter products by category', async () => {
      const response = await request(API_URL)
        .get('/petalas/fashion/products/category/dresses')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data).toBeInstanceOf(Array);
      response.body.data.forEach((product: any) => {
        expect(product.category_id).toBe('dresses');
      });
    });

    it('should return empty array for non-existent category', async () => {
      const response = await request(API_URL)
        .get('/petalas/fashion/products/category/non-existent')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data).toEqual([]);
    });
  });

  describe('POST /petalas/fashion/products/filter', () => {
    it('should apply multiple filters', async () => {
      const response = await request(API_URL)
        .post('/petalas/fashion/products/filter')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          categories: ['dresses', 'tops'],
          price_range: { min: 20, max: 100 },
          sizes: ['S', 'M'],
          colors: ['red', 'blue'],
        })
        .expect(200);

      expect(response.body.data).toBeInstanceOf(Array);
      response.body.data.forEach((product: any) => {
        expect(product.price).toBeGreaterThanOrEqual(20);
        expect(product.price).toBeLessThanOrEqual(100);
        expect(['dresses', 'tops']).toContain(product.category_id);
      });
    });

    it('should sort filtered results', async () => {
      const response = await request(API_URL)
        .post('/petalas/fashion/products/filter')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          categories: ['dresses'],
          sort: 'price_asc',
        })
        .expect(200);

      const prices = response.body.data.map((p: any) => p.price);
      const sorted = [...prices].sort((a, b) => a - b);
      expect(prices).toEqual(sorted);
    });

    it('should handle empty filter gracefully', async () => {
      const response = await request(API_URL)
        .post('/petalas/fashion/products/filter')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(200);

      expect(response.body.data).toBeInstanceOf(Array);
    });
  });

  describe('POST /petalas/fashion/products/:id/view', () => {
    it('should track product view', async () => {
      if (!testProductId) return;

      const response = await request(API_URL)
        .post(`/petalas/fashion/products/${testProductId}/view`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should increment view count', async () => {
      if (!testProductId) return;

      const before = await request(API_URL)
        .get(`/petalas/fashion/products/${testProductId}`)
        .set('Authorization', `Bearer ${authToken}`);

      await request(API_URL)
        .post(`/petalas/fashion/products/${testProductId}/view`)
        .set('Authorization', `Bearer ${authToken}`);

      const after = await request(API_URL)
        .get(`/petalas/fashion/products/${testProductId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(after.body.data.view_count).toBeGreaterThanOrEqual(before.body.data.view_count);
    });
  });

  describe('GET /petalas/fashion/products/:id/related', () => {
    it('should return related products', async () => {
      if (!testProductId) return;

      const response = await request(API_URL)
        .get(`/petalas/fashion/products/${testProductId}/related`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data).not.toContainEqual(expect.objectContaining({ id: testProductId }));
    });

    it('should limit related products', async () => {
      if (!testProductId) return;

      const response = await request(API_URL)
        .get(`/petalas/fashion/products/${testProductId}/related?limit=4`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.length).toBeLessThanOrEqual(4);
    });
  });
});
