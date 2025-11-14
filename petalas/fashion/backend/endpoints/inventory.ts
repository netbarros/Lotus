import { defineEndpoint } from '@directus/extensions-sdk';

export default defineEndpoint((router, { services, database }) => {
  // GET /petalas/fashion/inventory - Get inventory status
  router.get('/', async (req, res) => {
    try {
      const tenant_id = req.accountability.tenant;
      const {
        status = 'all', // 'all', 'low', 'out_of_stock'
        limit = 50,
        offset = 0,
      } = req.query;

      let query = database('products')
        .select(
          'id',
          'name',
          'slug',
          'sku',
          'inventory_quantity',
          'low_stock_threshold',
          'track_inventory',
          'price',
          'featured_image'
        )
        .where({ tenant_id, status: 'active', track_inventory: true });

      switch (status) {
        case 'low':
          query = query.whereRaw(
            'inventory_quantity > 0 AND inventory_quantity <= low_stock_threshold'
          );
          break;
        case 'out_of_stock':
          query = query.where('inventory_quantity', 0);
          break;
        // 'all' - no additional filter
      }

      const products = await query.orderBy('inventory_quantity', 'asc').limit(limit).offset(offset);

      const total = await database('products')
        .count('* as count')
        .where({ tenant_id, status: 'active', track_inventory: true })
        .first();

      res.json({
        data: products.map((p) => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          sku: p.sku,
          image: p.featured_image,
          inventory: {
            quantity: p.inventory_quantity,
            threshold: p.low_stock_threshold,
            status: getInventoryStatus(p.inventory_quantity, p.low_stock_threshold),
          },
          price: parseFloat(p.price).toFixed(2),
        })),
        meta: {
          total: parseInt(total.count),
          limit: parseInt(limit),
          offset: parseInt(offset),
        },
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // PUT /petalas/fashion/inventory/:product_id - Update inventory quantity
  router.put('/:product_id', async (req, res) => {
    try {
      const { quantity, operation = 'set' } = req.body; // operation: 'set', 'increment', 'decrement'
      const tenant_id = req.accountability.tenant;

      if (quantity === undefined) {
        return res.status(400).json({ error: 'Quantity is required' });
      }

      if (quantity < 0) {
        return res.status(400).json({ error: 'Quantity cannot be negative' });
      }

      const product = await database('products')
        .where({ id: req.params.product_id, tenant_id })
        .first();

      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      if (!product.track_inventory) {
        return res.status(400).json({
          error: 'Inventory tracking not enabled for this product',
        });
      }

      let newQuantity;
      switch (operation) {
        case 'set':
          newQuantity = parseInt(quantity);
          break;
        case 'increment':
          newQuantity = product.inventory_quantity + parseInt(quantity);
          break;
        case 'decrement':
          newQuantity = Math.max(0, product.inventory_quantity - parseInt(quantity));
          break;
        default:
          return res.status(400).json({
            error: 'Invalid operation',
            supported: ['set', 'increment', 'decrement'],
          });
      }

      // Update inventory
      await database('products').where({ id: req.params.product_id }).update({
        inventory_quantity: newQuantity,
        updated_at: new Date(),
      });

      // Emit inventory update event
      await database('events').insert({
        id: database.raw('gen_random_uuid()'),
        tenant_id,
        aggregate_type: 'product',
        aggregate_id: req.params.product_id,
        event_type: 'petala.fashion.inventory.updated',
        event_data: JSON.stringify({
          product_id: req.params.product_id,
          sku: product.sku,
          operation,
          quantity: parseInt(quantity),
          old_quantity: product.inventory_quantity,
          new_quantity: newQuantity,
          status: getInventoryStatus(newQuantity, product.low_stock_threshold),
        }),
        timestamp: new Date(),
      });

      // Check if low stock alert needed
      if (newQuantity <= product.low_stock_threshold && newQuantity > 0) {
        await database('events').insert({
          id: database.raw('gen_random_uuid()'),
          tenant_id,
          aggregate_type: 'product',
          aggregate_id: req.params.product_id,
          event_type: 'petala.fashion.inventory.low_stock',
          event_data: JSON.stringify({
            product_id: req.params.product_id,
            sku: product.sku,
            name: product.name,
            quantity: newQuantity,
            threshold: product.low_stock_threshold,
          }),
          timestamp: new Date(),
        });
      }

      res.json({
        success: true,
        message: 'Inventory updated successfully',
        data: {
          product_id: req.params.product_id,
          old_quantity: product.inventory_quantity,
          new_quantity: newQuantity,
          status: getInventoryStatus(newQuantity, product.low_stock_threshold),
        },
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // POST /petalas/fashion/inventory/bulk-update - Bulk update inventory
  router.post('/bulk-update', async (req, res) => {
    try {
      const { updates } = req.body; // Array of { product_id, quantity, operation }
      const tenant_id = req.accountability.tenant;

      if (!updates || !Array.isArray(updates) || updates.length === 0) {
        return res.status(400).json({
          error: 'Updates array is required',
          example: [{ product_id: 'uuid', quantity: 10, operation: 'set' }],
        });
      }

      const results = [];

      for (const update of updates) {
        try {
          const { product_id, quantity, operation = 'set' } = update;

          const product = await database('products').where({ id: product_id, tenant_id }).first();

          if (!product || !product.track_inventory) {
            results.push({
              product_id,
              success: false,
              error: 'Product not found or inventory tracking disabled',
            });
            continue;
          }

          let newQuantity;
          switch (operation) {
            case 'set':
              newQuantity = parseInt(quantity);
              break;
            case 'increment':
              newQuantity = product.inventory_quantity + parseInt(quantity);
              break;
            case 'decrement':
              newQuantity = Math.max(0, product.inventory_quantity - parseInt(quantity));
              break;
            default:
              results.push({ product_id, success: false, error: 'Invalid operation' });
              continue;
          }

          await database('products').where({ id: product_id }).update({
            inventory_quantity: newQuantity,
            updated_at: new Date(),
          });

          // Emit event
          await database('events').insert({
            id: database.raw('gen_random_uuid()'),
            tenant_id,
            aggregate_type: 'product',
            aggregate_id: product_id,
            event_type: 'petala.fashion.inventory.updated',
            event_data: JSON.stringify({
              product_id,
              operation,
              old_quantity: product.inventory_quantity,
              new_quantity: newQuantity,
            }),
            timestamp: new Date(),
          });

          results.push({
            product_id,
            success: true,
            old_quantity: product.inventory_quantity,
            new_quantity: newQuantity,
          });
        } catch (err) {
          results.push({
            product_id: update.product_id,
            success: false,
            error: err.message,
          });
        }
      }

      const successCount = results.filter((r) => r.success).length;

      res.json({
        success: successCount > 0,
        message: `Updated ${successCount} of ${updates.length} products`,
        data: results,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET /petalas/fashion/inventory/alerts - Get low stock alerts
  router.get('/alerts', async (req, res) => {
    try {
      const tenant_id = req.accountability.tenant;

      const lowStock = await database('products')
        .select('id', 'name', 'slug', 'sku', 'inventory_quantity', 'low_stock_threshold', 'price')
        .where({ tenant_id, status: 'active', track_inventory: true })
        .whereRaw('inventory_quantity <= low_stock_threshold')
        .where('inventory_quantity', '>', 0)
        .orderBy('inventory_quantity', 'asc');

      const outOfStock = await database('products')
        .select('id', 'name', 'slug', 'sku', 'price')
        .where({ tenant_id, status: 'active', track_inventory: true, inventory_quantity: 0 });

      res.json({
        data: {
          low_stock: lowStock.map((p) => ({
            id: p.id,
            name: p.name,
            slug: p.slug,
            sku: p.sku,
            quantity: p.inventory_quantity,
            threshold: p.low_stock_threshold,
            urgency: p.inventory_quantity <= p.low_stock_threshold / 2 ? 'high' : 'medium',
          })),
          out_of_stock: outOfStock.map((p) => ({
            id: p.id,
            name: p.name,
            slug: p.slug,
            sku: p.sku,
          })),
          summary: {
            low_stock_count: lowStock.length,
            out_of_stock_count: outOfStock.length,
            total_alerts: lowStock.length + outOfStock.length,
          },
        },
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET /petalas/fashion/inventory/history/:product_id - Get inventory history
  router.get('/history/:product_id', async (req, res) => {
    try {
      const tenant_id = req.accountability.tenant;
      const { limit = 50 } = req.query;

      // Get inventory events from event store
      const history = await database('events')
        .select('*')
        .where({
          tenant_id,
          aggregate_type: 'product',
          aggregate_id: req.params.product_id,
        })
        .where('event_type', 'like', '%inventory%')
        .orderBy('timestamp', 'desc')
        .limit(limit);

      res.json({
        data: history.map((event) => ({
          id: event.id,
          event_type: event.event_type,
          data: JSON.parse(event.event_data),
          timestamp: event.timestamp,
        })),
        meta: {
          product_id: req.params.product_id,
          count: history.length,
        },
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // POST /petalas/fashion/inventory/reserve - Reserve inventory for pending order
  router.post('/reserve', async (req, res) => {
    try {
      const { items, order_id } = req.body; // items: [{ product_id, quantity }]
      const tenant_id = req.accountability.tenant;

      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'Items array is required' });
      }

      const reservations = [];

      for (const item of items) {
        const product = await database('products')
          .where({ id: item.product_id, tenant_id })
          .first();

        if (!product || !product.track_inventory) {
          reservations.push({
            product_id: item.product_id,
            success: false,
            error: 'Product not found or inventory not tracked',
          });
          continue;
        }

        if (product.inventory_quantity < item.quantity) {
          reservations.push({
            product_id: item.product_id,
            success: false,
            error: 'Insufficient inventory',
            available: product.inventory_quantity,
            requested: item.quantity,
          });
          continue;
        }

        // Create reservation (in production, use a dedicated reservations table)
        await database('events').insert({
          id: database.raw('gen_random_uuid()'),
          tenant_id,
          aggregate_type: 'product',
          aggregate_id: item.product_id,
          event_type: 'petala.fashion.inventory.reserved',
          event_data: JSON.stringify({
            product_id: item.product_id,
            quantity: item.quantity,
            order_id,
            expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes
          }),
          timestamp: new Date(),
        });

        reservations.push({
          product_id: item.product_id,
          success: true,
          quantity: item.quantity,
        });
      }

      const successCount = reservations.filter((r) => r.success).length;

      res.json({
        success: successCount === items.length,
        message:
          successCount === items.length
            ? 'All items reserved successfully'
            : `Reserved ${successCount} of ${items.length} items`,
        data: reservations,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
});

// Helper: Get inventory status
function getInventoryStatus(quantity, threshold) {
  if (quantity === 0) return 'out_of_stock';
  if (quantity <= threshold) return 'low_stock';
  return 'in_stock';
}
