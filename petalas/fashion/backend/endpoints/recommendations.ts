import { defineEndpoint } from '@directus/extensions-sdk';

export default defineEndpoint((router, { services, database, env }) => {
  // GET /petalas/fashion/recommendations - Get personalized product recommendations
  router.get('/', async (req, res) => {
    try {
      const {
        user_id,
        product_id, // For "similar products"
        type = 'personalized', // 'personalized', 'similar', 'trending', 'complementary'
        limit = 10,
      } = req.query;

      const tenant_id = req.accountability.tenant;

      let recommendations;

      switch (type) {
        case 'personalized':
          recommendations = await getPersonalizedRecommendations(
            database,
            tenant_id,
            user_id || req.accountability.user,
            limit
          );
          break;

        case 'similar':
          if (!product_id) {
            return res
              .status(400)
              .json({ error: 'product_id required for similar recommendations' });
          }
          recommendations = await getSimilarProducts(database, tenant_id, product_id, limit);
          break;

        case 'trending':
          recommendations = await getTrendingProducts(database, tenant_id, limit);
          break;

        case 'complementary':
          if (!product_id) {
            return res
              .status(400)
              .json({ error: 'product_id required for complementary recommendations' });
          }
          recommendations = await getComplementaryProducts(database, tenant_id, product_id, limit);
          break;

        default:
          return res.status(400).json({
            error: 'Invalid recommendation type',
            supported: ['personalized', 'similar', 'trending', 'complementary'],
          });
      }

      res.json({
        data: recommendations,
        meta: {
          type,
          count: recommendations.length,
          algorithm: getAlgorithmInfo(type),
        },
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // POST /petalas/fashion/recommendations/feedback - Record user interaction for ML training
  router.post('/feedback', async (req, res) => {
    try {
      const {
        product_id,
        action, // 'view', 'click', 'add_to_cart', 'purchase', 'skip'
        context, // Optional context (recommendation_type, position, etc.)
      } = req.body;

      const tenant_id = req.accountability.tenant;
      const user_id = req.accountability.user;

      if (!product_id || !action) {
        return res.status(400).json({
          error: 'Missing required fields',
          required: ['product_id', 'action'],
        });
      }

      // Store interaction for ML model training
      await database('recommendation_feedback').insert({
        id: database.raw('gen_random_uuid()'),
        tenant_id,
        user_id,
        product_id,
        action,
        context: context ? JSON.stringify(context) : null,
        created_at: new Date(),
      });

      // Emit event for real-time recommendation engine updates
      await database('events').insert({
        id: database.raw('gen_random_uuid()'),
        tenant_id,
        aggregate_type: 'recommendation',
        aggregate_id: product_id,
        event_type: 'petala.fashion.recommendation.interaction',
        event_data: JSON.stringify({
          user_id,
          product_id,
          action,
          context,
        }),
        timestamp: new Date(),
      });

      res.json({ success: true, message: 'Feedback recorded' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET /petalas/fashion/recommendations/stats - Get recommendation performance stats
  router.get('/stats', async (req, res) => {
    try {
      const tenant_id = req.accountability.tenant;
      const { days = 30 } = req.query;

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(days));

      // Get interaction stats
      const stats = await database('recommendation_feedback')
        .select('action')
        .count('* as count')
        .where({ tenant_id })
        .where('created_at', '>=', startDate)
        .groupBy('action');

      // Calculate CTR (Click-Through Rate)
      const views = stats.find((s) => s.action === 'view')?.count || 0;
      const clicks = stats.find((s) => s.action === 'click')?.count || 0;
      const addToCarts = stats.find((s) => s.action === 'add_to_cart')?.count || 0;
      const purchases = stats.find((s) => s.action === 'purchase')?.count || 0;

      const ctr = views > 0 ? ((clicks / views) * 100).toFixed(2) : 0;
      const conversionRate = clicks > 0 ? ((purchases / clicks) * 100).toFixed(2) : 0;

      res.json({
        data: {
          period_days: parseInt(days),
          interactions: {
            views: parseInt(views),
            clicks: parseInt(clicks),
            add_to_carts: parseInt(addToCarts),
            purchases: parseInt(purchases),
          },
          metrics: {
            ctr: parseFloat(ctr),
            conversion_rate: parseFloat(conversionRate),
            add_to_cart_rate: clicks > 0 ? ((addToCarts / clicks) * 100).toFixed(2) : 0,
          },
        },
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
});

// Helper: Personalized recommendations based on user history
async function getPersonalizedRecommendations(database, tenant_id, user_id, limit) {
  if (!user_id) {
    // For anonymous users, return trending products
    return getTrendingProducts(database, tenant_id, limit);
  }

  // Get user's purchase and view history
  const userHistory = await database('orders')
    .select('order_items.product_id')
    .leftJoin('order_items', 'orders.id', 'order_items.order_id')
    .where({ 'orders.tenant_id': tenant_id, 'orders.user_id': user_id })
    .whereNotNull('order_items.product_id')
    .pluck('product_id');

  // Get categories/brands user prefers
  const preferredCategories = await database('products')
    .select('category_id')
    .whereIn('id', userHistory)
    .whereNotNull('category_id')
    .groupBy('category_id')
    .orderByRaw('COUNT(*) DESC')
    .limit(3)
    .pluck('category_id');

  // Find similar products user hasn't purchased
  const recommendations = await database('products')
    .select(
      'products.*',
      database.raw('COALESCE(products.reviews_average, 0) as rating'),
      database.raw('COALESCE(products.orders_count, 0) as popularity')
    )
    .where({ 'products.tenant_id': tenant_id, 'products.status': 'active' })
    .whereNotIn(
      'products.id',
      userHistory.length > 0 ? userHistory : ['00000000-0000-0000-0000-000000000000']
    )
    .where(function () {
      if (preferredCategories.length > 0) {
        this.whereIn('category_id', preferredCategories);
      }
    })
    .orderByRaw('(reviews_average * 0.3 + orders_count * 0.7) DESC')
    .limit(limit);

  return recommendations;
}

// Helper: Similar products (collaborative filtering)
async function getSimilarProducts(database, tenant_id, product_id, limit) {
  // Get the product
  const product = await database('products').where({ id: product_id, tenant_id }).first();

  if (!product) {
    return [];
  }

  // Find products with same category, similar price range, same tags
  const priceRange = parseFloat(product.price) * 0.3; // ±30% price range

  const similar = await database('products')
    .select('products.*')
    .where({ tenant_id, status: 'active' })
    .where('id', '!=', product_id)
    .where(function () {
      this.where('category_id', product.category_id)
        .orWhere('brand_id', product.brand_id)
        .orWhere('gender', product.gender)
        .orWhere('season', product.season);
    })
    .whereBetween('price', [
      parseFloat(product.price) - priceRange,
      parseFloat(product.price) + priceRange,
    ])
    .orderByRaw('RANDOM()') // Add some randomness
    .limit(limit);

  return similar;
}

// Helper: Trending products (most popular recently)
async function getTrendingProducts(database, tenant_id, limit) {
  const trending = await database('products')
    .select(
      'products.*',
      database.raw('COALESCE(products.views_count, 0) as views'),
      database.raw('COALESCE(products.orders_count, 0) as orders')
    )
    .where({ tenant_id, status: 'active' })
    .orderByRaw('(views_count * 0.3 + orders_count * 0.7) DESC')
    .limit(limit);

  return trending;
}

// Helper: Complementary products (frequently bought together)
async function getComplementaryProducts(database, tenant_id, product_id, limit) {
  // Find products frequently bought together with this product
  const complementary = await database('order_items as oi1')
    .select('products.*', database.raw('COUNT(DISTINCT oi1.order_id) as frequency'))
    .leftJoin('order_items as oi2', function () {
      this.on('oi1.order_id', '=', 'oi2.order_id').andOn('oi1.product_id', '!=', 'oi2.product_id');
    })
    .leftJoin('products', 'oi2.product_id', 'products.id')
    .where({ 'oi1.product_id': product_id, 'oi1.tenant_id': tenant_id })
    .where({ 'products.status': 'active' })
    .whereNotNull('products.id')
    .groupBy('products.id')
    .orderBy('frequency', 'desc')
    .limit(limit);

  return complementary;
}

// Helper: Get algorithm description
function getAlgorithmInfo(type) {
  const algorithms = {
    personalized: 'Collaborative filtering based on user purchase history and preferences',
    similar: 'Content-based filtering using product attributes (category, price, tags)',
    trending: 'Popularity-based ranking using views and orders',
    complementary: 'Association rule mining (frequently bought together)',
  };
  return algorithms[type] || 'Unknown';
}
