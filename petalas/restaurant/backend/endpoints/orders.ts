/**
 * Pétala Restaurant - Orders Endpoints
 */

import { defineEndpoint } from '@directus/extensions-sdk';

export default defineEndpoint((router, { database }) => {
  // POST /petalas/restaurant/orders - Create order
  router.post('/', async (req, res) => {
    try {
      const { tenant_id, restaurant_id, table_id, items, notes, order_type } = req.body;

      const [id] = await database('orders').insert({
        id: generateUUID(),
        tenant_id,
        restaurant_id,
        table_id,
        items: JSON.stringify(items),
        notes,
        order_type,
        status: 'pending',
        created_at: database.fn.now()
      });

      res.json({ success: true, order_id: id });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET /petalas/restaurant/orders/:id - Get order
  router.get('/:id', async (req, res) => {
    try {
      const order = await database('orders')
        .where({ id: req.params.id })
        .first();

      if (!order) return res.status(404).json({ error: 'Order not found' });

      res.json({ data: order });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // PATCH /petalas/restaurant/orders/:id/status - Update order status
  router.patch('/:id/status', async (req, res) => {
    try {
      const { status } = req.body;

      await database('orders')
        .where({ id: req.params.id })
        .update({ status, updated_at: database.fn.now() });

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
});

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}
