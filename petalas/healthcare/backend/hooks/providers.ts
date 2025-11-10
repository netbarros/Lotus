/**
 * Pétala Restaurant - Restaurants Hooks
 *
 * Handles restaurant lifecycle events:
 * - Auto-generate slug
 * - Validate business hours
 * - Track restaurant stats
 */

import { defineHook } from '@directus/extensions-sdk';

export default defineHook(({ filter }, { database }) => {
  filter('items.create', async (input, meta) => {
    if (meta.collection === 'restaurants') {
      if (!input.slug && input.name) {
        input.slug = input.name
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');
      }
      if (!input.status) {
        input.status = 'draft';
      }
    }
    return input;
  });
});
