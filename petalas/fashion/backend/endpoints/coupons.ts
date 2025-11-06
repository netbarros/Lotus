import { defineEndpoint } from '@directus/extensions-sdk';

export default defineEndpoint((router, { services, database }) => {
  // POST /petalas/fashion/coupons/validate - Validate coupon code
  router.post('/validate', async (req, res) => {
    try {
      const { code, cart_total, customer_email } = req.body;
      const tenant_id = req.accountability.tenant;

      if (!code) {
        return res.status(400).json({ error: 'Coupon code is required' });
      }

      // Find coupon
      const coupon = await database('coupons')
        .where({
          code: code.toUpperCase(),
          tenant_id,
          status: 'active'
        })
        .where('valid_from', '<=', new Date())
        .where(function() {
          this.whereNull('valid_until').orWhere('valid_until', '>=', new Date());
        })
        .first();

      if (!coupon) {
        return res.status(404).json({
          valid: false,
          error: 'Invalid or expired coupon code'
        });
      }

      // Check usage limit
      if (coupon.usage_limit && coupon.usage_count >= coupon.usage_limit) {
        return res.status(400).json({
          valid: false,
          error: 'Coupon usage limit reached'
        });
      }

      // Check per-customer usage limit
      if (coupon.usage_limit_per_customer && customer_email) {
        const customerUsage = await database('orders')
          .count('* as count')
          .where({
            tenant_id,
            customer_email,
            coupon_id: coupon.id,
            payment_status: 'paid'
          })
          .first();

        if (parseInt(customerUsage.count) >= coupon.usage_limit_per_customer) {
          return res.status(400).json({
            valid: false,
            error: 'You have already used this coupon the maximum number of times'
          });
        }
      }

      // Check minimum order value
      if (coupon.minimum_order_value && cart_total) {
        if (parseFloat(cart_total) < parseFloat(coupon.minimum_order_value)) {
          return res.status(400).json({
            valid: false,
            error: `Minimum order value of $${coupon.minimum_order_value} required`,
            minimum_required: parseFloat(coupon.minimum_order_value),
            current_total: parseFloat(cart_total),
            difference: (parseFloat(coupon.minimum_order_value) - parseFloat(cart_total)).toFixed(2)
          });
        }
      }

      // Calculate discount
      let discountAmount = 0;
      if (cart_total) {
        if (coupon.discount_type === 'percentage') {
          discountAmount = parseFloat(cart_total) * (parseFloat(coupon.discount_value) / 100);

          // Apply max discount cap
          if (coupon.max_discount_amount && discountAmount > parseFloat(coupon.max_discount_amount)) {
            discountAmount = parseFloat(coupon.max_discount_amount);
          }
        } else if (coupon.discount_type === 'fixed') {
          discountAmount = parseFloat(coupon.discount_value);
        }
      }

      res.json({
        valid: true,
        data: {
          code: coupon.code,
          discount_type: coupon.discount_type,
          discount_value: parseFloat(coupon.discount_value),
          discount_amount: cart_total ? discountAmount.toFixed(2) : null,
          max_discount_amount: coupon.max_discount_amount ? parseFloat(coupon.max_discount_amount) : null,
          free_shipping: coupon.discount_type === 'free_shipping',
          description: coupon.description,
          valid_until: coupon.valid_until,
          remaining_uses: coupon.usage_limit ? coupon.usage_limit - coupon.usage_count : 'unlimited'
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET /petalas/fashion/coupons/active - Get active coupons for customer
  router.get('/active', async (req, res) => {
    try {
      const tenant_id = req.accountability.tenant;
      const { customer_email } = req.query;

      let query = database('coupons')
        .select('*')
        .where({ tenant_id, status: 'active' })
        .where('valid_from', '<=', new Date())
        .where(function() {
          this.whereNull('valid_until').orWhere('valid_until', '>=', new Date());
        });

      // Only show coupons that haven't reached usage limit
      query = query.where(function() {
        this.whereNull('usage_limit').orWhereRaw('usage_count < usage_limit');
      });

      const coupons = await query.orderBy('created_at', 'desc');

      // Filter by per-customer usage if email provided
      let filteredCoupons = coupons;
      if (customer_email) {
        const customerOrders = await database('orders')
          .select('coupon_id')
          .count('* as usage_count')
          .where({ tenant_id, customer_email, payment_status: 'paid' })
          .whereNotNull('coupon_id')
          .groupBy('coupon_id');

        const usageMap = new Map(customerOrders.map(o => [o.coupon_id, parseInt(o.usage_count)]));

        filteredCoupons = coupons.filter(coupon => {
          if (!coupon.usage_limit_per_customer) return true;
          const usage = usageMap.get(coupon.id) || 0;
          return usage < coupon.usage_limit_per_customer;
        });
      }

      res.json({
        data: filteredCoupons.map(c => ({
          code: c.code,
          discount_type: c.discount_type,
          discount_value: parseFloat(c.discount_value),
          description: c.description,
          minimum_order_value: c.minimum_order_value ? parseFloat(c.minimum_order_value) : null,
          valid_until: c.valid_until,
          usage_limit: c.usage_limit,
          usage_count: c.usage_count,
          remaining: c.usage_limit ? c.usage_limit - c.usage_count : null
        })),
        meta: {
          count: filteredCoupons.length
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // POST /petalas/fashion/coupons/apply - Apply coupon to cart
  router.post('/apply', async (req, res) => {
    try {
      const { code, cart_id, cart_total } = req.body;
      const tenant_id = req.accountability.tenant;
      const user_id = req.accountability.user;

      if (!code || !cart_total) {
        return res.status(400).json({
          error: 'Missing required fields',
          required: ['code', 'cart_total']
        });
      }

      // Validate coupon
      const validation = await validateCoupon(database, tenant_id, code, cart_total, user_id);

      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          error: validation.error
        });
      }

      // Store applied coupon in session/cart metadata
      // (In production, you might store this in a cart_metadata table)

      res.json({
        success: true,
        data: {
          code: validation.coupon.code,
          discount_amount: validation.discount_amount,
          new_total: (parseFloat(cart_total) - validation.discount_amount).toFixed(2)
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET /petalas/fashion/coupons/stats - Get coupon usage statistics
  router.get('/stats', async (req, res) => {
    try {
      const tenant_id = req.accountability.tenant;
      const { days = 30 } = req.query;

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(days));

      const stats = await database('coupons')
        .select(
          'coupons.code',
          'coupons.discount_type',
          'coupons.discount_value',
          database.raw('COUNT(orders.id) as usage_count'),
          database.raw('SUM(CAST(orders.discount AS DECIMAL)) as total_discount')
        )
        .leftJoin('orders', function() {
          this.on('coupons.id', '=', 'orders.coupon_id')
            .andOnVal('orders.payment_status', '=', 'paid');
        })
        .where({ 'coupons.tenant_id': tenant_id })
        .where('orders.created_at', '>=', startDate)
        .groupBy('coupons.id', 'coupons.code', 'coupons.discount_type', 'coupons.discount_value')
        .orderBy('usage_count', 'desc');

      res.json({
        data: stats.map(s => ({
          code: s.code,
          discount_type: s.discount_type,
          discount_value: parseFloat(s.discount_value),
          usage_count: parseInt(s.usage_count || 0),
          total_discount: parseFloat(s.total_discount || 0).toFixed(2)
        })),
        meta: {
          period_days: parseInt(days)
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
});

// Helper: Validate coupon
async function validateCoupon(database, tenant_id, code, cart_total, customer_id) {
  const coupon = await database('coupons')
    .where({
      code: code.toUpperCase(),
      tenant_id,
      status: 'active'
    })
    .where('valid_from', '<=', new Date())
    .where(function() {
      this.whereNull('valid_until').orWhere('valid_until', '>=', new Date());
    })
    .first();

  if (!coupon) {
    return { valid: false, error: 'Invalid or expired coupon' };
  }

  // Check usage limits
  if (coupon.usage_limit && coupon.usage_count >= coupon.usage_limit) {
    return { valid: false, error: 'Coupon usage limit reached' };
  }

  if (coupon.usage_limit_per_customer && customer_id) {
    const customerUsage = await database('orders')
      .count('* as count')
      .where({
        tenant_id,
        user_id: customer_id,
        coupon_id: coupon.id,
        payment_status: 'paid'
      })
      .first();

    if (parseInt(customerUsage.count) >= coupon.usage_limit_per_customer) {
      return { valid: false, error: 'Coupon usage limit per customer reached' };
    }
  }

  // Check minimum order value
  if (coupon.minimum_order_value && parseFloat(cart_total) < parseFloat(coupon.minimum_order_value)) {
    return {
      valid: false,
      error: `Minimum order value of $${coupon.minimum_order_value} required`
    };
  }

  // Calculate discount
  let discountAmount = 0;
  if (coupon.discount_type === 'percentage') {
    discountAmount = parseFloat(cart_total) * (parseFloat(coupon.discount_value) / 100);
    if (coupon.max_discount_amount) {
      discountAmount = Math.min(discountAmount, parseFloat(coupon.max_discount_amount));
    }
  } else if (coupon.discount_type === 'fixed') {
    discountAmount = parseFloat(coupon.discount_value);
  }

  return {
    valid: true,
    coupon,
    discount_amount: discountAmount
  };
}
