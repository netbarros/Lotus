import { defineEndpoint } from '@directus/extensions-sdk';

export default defineEndpoint((router, { services, database }) => {
  // GET /petalas/fashion/analytics/dashboard - Get dashboard metrics
  router.get('/dashboard', async (req, res) => {
    try {
      const tenant_id = req.accountability.tenant;
      const { period = '30d' } = req.query; // '7d', '30d', '90d', '1y'

      const { startDate, endDate } = getPeriodDates(period);

      // Revenue metrics
      const revenueData = await database('orders')
        .select(
          database.raw('SUM(CAST(total AS DECIMAL)) as total_revenue'),
          database.raw('COUNT(*) as orders_count'),
          database.raw('AVG(CAST(total AS DECIMAL)) as avg_order_value'),
          database.raw('SUM(items_count) as items_sold')
        )
        .where({ tenant_id, payment_status: 'paid' })
        .whereBetween('created_at', [startDate, endDate])
        .first();

      // Orders by status
      const ordersByStatus = await database('orders')
        .select('payment_status')
        .count('* as count')
        .where({ tenant_id })
        .whereBetween('created_at', [startDate, endDate])
        .groupBy('payment_status');

      // Top products
      const topProducts = await database('order_items')
        .select(
          'products.id',
          'products.name',
          'products.slug',
          'products.featured_image',
          database.raw('SUM(order_items.quantity) as units_sold'),
          database.raw('SUM(CAST(order_items.subtotal AS DECIMAL)) as revenue')
        )
        .leftJoin('products', 'order_items.product_id', 'products.id')
        .leftJoin('orders', 'order_items.order_id', 'orders.id')
        .where({ 'orders.tenant_id': tenant_id, 'orders.payment_status': 'paid' })
        .whereBetween('orders.created_at', [startDate, endDate])
        .groupBy('products.id', 'products.name', 'products.slug', 'products.featured_image')
        .orderBy('revenue', 'desc')
        .limit(10);

      // Customer metrics
      const customerData = await database('customers')
        .select(
          database.raw('COUNT(*) as total_customers'),
          database.raw('AVG(CAST(total_spent AS DECIMAL)) as avg_ltv')
        )
        .where({ tenant_id })
        .first();

      const newCustomers = await database('customers')
        .count('* as count')
        .where({ tenant_id })
        .whereBetween('created_at', [startDate, endDate])
        .first();

      // Conversion funnel
      const productViews = await database('products')
        .sum('views_count as total_views')
        .where({ tenant_id })
        .first();

      const cartAdds = await database('cart_items')
        .count('* as count')
        .where({ tenant_id })
        .whereBetween('created_at', [startDate, endDate])
        .first();

      const checkouts = await database('orders')
        .count('* as count')
        .where({ tenant_id })
        .whereBetween('created_at', [startDate, endDate])
        .first();

      const purchases = await database('orders')
        .count('* as count')
        .where({ tenant_id, payment_status: 'paid' })
        .whereBetween('created_at', [startDate, endDate])
        .first();

      // Cart abandonment rate
      const abandonedCarts = await database('cart_items')
        .countDistinct('user_id as count')
        .where({ tenant_id, status: 'active' })
        .where('updated_at', '<', database.raw("NOW() - INTERVAL '24 hours'"))
        .first();

      const totalCarts = await database('cart_items')
        .countDistinct('user_id as count')
        .where({ tenant_id })
        .whereBetween('created_at', [startDate, endDate])
        .first();

      const abandonmentRate = totalCarts.count > 0
        ? ((abandonedCarts.count / totalCarts.count) * 100).toFixed(2)
        : 0;

      // Conversion rate
      const conversionRate = checkouts.count > 0
        ? ((purchases.count / checkouts.count) * 100).toFixed(2)
        : 0;

      // Inventory alerts
      const lowInventory = await database('products')
        .select('id', 'name', 'slug', 'inventory_quantity', 'low_stock_threshold')
        .where({ tenant_id, status: 'active', track_inventory: true })
        .whereRaw('inventory_quantity <= low_stock_threshold')
        .orderBy('inventory_quantity', 'asc')
        .limit(10);

      // Revenue trend (daily breakdown)
      const revenueTrend = await database('orders')
        .select(
          database.raw('DATE(created_at) as date'),
          database.raw('SUM(CAST(total AS DECIMAL)) as revenue'),
          database.raw('COUNT(*) as orders')
        )
        .where({ tenant_id, payment_status: 'paid' })
        .whereBetween('created_at', [startDate, endDate])
        .groupByRaw('DATE(created_at)')
        .orderBy('date', 'asc');

      res.json({
        data: {
          period: {
            type: period,
            start_date: startDate,
            end_date: endDate
          },
          revenue: {
            total: parseFloat(revenueData.total_revenue || 0).toFixed(2),
            orders_count: parseInt(revenueData.orders_count || 0),
            avg_order_value: parseFloat(revenueData.avg_order_value || 0).toFixed(2),
            items_sold: parseInt(revenueData.items_sold || 0),
            trend: revenueTrend
          },
          orders: {
            by_status: ordersByStatus.map(s => ({
              status: s.payment_status,
              count: parseInt(s.count)
            })),
            total: ordersByStatus.reduce((sum, s) => sum + parseInt(s.count), 0)
          },
          products: {
            top_sellers: topProducts.map(p => ({
              id: p.id,
              name: p.name,
              slug: p.slug,
              image: p.featured_image,
              units_sold: parseInt(p.units_sold),
              revenue: parseFloat(p.revenue).toFixed(2)
            })),
            low_inventory: lowInventory.map(p => ({
              id: p.id,
              name: p.name,
              slug: p.slug,
              quantity: p.inventory_quantity,
              threshold: p.low_stock_threshold,
              urgency: p.inventory_quantity === 0 ? 'critical' : 'warning'
            }))
          },
          customers: {
            total: parseInt(customerData.total_customers || 0),
            new: parseInt(newCustomers.count || 0),
            avg_ltv: parseFloat(customerData.avg_ltv || 0).toFixed(2)
          },
          conversion: {
            funnel: {
              views: parseInt(productViews.total_views || 0),
              cart_adds: parseInt(cartAdds.count || 0),
              checkouts: parseInt(checkouts.count || 0),
              purchases: parseInt(purchases.count || 0)
            },
            rates: {
              cart_abandonment: parseFloat(abandonmentRate),
              checkout_conversion: parseFloat(conversionRate)
            }
          }
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET /petalas/fashion/analytics/products - Product performance analytics
  router.get('/products', async (req, res) => {
    try {
      const tenant_id = req.accountability.tenant;
      const { period = '30d', sort = 'revenue', limit = 50 } = req.query;

      const { startDate, endDate } = getPeriodDates(period);

      const sortOptions = {
        revenue: database.raw('SUM(CAST(order_items.subtotal AS DECIMAL)) DESC'),
        units: database.raw('SUM(order_items.quantity) DESC'),
        views: database.raw('products.views_count DESC'),
        rating: database.raw('products.reviews_average DESC')
      };

      const products = await database('products')
        .select(
          'products.id',
          'products.name',
          'products.slug',
          'products.price',
          'products.featured_image',
          'products.views_count',
          'products.orders_count',
          'products.reviews_count',
          'products.reviews_average',
          'products.inventory_quantity',
          database.raw('COALESCE(SUM(order_items.quantity), 0) as units_sold'),
          database.raw('COALESCE(SUM(CAST(order_items.subtotal AS DECIMAL)), 0) as revenue')
        )
        .leftJoin('order_items', 'products.id', 'order_items.product_id')
        .leftJoin('orders', function() {
          this.on('order_items.order_id', '=', 'orders.id')
            .andOnVal('orders.payment_status', '=', 'paid')
            .andOn('orders.created_at', '>=', database.raw('?', [startDate]))
            .andOn('orders.created_at', '<=', database.raw('?', [endDate]));
        })
        .where({ 'products.tenant_id': tenant_id, 'products.status': 'active' })
        .groupBy(
          'products.id',
          'products.name',
          'products.slug',
          'products.price',
          'products.featured_image',
          'products.views_count',
          'products.orders_count',
          'products.reviews_count',
          'products.reviews_average',
          'products.inventory_quantity'
        )
        .orderByRaw(sortOptions[sort] || sortOptions.revenue)
        .limit(parseInt(limit));

      res.json({
        data: products.map(p => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          price: parseFloat(p.price).toFixed(2),
          image: p.featured_image,
          metrics: {
            views: parseInt(p.views_count || 0),
            units_sold: parseInt(p.units_sold || 0),
            revenue: parseFloat(p.revenue || 0).toFixed(2),
            reviews: {
              count: parseInt(p.reviews_count || 0),
              average: parseFloat(p.reviews_average || 0).toFixed(2)
            },
            inventory: parseInt(p.inventory_quantity || 0)
          }
        })),
        meta: {
          period: { type: period, start_date: startDate, end_date: endDate },
          sort_by: sort,
          count: products.length
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET /petalas/fashion/analytics/customers - Customer analytics
  router.get('/customers', async (req, res) => {
    try {
      const tenant_id = req.accountability.tenant;
      const { segment = 'all' } = req.query; // 'all', 'high_value', 'at_risk', 'new'

      let query = database('customers')
        .select(
          'customers.*',
          database.raw('COALESCE(customers.orders_count, 0) as orders'),
          database.raw('COALESCE(CAST(customers.total_spent AS DECIMAL), 0) as ltv')
        )
        .where({ 'customers.tenant_id': tenant_id });

      switch (segment) {
        case 'high_value':
          query = query.where('total_spent', '>=', 500).orderBy('total_spent', 'desc');
          break;
        case 'at_risk':
          query = query
            .where('last_order_at', '<', database.raw("NOW() - INTERVAL '90 days'"))
            .where('orders_count', '>', 0)
            .orderBy('last_order_at', 'asc');
          break;
        case 'new':
          query = query
            .where('created_at', '>=', database.raw("NOW() - INTERVAL '30 days'"))
            .orderBy('created_at', 'desc');
          break;
        default:
          query = query.orderBy('total_spent', 'desc');
      }

      const customers = await query.limit(100);

      res.json({
        data: customers.map(c => ({
          id: c.id,
          email: c.email,
          name: c.name,
          loyalty_tier: c.loyalty_tier,
          loyalty_points: c.loyalty_points,
          metrics: {
            orders_count: parseInt(c.orders || 0),
            total_spent: parseFloat(c.ltv || 0).toFixed(2),
            avg_order_value: c.orders > 0 ? (c.ltv / c.orders).toFixed(2) : '0.00',
            last_order_at: c.last_order_at
          },
          created_at: c.created_at
        })),
        meta: {
          segment,
          count: customers.length
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET /petalas/fashion/analytics/export - Export analytics data (CSV)
  router.get('/export', async (req, res) => {
    try {
      const tenant_id = req.accountability.tenant;
      const { type = 'orders', period = '30d' } = req.query;

      const { startDate, endDate } = getPeriodDates(period);

      let data;
      let filename;

      switch (type) {
        case 'orders':
          data = await database('orders')
            .select('*')
            .where({ tenant_id })
            .whereBetween('created_at', [startDate, endDate])
            .orderBy('created_at', 'desc');
          filename = `orders_${period}.csv`;
          break;

        case 'products':
          data = await database('products')
            .select('*')
            .where({ tenant_id })
            .orderBy('created_at', 'desc');
          filename = `products_${period}.csv`;
          break;

        case 'customers':
          data = await database('customers')
            .select('*')
            .where({ tenant_id })
            .orderBy('created_at', 'desc');
          filename = `customers_${period}.csv`;
          break;

        default:
          return res.status(400).json({
            error: 'Invalid export type',
            supported: ['orders', 'products', 'customers']
          });
      }

      // Convert to CSV
      const csv = convertToCSV(data);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(csv);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
});

// Helper: Get period date range
function getPeriodDates(period) {
  const endDate = new Date();
  const startDate = new Date();

  switch (period) {
    case '7d':
      startDate.setDate(startDate.getDate() - 7);
      break;
    case '30d':
      startDate.setDate(startDate.getDate() - 30);
      break;
    case '90d':
      startDate.setDate(startDate.getDate() - 90);
      break;
    case '1y':
      startDate.setFullYear(startDate.getFullYear() - 1);
      break;
    default:
      startDate.setDate(startDate.getDate() - 30);
  }

  return { startDate, endDate };
}

// Helper: Convert array of objects to CSV
function convertToCSV(data) {
  if (data.length === 0) return '';

  const headers = Object.keys(data[0]);
  const csvRows = [];

  // Add header row
  csvRows.push(headers.join(','));

  // Add data rows
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header];
      // Escape commas and quotes
      const escaped = ('' + value).replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  }

  return csvRows.join('\n');
}
