/**
 * Pétala Restaurant - Notifications Endpoints
 */

import { defineEndpoint } from '@directus/extensions-sdk';

export default defineEndpoint((router, { database }) => {
  router.post('/sms', async (req, res) => {
    try {
      const { to, message } = req.body;

      // Log SMS notification (integration with SMS provider would go here)
      await database('notifications').insert({
        id: generateUUID(),
        type: 'sms',
        recipient: to,
        message,
        status: 'sent',
        sent_at: database.fn.now()
      });

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.post('/staff', async (req, res) => {
    try {
      const { type, message, staff_id } = req.body;

      await database('staff_notifications').insert({
        id: generateUUID(),
        type,
        message,
        staff_id,
        read: false,
        created_at: database.fn.now()
      });

      res.json({ success: true });
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
