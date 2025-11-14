/**
 * Pétala Restaurant - Reviews Hooks
 *
 * Handles review lifecycle events:
 * - Validate rating range
 * - Update restaurant ratings
 * - Auto-moderate reviews
 */

import { defineHook } from '@directus/extensions-sdk';

export default defineHook(({ filter, action }, { database }) => {
  filter('items.create', async (input, meta) => {
    if (meta.collection === 'reviews') {
      if (input.rating < 1 || input.rating > 5) {
        throw new Error('Rating must be between 1 and 5');
      }
      if (!input.status) {
        input.status = 'pending';
      }
    }
    return input;
  });

  action('items.create', async (meta) => {
    if (meta.collection === 'reviews' && meta.payload && meta.payload.restaurant_id) {
      // Recalculate restaurant average rating
      const stats = await database('reviews')
        .where({
          restaurant_id: meta.payload.restaurant_id,
          status: 'approved',
        })
        .select(
          database.raw('AVG(rating) as avg_rating'),
          database.raw('COUNT(*) as total_reviews')
        )
        .first();

      if (stats) {
        await database('restaurants').where('id', meta.payload.restaurant_id).update({
          average_rating: stats.avg_rating,
          total_reviews: stats.total_reviews,
        });
      }
    }
  });
});
