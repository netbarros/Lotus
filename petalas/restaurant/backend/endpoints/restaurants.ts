/**
 * Pétala Restaurant - Restaurants Endpoints
 */

import { defineEndpoint } from '@directus/extensions-sdk';

export default defineEndpoint((router, { database }) => {
  router.get('/:id', async (req, res) => {
    try {
      const restaurant = await database('restaurants').where({ id: req.params.id }).first();

      if (!restaurant) return res.status(404).json({ error: 'Restaurant not found' });

      res.json({ data: restaurant });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.get('/:id/hours', async (req, res) => {
    try {
      const hours = await database('business_hours')
        .where({ restaurant_id: req.params.id })
        .orderBy('day_of_week');

      res.json({ data: hours });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
});
