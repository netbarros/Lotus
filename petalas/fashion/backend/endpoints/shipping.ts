import { defineEndpoint } from '@directus/extensions-sdk';

export default defineEndpoint((router, { services, database, env }) => {
  // POST /petalas/fashion/shipping/calculate - Calculate shipping rates
  router.post('/calculate', async (req, res) => {
    try {
      const {
        destination, // { country, state, city, postal_code }
        items, // Array of { product_id, quantity }
        coupon_code
      } = req.body;

      const tenant_id = req.accountability.tenant;

      if (!destination || !items || items.length === 0) {
        return res.status(400).json({
          error: 'Missing required fields',
          required: ['destination', 'items']
        });
      }

      // Get products to calculate weight/dimensions
      const productIds = items.map(item => item.product_id);
      const products = await database('products')
        .select('id', 'weight', 'dimensions')
        .where({ tenant_id })
        .whereIn('id', productIds);

      // Calculate total weight
      let totalWeight = 0;
      for (const item of items) {
        const product = products.find(p => p.id === item.product_id);
        if (product && product.weight) {
          totalWeight += parseFloat(product.weight) * item.quantity;
        }
      }

      // Get shipping zones for destination
      const shippingZones = await database('shipping_zones')
        .select('*')
        .where({ tenant_id, status: 'active' })
        .where(function() {
          this.where('countries', 'like', `%${destination.country}%`)
            .orWhere('countries', 'like', '%*%'); // Wildcard for all countries
        })
        .orderBy('priority', 'asc');

      if (shippingZones.length === 0) {
        return res.status(400).json({
          error: 'No shipping available to destination',
          destination
        });
      }

      // Calculate rates for each shipping method
      const rates = [];

      for (const zone of shippingZones) {
        const methods = zone.methods ? JSON.parse(zone.methods) : [];

        for (const method of methods) {
          let rate = 0;

          // Calculate based on pricing type
          switch (method.pricing_type) {
            case 'flat':
              rate = parseFloat(method.rate);
              break;

            case 'weight':
              rate = parseFloat(method.base_rate) + (totalWeight * parseFloat(method.rate_per_kg || 0));
              break;

            case 'tiered':
              // Tiered pricing based on weight brackets
              const tiers = method.tiers || [];
              const tier = tiers.find(t => totalWeight >= t.min_weight && totalWeight <= t.max_weight);
              rate = tier ? parseFloat(tier.rate) : parseFloat(method.base_rate || 0);
              break;

            default:
              rate = parseFloat(method.rate || 0);
          }

          // Apply free shipping threshold
          if (method.free_shipping_threshold) {
            const cartTotal = await calculateCartTotal(database, tenant_id, items);
            if (cartTotal >= parseFloat(method.free_shipping_threshold)) {
              rate = 0;
            }
          }

          // Check if coupon provides free shipping
          if (coupon_code) {
            const coupon = await database('coupons')
              .where({
                code: coupon_code.toUpperCase(),
                tenant_id,
                status: 'active'
              })
              .where('valid_from', '<=', new Date())
              .where(function() {
                this.whereNull('valid_until').orWhere('valid_until', '>=', new Date());
              })
              .first();

            if (coupon && coupon.discount_type === 'free_shipping') {
              rate = 0;
            }
          }

          rates.push({
            id: `${zone.id}_${method.id}`,
            zone_id: zone.id,
            zone_name: zone.name,
            method_id: method.id,
            method_name: method.name,
            carrier: method.carrier || 'Standard',
            delivery_time: method.delivery_time || '5-7 business days',
            rate: rate.toFixed(2),
            currency: 'USD'
          });
        }
      }

      // Sort by rate (cheapest first)
      rates.sort((a, b) => parseFloat(a.rate) - parseFloat(b.rate));

      res.json({
        data: {
          rates,
          destination,
          total_weight: totalWeight.toFixed(2),
          weight_unit: 'kg'
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // POST /petalas/fashion/shipping/track - Track shipment
  router.post('/track', async (req, res) => {
    try {
      const { order_id, tracking_number } = req.body;
      const tenant_id = req.accountability.tenant;

      if (!order_id && !tracking_number) {
        return res.status(400).json({
          error: 'Either order_id or tracking_number is required'
        });
      }

      let order;
      if (order_id) {
        order = await database('orders')
          .where({ id: order_id, tenant_id })
          .first();
      } else {
        order = await database('orders')
          .where({ tracking_number, tenant_id })
          .first();
      }

      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      // If no tracking number yet
      if (!order.tracking_number) {
        return res.json({
          data: {
            order_id: order.id,
            order_number: order.order_number,
            status: order.fulfillment_status,
            tracking_available: false,
            message: 'Tracking information not yet available'
          }
        });
      }

      // Get tracking info from carrier API (mock for now)
      const trackingInfo = await getCarrierTracking(
        order.shipping_carrier,
        order.tracking_number,
        env
      );

      res.json({
        data: {
          order_id: order.id,
          order_number: order.order_number,
          tracking_number: order.tracking_number,
          carrier: order.shipping_carrier,
          status: trackingInfo.status,
          estimated_delivery: trackingInfo.estimated_delivery,
          tracking_events: trackingInfo.events,
          tracking_url: trackingInfo.tracking_url
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET /petalas/fashion/shipping/zones - Get shipping zones
  router.get('/zones', async (req, res) => {
    try {
      const tenant_id = req.accountability.tenant;

      const zones = await database('shipping_zones')
        .select('*')
        .where({ tenant_id, status: 'active' })
        .orderBy('priority', 'asc');

      res.json({
        data: zones.map(z => ({
          id: z.id,
          name: z.name,
          countries: z.countries ? JSON.parse(z.countries) : [],
          methods: z.methods ? JSON.parse(z.methods) : [],
          priority: z.priority
        }))
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // POST /petalas/fashion/shipping/webhook/carrier - Carrier tracking webhook
  router.post('/webhook/carrier', async (req, res) => {
    try {
      const { tracking_number, status, events, carrier } = req.body;

      // Verify webhook authenticity (depends on carrier)

      // Find order by tracking number
      const order = await database('orders')
        .where({ tracking_number })
        .first();

      if (order) {
        // Map carrier status to our fulfillment status
        let fulfillmentStatus = order.fulfillment_status;
        switch (status?.toLowerCase()) {
          case 'in_transit':
            fulfillmentStatus = 'shipped';
            break;
          case 'delivered':
            fulfillmentStatus = 'delivered';
            break;
          case 'failed':
          case 'returned':
            fulfillmentStatus = 'returned';
            break;
        }

        // Update order
        await database('orders')
          .where({ id: order.id })
          .update({
            fulfillment_status: fulfillmentStatus,
            delivered_at: status === 'delivered' ? new Date() : order.delivered_at,
            updated_at: new Date()
          });

        // Emit event
        await database('events').insert({
          id: database.raw('gen_random_uuid()'),
          tenant_id: order.tenant_id,
          aggregate_type: 'order',
          aggregate_id: order.id,
          event_type: 'petala.fashion.shipment.updated',
          event_data: JSON.stringify({
            order_id: order.id,
            tracking_number,
            status: fulfillmentStatus,
            carrier,
            events
          }),
          timestamp: new Date()
        });
      }

      res.json({ received: true });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
});

// Helper: Calculate cart total for free shipping threshold
async function calculateCartTotal(database, tenant_id, items) {
  const productIds = items.map(item => item.product_id);
  const products = await database('products')
    .select('id', 'price')
    .where({ tenant_id })
    .whereIn('id', productIds);

  let total = 0;
  for (const item of items) {
    const product = products.find(p => p.id === item.product_id);
    if (product) {
      total += parseFloat(product.price) * item.quantity;
    }
  }

  return total;
}

// Helper: Get carrier tracking info (mock implementation)
async function getCarrierTracking(carrier, trackingNumber, env) {
  // In production, integrate with carrier APIs:
  // - USPS: https://www.usps.com/business/web-tools-apis/track-and-confirm-api.htm
  // - FedEx: https://developer.fedex.com/api/en-us/catalog/track/v1/docs.html
  // - UPS: https://developer.ups.com/api/reference/tracking
  // - DHL: https://developer.dhl.com/api-reference/shipment-tracking
  // - Correios (Brazil): https://www.correios.com.br/atendimento/developers

  // Mock response
  return {
    status: 'in_transit',
    estimated_delivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    tracking_url: `https://${carrier?.toLowerCase()}.com/track?number=${trackingNumber}`,
    events: [
      {
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'picked_up',
        location: 'Origin facility',
        description: 'Package picked up by carrier'
      },
      {
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'in_transit',
        location: 'Distribution center',
        description: 'Package in transit'
      },
      {
        timestamp: new Date().toISOString(),
        status: 'out_for_delivery',
        location: 'Local facility',
        description: 'Out for delivery'
      }
    ]
  };
}
