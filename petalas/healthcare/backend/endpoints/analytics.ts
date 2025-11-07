/**
 * Pétala Restaurant - Analytics Endpoints
 */

import { defineEndpoint } from '@directus/extensions-sdk';

export default defineEndpoint((router, { database }) => {
  router.get('/dashboard', async (req, res) => {
    try {
      const { restaurant_id, date_from, date_to } = req.query;

      const stats = await database('orders')
        .where({ restaurant_id })
        .whereBetween('created_at', [date_from, date_to])
        .select(
          database.raw('COUNT(*) as total_orders'),
          database.raw('SUM(total) as total_revenue'),
          database.raw('AVG(total) as average_order_value')
        )
        .first();

      res.json({ data: stats });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
});
