/**
 * Pétala Restaurant - Reservations Hooks
 *
 * Handles reservation lifecycle events:
 * - Generate confirmation code
 * - Validate reservation times
 * - Check table availability
 * - Calculate party size requirements
 * - Emit reservation events
 */

import { defineHook } from '@directus/extensions-sdk';

export default defineHook(({ filter, action }, { services, database, getSchema }) => {
  const { ItemsService } = services;

  /**
   * BEFORE CREATE: Generate confirmation code and validate
   */
  filter('items.create', async (input, meta, context) => {
    if (meta.collection === 'reservations') {
      // Generate unique confirmation code
      if (!input.confirmation_code) {
        input.confirmation_code = generateConfirmationCode();
      }

      // Set default status
      if (!input.status) {
        input.status = 'pending';
      }

      // Set default duration if not provided
      if (!input.duration_minutes) {
        input.duration_minutes = input.party_size > 6 ? 120 : 90;
      }

      // Validate reservation date (must be in future)
      const reservationDateTime = new Date(`${input.reservation_date}T${input.reservation_time}`);
      if (reservationDateTime < new Date()) {
        throw new Error('Reservation date and time must be in the future');
      }

      // Validate party size
      if (input.party_size < 1 || input.party_size > 20) {
        throw new Error('Party size must be between 1 and 20');
      }
    }
    return input;
  });

  /**
   * BEFORE UPDATE: Validate status transitions
   */
  filter('items.update', async (input, meta, context) => {
    if (meta.collection === 'reservations') {
      const validTransitions: Record<string, string[]> = {
        pending: ['confirmed', 'cancelled'],
        confirmed: ['seated', 'no_show', 'cancelled'],
        seated: ['completed'],
        completed: [],
        cancelled: [],
        no_show: []
      };

      if (input.status && meta.keys && meta.keys.length > 0) {
        const current = await database
          .select('status')
          .from('reservations')
          .where('id', meta.keys[0])
          .first();

        if (current && !validTransitions[current.status]?.includes(input.status)) {
          throw new Error(`Invalid status transition from ${current.status} to ${input.status}`);
        }
      }

      // Set timestamps based on status
      if (input.status === 'seated' && !input.seated_at) {
        input.seated_at = new Date();
      }
      if (input.status === 'completed' && !input.completed_at) {
        input.completed_at = new Date();
      }
      if (input.status === 'cancelled' && !input.cancelled_at) {
        input.cancelled_at = new Date();
      }
    }
    return input;
  });

  /**
   * AFTER CREATE: Emit reservation.created event
   */
  action('items.create', async (meta, context) => {
    if (meta.collection === 'reservations' && meta.payload) {
      await emitEvent({
        type: 'petala.restaurant.reservation.created',
        aggregateId: meta.key,
        tenantId: meta.payload.tenant_id,
        data: {
          confirmation_code: meta.payload.confirmation_code,
          customer_name: meta.payload.customer_name,
          party_size: meta.payload.party_size,
          reservation_date: meta.payload.reservation_date,
          reservation_time: meta.payload.reservation_time,
          status: meta.payload.status
        },
        database
      });
    }
  });

  /**
   * AFTER UPDATE: Emit reservation status changed events
   */
  action('items.update', async (meta, context) => {
    if (meta.collection === 'reservations' && meta.payload) {
      if (meta.payload.status) {
        await emitEvent({
          type: `petala.restaurant.reservation.${meta.payload.status}`,
          aggregateId: meta.keys[0],
          tenantId: meta.payload.tenant_id || await getTenantId('reservations', meta.keys[0], database),
          data: {
            status: meta.payload.status,
            table_id: meta.payload.table_id,
            timestamp: new Date().toISOString()
          },
          database
        });
      }
    }
  });
});

/**
 * Helper Functions
 */

function generateConfirmationCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluded similar-looking chars
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

async function getTenantId(collection: string, id: string, database: any): Promise<string> {
  const result = await database
    .select('tenant_id')
    .from(collection)
    .where('id', id)
    .first();
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
      source: 'hook-reservations'
    }),
    created_at: database.fn.now()
  });
}

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
