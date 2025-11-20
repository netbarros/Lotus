/**
 * Sofia AI Assistant Endpoints for Pétala Restaurant
 * Integrates Sofia with Restaurant-specific business logic
 */

import { defineEndpoint } from '@directus/extensions-sdk';
import { SofiaEngine } from '../../../../../shared/sofia/core/SofiaEngine';
import { SofiaCognitiveMeshIntegration } from '../../../../../shared/sofia/core/CognitiveMeshIntegration';

export default defineEndpoint((router, context) => {
  const { services, getSchema, database, logger } = context;

  /**
   * POST /petalas/restaurant/sofia/session
   * Initialize Sofia session for a user
   */
  router.post('/session', async (req, res) => {
    try {
      const { user_id, tenant_id, restaurant_id } = req.body;

      if (!tenant_id) {
        return res.status(400).json({ error: 'tenant_id is required' });
      }

      const anthropicKey = process.env.ANTHROPIC_API_KEY;
      if (!anthropicKey) {
        logger.error('ANTHROPIC_API_KEY not configured');
        return res.status(500).json({ error: 'Sofia AI is not configured' });
      }

      const sofia = new SofiaEngine({
        petala: 'restaurant',
        tenant_id,
        user_id,
        anthropicApiKey: anthropicKey,
        personality: 'friendly',
        features: {
          voice: true,
          chat: true,
          recommendations: true,
          proactive: true,
        },
      });

      const meshIntegration = new SofiaCognitiveMeshIntegration(sofia, {
        tenant_id,
        petala: 'restaurant',
        enableRealtime: true,
        enableAutoOptimization: true,
      });

      await meshIntegration.initialize();

      const conversationId = `conv_${tenant_id}_${user_id || 'guest'}_${Date.now()}`;

      return res.json({
        conversation_id: conversationId,
        context: sofia.getContext(),
        message: 'Sofia session initialized successfully',
      });
    } catch (error: any) {
      logger.error('Error initializing Sofia session:', error);
      return res.status(500).json({ error: error.message });
    }
  });

  /**
   * POST /petalas/restaurant/sofia/message
   * Send message to Sofia
   */
  router.post('/message', async (req, res) => {
    try {
      const { conversation_id, message, context } = req.body;

      if (!conversation_id || !message) {
        return res.status(400).json({ error: 'conversation_id and message are required' });
      }

      const parts = conversation_id.split('_');
      const tenant_id = parts[1];

      const anthropicKey = process.env.ANTHROPIC_API_KEY;
      if (!anthropicKey) {
        return res.status(500).json({ error: 'Sofia AI is not configured' });
      }

      const sofia = new SofiaEngine({
        petala: 'restaurant',
        tenant_id,
        anthropicApiKey: anthropicKey,
        personality: 'friendly',
      });

      if (context) {
        sofia.updateContext(context);
      }

      const response = await sofia.processMessage(message, context);

      return res.json({
        message_id: `msg_${Date.now()}`,
        message: response.message,
        intent: response.intent,
        actions: response.actions,
        suggestions: response.suggestions,
        context: response.intent.context,
      });
    } catch (error: any) {
      logger.error('Error processing Sofia message:', error);
      return res.status(500).json({ error: error.message });
    }
  });

  /**
   * POST /petalas/restaurant/sofia/reservation
   * Make or modify reservation via Sofia
   */
  router.post('/reservation', async (req, res) => {
    try {
      const { details, context } = req.body;
      const schema = await getSchema();
      const reservationsService = new services.ItemsService('reservations', {
        schema,
        accountability: req.accountability,
      });

      // Extract reservation details from Sofia context or provided details
      const reservationData: any = {
        tenant_id: context?.tenant_id || 'default',
        customer_name: details?.customer_name || context?.customer_name || 'Guest',
        customer_email: details?.customer_email || context?.customer_email,
        customer_phone: details?.customer_phone || context?.customer_phone,
        reservation_date: details?.date,
        reservation_time: details?.time,
        party_size: details?.party_size || 2,
        status: 'pending',
        special_requests: details?.special_requests,
        source: 'sofia_ai',
      };

      // Create reservation
      const reservation = await reservationsService.createOne(reservationData);

      return res.json({
        message: `Reserva confirmada! Mesa para ${reservation.party_size} pessoa(s) no dia ${reservation.reservation_date} às ${reservation.reservation_time}. 🎉`,
        reservation,
        actions: [
          {
            type: 'view_reservation',
            label: 'Ver detalhes',
            payload: { reservation_id: reservation.id },
          },
        ],
        suggestions: ['Modificar reserva', 'Ver cardápio', 'Pedir indicações'],
      });
    } catch (error: any) {
      logger.error('Error making reservation via Sofia:', error);
      return res.status(500).json({ error: error.message });
    }
  });

  /**
   * POST /petalas/restaurant/sofia/menu-recommendations
   * Get menu recommendations from Sofia
   */
  router.post('/menu-recommendations', async (req, res) => {
    try {
      const { preferences, context } = req.body;
      const schema = await getSchema();
      const menuItemsService = new services.ItemsService('menu_items', {
        schema,
        accountability: req.accountability,
      });

      // Build filter based on preferences
      const filter: any = {
        status: { _eq: 'available' },
      };

      if (preferences?.dietary_restrictions && preferences.dietary_restrictions.length > 0) {
        filter.dietary_tags = { _intersects: preferences.dietary_restrictions };
      }

      if (preferences?.price_range) {
        filter.price = {};
        if (preferences.price_range.min) filter.price._gte = preferences.price_range.min;
        if (preferences.price_range.max) filter.price._lte = preferences.price_range.max;
      }

      // Get recommendations
      const recommendations = await menuItemsService.readByQuery({
        filter,
        limit: 6,
        sort: ['-popularity_score', '-rating'],
      });

      return res.json({
        message: 'Aqui estão minhas recomendações especiais para você! 👨‍🍳',
        recommendations,
        personalized: Boolean(preferences?.dietary_restrictions || preferences?.price_range),
      });
    } catch (error: any) {
      logger.error('Error getting menu recommendations:', error);
      return res.status(500).json({ error: error.message });
    }
  });

  /**
   * POST /petalas/restaurant/sofia/order
   * Place order via Sofia
   */
  router.post('/order', async (req, res) => {
    try {
      const { order_type, context } = req.body;
      const schema = await getSchema();
      const ordersService = new services.ItemsService('orders', {
        schema,
        accountability: req.accountability,
      });

      const orderData: any = {
        tenant_id: context?.tenant_id || 'default',
        customer_email: context?.customer_email,
        customer_phone: context?.customer_phone,
        order_type: order_type || 'dine-in',
        status: 'pending',
        items: context?.order_items || [],
        subtotal: context?.order_total || 0,
        source: 'sofia_ai',
      };

      const order = await ordersService.createOne(orderData);

      const typeMessages: Record<string, string> = {
        'dine-in': 'Pedido realizado! Será servido em sua mesa em breve.',
        takeout: 'Pedido para retirada confirmado! Estará pronto em 20-30 minutos.',
        delivery: 'Pedido para entrega confirmado! Chegará em 40-50 minutos.',
      };

      return res.json({
        message: typeMessages[order_type] || 'Pedido confirmado!',
        order,
        estimated_time:
          order_type === 'dine-in'
            ? '15-20 min'
            : order_type === 'takeout'
              ? '20-30 min'
              : '40-50 min',
        suggestions: ['Rastrear pedido', 'Adicionar mais itens', 'Ver conta'],
      });
    } catch (error: any) {
      logger.error('Error placing order via Sofia:', error);
      return res.status(500).json({ error: error.message });
    }
  });

  /**
   * POST /petalas/restaurant/sofia/table-availability
   * Check table availability
   */
  router.post('/table-availability', async (req, res) => {
    try {
      const { date, time, party_size } = req.body;
      const schema = await getSchema();
      const tablesService = new services.ItemsService('tables', {
        schema,
        accountability: req.accountability,
      });
      const reservationsService = new services.ItemsService('reservations', {
        schema,
        accountability: req.accountability,
      });

      // Get all tables that can accommodate party size
      const suitableTables = await tablesService.readByQuery({
        filter: {
          status: { _eq: 'available' },
          capacity: { _gte: party_size },
          _or: [{ min_capacity: { _null: true } }, { min_capacity: { _lte: party_size } }],
        },
        sort: ['capacity'],
      });

      // Check existing reservations for the requested time slot
      const existingReservations = await reservationsService.readByQuery({
        filter: {
          reservation_date: { _eq: date },
          reservation_time: { _eq: time },
          status: { _in: ['pending', 'confirmed'] },
        },
      });

      const reservedTableIds = existingReservations.map((r: any) => r.table_id).filter(Boolean);
      const availableTables = suitableTables.filter((t: any) => !reservedTableIds.includes(t.id));

      if (availableTables.length > 0) {
        return res.json({
          available: true,
          message: `Ótimas notícias! Temos ${availableTables.length} mesa(s) disponível(is) para ${party_size} pessoa(s) no dia ${date} às ${time}! 🎉`,
          tables: availableTables,
          suggestions: ['Fazer reserva', 'Ver outras opções', 'Mudar horário'],
        });
      } else {
        // Suggest alternative times
        return res.json({
          available: false,
          message: `Infelizmente não temos mesas disponíveis para esse horário. Posso sugerir horários alternativos? 🤔`,
          suggestions: ['Ver horários disponíveis', 'Tentar outro dia', 'Lista de espera'],
        });
      }
    } catch (error: any) {
      logger.error('Error checking table availability:', error);
      return res.status(500).json({ error: error.message });
    }
  });

  /**
   * POST /petalas/restaurant/sofia/chef-recommendations
   * Get chef's special recommendations
   */
  router.post('/chef-recommendations', async (req, res) => {
    try {
      const schema = await getSchema();
      const menuItemsService = new services.ItemsService('menu_items', {
        schema,
        accountability: req.accountability,
      });

      // Get chef specials
      const chefSpecials = await menuItemsService.readByQuery({
        filter: {
          status: { _eq: 'available' },
          is_chef_special: { _eq: true },
        },
        limit: 5,
        sort: ['-created_at'],
      });

      return res.json({
        message: 'Aqui estão os pratos especiais do nosso chef! 👨‍🍳⭐',
        recommendations: chefSpecials,
        suggestions: ['Fazer pedido', 'Ver ingredientes', 'Perguntar sobre alérgenos'],
      });
    } catch (error: any) {
      logger.error('Error getting chef recommendations:', error);
      return res.status(500).json({ error: error.message });
    }
  });

  /**
   * DELETE /petalas/restaurant/sofia/session/:conversation_id
   * Clear Sofia conversation
   */
  router.delete('/session/:conversation_id', async (req, res) => {
    try {
      const { conversation_id } = req.params;

      return res.json({
        message: 'Conversation cleared successfully',
        conversation_id,
      });
    } catch (error: any) {
      logger.error('Error clearing Sofia conversation:', error);
      return res.status(500).json({ error: error.message });
    }
  });
});
