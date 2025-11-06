import { defineHook } from '@directus/extensions-sdk';
export default defineHook(({ filter }, { services, database }) => {
  filter('items.create', async (input, meta) => {
    if (meta.collection === '${file}') {
      if (!input.slug && input.name) {
        input.slug = input.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      }
      input.status = input.status || 'active';
    }
    return input;
  });
});
