/**
 * Pétala Restaurant - Customers Hooks
 *
 * Handles customer lifecycle events:
 * - Track visit count
 * - Calculate loyalty points
 * - Update customer stats
 */

import { defineHook } from '@directus/extensions-sdk';

export default defineHook(({ filter }, { database }) => {
  filter('items.create', async (input, meta) => {
    if (meta.collection === 'customers') {
      if (input.visit_count === undefined) {
        input.visit_count = 0;
      }
      if (input.total_spent === undefined) {
        input.total_spent = 0;
      }
      if (input.loyalty_points === undefined) {
        input.loyalty_points = 0;
      }
    }
    return input;
  });
});
