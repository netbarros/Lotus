import { defineEndpoint } from '@directus/extensions-sdk';

export default defineEndpoint((router, { services, database, env }) => {
  // POST /petalas/fashion/payment - Process payment
  router.post('/', async (req, res) => {
    try {
      const {
        order_id,
        payment_method, // 'stripe', 'mercadopago', 'pix'
        payment_data, // Payment-specific data (token, card info, etc.)
      } = req.body;

      const tenant_id = req.accountability.tenant;

      if (!order_id || !payment_method) {
        return res.status(400).json({
          error: 'Missing required fields',
          required: ['order_id', 'payment_method'],
        });
      }

      // Get order
      const order = await database('orders').where({ id: order_id, tenant_id }).first();

      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      if (order.payment_status === 'paid') {
        return res.status(400).json({ error: 'Order already paid' });
      }

      let paymentResult;

      // Process payment based on method
      switch (payment_method.toLowerCase()) {
        case 'stripe':
          paymentResult = await processStripePayment(order, payment_data, env);
          break;
        case 'mercadopago':
          paymentResult = await processMercadoPagoPayment(order, payment_data, env);
          break;
        case 'pix':
          paymentResult = await generatePixQRCode(order, payment_data, env);
          break;
        default:
          return res.status(400).json({
            error: 'Invalid payment method',
            supported: ['stripe', 'mercadopago', 'pix'],
          });
      }

      if (paymentResult.success) {
        // Update order status
        await database('orders')
          .where({ id: order_id })
          .update({
            payment_status: paymentResult.status, // 'paid' or 'pending' (for PIX)
            payment_transaction_id: paymentResult.transaction_id,
            payment_data: JSON.stringify(paymentResult.payment_data),
            paid_at: paymentResult.status === 'paid' ? new Date() : null,
            updated_at: new Date(),
          });

        // If paid, trigger order processing flow (inventory decrement, email, etc.)
        if (paymentResult.status === 'paid') {
          // Emit event for order-processing flow to consume
          await database('events').insert({
            id: database.raw('gen_random_uuid()'),
            tenant_id,
            aggregate_type: 'order',
            aggregate_id: order_id,
            event_type: 'petala.fashion.payment.completed',
            event_data: JSON.stringify({
              order_id,
              order_number: order.order_number,
              payment_method,
              amount: order.total,
              currency: order.currency,
              transaction_id: paymentResult.transaction_id,
            }),
            timestamp: new Date(),
          });
        }

        res.json({
          success: true,
          message: paymentResult.message,
          data: {
            order_id,
            payment_status: paymentResult.status,
            transaction_id: paymentResult.transaction_id,
            ...(paymentResult.qr_code && { qr_code: paymentResult.qr_code }),
            ...(paymentResult.pix_code && { pix_code: paymentResult.pix_code }),
          },
        });
      } else {
        // Payment failed
        await database('orders')
          .where({ id: order_id })
          .update({
            payment_status: 'failed',
            payment_data: JSON.stringify({ error: paymentResult.error }),
            updated_at: new Date(),
          });

        res.status(400).json({
          error: 'Payment failed',
          message: paymentResult.error,
        });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET /petalas/fashion/payment/:order_id/status - Check payment status
  router.get('/:order_id/status', async (req, res) => {
    try {
      const tenant_id = req.accountability.tenant;

      const order = await database('orders')
        .select(
          'id',
          'order_number',
          'payment_status',
          'payment_method',
          'payment_transaction_id',
          'total',
          'currency',
          'paid_at'
        )
        .where({ id: req.params.order_id, tenant_id })
        .first();

      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      res.json({
        data: {
          order_id: order.id,
          order_number: order.order_number,
          payment_status: order.payment_status,
          payment_method: order.payment_method,
          transaction_id: order.payment_transaction_id,
          amount: order.total,
          currency: order.currency,
          paid_at: order.paid_at,
        },
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // POST /petalas/fashion/payment/webhook/stripe - Stripe webhook handler
  router.post('/webhook/stripe', async (req, res) => {
    try {
      const signature = req.headers['stripe-signature'];
      const payload = req.body;

      // Verify webhook signature (implementation depends on Stripe SDK)
      // const event = stripe.webhooks.constructEvent(payload, signature, env.STRIPE_WEBHOOK_SECRET);

      // Handle event types
      const eventType = payload.type;
      const session = payload.data.object;

      if (eventType === 'checkout.session.completed' || eventType === 'payment_intent.succeeded') {
        const orderId = session.metadata?.order_id;
        if (orderId) {
          await database('orders').where({ id: orderId }).update({
            payment_status: 'paid',
            paid_at: new Date(),
            updated_at: new Date(),
          });
        }
      }

      res.json({ received: true });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  // POST /petalas/fashion/payment/webhook/mercadopago - Mercado Pago webhook handler
  router.post('/webhook/mercadopago', async (req, res) => {
    try {
      const { type, data } = req.body;

      if (type === 'payment') {
        const paymentId = data.id;
        // Fetch payment details from Mercado Pago API
        // const payment = await mercadopago.payment.get(paymentId);

        // Update order based on payment status
        // if (payment.metadata.order_id && payment.status === 'approved') {
        //   await database('orders')
        //     .where({ id: payment.metadata.order_id })
        //     .update({ payment_status: 'paid', paid_at: new Date() });
        // }
      }

      res.json({ received: true });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  // POST /petalas/fashion/payment/webhook/pix - PIX payment confirmation webhook
  router.post('/webhook/pix', async (req, res) => {
    try {
      const { txid, status } = req.body;

      // Verify webhook authenticity
      // Find order by transaction ID
      const order = await database('orders').where({ payment_transaction_id: txid }).first();

      if (order && status === 'CONCLUIDA') {
        await database('orders').where({ id: order.id }).update({
          payment_status: 'paid',
          paid_at: new Date(),
          updated_at: new Date(),
        });

        // Emit payment completed event
        await database('events').insert({
          id: database.raw('gen_random_uuid()'),
          tenant_id: order.tenant_id,
          aggregate_type: 'order',
          aggregate_id: order.id,
          event_type: 'petala.fashion.payment.completed',
          event_data: JSON.stringify({
            order_id: order.id,
            payment_method: 'pix',
            transaction_id: txid,
          }),
          timestamp: new Date(),
        });
      }

      res.json({ received: true });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
});

// Helper functions for payment processing
async function processStripePayment(order, paymentData, env) {
  try {
    // Initialize Stripe (requires stripe npm package)
    // const stripe = require('stripe')(env.STRIPE_SECRET_KEY);

    // Create payment intent or charge
    // const paymentIntent = await stripe.paymentIntents.create({
    //   amount: Math.round(parseFloat(order.total) * 100), // Convert to cents
    //   currency: order.currency.toLowerCase(),
    //   payment_method: paymentData.payment_method_id,
    //   confirm: true,
    //   metadata: { order_id: order.id, order_number: order.order_number }
    // });

    // Mock response for now
    return {
      success: true,
      status: 'paid',
      transaction_id: 'stripe_' + Date.now(),
      message: 'Payment processed successfully via Stripe',
      payment_data: { method: 'stripe' },
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

async function processMercadoPagoPayment(order, paymentData, env) {
  try {
    // Initialize Mercado Pago SDK
    // const mercadopago = require('mercadopago');
    // mercadopago.configure({ access_token: env.MERCADOPAGO_ACCESS_TOKEN });

    // Create payment
    // const payment = await mercadopago.payment.create({
    //   transaction_amount: parseFloat(order.total),
    //   description: `Order ${order.order_number}`,
    //   payment_method_id: paymentData.payment_method_id,
    //   payer: { email: order.customer_email },
    //   metadata: { order_id: order.id }
    // });

    // Mock response
    return {
      success: true,
      status: 'paid',
      transaction_id: 'mp_' + Date.now(),
      message: 'Payment processed successfully via Mercado Pago',
      payment_data: { method: 'mercadopago' },
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

async function generatePixQRCode(order, paymentData, env) {
  try {
    // Generate PIX QR Code using Brazilian payment provider
    // Example: Gerencianet, PagSeguro, Banco do Brasil API
    // const pix = await pixProvider.createCharge({
    //   amount: parseFloat(order.total),
    //   order_id: order.order_number,
    //   expiration: 3600 // 1 hour
    // });

    // Mock response
    const txid = 'pix_' + Date.now();
    const qrCode =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII='; // Mock QR code
    const pixCode =
      '00020126580014br.gov.bcb.pix0136' +
      txid +
      '52040000530398654' +
      order.total +
      '5802BR6009SAO PAULO';

    return {
      success: true,
      status: 'pending', // PIX payments are pending until confirmed
      transaction_id: txid,
      message: 'PIX QR Code generated. Payment pending confirmation.',
      qr_code: qrCode,
      pix_code: pixCode,
      payment_data: {
        method: 'pix',
        expires_at: new Date(Date.now() + 3600000).toISOString(),
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}
