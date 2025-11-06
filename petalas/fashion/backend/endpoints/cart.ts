import { defineEndpoint } from '@directus/extensions-sdk';

export default defineEndpoint((router, { services, database }) => {
  // POST /petalas/fashion/cart/add - Add item to cart
  router.post('/add', async (req, res) => {
    try {
      const { product_id, variant_id, quantity = 1 } = req.body;
      const tenant_id = req.accountability.tenant;
      const user_id = req.accountability.user || req.session?.id;

      if (!product_id) {
        return res.status(400).json({ error: 'product_id is required' });
      }

      // Verify product exists and is active
      const product = await database('products')
        .where({ id: product_id, tenant_id, status: 'active' })
        .first();

      if (!product) {
        return res.status(404).json({ error: 'Product not found or inactive' });
      }

      // Check inventory
      if (product.track_inventory && product.inventory_quantity < quantity) {
        return res.status(400).json({
          error: 'Insufficient inventory',
          available: product.inventory_quantity
        });
      }

      // Check if item already in cart
      const existingItem = await database('cart_items')
        .where({
          user_id,
          tenant_id,
          product_id,
          variant_id: variant_id || null,
          status: 'active'
        })
        .first();

      if (existingItem) {
        // Update quantity
        const newQuantity = existingItem.quantity + quantity;

        if (product.track_inventory && product.inventory_quantity < newQuantity) {
          return res.status(400).json({
            error: 'Insufficient inventory for requested quantity',
            available: product.inventory_quantity,
            current_in_cart: existingItem.quantity
          });
        }

        await database('cart_items')
          .where({ id: existingItem.id })
          .update({
            quantity: newQuantity,
            updated_at: new Date()
          });

        res.json({
          success: true,
          message: 'Cart updated',
          item_id: existingItem.id,
          quantity: newQuantity
        });
      } else {
        // Create new cart item
        const [cartItem] = await database('cart_items')
          .insert({
            id: database.raw('gen_random_uuid()'),
            user_id,
            tenant_id,
            product_id,
            variant_id: variant_id || null,
            quantity,
            price: product.price,
            status: 'active',
            created_at: new Date(),
            updated_at: new Date()
          })
          .returning('*');

        res.json({
          success: true,
          message: 'Item added to cart',
          item_id: cartItem.id,
          quantity
        });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET /petalas/fashion/cart - Get cart contents
  router.get('/', async (req, res) => {
    try {
      const tenant_id = req.accountability.tenant;
      const user_id = req.accountability.user || req.session?.id;

      const cartItems = await database('cart_items')
        .select(
          'cart_items.*',
          'products.name as product_name',
          'products.slug as product_slug',
          'products.featured_image',
          'products.track_inventory',
          'products.inventory_quantity'
        )
        .leftJoin('products', 'cart_items.product_id', 'products.id')
        .where({
          'cart_items.user_id': user_id,
          'cart_items.tenant_id': tenant_id,
          'cart_items.status': 'active'
        })
        .orderBy('cart_items.created_at', 'desc');

      // Calculate totals
      const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const itemsCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

      // Check for low inventory warnings
      const warnings = cartItems
        .filter(item => item.track_inventory && item.inventory_quantity < item.quantity)
        .map(item => ({
          item_id: item.id,
          product_name: item.product_name,
          requested: item.quantity,
          available: item.inventory_quantity
        }));

      res.json({
        data: {
          items: cartItems,
          summary: {
            items_count: itemsCount,
            subtotal: subtotal.toFixed(2),
            currency: 'USD'
          },
          warnings: warnings.length > 0 ? warnings : null
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // PUT /petalas/fashion/cart/:id - Update cart item quantity
  router.put('/:id', async (req, res) => {
    try {
      const { quantity } = req.body;
      const tenant_id = req.accountability.tenant;
      const user_id = req.accountability.user || req.session?.id;

      if (!quantity || quantity < 1) {
        return res.status(400).json({ error: 'Quantity must be at least 1' });
      }

      const cartItem = await database('cart_items')
        .where({
          id: req.params.id,
          user_id,
          tenant_id,
          status: 'active'
        })
        .first();

      if (!cartItem) {
        return res.status(404).json({ error: 'Cart item not found' });
      }

      // Check inventory
      const product = await database('products')
        .where({ id: cartItem.product_id })
        .first();

      if (product.track_inventory && product.inventory_quantity < quantity) {
        return res.status(400).json({
          error: 'Insufficient inventory',
          available: product.inventory_quantity
        });
      }

      await database('cart_items')
        .where({ id: req.params.id })
        .update({
          quantity,
          updated_at: new Date()
        });

      res.json({
        success: true,
        message: 'Cart item updated',
        quantity
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // DELETE /petalas/fashion/cart/:id - Remove item from cart
  router.delete('/:id', async (req, res) => {
    try {
      const tenant_id = req.accountability.tenant;
      const user_id = req.accountability.user || req.session?.id;

      const cartItem = await database('cart_items')
        .where({
          id: req.params.id,
          user_id,
          tenant_id,
          status: 'active'
        })
        .first();

      if (!cartItem) {
        return res.status(404).json({ error: 'Cart item not found' });
      }

      // Soft delete
      await database('cart_items')
        .where({ id: req.params.id })
        .update({
          status: 'removed',
          updated_at: new Date()
        });

      res.json({
        success: true,
        message: 'Item removed from cart'
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // DELETE /petalas/fashion/cart - Clear entire cart
  router.delete('/', async (req, res) => {
    try {
      const tenant_id = req.accountability.tenant;
      const user_id = req.accountability.user || req.session?.id;

      await database('cart_items')
        .where({
          user_id,
          tenant_id,
          status: 'active'
        })
        .update({
          status: 'cleared',
          updated_at: new Date()
        });

      res.json({
        success: true,
        message: 'Cart cleared'
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
});
