/**
 * Pétala Restaurant - Waitlist Hooks
 *
 * Handles waitlist lifecycle events:
 * - Calculate position
 * - Estimate wait time
 * - Track waitlist metrics
 */

import { defineHook } from '@directus/extensions-sdk';

export default defineHook(({ filter, action }, { database }) => {
  filter('items.create', async (input, meta) => {
    if (meta.collection === 'waitlist') {
      if (!input.status) {
        input.status = 'waiting';
      }
      // Calculate position
      const count = await database('waitlist')
        .where({
          restaurant_id: input.restaurant_id,
          status: 'waiting'
        })
        .count('id as total')
        .first();

      input.position = (count?.total || 0) + 1;

      // Estimate wait time (15 minutes per party ahead)
      input.estimated_wait_minutes = input.position * 15;
    }
    return input;
  });

  action('items.update', async (meta) => {
    if (meta.collection === 'waitlist' && meta.payload) {
      // If waitlist entry was seated or cancelled, update positions for others
      if (['seated', 'cancelled', 'no_show'].includes(meta.payload.status)) {
        const restaurant_id = meta.payload.restaurant_id ||
          (await database('waitlist').where('id', meta.keys[0]).first())?.restaurant_id;

        if (restaurant_id) {
          await database.raw(`
            UPDATE waitlist
            SET position = position - 1,
                estimated_wait_minutes = (position - 1) * 15
            WHERE restaurant_id = ?
              AND status = 'waiting'
              AND position > (SELECT position FROM waitlist WHERE id = ?)
          `, [restaurant_id, meta.keys[0]]);
        }
      }
    }
  });
});
