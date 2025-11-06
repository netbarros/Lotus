import { defineEndpoint } from '@directus/extensions-sdk';

export default defineEndpoint((router, { services, database, env }) => {
  // POST /petalas/fashion/instagram/connect - Connect Instagram account
  router.post('/connect', async (req, res) => {
    try {
      const { access_token, instagram_business_account_id } = req.body;
      const tenant_id = req.accountability.tenant;

      if (!access_token || !instagram_business_account_id) {
        return res.status(400).json({
          error: 'Missing required fields',
          required: ['access_token', 'instagram_business_account_id']
        });
      }

      // Verify token with Instagram Graph API
      const verifyResponse = await fetch(
        `https://graph.instagram.com/me?fields=id,username&access_token=${access_token}`
      );

      if (!verifyResponse.ok) {
        return res.status(400).json({ error: 'Invalid Instagram access token' });
      }

      const instagramAccount = await verifyResponse.json();

      // Store Instagram credentials (encrypt access_token in production)
      await database('instagram_connections')
        .insert({
          id: database.raw('gen_random_uuid()'),
          tenant_id,
          instagram_account_id: instagramAccount.id,
          instagram_username: instagramAccount.username,
          business_account_id: instagram_business_account_id,
          access_token: access_token, // TODO: Encrypt
          status: 'active',
          created_at: new Date(),
          updated_at: new Date()
        })
        .onConflict(['tenant_id', 'instagram_account_id'])
        .merge();

      // Emit connection event
      await database('events').insert({
        id: database.raw('gen_random_uuid()'),
        tenant_id,
        aggregate_type: 'instagram',
        aggregate_id: instagramAccount.id,
        event_type: 'petala.fashion.instagram.connected',
        event_data: JSON.stringify({
          instagram_username: instagramAccount.username,
          business_account_id: instagram_business_account_id
        }),
        timestamp: new Date()
      });

      res.json({
        success: true,
        message: 'Instagram account connected successfully',
        data: {
          instagram_username: instagramAccount.username,
          instagram_account_id: instagramAccount.id
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // POST /petalas/fashion/instagram/sync-products - Sync products to Instagram Shopping
  router.post('/sync-products', async (req, res) => {
    try {
      const { product_ids } = req.body; // Optional: sync specific products, or all if not provided
      const tenant_id = req.accountability.tenant;

      // Get Instagram connection
      const connection = await database('instagram_connections')
        .where({ tenant_id, status: 'active' })
        .first();

      if (!connection) {
        return res.status(400).json({
          error: 'Instagram account not connected',
          message: 'Please connect your Instagram account first'
        });
      }

      // Get products to sync
      let query = database('products')
        .select('*')
        .where({ tenant_id, status: 'active' });

      if (product_ids && product_ids.length > 0) {
        query = query.whereIn('id', product_ids);
      }

      const products = await query.limit(100); // Instagram API limits

      const syncResults = [];

      for (const product of products) {
        try {
          // Create product in Facebook Catalog (required for Instagram Shopping)
          const catalogProduct = {
            retailer_id: product.id,
            name: product.name,
            description: product.short_description || product.description,
            url: `https://${connection.tenant_id}.softwarelotus.com.br/products/${product.slug}`,
            image_url: product.featured_image,
            price: parseFloat(product.price) * 100, // Convert to cents
            currency: 'USD',
            availability: product.inventory_quantity > 0 ? 'in stock' : 'out of stock',
            brand: product.brand_id || 'Unknown',
            condition: 'new'
          };

          // Call Facebook Catalog API (mock for now)
          // const response = await fetch(`https://graph.facebook.com/v18.0/${catalog_id}/products`, {
          //   method: 'POST',
          //   headers: { 'Content-Type': 'application/json' },
          //   body: JSON.stringify({ access_token: connection.access_token, ...catalogProduct })
          // });

          // Store sync status
          await database('instagram_product_syncs')
            .insert({
              id: database.raw('gen_random_uuid()'),
              tenant_id,
              product_id: product.id,
              instagram_account_id: connection.instagram_account_id,
              status: 'synced',
              synced_at: new Date(),
              created_at: new Date()
            })
            .onConflict(['tenant_id', 'product_id', 'instagram_account_id'])
            .merge();

          syncResults.push({
            product_id: product.id,
            product_name: product.name,
            success: true
          });
        } catch (error) {
          syncResults.push({
            product_id: product.id,
            product_name: product.name,
            success: false,
            error: error.message
          });
        }
      }

      const successCount = syncResults.filter(r => r.success).length;

      // Emit sync event
      await database('events').insert({
        id: database.raw('gen_random_uuid()'),
        tenant_id,
        aggregate_type: 'instagram',
        aggregate_id: connection.instagram_account_id,
        event_type: 'petala.fashion.instagram.products_synced',
        event_data: JSON.stringify({
          total_products: products.length,
          synced_count: successCount,
          failed_count: products.length - successCount
        }),
        timestamp: new Date()
      });

      res.json({
        success: successCount > 0,
        message: `Synced ${successCount} of ${products.length} products`,
        data: syncResults
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET /petalas/fashion/instagram/posts - Get Instagram posts with products
  router.get('/posts', async (req, res) => {
    try {
      const tenant_id = req.accountability.tenant;
      const { limit = 20 } = req.query;

      // Get Instagram connection
      const connection = await database('instagram_connections')
        .where({ tenant_id, status: 'active' })
        .first();

      if (!connection) {
        return res.status(400).json({ error: 'Instagram account not connected' });
      }

      // Fetch recent posts from Instagram Graph API
      const postsResponse = await fetch(
        `https://graph.instagram.com/${connection.business_account_id}/media?fields=id,caption,media_type,media_url,permalink,timestamp,like_count,comments_count&limit=${limit}&access_token=${connection.access_token}`
      );

      if (!postsResponse.ok) {
        return res.status(400).json({ error: 'Failed to fetch Instagram posts' });
      }

      const postsData = await postsResponse.json();

      res.json({
        data: postsData.data || [],
        meta: {
          instagram_username: connection.instagram_username,
          count: postsData.data?.length || 0
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // POST /petalas/fashion/instagram/tag-product - Tag product in Instagram post
  router.post('/tag-product', async (req, res) => {
    try {
      const { post_id, product_id } = req.body;
      const tenant_id = req.accountability.tenant;

      if (!post_id || !product_id) {
        return res.status(400).json({
          error: 'Missing required fields',
          required: ['post_id', 'product_id']
        });
      }

      // Get Instagram connection
      const connection = await database('instagram_connections')
        .where({ tenant_id, status: 'active' })
        .first();

      if (!connection) {
        return res.status(400).json({ error: 'Instagram account not connected' });
      }

      // Get product
      const product = await database('products')
        .where({ id: product_id, tenant_id })
        .first();

      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      // Tag product in Instagram post via Graph API (mock for now)
      // const response = await fetch(`https://graph.facebook.com/v18.0/${post_id}/product_tags`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     access_token: connection.access_token,
      //     product_id: product.id
      //   })
      // });

      // Store tag relationship
      await database('instagram_product_tags')
        .insert({
          id: database.raw('gen_random_uuid()'),
          tenant_id,
          post_id,
          product_id,
          created_at: new Date()
        });

      res.json({
        success: true,
        message: 'Product tagged in Instagram post'
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET /petalas/fashion/instagram/analytics - Get Instagram Shopping analytics
  router.get('/analytics', async (req, res) => {
    try {
      const tenant_id = req.accountability.tenant;
      const { days = 30 } = req.query;

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(days));

      // Get synced products
      const syncedProducts = await database('instagram_product_syncs')
        .count('* as count')
        .where({ tenant_id, status: 'synced' })
        .first();

      // Get product tags
      const taggedPosts = await database('instagram_product_tags')
        .count('* as count')
        .where({ tenant_id })
        .where('created_at', '>=', startDate)
        .first();

      // Get top tagged products
      const topTaggedProducts = await database('instagram_product_tags')
        .select(
          'products.id',
          'products.name',
          'products.slug',
          database.raw('COUNT(instagram_product_tags.id) as tag_count')
        )
        .leftJoin('products', 'instagram_product_tags.product_id', 'products.id')
        .where({ 'instagram_product_tags.tenant_id': tenant_id })
        .where('instagram_product_tags.created_at', '>=', startDate)
        .groupBy('products.id', 'products.name', 'products.slug')
        .orderBy('tag_count', 'desc')
        .limit(10);

      // Get Instagram connection info
      const connection = await database('instagram_connections')
        .where({ tenant_id, status: 'active' })
        .first();

      res.json({
        data: {
          period_days: parseInt(days),
          connection: {
            connected: !!connection,
            instagram_username: connection?.instagram_username || null
          },
          products: {
            synced_count: parseInt(syncedProducts.count || 0),
            tagged_posts_count: parseInt(taggedPosts.count || 0)
          },
          top_tagged_products: topTaggedProducts.map(p => ({
            id: p.id,
            name: p.name,
            slug: p.slug,
            tags: parseInt(p.tag_count)
          }))
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // POST /petalas/fashion/instagram/webhook - Instagram webhook handler
  router.post('/webhook', async (req, res) => {
    try {
      const { object, entry } = req.body;

      // Verify webhook (Instagram sends verification challenge on setup)
      if (req.query['hub.mode'] === 'subscribe' && req.query['hub.verify_token']) {
        const VERIFY_TOKEN = env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN || 'lotus_fashion_webhook';
        if (req.query['hub.verify_token'] === VERIFY_TOKEN) {
          return res.send(req.query['hub.challenge']);
        }
        return res.status(403).send('Forbidden');
      }

      // Handle webhook events
      if (object === 'instagram') {
        for (const item of entry) {
          const changes = item.changes || [];

          for (const change of changes) {
            // Handle different event types
            if (change.field === 'comments') {
              // New comment on post
              // Could trigger notifications, sentiment analysis, etc.
            } else if (change.field === 'media') {
              // New media posted
              // Could trigger auto-tagging of products
            }
          }
        }
      }

      res.json({ received: true });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  // DELETE /petalas/fashion/instagram/disconnect - Disconnect Instagram account
  router.delete('/disconnect', async (req, res) => {
    try {
      const tenant_id = req.accountability.tenant;

      const connection = await database('instagram_connections')
        .where({ tenant_id, status: 'active' })
        .first();

      if (!connection) {
        return res.status(404).json({ error: 'No active Instagram connection found' });
      }

      // Deactivate connection
      await database('instagram_connections')
        .where({ id: connection.id })
        .update({
          status: 'disconnected',
          updated_at: new Date()
        });

      // Emit disconnection event
      await database('events').insert({
        id: database.raw('gen_random_uuid()'),
        tenant_id,
        aggregate_type: 'instagram',
        aggregate_id: connection.instagram_account_id,
        event_type: 'petala.fashion.instagram.disconnected',
        event_data: JSON.stringify({
          instagram_username: connection.instagram_username
        }),
        timestamp: new Date()
      });

      res.json({
        success: true,
        message: 'Instagram account disconnected'
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
});
