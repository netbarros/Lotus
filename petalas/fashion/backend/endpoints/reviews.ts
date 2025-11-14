import { defineEndpoint } from '@directus/extensions-sdk';

export default defineEndpoint((router, { services, database }) => {
  // POST /petalas/fashion/reviews - Submit product review
  router.post('/', async (req, res) => {
    try {
      const {
        product_id,
        rating,
        title,
        comment,
        images, // Array of image URLs
        verified_purchase = false,
      } = req.body;

      const tenant_id = req.accountability.tenant;
      const user_id = req.accountability.user;

      if (!product_id || !rating) {
        return res.status(400).json({
          error: 'Missing required fields',
          required: ['product_id', 'rating'],
        });
      }

      if (rating < 1 || rating > 5) {
        return res.status(400).json({
          error: 'Rating must be between 1 and 5',
        });
      }

      // Verify product exists
      const product = await database('products').where({ id: product_id, tenant_id }).first();

      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      // Check if user purchased this product (for verified purchase badge)
      let isVerifiedPurchase = verified_purchase;
      if (user_id) {
        const purchase = await database('order_items')
          .leftJoin('orders', 'order_items.order_id', 'orders.id')
          .where({
            'order_items.product_id': product_id,
            'orders.user_id': user_id,
            'orders.tenant_id': tenant_id,
            'orders.payment_status': 'paid',
          })
          .first();

        isVerifiedPurchase = !!purchase;
      }

      // Check if user already reviewed this product
      if (user_id) {
        const existingReview = await database('reviews')
          .where({ product_id, user_id, tenant_id })
          .first();

        if (existingReview) {
          return res.status(400).json({
            error: 'You have already reviewed this product',
            review_id: existingReview.id,
          });
        }
      }

      // Create review
      const [review] = await database('reviews')
        .insert({
          id: database.raw('gen_random_uuid()'),
          tenant_id,
          product_id,
          user_id,
          rating,
          title: title || null,
          comment: comment || null,
          images: images ? JSON.stringify(images) : null,
          verified_purchase: isVerifiedPurchase,
          status: isVerifiedPurchase ? 'approved' : 'pending', // Auto-approve verified purchases
          helpful_count: 0,
          created_at: new Date(),
          updated_at: new Date(),
        })
        .returning('*');

      // Emit event for review moderation flow
      await database('events').insert({
        id: database.raw('gen_random_uuid()'),
        tenant_id,
        aggregate_type: 'review',
        aggregate_id: review.id,
        event_type: 'petala.fashion.review.created',
        event_data: JSON.stringify({
          review_id: review.id,
          product_id,
          rating,
          verified_purchase: isVerifiedPurchase,
          status: review.status,
        }),
        timestamp: new Date(),
      });

      res.json({
        success: true,
        message: isVerifiedPurchase
          ? 'Review submitted and approved'
          : 'Review submitted for moderation',
        data: {
          review_id: review.id,
          status: review.status,
          verified_purchase: review.verified_purchase,
        },
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET /petalas/fashion/reviews/:product_id - Get product reviews
  router.get('/:product_id', async (req, res) => {
    try {
      const tenant_id = req.accountability.tenant;
      const {
        limit = 20,
        offset = 0,
        sort = 'recent', // 'recent', 'helpful', 'rating_high', 'rating_low'
        rating_filter, // Filter by specific rating (1-5)
      } = req.query;

      let query = database('reviews')
        .select('reviews.*', 'customers.name as customer_name', 'customers.email as customer_email')
        .leftJoin('customers', 'reviews.user_id', 'customers.id')
        .where({
          'reviews.product_id': req.params.product_id,
          'reviews.tenant_id': tenant_id,
          'reviews.status': 'approved',
        });

      // Apply rating filter
      if (rating_filter) {
        query = query.where('reviews.rating', parseInt(rating_filter));
      }

      // Apply sorting
      switch (sort) {
        case 'helpful':
          query = query.orderBy('reviews.helpful_count', 'desc');
          break;
        case 'rating_high':
          query = query.orderBy('reviews.rating', 'desc');
          break;
        case 'rating_low':
          query = query.orderBy('reviews.rating', 'asc');
          break;
        default: // 'recent'
          query = query.orderBy('reviews.created_at', 'desc');
      }

      const reviews = await query.limit(limit).offset(offset);

      // Get total count
      const total = await database('reviews')
        .count('* as count')
        .where({
          product_id: req.params.product_id,
          tenant_id,
          status: 'approved',
        })
        .first();

      // Get rating distribution
      const distribution = await database('reviews')
        .select('rating')
        .count('* as count')
        .where({
          product_id: req.params.product_id,
          tenant_id,
          status: 'approved',
        })
        .groupBy('rating')
        .orderBy('rating', 'desc');

      res.json({
        data: reviews.map((r) => ({
          id: r.id,
          rating: r.rating,
          title: r.title,
          comment: r.comment,
          images: r.images ? JSON.parse(r.images) : null,
          verified_purchase: r.verified_purchase,
          helpful_count: r.helpful_count,
          customer: {
            name: r.customer_name || 'Anonymous',
            email: r.customer_email,
          },
          created_at: r.created_at,
        })),
        meta: {
          total: parseInt(total.count),
          limit: parseInt(limit),
          offset: parseInt(offset),
          distribution: distribution.map((d) => ({
            rating: d.rating,
            count: parseInt(d.count),
          })),
        },
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // POST /petalas/fashion/reviews/:id/helpful - Mark review as helpful
  router.post('/:id/helpful', async (req, res) => {
    try {
      const tenant_id = req.accountability.tenant;

      const review = await database('reviews').where({ id: req.params.id, tenant_id }).first();

      if (!review) {
        return res.status(404).json({ error: 'Review not found' });
      }

      // Increment helpful count
      await database('reviews').where({ id: req.params.id }).increment('helpful_count', 1);

      res.json({
        success: true,
        message: 'Review marked as helpful',
        helpful_count: review.helpful_count + 1,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // PUT /petalas/fashion/reviews/:id - Update review
  router.put('/:id', async (req, res) => {
    try {
      const { rating, title, comment, images } = req.body;
      const tenant_id = req.accountability.tenant;
      const user_id = req.accountability.user;

      const review = await database('reviews')
        .where({ id: req.params.id, tenant_id, user_id })
        .first();

      if (!review) {
        return res.status(404).json({ error: 'Review not found or unauthorized' });
      }

      if (rating && (rating < 1 || rating > 5)) {
        return res.status(400).json({ error: 'Rating must be between 1 and 5' });
      }

      // Update review
      await database('reviews')
        .where({ id: req.params.id })
        .update({
          rating: rating || review.rating,
          title: title !== undefined ? title : review.title,
          comment: comment !== undefined ? comment : review.comment,
          images: images ? JSON.stringify(images) : review.images,
          status: 'pending', // Re-moderate after edit
          updated_at: new Date(),
        });

      res.json({
        success: true,
        message: 'Review updated and submitted for moderation',
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // DELETE /petalas/fashion/reviews/:id - Delete review
  router.delete('/:id', async (req, res) => {
    try {
      const tenant_id = req.accountability.tenant;
      const user_id = req.accountability.user;

      const review = await database('reviews')
        .where({ id: req.params.id, tenant_id, user_id })
        .first();

      if (!review) {
        return res.status(404).json({ error: 'Review not found or unauthorized' });
      }

      // Soft delete
      await database('reviews').where({ id: req.params.id }).update({
        status: 'deleted',
        updated_at: new Date(),
      });

      // Emit event to trigger product stats recalculation
      await database('events').insert({
        id: database.raw('gen_random_uuid()'),
        tenant_id,
        aggregate_type: 'review',
        aggregate_id: req.params.id,
        event_type: 'petala.fashion.review.deleted',
        event_data: JSON.stringify({
          review_id: req.params.id,
          product_id: review.product_id,
        }),
        timestamp: new Date(),
      });

      res.json({
        success: true,
        message: 'Review deleted',
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET /petalas/fashion/reviews/stats/:product_id - Get review statistics
  router.get('/stats/:product_id', async (req, res) => {
    try {
      const tenant_id = req.accountability.tenant;

      const stats = await database('reviews')
        .select(
          database.raw('COUNT(*) as total_reviews'),
          database.raw('AVG(rating) as average_rating'),
          database.raw('SUM(CASE WHEN verified_purchase THEN 1 ELSE 0 END) as verified_count')
        )
        .where({
          product_id: req.params.product_id,
          tenant_id,
          status: 'approved',
        })
        .first();

      const distribution = await database('reviews')
        .select('rating')
        .count('* as count')
        .where({
          product_id: req.params.product_id,
          tenant_id,
          status: 'approved',
        })
        .groupBy('rating')
        .orderBy('rating', 'desc');

      // Calculate percentages
      const total = parseInt(stats.total_reviews || 0);
      const distributionWithPercent = [1, 2, 3, 4, 5]
        .map((rating) => {
          const item = distribution.find((d) => d.rating === rating);
          const count = item ? parseInt(item.count) : 0;
          return {
            rating,
            count,
            percentage: total > 0 ? ((count / total) * 100).toFixed(1) : '0.0',
          };
        })
        .reverse();

      res.json({
        data: {
          total_reviews: total,
          average_rating: parseFloat(stats.average_rating || 0).toFixed(2),
          verified_count: parseInt(stats.verified_count || 0),
          distribution: distributionWithPercent,
        },
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
});
