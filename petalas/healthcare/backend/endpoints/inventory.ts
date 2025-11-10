/**
 * Pétala Restaurant - Inventory Endpoints
 */

import { defineEndpoint } from '@directus/extensions-sdk';

export default defineEndpoint((router, { database }) => {
  router.post('/decrement', async (req, res) => {
    try {
      const { items, restaurant_id } = req.body;

      for (const item of items) {
        await database('menu_items')
          .where({ id: item.menu_item_id, restaurant_id })
          .decrement('stock_quantity', item.quantity);
      }

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.get('/low-stock', async (req, res) => {
    try {
      const { restaurant_id } = req.query;

      const items = await database('menu_items')
        .where({ restaurant_id })
        .whereRaw('stock_quantity <= low_stock_threshold');

      res.json({ data: items });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
});
