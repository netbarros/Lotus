/**
 * Pétala Restaurant - Orders Hooks
 *
 * Handles order lifecycle events:
 * - Generate order number
 * - Validate order items
 * - Calculate totals
 * - Track order status
 * - Emit order events
 */

import { defineHook } from '@directus/extensions-sdk';

export default defineHook(({ filter, action }, { services, database, getSchema }) => {
  const { ItemsService } = services;

  /**
   * BEFORE CREATE: Generate order number and set defaults
   */
  filter('items.create', async (input, meta, context) => {
    if (meta.collection === 'orders') {
      // Generate unique order number
      if (!input.order_number) {
        const year = new Date().getFullYear();
        const month = String(new Date().getMonth() + 1).padStart(2, '0');
        const nextNumber = Math.floor(Math.random() * 9999) + 1;
        input.order_number = `RES-${year}${month}-${String(nextNumber).padStart(4, '0')}`;
      }

      // Set default status
      if (!input.status) {
        input.status = 'pending';
      }

      // Set default order type if not provided
      if (!input.order_type) {
        input.order_type = input.table_id ? 'dine_in' : 'takeout';
      }

      // Validate order has items
      if (!input.items || input.items.length === 0) {
        throw new Error('Order must have at least one item');
      }

      // Set created timestamp
      if (!input.created_at) {
        input.created_at = new Date();
      }
    }
    return input;
  });

  /**
   * BEFORE UPDATE: Validate status transitions and set timestamps
   */
  filter('items.update', async (input, meta, context) => {
    if (meta.collection === 'orders') {
      const validTransitions: Record<string, string[]> = {
        pending: ['confirmed', 'cancelled'],
        confirmed: ['preparing', 'cancelled'],
        preparing: ['ready', 'cancelled'],
        ready: ['served', 'out_for_delivery'],
        served: ['completed'],
        out_for_delivery: ['delivered'],
        delivered: ['completed'],
        completed: [],
        cancelled: [],
      };

      if (input.status && meta.keys && meta.keys.length > 0) {
        const current = await database
          .select('status')
          .from('orders')
          .where('id', meta.keys[0])
          .first();

        if (current && !validTransitions[current.status]?.includes(input.status)) {
          throw new Error(`Invalid status transition from ${current.status} to ${input.status}`);
        }
      }

      // Set timestamps based on status
      const statusTimestamps: Record<string, string> = {
        confirmed: 'confirmed_at',
        preparing: 'preparing_at',
        ready: 'ready_at',
        served: 'served_at',
        delivered: 'delivered_at',
        completed: 'completed_at',
        cancelled: 'cancelled_at',
      };

      if (
        input.status &&
        statusTimestamps[input.status] &&
        !input[statusTimestamps[input.status]]
      ) {
        input[statusTimestamps[input.status]] = new Date();
      }
    }
    return input;
  });

  /**
   * AFTER CREATE: Emit order.created event
   */
  action('items.create', async (meta, context) => {
    if (meta.collection === 'orders' && meta.payload) {
      await emitEvent({
        type: 'petala.restaurant.order.created',
        aggregateId: meta.key,
        tenantId: meta.payload.tenant_id,
        data: {
          order_number: meta.payload.order_number,
          order_type: meta.payload.order_type,
          table_id: meta.payload.table_id,
          total: meta.payload.total,
          items_count: meta.payload.items?.length || 0,
          status: meta.payload.status,
        },
        database,
      });

      // Update table status if dine-in
      if (meta.payload.table_id && meta.payload.order_type === 'dine_in') {
        await database('tables').where('id', meta.payload.table_id).update({
          status: 'occupied',
          current_order_id: meta.key,
          updated_at: database.fn.now(),
        });
      }
    }
  });

  /**
   * AFTER UPDATE: Emit order status changed events
   */
  action('items.update', async (meta, context) => {
    if (meta.collection === 'orders' && meta.payload) {
      if (meta.payload.status) {
        await emitEvent({
          type: `petala.restaurant.order.${meta.payload.status}`,
          aggregateId: meta.keys[0],
          tenantId: meta.payload.tenant_id || (await getTenantId('orders', meta.keys[0], database)),
          data: {
            status: meta.payload.status,
            order_number: meta.payload.order_number,
            timestamp: new Date().toISOString(),
          },
          database,
        });
      }

      // If order completed and table exists, mark table as needs cleaning
      if (meta.payload.status === 'completed' && meta.payload.table_id) {
        await database('tables').where('id', meta.payload.table_id).update({
          status: 'cleaning',
          current_order_id: null,
          updated_at: database.fn.now(),
        });
      }
    }
  });
});

/**
 * Helper Functions
 */

async function getTenantId(collection: string, id: string, database: any): Promise<string> {
  const result = await database.select('tenant_id').from(collection).where('id', id).first();
  return result?.tenant_id;
}

async function emitEvent(params: {
  type: string;
  aggregateId: string;
  tenantId: string;
  data: Record<string, any>;
  database: any;
}): Promise<void> {
  const { type, aggregateId, tenantId, data, database } = params;

  await database('events').insert({
    id: generateUUID(),
    type,
    aggregate_id: aggregateId,
    tenant_id: tenantId,
    data: JSON.stringify(data),
    metadata: JSON.stringify({
      timestamp: new Date().toISOString(),
      version: 1,
      source: 'hook-orders',
    }),
    created_at: database.fn.now(),
  });
}

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
