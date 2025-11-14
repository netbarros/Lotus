import { defineEndpoint } from '@directus/extensions-sdk';

export default defineEndpoint((router, { services, database }) => {
  // GET /petalas/fashion/orders/:id - Get order details
  router.get('/:id', async (req, res) => {
    try {
      const tenant_id = req.accountability.tenant;
      const user_id = req.accountability.user;

      const order = await database('orders').where({ id: req.params.id, tenant_id }).first();

      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      // Verify user has access to this order
      if (user_id && order.user_id !== user_id) {
        return res.status(403).json({ error: 'Unauthorized access to order' });
      }

      // Get order items
      const items = await database('order_items')
        .select(
          'order_items.*',
          'products.name as product_name',
          'products.slug as product_slug',
          'products.featured_image'
        )
        .leftJoin('products', 'order_items.product_id', 'products.id')
        .where({ 'order_items.order_id': order.id, 'order_items.tenant_id': tenant_id });

      res.json({
        data: {
          id: order.id,
          order_number: order.order_number,
          status: {
            payment: order.payment_status,
            fulfillment: order.fulfillment_status,
          },
          customer: {
            email: order.customer_email,
            name: order.customer_name,
            phone: order.customer_phone,
          },
          addresses: {
            billing: order.billing_address ? JSON.parse(order.billing_address) : null,
            shipping: order.shipping_address ? JSON.parse(order.shipping_address) : null,
          },
          items: items.map((item) => ({
            id: item.id,
            product_id: item.product_id,
            product_name: item.product_name,
            product_slug: item.product_slug,
            image: item.featured_image,
            variant_id: item.variant_id,
            quantity: item.quantity,
            price: parseFloat(item.price).toFixed(2),
            subtotal: parseFloat(item.subtotal).toFixed(2),
          })),
          totals: {
            subtotal: parseFloat(order.subtotal).toFixed(2),
            discount: parseFloat(order.discount || 0).toFixed(2),
            tax: parseFloat(order.tax || 0).toFixed(2),
            shipping: parseFloat(order.shipping || 0).toFixed(2),
            total: parseFloat(order.total).toFixed(2),
            currency: order.currency,
          },
          payment: {
            method: order.payment_method,
            transaction_id: order.payment_transaction_id,
            paid_at: order.paid_at,
          },
          shipping: {
            carrier: order.shipping_carrier,
            tracking_number: order.tracking_number,
            shipped_at: order.shipped_at,
            delivered_at: order.delivered_at,
          },
          notes: order.notes,
          created_at: order.created_at,
          updated_at: order.updated_at,
        },
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // PUT /petalas/fashion/orders/:id/cancel - Cancel order
  router.put('/:id/cancel', async (req, res) => {
    try {
      const { reason } = req.body;
      const tenant_id = req.accountability.tenant;
      const user_id = req.accountability.user;

      const order = await database('orders').where({ id: req.params.id, tenant_id }).first();

      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      // Verify user has access to this order
      if (user_id && order.user_id !== user_id) {
        return res.status(403).json({ error: 'Unauthorized access to order' });
      }

      // Check if order can be cancelled
      if (order.payment_status === 'paid' && order.fulfillment_status === 'shipped') {
        return res.status(400).json({
          error: 'Order cannot be cancelled - already shipped',
          message: 'Please contact support for returns',
        });
      }

      if (order.payment_status === 'cancelled') {
        return res.status(400).json({ error: 'Order already cancelled' });
      }

      // Cancel order
      await database('orders')
        .where({ id: req.params.id })
        .update({
          payment_status: 'cancelled',
          fulfillment_status: 'cancelled',
          notes: reason ? `Cancelled: ${reason}` : 'Cancelled by customer',
          updated_at: new Date(),
        });

      // Restore inventory
      const orderItems = await database('order_items').where({ order_id: req.params.id });

      for (const item of orderItems) {
        await database('products')
          .where({ id: item.product_id })
          .increment('inventory_quantity', item.quantity);
      }

      // Emit cancellation event
      await database('events').insert({
        id: database.raw('gen_random_uuid()'),
        tenant_id,
        aggregate_type: 'order',
        aggregate_id: req.params.id,
        event_type: 'petala.fashion.order.cancelled',
        event_data: JSON.stringify({
          order_id: req.params.id,
          order_number: order.order_number,
          reason,
          cancelled_by: user_id ? 'customer' : 'admin',
        }),
        timestamp: new Date(),
      });

      res.json({
        success: true,
        message: 'Order cancelled successfully',
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // POST /petalas/fashion/orders/:id/refund - Request refund
  router.post('/:id/refund', async (req, res) => {
    try {
      const { reason, items } = req.body; // items: array of { item_id, quantity }
      const tenant_id = req.accountability.tenant;
      const user_id = req.accountability.user;

      const order = await database('orders').where({ id: req.params.id, tenant_id }).first();

      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      // Verify user has access
      if (user_id && order.user_id !== user_id) {
        return res.status(403).json({ error: 'Unauthorized access to order' });
      }

      // Check if order is paid
      if (order.payment_status !== 'paid') {
        return res.status(400).json({
          error: 'Order must be paid to request refund',
          current_status: order.payment_status,
        });
      }

      // Check refund window (e.g., 30 days)
      const daysSincePurchase = Math.floor(
        (Date.now() - new Date(order.paid_at).getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysSincePurchase > 30) {
        return res.status(400).json({
          error: 'Refund window expired',
          days_since_purchase: daysSincePurchase,
          refund_window: 30,
        });
      }

      // Calculate refund amount
      let refundAmount = parseFloat(order.total);
      if (items && items.length > 0) {
        // Partial refund
        const orderItems = await database('order_items')
          .where({ order_id: req.params.id })
          .whereIn(
            'id',
            items.map((i) => i.item_id)
          );

        refundAmount = orderItems.reduce((sum, item) => {
          const refundQty = items.find((i) => i.item_id === item.id)?.quantity || item.quantity;
          return sum + parseFloat(item.price) * refundQty;
        }, 0);
      }

      // Create refund record
      const [refund] = await database('refunds')
        .insert({
          id: database.raw('gen_random_uuid()'),
          tenant_id,
          order_id: req.params.id,
          amount: refundAmount.toFixed(2),
          reason,
          status: 'pending',
          items: items ? JSON.stringify(items) : null,
          created_at: new Date(),
          updated_at: new Date(),
        })
        .returning('*');

      // Update order status
      await database('orders').where({ id: req.params.id }).update({
        payment_status: 'refund_pending',
        updated_at: new Date(),
      });

      // Emit refund request event
      await database('events').insert({
        id: database.raw('gen_random_uuid()'),
        tenant_id,
        aggregate_type: 'order',
        aggregate_id: req.params.id,
        event_type: 'petala.fashion.refund.requested',
        event_data: JSON.stringify({
          order_id: req.params.id,
          refund_id: refund.id,
          amount: refundAmount,
          reason,
        }),
        timestamp: new Date(),
      });

      res.json({
        success: true,
        message: 'Refund request submitted',
        data: {
          refund_id: refund.id,
          amount: refundAmount.toFixed(2),
          status: 'pending',
        },
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET /petalas/fashion/orders/:id/invoice - Get order invoice (PDF)
  router.get('/:id/invoice', async (req, res) => {
    try {
      const tenant_id = req.accountability.tenant;
      const user_id = req.accountability.user;

      const order = await database('orders').where({ id: req.params.id, tenant_id }).first();

      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      // Verify user has access
      if (user_id && order.user_id !== user_id) {
        return res.status(403).json({ error: 'Unauthorized access to order' });
      }

      // Get order items
      const items = await database('order_items').select('*').where({ order_id: req.params.id });

      // Generate invoice HTML (in production, use PDF library like pdfkit or puppeteer)
      const invoiceHtml = generateInvoiceHTML(order, items);

      res.setHeader('Content-Type', 'text/html');
      res.send(invoiceHtml);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // POST /petalas/fashion/orders/:id/track-event - Track custom order event
  router.post('/:id/track-event', async (req, res) => {
    try {
      const { event_type, event_data } = req.body;
      const tenant_id = req.accountability.tenant;

      const order = await database('orders').where({ id: req.params.id, tenant_id }).first();

      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      // Emit custom event
      await database('events').insert({
        id: database.raw('gen_random_uuid()'),
        tenant_id,
        aggregate_type: 'order',
        aggregate_id: req.params.id,
        event_type: `petala.fashion.order.${event_type}`,
        event_data: JSON.stringify({
          order_id: req.params.id,
          order_number: order.order_number,
          ...event_data,
        }),
        timestamp: new Date(),
      });

      res.json({
        success: true,
        message: 'Event tracked successfully',
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
});

// Helper: Generate invoice HTML
function generateInvoiceHTML(order, items) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Invoice - ${order.order_number}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 40px; }
    .header { text-align: center; margin-bottom: 40px; }
    .info { display: flex; justify-content: space-between; margin-bottom: 30px; }
    .section { margin-bottom: 20px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
    th { background-color: #f5f5f5; }
    .total { text-align: right; font-size: 18px; font-weight: bold; }
  </style>
</head>
<body>
  <div class="header">
    <h1>INVOICE</h1>
    <p>Order #${order.order_number}</p>
    <p>Date: ${new Date(order.created_at).toLocaleDateString()}</p>
  </div>

  <div class="info">
    <div class="section">
      <h3>Bill To:</h3>
      <p>${order.customer_name || order.customer_email}</p>
      <p>${order.customer_email}</p>
    </div>
    <div class="section">
      <h3>Ship To:</h3>
      <p>${order.shipping_address ? JSON.parse(order.shipping_address).street : 'N/A'}</p>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Product</th>
        <th>Quantity</th>
        <th>Price</th>
        <th>Subtotal</th>
      </tr>
    </thead>
    <tbody>
      ${items
        .map(
          (item) => `
        <tr>
          <td>${item.product_name}</td>
          <td>${item.quantity}</td>
          <td>$${parseFloat(item.price).toFixed(2)}</td>
          <td>$${parseFloat(item.subtotal).toFixed(2)}</td>
        </tr>
      `
        )
        .join('')}
    </tbody>
  </table>

  <div class="total">
    <p>Subtotal: $${parseFloat(order.subtotal).toFixed(2)}</p>
    ${order.discount > 0 ? `<p>Discount: -$${parseFloat(order.discount).toFixed(2)}</p>` : ''}
    <p>Tax: $${parseFloat(order.tax || 0).toFixed(2)}</p>
    <p>Shipping: $${parseFloat(order.shipping || 0).toFixed(2)}</p>
    <p style="font-size: 20px; margin-top: 10px;">TOTAL: $${parseFloat(order.total).toFixed(2)}</p>
  </div>

  <div class="section" style="margin-top: 40px; text-align: center; color: #666;">
    <p>Thank you for your business!</p>
    <p>Payment Status: ${order.payment_status.toUpperCase()}</p>
  </div>
</body>
</html>
  `;
}
