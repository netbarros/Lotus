import { defineEndpoint } from '@directus/extensions-sdk';

export default defineEndpoint((router, { services, database }) => {
  // GET /petalas/fashion/customers/profile - Get customer profile
  router.get('/profile', async (req, res) => {
    try {
      const tenant_id = req.accountability.tenant;
      const user_id = req.accountability.user;

      if (!user_id) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const customer = await database('customers')
        .where({ id: user_id, tenant_id })
        .first();

      if (!customer) {
        return res.status(404).json({ error: 'Customer profile not found' });
      }

      res.json({
        data: {
          id: customer.id,
          email: customer.email,
          name: customer.name,
          phone: customer.phone,
          addresses: customer.addresses ? JSON.parse(customer.addresses) : [],
          loyalty_tier: customer.loyalty_tier,
          loyalty_points: customer.loyalty_points,
          stats: {
            orders_count: customer.orders_count,
            total_spent: parseFloat(customer.total_spent || 0).toFixed(2),
            avg_order_value: customer.orders_count > 0
              ? (parseFloat(customer.total_spent) / customer.orders_count).toFixed(2)
              : '0.00'
          },
          preferences: customer.preferences ? JSON.parse(customer.preferences) : {},
          created_at: customer.created_at,
          last_order_at: customer.last_order_at
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // PUT /petalas/fashion/customers/profile - Update customer profile
  router.put('/profile', async (req, res) => {
    try {
      const {
        name,
        phone,
        addresses,
        preferences
      } = req.body;

      const tenant_id = req.accountability.tenant;
      const user_id = req.accountability.user;

      if (!user_id) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const customer = await database('customers')
        .where({ id: user_id, tenant_id })
        .first();

      if (!customer) {
        return res.status(404).json({ error: 'Customer profile not found' });
      }

      // Update customer
      await database('customers')
        .where({ id: user_id })
        .update({
          name: name !== undefined ? name : customer.name,
          phone: phone !== undefined ? phone : customer.phone,
          addresses: addresses ? JSON.stringify(addresses) : customer.addresses,
          preferences: preferences ? JSON.stringify(preferences) : customer.preferences,
          updated_at: new Date()
        });

      res.json({
        success: true,
        message: 'Profile updated successfully'
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET /petalas/fashion/customers/orders - Get customer order history
  router.get('/orders', async (req, res) => {
    try {
      const { limit = 20, offset = 0, status } = req.query;
      const tenant_id = req.accountability.tenant;
      const user_id = req.accountability.user;

      if (!user_id) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      let query = database('orders')
        .select('*')
        .where({ user_id, tenant_id });

      if (status) {
        query = query.where({ payment_status: status });
      }

      const orders = await query
        .orderBy('created_at', 'desc')
        .limit(limit)
        .offset(offset);

      const total = await database('orders')
        .count('* as count')
        .where({ user_id, tenant_id })
        .first();

      res.json({
        data: orders.map(o => ({
          id: o.id,
          order_number: o.order_number,
          status: {
            payment: o.payment_status,
            fulfillment: o.fulfillment_status
          },
          totals: {
            subtotal: parseFloat(o.subtotal).toFixed(2),
            discount: parseFloat(o.discount || 0).toFixed(2),
            tax: parseFloat(o.tax || 0).toFixed(2),
            shipping: parseFloat(o.shipping || 0).toFixed(2),
            total: parseFloat(o.total).toFixed(2),
            currency: o.currency
          },
          items_count: o.items_count,
          tracking_number: o.tracking_number,
          created_at: o.created_at,
          paid_at: o.paid_at,
          shipped_at: o.shipped_at,
          delivered_at: o.delivered_at
        })),
        meta: {
          total: parseInt(total.count),
          limit: parseInt(limit),
          offset: parseInt(offset)
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // POST /petalas/fashion/customers/addresses - Add new address
  router.post('/addresses', async (req, res) => {
    try {
      const { address } = req.body;
      const tenant_id = req.accountability.tenant;
      const user_id = req.accountability.user;

      if (!user_id) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      if (!address || !address.street || !address.city || !address.country) {
        return res.status(400).json({
          error: 'Missing required address fields',
          required: ['street', 'city', 'country']
        });
      }

      const customer = await database('customers')
        .where({ id: user_id, tenant_id })
        .first();

      if (!customer) {
        return res.status(404).json({ error: 'Customer profile not found' });
      }

      // Parse existing addresses
      const addresses = customer.addresses ? JSON.parse(customer.addresses) : [];

      // Add new address with unique ID
      const newAddress = {
        id: `addr_${Date.now()}`,
        ...address,
        is_default: addresses.length === 0, // First address is default
        created_at: new Date().toISOString()
      };

      addresses.push(newAddress);

      // Update customer
      await database('customers')
        .where({ id: user_id })
        .update({
          addresses: JSON.stringify(addresses),
          updated_at: new Date()
        });

      res.json({
        success: true,
        message: 'Address added successfully',
        data: newAddress
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // PUT /petalas/fashion/customers/addresses/:address_id - Update address
  router.put('/addresses/:address_id', async (req, res) => {
    try {
      const { address } = req.body;
      const tenant_id = req.accountability.tenant;
      const user_id = req.accountability.user;

      if (!user_id) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const customer = await database('customers')
        .where({ id: user_id, tenant_id })
        .first();

      if (!customer) {
        return res.status(404).json({ error: 'Customer profile not found' });
      }

      const addresses = customer.addresses ? JSON.parse(customer.addresses) : [];
      const addressIndex = addresses.findIndex(a => a.id === req.params.address_id);

      if (addressIndex === -1) {
        return res.status(404).json({ error: 'Address not found' });
      }

      // Update address
      addresses[addressIndex] = {
        ...addresses[addressIndex],
        ...address,
        updated_at: new Date().toISOString()
      };

      await database('customers')
        .where({ id: user_id })
        .update({
          addresses: JSON.stringify(addresses),
          updated_at: new Date()
        });

      res.json({
        success: true,
        message: 'Address updated successfully',
        data: addresses[addressIndex]
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // DELETE /petalas/fashion/customers/addresses/:address_id - Delete address
  router.delete('/addresses/:address_id', async (req, res) => {
    try {
      const tenant_id = req.accountability.tenant;
      const user_id = req.accountability.user;

      if (!user_id) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const customer = await database('customers')
        .where({ id: user_id, tenant_id })
        .first();

      if (!customer) {
        return res.status(404).json({ error: 'Customer profile not found' });
      }

      const addresses = customer.addresses ? JSON.parse(customer.addresses) : [];
      const updatedAddresses = addresses.filter(a => a.id !== req.params.address_id);

      if (addresses.length === updatedAddresses.length) {
        return res.status(404).json({ error: 'Address not found' });
      }

      await database('customers')
        .where({ id: user_id })
        .update({
          addresses: JSON.stringify(updatedAddresses),
          updated_at: new Date()
        });

      res.json({
        success: true,
        message: 'Address deleted successfully'
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET /petalas/fashion/customers/loyalty - Get loyalty program details
  router.get('/loyalty', async (req, res) => {
    try {
      const tenant_id = req.accountability.tenant;
      const user_id = req.accountability.user;

      if (!user_id) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const customer = await database('customers')
        .where({ id: user_id, tenant_id })
        .first();

      if (!customer) {
        return res.status(404).json({ error: 'Customer profile not found' });
      }

      // Get loyalty tier thresholds
      const tiers = {
        bronze: { min_spent: 0, max_spent: 500, discount: 0 },
        silver: { min_spent: 500, max_spent: 1500, discount: 5 },
        gold: { min_spent: 1500, max_spent: 5000, discount: 10 },
        platinum: { min_spent: 5000, max_spent: Infinity, discount: 15 }
      };

      const currentTier = tiers[customer.loyalty_tier] || tiers.bronze;
      const nextTierName = getNextTier(customer.loyalty_tier);
      const nextTier = nextTierName ? tiers[nextTierName] : null;

      res.json({
        data: {
          current_tier: {
            name: customer.loyalty_tier,
            discount_percentage: currentTier.discount,
            points: customer.loyalty_points
          },
          next_tier: nextTier ? {
            name: nextTierName,
            discount_percentage: nextTier.discount,
            required_spending: nextTier.min_spent,
            remaining: (nextTier.min_spent - parseFloat(customer.total_spent)).toFixed(2)
          } : null,
          points_value: (customer.loyalty_points * 0.01).toFixed(2), // $0.01 per point
          total_spent: parseFloat(customer.total_spent || 0).toFixed(2)
        }
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
