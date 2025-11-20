/**
 * Pétala Restaurant - Kitchen Display System Endpoints
 */

import { defineEndpoint } from '@directus/extensions-sdk';

export default defineEndpoint((router, { database }) => {
  // POST /petalas/restaurant/kitchen/new-order - Receive new order
  router.post('/new-order', async (req, res) => {
    try {
      const { order_id, table_number, items, priority, special_instructions } = req.body;

      await database('kitchen_orders').insert({
        id: generateUUID(),
        order_id,
        table_number,
        items: JSON.stringify(items),
        priority,
        special_instructions,
        status: 'new',
        created_at: database.fn.now(),
      });

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET /petalas/restaurant/kitchen/orders - Get active kitchen orders
  router.get('/orders', async (req, res) => {
    try {
      const { restaurant_id } = req.query;

      const orders = await database('kitchen_orders')
        .whereIn('status', ['new', 'preparing'])
        .orderBy('priority', 'desc')
        .orderBy('created_at', 'asc');

      res.json({ data: orders });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // PATCH /petalas/restaurant/kitchen/orders/:id/status - Update kitchen order status
  router.patch('/orders/:id/status', async (req, res) => {
    try {
      const { status } = req.body;

      await database('kitchen_orders')
        .where({ id: req.params.id })
        .update({ status, updated_at: database.fn.now() });

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
});

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}
