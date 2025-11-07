/**
 * Pétala Restaurant - Payment Endpoints
 */

import { defineEndpoint } from '@directus/extensions-sdk';

export default defineEndpoint((router, { database }) => {
  router.post('/process', async (req, res) => {
    try {
      const { order_id, amount, payment_method } = req.body;

      await database('orders')
        .where({ id: order_id })
        .update({
          payment_status: 'paid',
          payment_method,
          paid_at: database.fn.now()
        });

      res.json({ success: true, transaction_id: generateUUID() });
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
