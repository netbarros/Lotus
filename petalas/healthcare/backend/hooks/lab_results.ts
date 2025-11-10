/**
 * Pétala Restaurant - Menu Items Hooks
 *
 * Handles menu item lifecycle events:
 * - Auto-generate slug
 * - Validate pricing
 * - Track popularity
 * - Update menu counts
 */

import { defineHook } from '@directus/extensions-sdk';

export default defineHook(({ filter, action }, { services, database }) => {
  /**
   * BEFORE CREATE: Auto-generate slug and validate
   */
  filter('items.create', async (input, meta) => {
    if (meta.collection === 'menu_items') {
      if (!input.slug && input.name) {
        input.slug = generateSlug(input.name);
      }
      if (input.price !== undefined && input.price < 0) {
        throw new Error('Price cannot be negative');
      }
      if (!input.status) {
        input.status = 'draft';
      }
      if (input.available === undefined) {
        input.available = true;
      }
    }
    return input;
  });

  /**
   * BEFORE UPDATE: Regenerate slug if name changed
   */
  filter('items.update', async (input, meta) => {
    if (meta.collection === 'menu_items' && input.name && !input.slug) {
      input.slug = generateSlug(input.name);
    }
    return input;
  });

  /**
   * AFTER CREATE: Update menu item count
   */
  action('items.create', async (meta) => {
    if (meta.collection === 'menu_items' && meta.payload && meta.payload.menu_id) {
      await database('menus')
        .where('id', meta.payload.menu_id)
        .increment('items_count', 1);
    }
  });

  /**
   * AFTER DELETE: Update menu item count
   */
  action('items.delete', async (meta) => {
    if (meta.collection === 'menu_items' && meta.payload && meta.payload.menu_id) {
      await database('menus')
        .where('id', meta.payload.menu_id)
        .decrement('items_count', 1);
    }
  });
});

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
