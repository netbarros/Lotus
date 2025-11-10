/**
 * Pétala Restaurant - Tables Hooks
 *
 * Handles table lifecycle events:
 * - Validate table capacity
 * - Track table availability
 * - Calculate turnover metrics
 * - Emit table events
 */

import { defineHook } from '@directus/extensions-sdk';

export default defineHook(({ filter, action }, { services, database }) => {
  /**
   * BEFORE CREATE: Validate table data
   */
  filter('items.create', async (input, meta) => {
    if (meta.collection === 'tables') {
      if (!input.status) {
        input.status = 'available';
      }
      if (!input.capacity || input.capacity < 1) {
        throw new Error('Table capacity must be at least 1');
      }
      if (!input.number) {
        throw new Error('Table number is required');
      }
    }
    return input;
  });

  /**
   * BEFORE UPDATE: Track status changes
   */
  filter('items.update', async (input, meta) => {
    if (meta.collection === 'tables' && input.status) {
      const validStatuses = ['available', 'occupied', 'reserved', 'cleaning', 'out_of_service'];
      if (!validStatuses.includes(input.status)) {
        throw new Error(`Invalid table status: ${input.status}`);
      }
    }
    return input;
  });

  /**
   * AFTER UPDATE: Emit table status changed event
   */
  action('items.update', async (meta) => {
    if (meta.collection === 'tables' && meta.payload && meta.payload.status) {
      await database('events').insert({
        id: generateUUID(),
        type: 'petala.restaurant.table.status_changed',
        aggregate_id: meta.keys[0],
        tenant_id: meta.payload.tenant_id || '',
        data: JSON.stringify({
          number: meta.payload.number,
          status: meta.payload.status,
          capacity: meta.payload.capacity
        }),
        metadata: JSON.stringify({
          timestamp: new Date().toISOString(),
          version: 1,
          source: 'hook-tables'
        }),
        created_at: database.fn.now()
      });
    }
  });
});

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
