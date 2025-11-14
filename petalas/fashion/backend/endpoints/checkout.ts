import { defineEndpoint } from '@directus/extensions-sdk';

export default defineEndpoint((router, { services, database }) => {
  // POST /petalas/fashion/checkout - Create order from cart
  router.post('/', async (req, res) => {
    try {
      const {
        billing_address,
        shipping_address,
        payment_method,
        coupon_code,
        customer_email,
        customer_name,
        customer_phone,
      } = req.body;

      const tenant_id = req.accountability.tenant;
      const user_id = req.accountability.user || null;

      // Validate required fields
      if (!billing_address || !shipping_address || !payment_method) {
        return res.status(400).json({
          error: 'Missing required fields',
          required: ['billing_address', 'shipping_address', 'payment_method'],
        });
      }

      if (!user_id && !customer_email) {
        return res.status(400).json({
          error: 'customer_email is required for guest checkout',
        });
      }

      // Get cart items
      const cartItems = await database('cart_items')
        .select(
          'cart_items.*',
          'products.name as product_name',
          'products.track_inventory',
          'products.inventory_quantity',
          'products.weight'
        )
        .leftJoin('products', 'cart_items.product_id', 'products.id')
        .where({
          'cart_items.user_id': user_id || customer_email,
          'cart_items.tenant_id': tenant_id,
          'cart_items.status': 'active',
        });

      if (cartItems.length === 0) {
        return res.status(400).json({ error: 'Cart is empty' });
      }

      // Verify inventory for all items
      const inventoryErrors = [];
      for (const item of cartItems) {
        if (item.track_inventory && item.inventory_quantity < item.quantity) {
          inventoryErrors.push({
            product_name: item.product_name,
            requested: item.quantity,
            available: item.inventory_quantity,
          });
        }
      }

      if (inventoryErrors.length > 0) {
        return res.status(400).json({
          error: 'Insufficient inventory',
          items: inventoryErrors,
        });
      }

      // Calculate subtotal
      const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

      // Apply coupon if provided
      let discount = 0;
      let couponId = null;
      if (coupon_code) {
        const coupon = await database('coupons')
          .where({
            code: coupon_code.toUpperCase(),
            tenant_id,
            status: 'active',
          })
          .where('valid_from', '<=', new Date())
          .where(function () {
            this.whereNull('valid_until').orWhere('valid_until', '>=', new Date());
          })
          .first();

        if (coupon) {
          // Check usage limit
          if (coupon.usage_limit && coupon.usage_count >= coupon.usage_limit) {
            return res.status(400).json({ error: 'Coupon usage limit reached' });
          }

          // Check minimum order value
          if (coupon.minimum_order_value && subtotal < coupon.minimum_order_value) {
            return res.status(400).json({
              error: 'Minimum order value not met',
              minimum: coupon.minimum_order_value,
              current: subtotal,
            });
          }

          couponId = coupon.id;

          if (coupon.discount_type === 'percentage') {
            discount = subtotal * (coupon.discount_value / 100);
            if (coupon.max_discount_amount) {
              discount = Math.min(discount, coupon.max_discount_amount);
            }
          } else if (coupon.discount_type === 'fixed') {
            discount = coupon.discount_value;
          }
        } else {
          return res.status(400).json({ error: 'Invalid or expired coupon code' });
        }
      }

      // Calculate shipping (simplified - use shipping calculator endpoint for real rates)
      const totalWeight = cartItems.reduce(
        (sum, item) => sum + (item.weight || 0) * item.quantity,
        0
      );
      const shipping = totalWeight > 0 ? Math.max(5, totalWeight * 0.5) : 0;

      // Calculate tax (simplified - 10% for now)
      const taxableAmount = subtotal - discount;
      const tax = taxableAmount * 0.1;

      // Calculate total
      const total = subtotal - discount + shipping + tax;

      // Generate order number
      const year = new Date().getFullYear();
      const orderCount = await database('orders').where({ tenant_id }).count('* as count').first();
      const nextNumber = (parseInt(orderCount.count) || 0) + 1;
      const orderNumber = `ORD-${year}-${String(nextNumber).padStart(6, '0')}`;

      // Create order
      const [order] = await database('orders')
        .insert({
          id: database.raw('gen_random_uuid()'),
          tenant_id,
          user_id,
          order_number: orderNumber,
          customer_email: customer_email || null,
          customer_name: customer_name || null,
          customer_phone: customer_phone || null,
          billing_address: JSON.stringify(billing_address),
          shipping_address: JSON.stringify(shipping_address),
          payment_method,
          payment_status: 'pending',
          fulfillment_status: 'unfulfilled',
          subtotal: subtotal.toFixed(2),
          discount: discount.toFixed(2),
          tax: tax.toFixed(2),
          shipping: shipping.toFixed(2),
          total: total.toFixed(2),
          currency: 'USD',
          coupon_id: couponId,
          items_count: cartItems.reduce((sum, item) => sum + item.quantity, 0),
          notes: null,
          status: 'pending',
          created_at: new Date(),
          updated_at: new Date(),
        })
        .returning('*');

      // Create order items
      for (const cartItem of cartItems) {
        await database('order_items').insert({
          id: database.raw('gen_random_uuid()'),
          tenant_id,
          order_id: order.id,
          product_id: cartItem.product_id,
          variant_id: cartItem.variant_id,
          quantity: cartItem.quantity,
          price: cartItem.price,
          subtotal: (cartItem.price * cartItem.quantity).toFixed(2),
          product_name: cartItem.product_name,
          created_at: new Date(),
          updated_at: new Date(),
        });
      }

      // Update coupon usage if applied
      if (couponId) {
        await database('coupons').where({ id: couponId }).increment('usage_count', 1);
      }

      // Clear cart
      await database('cart_items')
        .where({
          user_id: user_id || customer_email,
          tenant_id,
          status: 'active',
        })
        .update({
          status: 'checked_out',
          updated_at: new Date(),
        });

      // Return order details (payment will be processed separately)
      res.json({
        success: true,
        message: 'Order created successfully',
        data: {
          order_id: order.id,
          order_number: order.order_number,
          total: order.total,
          currency: order.currency,
          payment_status: order.payment_status,
          payment_method: order.payment_method,
          items_count: order.items_count,
        },
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // POST /petalas/fashion/checkout/validate - Validate checkout data without creating order
  router.post('/validate', async (req, res) => {
    try {
      const { coupon_code } = req.body;
      const tenant_id = req.accountability.tenant;
      const user_id = req.accountability.user || req.body.customer_email;

      // Get cart items
      const cartItems = await database('cart_items')
        .select('cart_items.*', 'products.inventory_quantity', 'products.track_inventory')
        .leftJoin('products', 'cart_items.product_id', 'products.id')
        .where({
          'cart_items.user_id': user_id,
          'cart_items.tenant_id': tenant_id,
          'cart_items.status': 'active',
        });

      if (cartItems.length === 0) {
        return res.status(400).json({ error: 'Cart is empty' });
      }

      // Check inventory
      const inventoryErrors = [];
      for (const item of cartItems) {
        if (item.track_inventory && item.inventory_quantity < item.quantity) {
          inventoryErrors.push({
            product_id: item.product_id,
            requested: item.quantity,
            available: item.inventory_quantity,
          });
        }
      }

      const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

      // Validate coupon if provided
      let couponValid = null;
      if (coupon_code) {
        const coupon = await database('coupons')
          .where({
            code: coupon_code.toUpperCase(),
            tenant_id,
            status: 'active',
          })
          .where('valid_from', '<=', new Date())
          .where(function () {
            this.whereNull('valid_until').orWhere('valid_until', '>=', new Date());
          })
          .first();

        if (coupon) {
          if (coupon.usage_limit && coupon.usage_count >= coupon.usage_limit) {
            couponValid = { valid: false, error: 'Coupon usage limit reached' };
          } else if (coupon.minimum_order_value && subtotal < coupon.minimum_order_value) {
            couponValid = {
              valid: false,
              error: 'Minimum order value not met',
              minimum: coupon.minimum_order_value,
            };
          } else {
            let discount = 0;
            if (coupon.discount_type === 'percentage') {
              discount = subtotal * (coupon.discount_value / 100);
              if (coupon.max_discount_amount) {
                discount = Math.min(discount, coupon.max_discount_amount);
              }
            } else {
              discount = coupon.discount_value;
            }
            couponValid = {
              valid: true,
              discount: discount.toFixed(2),
              type: coupon.discount_type,
              value: coupon.discount_value,
            };
          }
        } else {
          couponValid = { valid: false, error: 'Invalid or expired coupon' };
        }
      }

      res.json({
        valid: inventoryErrors.length === 0,
        inventory_errors: inventoryErrors.length > 0 ? inventoryErrors : null,
        coupon: couponValid,
        subtotal: subtotal.toFixed(2),
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
});
