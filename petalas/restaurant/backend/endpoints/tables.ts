/**
 * Pétala Restaurant - Tables Endpoints
 */

import { defineEndpoint } from '@directus/extensions-sdk';

export default defineEndpoint((router, { database }) => {
  // GET /petalas/restaurant/tables - List tables
  router.get('/', async (req, res) => {
    try {
      const { restaurant_id, status } = req.query;

      let query = database('tables').where({ restaurant_id });
      if (status) query = query.where({ status });

      const tables = await query;

      res.json({ data: tables });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET /petalas/restaurant/tables/available - Get available tables
  router.get('/available', async (req, res) => {
    try {
      const { restaurant_id, party_size } = req.query;

      const tables = await database('tables')
        .where({ restaurant_id, status: 'available' })
        .where('capacity', '>=', party_size);

      res.json({ data: tables });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // PATCH /petalas/restaurant/tables/:id/status - Update table status
  router.patch('/:id/status', async (req, res) => {
    try {
      const { status } = req.body;

      await database('tables')
        .where({ id: req.params.id })
        .update({ status, updated_at: database.fn.now() });

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
});
