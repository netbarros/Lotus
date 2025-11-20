import { defineEndpoint } from '@directus/extensions-sdk';

export default defineEndpoint((router, { services, database }) => {
  // GET /petalas/fashion/products - List products
  router.get('/', async (req, res) => {
    try {
      const { limit = 20, offset = 0, status = 'active' } = req.query;

      const products = await database('products')
        .where({ status, tenant_id: req.accountability.tenant })
        .limit(limit)
        .offset(offset);

      const total = await database('products')
        .where({ status, tenant_id: req.accountability.tenant })
        .count('* as count')
        .first();

      res.json({ data: products, meta: { total: total.count, limit, offset } });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET /petalas/fashion/products/:id - Get product detail
  router.get('/:id', async (req, res) => {
    try {
      const product = await database('products')
        .where({ id: req.params.id, tenant_id: req.accountability.tenant })
        .first();

      if (!product) return res.status(404).json({ error: 'Product not found' });

      await database('products').where({ id: req.params.id }).increment('views_count', 1);

      res.json({ data: product });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
});
