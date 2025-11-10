/**
 * Pétala Restaurant - Customers Endpoints
 */

import { defineEndpoint } from '@directus/extensions-sdk';

export default defineEndpoint((router, { database }) => {
  router.get('/:id', async (req, res) => {
    try {
      const customer = await database('customers').where({ id: req.params.id }).first();
      if (!customer) return res.status(404).json({ error: 'Not found' });
      res.json({ data: customer });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.get('/:id/visits', async (req, res) => {
    try {
      const visits = await database('orders')
        .where({ customer_id: req.params.id, status: 'completed' })
        .orderBy('created_at', 'desc');
      res.json({ data: visits });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
});
