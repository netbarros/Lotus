import { defineHook } from '@directus/extensions-sdk';
import { slugify } from '../utils/slugify';

export default defineHook(({ filter, action }, { services, database, getSchema }) => {
  const { ItemsService } = services;

  // Auto-generate slug from title
  filter('properties.items.create', async (input, meta, context) => {
    if (input.title && !input.slug) {
      input.slug = slugify(input.title);
    }
    return input;
  });

  filter('properties.items.update', async (input, meta, context) => {
    if (input.title && !input.slug) {
      input.slug = slugify(input.title);
    }
    return input;
  });

  // Auto-calculate price per sqft
  filter('properties.items.create', async (input) => {
    if (input.price && input.square_feet && input.square_feet > 0) {
      input.price_per_sqft = (input.price / input.square_feet).toFixed(2);
    }
    return input;
  });

  filter('properties.items.update', async (input) => {
    if (input.price && input.square_feet && input.square_feet > 0) {
      input.price_per_sqft = (input.price / input.square_feet).toFixed(2);
    }
    return input;
  });

  // Increment views count
  action('properties.items.read', async (meta, context) => {
    const schema = await getSchema();
    const propertiesService = new ItemsService('properties', {
      schema,
      accountability: context.accountability,
    });

    if (meta.keys && meta.keys.length > 0) {
      for (const key of meta.keys) {
        const property = await propertiesService.readOne(key);
        if (property) {
          await propertiesService.updateOne(key, {
            views: (property.views || 0) + 1,
          });
        }
      }
    }
  });

  // Update agent listing count
  action('properties.items.create', async ({ key, payload }, context) => {
    if (payload.agent_id && payload.status === 'active') {
      const schema = await getSchema();
      const agentsService = new ItemsService('agents', {
        schema,
        accountability: context.accountability,
      });

      const agent = await agentsService.readOne(payload.agent_id);
      if (agent) {
        await agentsService.updateOne(payload.agent_id, {
          listings_count: (agent.listings_count || 0) + 1,
        });
      }
    }
  });

  // Update agent sales count when property sold
  action('properties.items.update', async ({ keys, payload }, context) => {
    if (payload.status === 'sold' || payload.status === 'rented') {
      const schema = await getSchema();
      const propertiesService = new ItemsService('properties', {
        schema,
        accountability: context.accountability,
      });
      const agentsService = new ItemsService('agents', {
        schema,
        accountability: context.accountability,
      });

      for (const key of keys) {
        const property = await propertiesService.readOne(key);
        if (property && property.agent_id) {
          const agent = await agentsService.readOne(property.agent_id);
          if (agent) {
            await agentsService.updateOne(property.agent_id, {
              sales_count: (agent.sales_count || 0) + 1,
            });
          }
        }
      }
    }
  });

  // Validate required fields based on property type
  filter('properties.items.create', async (input) => {
    if (input.property_type === 'land') {
      // Land doesn't need bedrooms/bathrooms
      delete input.bedrooms;
      delete input.bathrooms;
    } else if (!input.bedrooms || !input.bathrooms) {
      throw new Error('Bedrooms and bathrooms are required for this property type');
    }
    return input;
  });

  // Ensure coordinates are present in address
  filter('properties.items.create', async (input) => {
    if (input.address && (!input.address.coordinates || !input.address.coordinates.lat)) {
      throw new Error('Address must include coordinates (lat, lng)');
    }
    return input;
  });

  filter('properties.items.update', async (input) => {
    if (input.address && (!input.address.coordinates || !input.address.coordinates.lat)) {
      throw new Error('Address must include coordinates (lat, lng)');
    }
    return input;
  });

  // Multi-tenant isolation (RLS enforcement)
  filter('properties.items.read', async (input, meta, context) => {
    const accountability = context.accountability;
    if (accountability && accountability.role !== 'admin') {
      if (!input.filter) {
        input.filter = {};
      }
      input.filter.tenant_id = { _eq: accountability.tenant_id };
    }
    return input;
  });
});
