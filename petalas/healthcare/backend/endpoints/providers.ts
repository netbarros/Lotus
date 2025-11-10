/**
 * Pétala Restaurant - Reviews Endpoints
 */

import { defineEndpoint } from '@directus/extensions-sdk';

export default defineEndpoint((router, { database }) => {
  // POST /petalas/restaurant/reviews - Submit review
  router.post('/', async (req, res) => {
    try {
      const { tenant_id, restaurant_id, customer_id, rating, comment, order_id } = req.body;

      if (rating < 1 || rating > 5) {
        return res.status(400).json({ error: 'Rating must be between 1 and 5' });
      }

      const [id] = await database('reviews').insert({
        id: generateUUID(),
        tenant_id,
        restaurant_id,
        customer_id,
        rating,
        comment,
        order_id,
        status: 'pending',
        created_at: database.fn.now()
      });

      res.json({ success: true, review_id: id });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET /petalas/restaurant/reviews - List reviews
  router.get('/', async (req, res) => {
    try {
      const { restaurant_id, status = 'approved' } = req.query;

      const reviews = await database('reviews')
        .where({ restaurant_id, status })
        .orderBy('created_at', 'desc');

      res.json({ data: reviews });
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
