/**
 * Pétala Restaurant - Scheduler Endpoints
 */

import { defineEndpoint } from '@directus/extensions-sdk';

export default defineEndpoint((router, { database }) => {
  router.post('/create', async (req, res) => {
    try {
      const { type, execute_at, data } = req.body;

      const [id] = await database('scheduled_tasks').insert({
        id: generateUUID(),
        type,
        execute_at,
        data: JSON.stringify(data),
        status: 'pending',
        created_at: database.fn.now(),
      });

      res.json({ success: true, task_id: id });
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
