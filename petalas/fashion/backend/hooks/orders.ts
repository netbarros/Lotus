import { defineHook } from '@directus/extensions-sdk';

export default defineHook(({ filter, action }, { services, database }) => {
  filter('items.create', async (input, meta) => {
    if (meta.collection === 'orders') {
      if (!input.order_number) {
        const year = new Date().getFullYear();
        const nextNumber = Math.floor(Math.random() * 999999) + 1;
        input.order_number = `ORD-${year}-${String(nextNumber).padStart(6, '0')}`;
      }
      input.payment_status = input.payment_status || 'pending';
      input.fulfillment_status = input.fulfillment_status || 'unfulfilled';
      input.status = input.status || 'active';
    }
    return input;
  });
});
