import { defineEndpoint } from '@directus/extensions-sdk';

export default defineEndpoint((router, { services, database }) => {
  // GET /petalas/fashion/loyalty/status - Get customer loyalty status
  router.get('/status', async (req, res) => {
    try {
      const tenant_id = req.accountability.tenant;
      const user_id = req.accountability.user;

      if (!user_id) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const customer = await database('customers').where({ id: user_id, tenant_id }).first();

      if (!customer) {
        return res.status(404).json({ error: 'Customer not found' });
      }

      // Tier configuration
      const tiers = {
        bronze: {
          min: 0,
          max: 500,
          discount: 0,
          pointsMultiplier: 1,
          benefits: ['Early access to new collections'],
        },
        silver: {
          min: 500,
          max: 1500,
          discount: 5,
          pointsMultiplier: 1.25,
          benefits: ['5% discount', 'Free shipping on orders $50+', 'Birthday gift'],
        },
        gold: {
          min: 1500,
          max: 5000,
          discount: 10,
          pointsMultiplier: 1.5,
          benefits: ['10% discount', 'Free shipping', 'Priority support', 'Exclusive sales access'],
        },
        platinum: {
          min: 5000,
          max: Infinity,
          discount: 15,
          pointsMultiplier: 2,
          benefits: [
            '15% discount',
            'Free shipping + returns',
            'VIP support',
            'Personal stylist',
            'Exclusive events',
          ],
        },
      };

      const currentTier = tiers[customer.loyalty_tier] || tiers.bronze;
      const nextTierName = getNextTier(customer.loyalty_tier);
      const nextTier = nextTierName ? tiers[nextTierName] : null;

      const totalSpent = parseFloat(customer.total_spent || 0);
      const progress = nextTier
        ? ((totalSpent - currentTier.min) / (nextTier.min - currentTier.min)) * 100
        : 100;

      res.json({
        data: {
          current_tier: {
            name: customer.loyalty_tier,
            discount_percentage: currentTier.discount,
            points_multiplier: currentTier.pointsMultiplier,
            benefits: currentTier.benefits,
          },
          points: {
            balance: customer.loyalty_points,
            value_usd: (customer.loyalty_points * 0.01).toFixed(2), // $0.01 per point
            expires_at: null, // Could implement point expiration
          },
          next_tier: nextTier
            ? {
                name: nextTierName,
                discount_percentage: nextTier.discount,
                required_spending: nextTier.min,
                remaining: (nextTier.min - totalSpent).toFixed(2),
                progress_percentage: Math.min(100, progress).toFixed(1),
              }
            : null,
          lifetime: {
            total_spent: totalSpent.toFixed(2),
            total_orders: customer.orders_count,
            points_earned: customer.loyalty_points,
            tier_since: customer.updated_at,
          },
        },
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // POST /petalas/fashion/loyalty/redeem - Redeem loyalty points
  router.post('/redeem', async (req, res) => {
    try {
      const { points, type = 'discount' } = req.body; // type: 'discount', 'product', 'gift_card'
      const tenant_id = req.accountability.tenant;
      const user_id = req.accountability.user;

      if (!user_id) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      if (!points || points < 100) {
        return res.status(400).json({
          error: 'Minimum 100 points required for redemption',
        });
      }

      const customer = await database('customers').where({ id: user_id, tenant_id }).first();

      if (!customer) {
        return res.status(404).json({ error: 'Customer not found' });
      }

      if (customer.loyalty_points < points) {
        return res.status(400).json({
          error: 'Insufficient points',
          available: customer.loyalty_points,
          requested: points,
        });
      }

      let redemptionValue;
      let couponCode;

      switch (type) {
        case 'discount':
          // Generate coupon: 100 points = $1 discount
          redemptionValue = (points * 0.01).toFixed(2);
          couponCode = `LOYALTY${Date.now()}`;

          // Create coupon
          await database('coupons').insert({
            id: database.raw('gen_random_uuid()'),
            tenant_id,
            code: couponCode,
            discount_type: 'fixed',
            discount_value: redemptionValue,
            description: `Loyalty points redemption: ${points} points`,
            valid_from: new Date(),
            valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            usage_limit: 1,
            usage_count: 0,
            status: 'active',
            created_at: new Date(),
            updated_at: new Date(),
          });
          break;

        default:
          return res.status(400).json({
            error: 'Invalid redemption type',
            supported: ['discount', 'product', 'gift_card'],
          });
      }

      // Deduct points
      await database('customers').where({ id: user_id }).decrement('loyalty_points', points);

      // Record redemption
      await database('loyalty_redemptions').insert({
        id: database.raw('gen_random_uuid()'),
        tenant_id,
        customer_id: user_id,
        points: points,
        type: type,
        value: redemptionValue,
        coupon_code: couponCode,
        created_at: new Date(),
      });

      // Emit redemption event
      await database('events').insert({
        id: database.raw('gen_random_uuid()'),
        tenant_id,
        aggregate_type: 'customer',
        aggregate_id: user_id,
        event_type: 'petala.fashion.loyalty.redeemed',
        event_data: JSON.stringify({
          customer_id: user_id,
          points,
          type,
          value: redemptionValue,
          coupon_code: couponCode,
        }),
        timestamp: new Date(),
      });

      res.json({
        success: true,
        message: 'Points redeemed successfully',
        data: {
          points_redeemed: points,
          new_balance: customer.loyalty_points - points,
          type,
          value: redemptionValue,
          coupon_code: couponCode,
        },
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET /petalas/fashion/loyalty/history - Get loyalty points history
  router.get('/history', async (req, res) => {
    try {
      const tenant_id = req.accountability.tenant;
      const user_id = req.accountability.user;
      const { limit = 50 } = req.query;

      if (!user_id) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Get earning events
      const earnings = await database('events')
        .select('*')
        .where({
          tenant_id,
          aggregate_type: 'customer',
          aggregate_id: user_id,
          event_type: 'petala.fashion.loyalty.earned',
        })
        .orderBy('timestamp', 'desc')
        .limit(limit);

      // Get redemption events
      const redemptions = await database('loyalty_redemptions')
        .select('*')
        .where({ tenant_id, customer_id: user_id })
        .orderBy('created_at', 'desc')
        .limit(limit);

      // Combine and sort
      const history = [
        ...earnings.map((e) => {
          const data = JSON.parse(e.event_data);
          return {
            id: e.id,
            type: 'earned',
            points: data.points_earned,
            description: data.source || 'Purchase',
            order_id: data.order_id,
            timestamp: e.timestamp,
          };
        }),
        ...redemptions.map((r) => ({
          id: r.id,
          type: 'redeemed',
          points: -r.points,
          description: `Redeemed for ${r.type}`,
          value: r.value,
          coupon_code: r.coupon_code,
          timestamp: r.created_at,
        })),
      ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      res.json({
        data: history.slice(0, limit),
        meta: {
          count: history.length,
        },
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET /petalas/fashion/loyalty/rewards - Get available rewards catalog
  router.get('/rewards', async (req, res) => {
    try {
      const tenant_id = req.accountability.tenant;

      // Define rewards catalog
      const rewards = [
        {
          id: 'discount_100',
          type: 'discount',
          name: '$1 Discount',
          points_required: 100,
          value: 1,
          description: 'Redeem 100 points for $1 off your next purchase',
        },
        {
          id: 'discount_500',
          type: 'discount',
          name: '$5 Discount',
          points_required: 500,
          value: 5,
          description: 'Redeem 500 points for $5 off your next purchase',
        },
        {
          id: 'discount_1000',
          type: 'discount',
          name: '$10 Discount',
          points_required: 1000,
          value: 10,
          description: 'Redeem 1000 points for $10 off your next purchase',
        },
        {
          id: 'free_shipping',
          type: 'benefit',
          name: 'Free Shipping',
          points_required: 200,
          value: null,
          description: 'Redeem 200 points for free shipping on your next order',
        },
        {
          id: 'early_access',
          type: 'benefit',
          name: 'Early Sale Access',
          points_required: 300,
          value: null,
          description: 'Get 24-hour early access to our next sale',
        },
      ];

      // Get customer points to show what they can afford
      const user_id = req.accountability.user;
      let customerPoints = 0;
      if (user_id) {
        const customer = await database('customers').where({ id: user_id, tenant_id }).first();
        customerPoints = customer?.loyalty_points || 0;
      }

      res.json({
        data: rewards.map((reward) => ({
          ...reward,
          affordable: customerPoints >= reward.points_required,
          points_needed: Math.max(0, reward.points_required - customerPoints),
        })),
        meta: {
          customer_points: customerPoints,
        },
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET /petalas/fashion/loyalty/leaderboard - Get loyalty leaderboard
  router.get('/leaderboard', async (req, res) => {
    try {
      const tenant_id = req.accountability.tenant;
      const { period = 'all_time', limit = 10 } = req.query; // 'all_time', 'month', 'year'

      let query = database('customers')
        .select(
          'id',
          'name',
          'email',
          'loyalty_tier',
          'loyalty_points',
          'total_spent',
          'orders_count'
        )
        .where({ tenant_id });

      // Apply period filter if needed
      if (period === 'month') {
        const monthStart = new Date();
        monthStart.setDate(1);
        monthStart.setHours(0, 0, 0, 0);
        query = query.where('created_at', '>=', monthStart);
      } else if (period === 'year') {
        const yearStart = new Date();
        yearStart.setMonth(0, 1);
        yearStart.setHours(0, 0, 0, 0);
        query = query.where('created_at', '>=', yearStart);
      }

      const leaderboard = await query.orderBy('loyalty_points', 'desc').limit(limit);

      res.json({
        data: leaderboard.map((customer, index) => ({
          rank: index + 1,
          name: customer.name || 'Anonymous',
          email: customer.email,
          tier: customer.loyalty_tier,
          points: customer.loyalty_points,
          total_spent: parseFloat(customer.total_spent || 0).toFixed(2),
          orders_count: customer.orders_count,
        })),
        meta: {
          period,
          count: leaderboard.length,
        },
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // POST /petalas/fashion/loyalty/bonus - Award bonus points (admin)
  router.post('/bonus', async (req, res) => {
    try {
      const { customer_id, points, reason } = req.body;
      const tenant_id = req.accountability.tenant;

      if (!customer_id || !points || !reason) {
        return res.status(400).json({
          error: 'Missing required fields',
          required: ['customer_id', 'points', 'reason'],
        });
      }

      const customer = await database('customers').where({ id: customer_id, tenant_id }).first();

      if (!customer) {
        return res.status(404).json({ error: 'Customer not found' });
      }

      // Award points
      await database('customers').where({ id: customer_id }).increment('loyalty_points', points);

      // Emit bonus event
      await database('events').insert({
        id: database.raw('gen_random_uuid()'),
        tenant_id,
        aggregate_type: 'customer',
        aggregate_id: customer_id,
        event_type: 'petala.fashion.loyalty.bonus',
        event_data: JSON.stringify({
          customer_id,
          points,
          reason,
          awarded_by: req.accountability.user,
        }),
        timestamp: new Date(),
      });

      res.json({
        success: true,
        message: 'Bonus points awarded',
        data: {
          customer_id,
          points_awarded: points,
          new_balance: customer.loyalty_points + points,
        },
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
});

// Helper: Get next loyalty tier
function getNextTier(currentTier) {
  const tierOrder = ['bronze', 'silver', 'gold', 'platinum'];
  const currentIndex = tierOrder.indexOf(currentTier);
  return currentIndex < tierOrder.length - 1 ? tierOrder[currentIndex + 1] : null;
}
