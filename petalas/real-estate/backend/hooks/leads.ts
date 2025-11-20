import { defineHook } from '@directus/extensions-sdk';

export default defineHook(({ filter, action }, { services, database, getSchema }) => {
  const { ItemsService, MailService } = services;

  // Auto-assign lead to property agent
  action('leads.items.create', async ({ key, payload }, context) => {
    const schema = await getSchema();
    const leadsService = new ItemsService('leads', {
      schema,
      accountability: context.accountability,
    });
    const propertiesService = new ItemsService('properties', {
      schema,
      accountability: context.accountability,
    });

    if (payload.property_id) {
      const property = await propertiesService.readOne(payload.property_id);
      if (property && property.agent_id && !payload.assigned_to) {
        await leadsService.updateOne(key, {
          assigned_to: property.agent_id,
        });
      }

      // Increment property leads count
      await propertiesService.updateOne(payload.property_id, {
        leads_count: (property.leads_count || 0) + 1,
      });
    }
  });

  // Send notification email to agent
  action('leads.items.create', async ({ key, payload }, context) => {
    const schema = await getSchema();
    const leadsService = new ItemsService('leads', {
      schema,
      accountability: context.accountability,
    });
    const agentsService = new ItemsService('agents', {
      schema,
      accountability: context.accountability,
    });
    const propertiesService = new ItemsService('properties', {
      schema,
      accountability: context.accountability,
    });

    const lead = await leadsService.readOne(key);
    let agentEmail = null;
    let propertyTitle = null;

    if (lead.assigned_to) {
      const agent = await agentsService.readOne(lead.assigned_to);
      agentEmail = agent?.email;
    }

    if (lead.property_id) {
      const property = await propertiesService.readOne(lead.property_id);
      propertyTitle = property?.title;
    }

    if (agentEmail) {
      const mailService = new MailService({ schema, accountability: context.accountability });

      await mailService.send({
        to: agentEmail,
        subject: `New Lead: ${lead.name} - ${propertyTitle || 'General Inquiry'}`,
        template: {
          name: 'new-lead',
          data: {
            leadName: lead.name,
            leadEmail: lead.email,
            leadPhone: lead.phone,
            leadMessage: lead.message,
            leadType: lead.lead_type,
            propertyTitle,
            dashboardUrl: process.env.PUBLIC_URL + '/admin/content/leads/' + key,
          },
        },
      });
    }
  });

  // Send auto-response to lead
  action('leads.items.create', async ({ key, payload }, context) => {
    const schema = await getSchema();
    const mailService = new MailService({ schema, accountability: context.accountability });
    const propertiesService = new ItemsService('properties', {
      schema,
      accountability: context.accountability,
    });

    let propertyTitle = 'our property';
    if (payload.property_id) {
      const property = await propertiesService.readOne(payload.property_id);
      propertyTitle = property?.title || propertyTitle;
    }

    await mailService.send({
      to: payload.email,
      subject: 'Thank you for your inquiry',
      template: {
        name: 'lead-confirmation',
        data: {
          leadName: payload.name,
          propertyTitle,
          message: payload.message,
        },
      },
    });
  });

  // Update lead status workflow
  action('leads.items.update', async ({ keys, payload }, context) => {
    if (payload.status === 'converted') {
      const schema = await getSchema();
      const leadsService = new ItemsService('leads', {
        schema,
        accountability: context.accountability,
      });

      // Log conversion for analytics
      for (const key of keys) {
        const lead = await leadsService.readOne(key);

        // Emit event for analytics
        await database('events').insert({
          type: 'petala.real_estate.lead.converted',
          tenant_id: lead.tenant_id,
          aggregate_id: key,
          data: {
            property_id: lead.property_id,
            agent_id: lead.assigned_to,
            lead_source: lead.lead_source,
          },
          metadata: {
            timestamp: new Date().toISOString(),
            version: 1,
          },
        });
      }
    }
  });

  // Multi-tenant isolation
  filter('leads.items.read', async (input, meta, context) => {
    const accountability = context.accountability;
    if (accountability && accountability.role !== 'admin') {
      if (!input.filter) {
        input.filter = {};
      }
      input.filter.tenant_id = { _eq: accountability.tenant_id };
    }
    return input;
  });

  // Validate email format
  filter('leads.items.create', async (input) => {
    if (input.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) {
      throw new Error('Invalid email format');
    }
    return input;
  });
});
