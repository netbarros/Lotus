/**
 * Pétala Restaurant - Delivery Endpoints
 */

import { defineEndpoint } from '@directus/extensions-sdk';

export default defineEndpoint((router, { database }) => {
  router.post('/assign', async (req, res) => {
    try {
      const { order_id, driver_id } = req.body;

      await database('orders')
        .where({ id: order_id })
        .update({
          driver_id,
          status: 'out_for_delivery',
          updated_at: database.fn.now()
        });

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.get('/track/:order_id', async (req, res) => {
    try {
      const order = await database('orders')
        .where({ id: req.params.order_id })
        .first();

      if (!order) return res.status(404).json({ error: 'Order not found' });

      res.json({ data: { status: order.status, estimated_arrival: order.estimated_arrival } });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
});
