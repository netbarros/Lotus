import { defineEndpoint } from '@directus/extensions-sdk';

export default defineEndpoint((router, { services, database, env }) => {
  // POST /petalas/fashion/ar/session - Start AR try-on session
  router.post('/session', async (req, res) => {
    try {
      const { product_id, customer_measurements } = req.body;
      const tenant_id = req.accountability.tenant;
      const user_id = req.accountability.user;

      if (!product_id) {
        return res.status(400).json({ error: 'product_id is required' });
      }

      // Get product with AR info
      const product = await database('products')
        .where({ id: product_id, tenant_id, ar_enabled: true })
        .first();

      if (!product) {
        return res.status(404).json({
          error: 'Product not found or AR not enabled for this product'
        });
      }

      if (!product.ar_model_url) {
        return res.status(400).json({
          error: 'AR 3D model not available for this product'
        });
      }

      // Create AR session
      const [session] = await database('ar_sessions')
        .insert({
          id: database.raw('gen_random_uuid()'),
          tenant_id,
          user_id,
          product_id,
          customer_measurements: customer_measurements ? JSON.stringify(customer_measurements) : null,
          status: 'active',
          started_at: new Date(),
          created_at: new Date(),
          updated_at: new Date()
        })
        .returning('*');

      // Emit AR session started event
      await database('events').insert({
        id: database.raw('gen_random_uuid()'),
        tenant_id,
        aggregate_type: 'ar_session',
        aggregate_id: session.id,
        event_type: 'petala.fashion.ar.session.started',
        event_data: JSON.stringify({
          session_id: session.id,
          product_id,
          user_id
        }),
        timestamp: new Date()
      });

      // Get 8th Wall API key (or other AR provider)
      const arApiKey = env.EIGHTH_WALL_API_KEY || 'demo_key';

      res.json({
        success: true,
        data: {
          session_id: session.id,
          product: {
            id: product.id,
            name: product.name,
            ar_model_url: product.ar_model_url,
            featured_image: product.featured_image
          },
          ar_config: {
            provider: '8th_wall',
            api_key: arApiKey,
            scene_url: `https://ar.softwarelotus.com.br/tryon/${session.id}`,
            capabilities: ['face_tracking', 'body_tracking', 'surface_detection']
          }
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // PUT /petalas/fashion/ar/session/:id - Update AR session
  router.put('/session/:id', async (req, res) => {
    try {
      const { action, data } = req.body; // action: 'capture', 'share', 'end'
      const tenant_id = req.accountability.tenant;

      const session = await database('ar_sessions')
        .where({ id: req.params.id, tenant_id })
        .first();

      if (!session) {
        return res.status(404).json({ error: 'AR session not found' });
      }

      switch (action) {
        case 'capture':
          // Store AR try-on photo
          const captureUrl = data?.image_url;
          if (!captureUrl) {
            return res.status(400).json({ error: 'image_url is required for capture action' });
          }

          await database('ar_sessions')
            .where({ id: req.params.id })
            .update({
              capture_url: captureUrl,
              captured_at: new Date(),
              updated_at: new Date()
            });

          // Emit capture event
          await database('events').insert({
            id: database.raw('gen_random_uuid()'),
            tenant_id,
            aggregate_type: 'ar_session',
            aggregate_id: req.params.id,
            event_type: 'petala.fashion.ar.capture.created',
            event_data: JSON.stringify({
              session_id: req.params.id,
              product_id: session.product_id,
              capture_url: captureUrl
            }),
            timestamp: new Date()
          });

          res.json({
            success: true,
            message: 'AR try-on captured successfully',
            data: { capture_url: captureUrl }
          });
          break;

        case 'share':
          // Share AR try-on to social media
          const platform = data?.platform; // 'instagram', 'facebook', 'twitter'
          if (!platform) {
            return res.status(400).json({ error: 'platform is required for share action' });
          }

          // Emit share event
          await database('events').insert({
            id: database.raw('gen_random_uuid()'),
            tenant_id,
            aggregate_type: 'ar_session',
            aggregate_id: req.params.id,
            event_type: 'petala.fashion.ar.shared',
            event_data: JSON.stringify({
              session_id: req.params.id,
              product_id: session.product_id,
              platform
            }),
            timestamp: new Date()
          });

          res.json({
            success: true,
            message: `AR try-on shared to ${platform}`
          });
          break;

        case 'end':
          // End AR session
          const duration = Math.floor((Date.now() - new Date(session.started_at).getTime()) / 1000);

          await database('ar_sessions')
            .where({ id: req.params.id })
            .update({
              status: 'completed',
              ended_at: new Date(),
              duration_seconds: duration,
              updated_at: new Date()
            });

          // Emit end event
          await database('events').insert({
            id: database.raw('gen_random_uuid()'),
            tenant_id,
            aggregate_type: 'ar_session',
            aggregate_id: req.params.id,
            event_type: 'petala.fashion.ar.session.ended',
            event_data: JSON.stringify({
              session_id: req.params.id,
              product_id: session.product_id,
              duration_seconds: duration,
              captured: !!session.capture_url
            }),
            timestamp: new Date()
          });

          res.json({
            success: true,
            message: 'AR session ended',
            data: { duration_seconds: duration }
          });
          break;

        default:
          return res.status(400).json({
            error: 'Invalid action',
            supported: ['capture', 'share', 'end']
          });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET /petalas/fashion/ar/products - Get AR-enabled products
  router.get('/products', async (req, res) => {
    try {
      const tenant_id = req.accountability.tenant;
      const { category_id, limit = 20 } = req.query;

      let query = database('products')
        .select('id', 'name', 'slug', 'price', 'featured_image', 'ar_model_url')
        .where({ tenant_id, status: 'active', ar_enabled: true })
        .whereNotNull('ar_model_url');

      if (category_id) {
        query = query.where({ category_id });
      }

      const products = await query.limit(limit);

      res.json({
        data: products.map(p => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          price: parseFloat(p.price).toFixed(2),
          image: p.featured_image,
          ar_available: true
        })),
        meta: {
          count: products.length
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET /petalas/fashion/ar/stats - Get AR usage statistics
  router.get('/stats', async (req, res) => {
    try {
      const tenant_id = req.accountability.tenant;
      const { days = 30 } = req.query;

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(days));

      // Total sessions
      const totalSessions = await database('ar_sessions')
        .count('* as count')
        .where({ tenant_id })
        .where('created_at', '>=', startDate)
        .first();

      // Completed sessions
      const completedSessions = await database('ar_sessions')
        .count('* as count')
        .where({ tenant_id, status: 'completed' })
        .where('created_at', '>=', startDate)
        .first();

      // Captured photos
      const capturedPhotos = await database('ar_sessions')
        .count('* as count')
        .where({ tenant_id })
        .whereNotNull('capture_url')
        .where('created_at', '>=', startDate)
        .first();

      // Average session duration
      const avgDuration = await database('ar_sessions')
        .avg('duration_seconds as avg')
        .where({ tenant_id, status: 'completed' })
        .where('created_at', '>=', startDate)
        .first();

      // Top AR products
      const topProducts = await database('ar_sessions')
        .select(
          'products.id',
          'products.name',
          'products.slug',
          database.raw('COUNT(ar_sessions.id) as sessions_count')
        )
        .leftJoin('products', 'ar_sessions.product_id', 'products.id')
        .where({ 'ar_sessions.tenant_id': tenant_id })
        .where('ar_sessions.created_at', '>=', startDate)
        .groupBy('products.id', 'products.name', 'products.slug')
        .orderBy('sessions_count', 'desc')
        .limit(10);

      // Conversion rate (AR sessions → purchases)
      const arUserPurchases = await database('ar_sessions')
        .countDistinct('ar_sessions.user_id as count')
        .leftJoin('orders', function() {
          this.on('ar_sessions.user_id', '=', 'orders.user_id')
            .andOn('ar_sessions.product_id', '=', database.raw('ANY(SELECT product_id FROM order_items WHERE order_id = orders.id)'))
            .andOnVal('orders.payment_status', '=', 'paid');
        })
        .where({ 'ar_sessions.tenant_id': tenant_id })
        .where('ar_sessions.created_at', '>=', startDate)
        .whereNotNull('orders.id')
        .first();

      const uniqueArUsers = await database('ar_sessions')
        .countDistinct('user_id as count')
        .where({ tenant_id })
        .where('created_at', '>=', startDate)
        .first();

      const conversionRate = uniqueArUsers.count > 0
        ? ((arUserPurchases.count / uniqueArUsers.count) * 100).toFixed(2)
        : 0;

      res.json({
        data: {
          period_days: parseInt(days),
          sessions: {
            total: parseInt(totalSessions.count || 0),
            completed: parseInt(completedSessions.count || 0),
            completion_rate: totalSessions.count > 0
              ? ((completedSessions.count / totalSessions.count) * 100).toFixed(2)
              : 0
          },
          captures: {
            count: parseInt(capturedPhotos.count || 0),
            capture_rate: totalSessions.count > 0
              ? ((capturedPhotos.count / totalSessions.count) * 100).toFixed(2)
              : 0
          },
          engagement: {
            avg_duration_seconds: Math.round(avgDuration.avg || 0),
            avg_duration_minutes: ((avgDuration.avg || 0) / 60).toFixed(1)
          },
          conversion: {
            rate: parseFloat(conversionRate),
            purchases: parseInt(arUserPurchases.count || 0),
            unique_users: parseInt(uniqueArUsers.count || 0)
          },
          top_products: topProducts.map(p => ({
            id: p.id,
            name: p.name,
            slug: p.slug,
            sessions: parseInt(p.sessions_count)
          }))
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // POST /petalas/fashion/ar/feedback - Submit AR feedback
  router.post('/feedback', async (req, res) => {
    try {
      const { session_id, rating, comment, issues } = req.body;
      const tenant_id = req.accountability.tenant;

      if (!session_id || !rating) {
        return res.status(400).json({
          error: 'Missing required fields',
          required: ['session_id', 'rating']
        });
      }

      if (rating < 1 || rating > 5) {
        return res.status(400).json({ error: 'Rating must be between 1 and 5' });
      }

      const session = await database('ar_sessions')
        .where({ id: session_id, tenant_id })
        .first();

      if (!session) {
        return res.status(404).json({ error: 'AR session not found' });
      }

      // Store feedback
      await database('ar_sessions')
        .where({ id: session_id })
        .update({
          feedback_rating: rating,
          feedback_comment: comment,
          feedback_issues: issues ? JSON.stringify(issues) : null,
          updated_at: new Date()
        });

      // Emit feedback event
      await database('events').insert({
        id: database.raw('gen_random_uuid()'),
        tenant_id,
        aggregate_type: 'ar_session',
        aggregate_id: session_id,
        event_type: 'petala.fashion.ar.feedback.submitted',
        event_data: JSON.stringify({
          session_id,
          product_id: session.product_id,
          rating,
          has_issues: !!issues
        }),
        timestamp: new Date()
      });

      res.json({
        success: true,
        message: 'Feedback submitted successfully'
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
});
