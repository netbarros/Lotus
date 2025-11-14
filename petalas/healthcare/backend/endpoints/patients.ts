/**
 * Pétala Restaurant - Reservations Endpoints
 *
 * Routes for reservation management
 */

import { defineEndpoint } from '@directus/extensions-sdk';

export default defineEndpoint((router, { database }) => {
  // POST /petalas/restaurant/reservations - Create reservation
  router.post('/', async (req, res) => {
    try {
      const {
        tenant_id,
        restaurant_id,
        customer_name,
        customer_email,
        customer_phone,
        reservation_date,
        reservation_time,
        party_size,
        special_requests,
        occasion,
      } = req.body;

      const [id] = await database('reservations').insert({
        id: generateUUID(),
        tenant_id,
        restaurant_id,
        customer_name,
        customer_email,
        customer_phone,
        reservation_date,
        reservation_time,
        party_size,
        special_requests,
        occasion,
        status: 'pending',
        created_at: database.fn.now(),
      });

      res.json({ success: true, reservation_id: id });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET /petalas/restaurant/reservations/:id - Get reservation
  router.get('/:id', async (req, res) => {
    try {
      const reservation = await database('reservations').where({ id: req.params.id }).first();

      if (!reservation) {
        return res.status(404).json({ error: 'Reservation not found' });
      }

      res.json({ data: reservation });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // POST /petalas/restaurant/reservations/check-availability - Check availability
  router.post('/check-availability', async (req, res) => {
    try {
      const { restaurant_id, reservation_date, reservation_time, party_size } = req.body;

      // Get available tables for the requested time slot
      const tables = await database('tables')
        .where({ restaurant_id, status: 'available' })
        .where('capacity', '>=', party_size);

      // Check conflicting reservations
      const conflicts = await database('reservations')
        .where({ restaurant_id, reservation_date })
        .whereBetween('reservation_time', [
          subtractMinutes(reservation_time, 90),
          addMinutes(reservation_time, 90),
        ])
        .whereIn('status', ['confirmed', 'seated']);

      const available = tables.length > conflicts.length;

      res.json({ available, tables_count: tables.length, conflicts_count: conflicts.length });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // PATCH /petalas/restaurant/reservations/:id/status - Update status
  router.patch('/:id/status', async (req, res) => {
    try {
      const { status } = req.body;

      await database('reservations')
        .where({ id: req.params.id })
        .update({ status, updated_at: database.fn.now() });

      res.json({ success: true });
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

function subtractMinutes(time: string, minutes: number): string {
  const [h, m] = time.split(':').map(Number);
  const totalMinutes = h * 60 + m - minutes;
  return `${Math.floor(totalMinutes / 60)
    .toString()
    .padStart(2, '0')}:${(totalMinutes % 60).toString().padStart(2, '0')}`;
}

function addMinutes(time: string, minutes: number): string {
  const [h, m] = time.split(':').map(Number);
  const totalMinutes = h * 60 + m + minutes;
  return `${Math.floor(totalMinutes / 60)
    .toString()
    .padStart(2, '0')}:${(totalMinutes % 60).toString().padStart(2, '0')}`;
}
