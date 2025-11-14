import { defineEndpoint } from '@directus/extensions-sdk';
import { z } from 'zod';

const createLeadSchema = z.object({
  property_id: z.string().uuid().optional(),
  name: z.string().min(2).max(255),
  email: z.string().email(),
  phone: z.string().optional(),
  message: z.string().optional(),
  lead_type: z.enum(['inquiry', 'viewing', 'offer', 'info', 'virtual_tour']).default('inquiry'),
  lead_source: z.string().optional(),
});

export default defineEndpoint({
  id: 'leads',
  handler: (router, { services, getSchema }) => {
    const { ItemsService } = services;

    // POST /api/petalas/real-estate/leads - Create new lead
    router.post('/', async (req, res) => {
      try {
        const schema = await getSchema();
        const leadsService = new ItemsService('leads', {
          schema,
          accountability: req.accountability,
        });

        const data = createLeadSchema.parse(req.body);

        const lead = await leadsService.createOne({
          ...data,
          tenant_id: req.accountability.tenant_id,
          status: 'new',
        });

        // Track event
        await services.database('events').insert({
          type: 'petala.real_estate.lead.created',
          tenant_id: req.accountability.tenant_id,
          aggregate_id: lead.id,
          data: {
            property_id: data.property_id,
            lead_type: data.lead_type,
            lead_source: data.lead_source,
          },
          metadata: {
            timestamp: new Date().toISOString(),
            version: 1,
          },
        });

        res.json({
          data: lead,
          message: 'Thank you for your inquiry! An agent will contact you shortly.',
        });
      } catch (error: any) {
        if (error.name === 'ZodError') {
          res.status(400).json({ error: 'Validation error', details: error.errors });
        } else {
          res.status(400).json({ error: error.message });
        }
      }
    });

    // GET /api/petalas/real-estate/leads - List leads (agent/admin only)
    router.get('/', async (req, res) => {
      try {
        const schema = await getSchema();
        const leadsService = new ItemsService('leads', {
          schema,
          accountability: req.accountability,
        });

        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const status = req.query.status as string;
        const property_id = req.query.property_id as string;

        const filter: any = {
          tenant_id: { _eq: req.accountability.tenant_id },
        };

        // If agent, only show assigned leads
        if (req.accountability.role === 'agent') {
          filter.assigned_to = { _eq: req.accountability.user };
        }

        if (status) {
          filter.status = { _eq: status };
        }

        if (property_id) {
          filter.property_id = { _eq: property_id };
        }

        const leads = await leadsService.readByQuery({
          filter,
          sort: ['-created_at'],
          page,
          limit,
          fields: ['*', 'property_id.*', 'assigned_to.*'],
        });

        const total = await leadsService.readByQuery({
          filter,
          aggregate: { count: '*' },
        });

        res.json({
          data: leads,
          meta: {
            total: total[0]?.count || 0,
            page,
            limit,
            pages: Math.ceil((total[0]?.count || 0) / limit),
          },
        });
      } catch (error: any) {
        res.status(400).json({ error: error.message });
      }
    });

    // GET /api/petalas/real-estate/leads/:id - Get lead detail
    router.get('/:id', async (req, res) => {
      try {
        const schema = await getSchema();
        const leadsService = new ItemsService('leads', {
          schema,
          accountability: req.accountability,
        });

        const lead = await leadsService.readOne(req.params.id, {
          fields: ['*', 'property_id.*', 'assigned_to.*'],
        });

        res.json({ data: lead });
      } catch (error: any) {
        res.status(404).json({ error: 'Lead not found' });
      }
    });

    // PATCH /api/petalas/real-estate/leads/:id - Update lead
    router.patch('/:id', async (req, res) => {
      try {
        const schema = await getSchema();
        const leadsService = new ItemsService('leads', {
          schema,
          accountability: req.accountability,
        });

        const updated = await leadsService.updateOne(req.params.id, req.body);

        res.json({ data: updated });
      } catch (error: any) {
        res.status(400).json({ error: error.message });
      }
    });
  },
});
