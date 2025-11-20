import { defineHook } from '@directus/extensions-sdk';

export default defineHook(({ filter, action }, { database }) => {
  filter('items.create', async (input, meta) => {
    if (meta.collection === 'patients') {
      if (!input.mrn) {
        const year = new Date().getFullYear();
        const random = Math.floor(Math.random() * 999999);
        input.mrn = `MRN-${year}-${String(random).padStart(6, '0')}`;
      }
      if (!input.status) input.status = 'active';
      if (input.total_visits === undefined) input.total_visits = 0;
    }
    return input;
  });

  action('items.create', async (meta) => {
    if (meta.collection === 'patients' && meta.payload) {
      await database('events').insert({
        id: generateUUID(),
        type: 'petala.healthcare.patient.registered',
        aggregate_id: meta.key,
        tenant_id: meta.payload.tenant_id,
        data: JSON.stringify({
          mrn: meta.payload.mrn,
          name: `${meta.payload.first_name} ${meta.payload.last_name}`,
        }),
        metadata: JSON.stringify({
          timestamp: new Date().toISOString(),
          version: 1,
          source: 'hook-patients',
        }),
        created_at: database.fn.now(),
      });
    }
  });
});

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}
