import { defineEndpoint } from '@directus/extensions-sdk';
import { z } from 'zod';

const searchSchema = z.object({
  query: z.string().optional(),
  property_type: z.enum(['house', 'apartment', 'condo', 'townhouse', 'land', 'commercial', 'multi_family']).optional(),
  listing_type: z.enum(['sale', 'rent']).optional(),
  min_price: z.number().optional(),
  max_price: z.number().optional(),
  bedrooms: z.number().optional(),
  bathrooms: z.number().optional(),
  min_sqft: z.number().optional(),
  max_sqft: z.number().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipcode: z.string().optional(),
  features: z.array(z.string()).optional(),
  amenities: z.array(z.string()).optional(),
  radius: z.number().optional(), // in miles
  lat: z.number().optional(),
  lng: z.number().optional(),
  page: z.number().default(1),
  limit: z.number().default(20).max(100),
  sort: z.enum(['price_asc', 'price_desc', 'newest', 'sqft_desc', 'views_desc']).default('newest'),
});

export default defineEndpoint({
  id: 'properties',
  handler: (router, { services, database, getSchema }) => {
    const { ItemsService } = services;

    // GET /api/petalas/real-estate/properties - Search properties
    router.get('/', async (req, res) => {
      try {
        const schema = await getSchema();
        const propertiesService = new ItemsService('properties', {
          schema,
          accountability: req.accountability,
        });

        const params = searchSchema.parse(req.query);

        // Build filter
        const filter: any = {
          status: { _eq: 'active' },
          tenant_id: { _eq: req.accountability.tenant_id },
        };

        if (params.property_type) {
          filter.property_type = { _eq: params.property_type };
        }

        if (params.listing_type) {
          filter.listing_type = { _eq: params.listing_type };
        }

        if (params.min_price || params.max_price) {
          filter.price = {};
          if (params.min_price) filter.price._gte = params.min_price;
          if (params.max_price) filter.price._lte = params.max_price;
        }

        if (params.bedrooms) {
          filter.bedrooms = { _gte: params.bedrooms };
        }

        if (params.bathrooms) {
          filter.bathrooms = { _gte: params.bathrooms };
        }

        if (params.min_sqft || params.max_sqft) {
          filter.square_feet = {};
          if (params.min_sqft) filter.square_feet._gte = params.min_sqft;
          if (params.max_sqft) filter.square_feet._lte = params.max_sqft;
        }

        if (params.city) {
          filter['address->city'] = { _icontains: params.city };
        }

        if (params.state) {
          filter['address->state'] = { _eq: params.state };
        }

        if (params.zipcode) {
          filter['address->zipcode'] = { _eq: params.zipcode };
        }

        if (params.features && params.features.length > 0) {
          filter.features = { _contains: params.features };
        }

        if (params.amenities && params.amenities.length > 0) {
          filter.amenities = { _contains: params.amenities };
        }

        // Radius search
        if (params.lat && params.lng && params.radius) {
          const radiusInDegrees = params.radius / 69; // Approximate miles to degrees
          filter._and = [
            { 'address->coordinates->lat': { _between: [params.lat - radiusInDegrees, params.lat + radiusInDegrees] } },
            { 'address->coordinates->lng': { _between: [params.lng - radiusInDegrees, params.lng + radiusInDegrees] } },
          ];
        }

        // Text search
        if (params.query) {
          filter._or = [
            { title: { _icontains: params.query } },
            { description: { _icontains: params.query } },
            { 'address->city': { _icontains: params.query } },
            { 'address->state': { _icontains: params.query } },
          ];
        }

        // Sort
        let sort: string[] = ['-created_at'];
        switch (params.sort) {
          case 'price_asc':
            sort = ['price'];
            break;
          case 'price_desc':
            sort = ['-price'];
            break;
          case 'sqft_desc':
            sort = ['-square_feet'];
            break;
          case 'views_desc':
            sort = ['-views'];
            break;
          case 'newest':
          default:
            sort = ['-created_at'];
            break;
        }

        const results = await propertiesService.readByQuery({
          filter,
          sort,
          page: params.page,
          limit: params.limit,
          fields: ['*', 'agent_id.*', 'agency_id.*', 'neighborhood_id.*'],
        });

        const total = await propertiesService.readByQuery({
          filter,
          aggregate: { count: '*' },
        });

        res.json({
          data: results,
          meta: {
            total: total[0]?.count || 0,
            page: params.page,
            limit: params.limit,
            pages: Math.ceil((total[0]?.count || 0) / params.limit),
          },
        });
      } catch (error: any) {
        res.status(400).json({ error: error.message });
      }
    });

    // GET /api/petalas/real-estate/properties/:id - Get property detail
    router.get('/:id', async (req, res) => {
      try {
        const schema = await getSchema();
        const propertiesService = new ItemsService('properties', {
          schema,
          accountability: req.accountability,
        });

        const property = await propertiesService.readOne(req.params.id, {
          fields: ['*', 'agent_id.*', 'agency_id.*', 'neighborhood_id.*'],
        });

        res.json({ data: property });
      } catch (error: any) {
        res.status(404).json({ error: 'Property not found' });
      }
    });

    // GET /api/petalas/real-estate/properties/:id/similar - Get similar properties
    router.get('/:id/similar', async (req, res) => {
      try {
        const schema = await getSchema();
        const propertiesService = new ItemsService('properties', {
          schema,
          accountability: req.accountability,
        });

        const property = await propertiesService.readOne(req.params.id);

        // Find similar properties (same type, similar price range, same area)
        const priceRange = property.price * 0.2; // 20% range
        const filter: any = {
          status: { _eq: 'active' },
          tenant_id: { _eq: req.accountability.tenant_id },
          id: { _neq: req.params.id },
          property_type: { _eq: property.property_type },
          listing_type: { _eq: property.listing_type },
          price: {
            _between: [property.price - priceRange, property.price + priceRange],
          },
        };

        if (property.address?.city) {
          filter['address->city'] = { _eq: property.address.city };
        }

        const similar = await propertiesService.readByQuery({
          filter,
          limit: 6,
          sort: ['-created_at'],
          fields: ['*', 'agent_id.*'],
        });

        res.json({ data: similar });
      } catch (error: any) {
        res.status(404).json({ error: 'Property not found' });
      }
    });

    // POST /api/petalas/real-estate/properties/:id/favorite - Add to favorites
    router.post('/:id/favorite', async (req, res) => {
      try {
        const schema = await getSchema();
        const favoritesService = new ItemsService('property_favorites', {
          schema,
          accountability: req.accountability,
        });

        const favorite = await favoritesService.createOne({
          property_id: req.params.id,
          user_id: req.accountability.user,
          tenant_id: req.accountability.tenant_id,
        });

        res.json({ data: favorite });
      } catch (error: any) {
        res.status(400).json({ error: error.message });
      }
    });

    // DELETE /api/petalas/real-estate/properties/:id/favorite - Remove from favorites
    router.delete('/:id/favorite', async (req, res) => {
      try {
        const schema = await getSchema();
        const favoritesService = new ItemsService('property_favorites', {
          schema,
          accountability: req.accountability,
        });

        const favorites = await favoritesService.readByQuery({
          filter: {
            property_id: { _eq: req.params.id },
            user_id: { _eq: req.accountability.user },
          },
        });

        if (favorites && favorites.length > 0) {
          await favoritesService.deleteOne(favorites[0].id);
        }

        res.json({ success: true });
      } catch (error: any) {
        res.status(400).json({ error: error.message });
      }
    });

    // GET /api/petalas/real-estate/properties/:id/schedule - Get available times for viewing
    router.get('/:id/schedule', async (req, res) => {
      try {
        const schema = await getSchema();
        const appointmentsService = new ItemsService('appointments', {
          schema,
          accountability: req.accountability,
        });

        const date = req.query.date || new Date().toISOString().split('T')[0];

        // Get existing appointments for the property on this date
        const existing = await appointmentsService.readByQuery({
          filter: {
            property_id: { _eq: req.params.id },
            appointment_date: { _eq: date },
            status: { _neq: 'cancelled' },
          },
          fields: ['appointment_time'],
        });

        const bookedTimes = existing.map((a: any) => a.appointment_time);

        // Generate available time slots (9 AM - 5 PM, hourly)
        const available = [];
        for (let hour = 9; hour <= 17; hour++) {
          const time = `${hour.toString().padStart(2, '0')}:00`;
          if (!bookedTimes.includes(time)) {
            available.push(time);
          }
        }

        res.json({ data: available });
      } catch (error: any) {
        res.status(400).json({ error: error.message });
      }
    });
  },
});
