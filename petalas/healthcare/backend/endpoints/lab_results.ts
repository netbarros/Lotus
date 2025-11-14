/**
 * Pétala Restaurant - Waitlist Endpoints
 */

import { defineEndpoint } from '@directus/extensions-sdk';

export default defineEndpoint((router, { database }) => {
  // POST /petalas/restaurant/waitlist - Add to waitlist
  router.post('/', async (req, res) => {
    try {
      const { tenant_id, restaurant_id, customer_name, customer_phone, party_size } = req.body;

      const [id] = await database('waitlist').insert({
        id: generateUUID(),
        tenant_id,
        restaurant_id,
        customer_name,
        customer_phone,
        party_size,
        status: 'waiting',
        created_at: database.fn.now(),
      });

      res.json({ success: true, waitlist_id: id });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET /petalas/restaurant/waitlist/position/:id - Get position
  router.get('/position/:id', async (req, res) => {
    try {
      const entry = await database('waitlist').where({ id: req.params.id }).first();

      if (!entry) return res.status(404).json({ error: 'Not found' });

      const position = await database('waitlist')
        .where({ restaurant_id: entry.restaurant_id, status: 'waiting' })
        .where('created_at', '<', entry.created_at)
        .count('* as count')
        .first();

      res.json({ position: (position?.count || 0) + 1 });
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
