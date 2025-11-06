/**
 * Sofia AI Assistant Endpoints for Pétala Fashion
 * Integrates Sofia with Fashion-specific business logic
 */

import { defineEndpoint } from '@directus/extensions-sdk'
import { SofiaEngine } from '../../../../../shared/sofia/core/SofiaEngine'
import { SofiaCognitiveMeshIntegration } from '../../../../../shared/sofia/core/CognitiveMeshIntegration'

export default defineEndpoint((router, context) => {
  const { services, getSchema, database, logger } = context

  /**
   * POST /petalas/fashion/sofia/session
   * Initialize Sofia session for a user
   */
  router.post('/session', async (req, res) => {
    try {
      const { user_id, tenant_id } = req.body

      if (!tenant_id) {
        return res.status(400).json({ error: 'tenant_id is required' })
      }

      // Get Anthropic API key from environment
      const anthropicKey = process.env.ANTHROPIC_API_KEY
      if (!anthropicKey) {
        logger.error('ANTHROPIC_API_KEY not configured')
        return res.status(500).json({ error: 'Sofia AI is not configured' })
      }

      // Create Sofia instance for Fashion
      const sofia = new SofiaEngine({
        petala: 'fashion',
        tenant_id,
        user_id,
        anthropicApiKey: anthropicKey,
        personality: 'friendly',
        features: {
          voice: true,
          chat: true,
          recommendations: true,
          proactive: true
        }
      })

      // Initialize Cognitive Mesh integration
      const meshIntegration = new SofiaCognitiveMeshIntegration(sofia, {
        tenant_id,
        petala: 'fashion',
        enableRealtime: true,
        enableAutoOptimization: true
      })

      await meshIntegration.initialize()

      // Generate conversation ID
      const conversationId = `conv_${tenant_id}_${user_id || 'guest'}_${Date.now()}`

      // Store session in cache (you would use Redis or similar in production)
      // For now, we'll just return the conversation ID

      return res.json({
        conversation_id: conversationId,
        context: sofia.getContext(),
        message: 'Sofia session initialized successfully'
      })
    } catch (error: any) {
      logger.error('Error initializing Sofia session:', error)
      return res.status(500).json({ error: error.message })
    }
  })

  /**
   * POST /petalas/fashion/sofia/message
   * Send message to Sofia
   */
  router.post('/message', async (req, res) => {
    try {
      const { conversation_id, message, context } = req.body

      if (!conversation_id || !message) {
        return res.status(400).json({ error: 'conversation_id and message are required' })
      }

      // Extract tenant_id from conversation_id
      const parts = conversation_id.split('_')
      const tenant_id = parts[1]

      // Get Anthropic API key
      const anthropicKey = process.env.ANTHROPIC_API_KEY
      if (!anthropicKey) {
        return res.status(500).json({ error: 'Sofia AI is not configured' })
      }

      // Create Sofia instance
      const sofia = new SofiaEngine({
        petala: 'fashion',
        tenant_id,
        anthropicApiKey: anthropicKey,
        personality: 'friendly'
      })

      // Update context if provided
      if (context) {
        sofia.updateContext(context)
      }

      // Process message
      const response = await sofia.processMessage(message, context)

      return res.json({
        message_id: `msg_${Date.now()}`,
        message: response.message,
        intent: response.intent,
        actions: response.actions,
        suggestions: response.suggestions,
        context: response.intent.context
      })
    } catch (error: any) {
      logger.error('Error processing Sofia message:', error)
      return res.status(500).json({ error: error.message })
    }
  })

  /**
   * POST /petalas/fashion/sofia/intent
   * Classify user intent
   */
  router.post('/intent', async (req, res) => {
    try {
      const { message, context } = req.body

      if (!message) {
        return res.status(400).json({ error: 'message is required' })
      }

      const anthropicKey = process.env.ANTHROPIC_API_KEY
      if (!anthropicKey) {
        return res.status(500).json({ error: 'Sofia AI is not configured' })
      }

      const sofia = new SofiaEngine({
        petala: 'fashion',
        tenant_id: 'default',
        anthropicApiKey: anthropicKey
      })

      const intent = await sofia.classifyIntent(message, context)

      return res.json(intent)
    } catch (error: any) {
      logger.error('Error classifying intent:', error)
      return res.status(500).json({ error: error.message })
    }
  })

  /**
   * POST /petalas/fashion/sofia/search
   * Search products using natural language via Sofia
   */
  router.post('/search', async (req, res) => {
    try {
      const { query, filters, context } = req.body
      const schema = await getSchema()
      const itemsService = new services.ItemsService('products', { schema, accountability: req.accountability })

      // Use Sofia to enhance search query
      const anthropicKey = process.env.ANTHROPIC_API_KEY
      if (anthropicKey) {
        const sofia = new SofiaEngine({
          petala: 'fashion',
          tenant_id: context?.tenant_id || 'default',
          anthropicApiKey: anthropicKey
        })

        // Get intent from query
        const intent = await sofia.classifyIntent(query, context)

        // Extract search parameters from entities
        const searchFilters: any = { ...filters }

        if (intent.entities.category) {
          searchFilters.category_id = { _eq: intent.entities.category }
        }

        if (intent.entities.price_range) {
          searchFilters.price = {
            _gte: intent.entities.price_range.min,
            _lte: intent.entities.price_range.max
          }
        }

        if (intent.entities.color) {
          searchFilters.variants = {
            color: { _contains: intent.entities.color }
          }
        }

        // Perform search
        const products = await itemsService.readByQuery({
          filter: {
            _and: [
              { status: { _eq: 'published' } },
              { _or: [
                { name: { _contains: query } },
                { description: { _contains: query } },
                { tags: { _contains: query } }
              ]},
              searchFilters
            ]
          },
          limit: 20,
          sort: ['-created_at']
        })

        return res.json({
          products: products,
          intent: intent,
          enhanced: true
        })
      }

      // Fallback to basic search if Sofia not configured
      const products = await itemsService.readByQuery({
        filter: {
          _and: [
            { status: { _eq: 'published' } },
            { _or: [
              { name: { _contains: query } },
              { description: { _contains: query } }
            ]}
          ]
        },
        limit: 20
      })

      return res.json({ products, enhanced: false })
    } catch (error: any) {
      logger.error('Error in Sofia search:', error)
      return res.status(500).json({ error: error.message })
    }
  })

  /**
   * POST /petalas/fashion/sofia/recommendations
   * Get personalized recommendations from Sofia
   */
  router.post('/recommendations', async (req, res) => {
    try {
      const { conversation_id, type, context } = req.body
      const schema = await getSchema()
      const itemsService = new services.ItemsService('products', { schema, accountability: req.accountability })

      // Get user's browsing history and preferences from context
      const viewedProducts = context?.viewed_products || []
      const preferredStyle = context?.preferred_style || []
      const priceRange = context?.price_range || {}

      // Build recommendation query
      const filter: any = {
        status: { _eq: 'published' }
      }

      if (preferredStyle.length > 0) {
        filter.style = { _in: preferredStyle }
      }

      if (priceRange.min || priceRange.max) {
        filter.price = {}
        if (priceRange.min) filter.price._gte = priceRange.min
        if (priceRange.max) filter.price._lte = priceRange.max
      }

      if (viewedProducts.length > 0) {
        // Exclude already viewed products
        filter.id = { _nin: viewedProducts }
      }

      const recommendations = await itemsService.readByQuery({
        filter,
        limit: 10,
        sort: ['-popularity_score', '-reviews_average']
      })

      return res.json({
        recommendations,
        context: {
          type,
          personalized: viewedProducts.length > 0 || preferredStyle.length > 0
        }
      })
    } catch (error: any) {
      logger.error('Error getting Sofia recommendations:', error)
      return res.status(500).json({ error: error.message })
    }
  })

  /**
   * POST /petalas/fashion/sofia/outfits
   * Get outfit suggestions based on a product
   */
  router.post('/outfits', async (req, res) => {
    try {
      const { product_id, context } = req.body
      const schema = await getSchema()
      const itemsService = new services.ItemsService('products', { schema, accountability: req.accountability })

      // Get the base product
      const baseProduct = await itemsService.readOne(product_id)

      if (!baseProduct) {
        return res.status(404).json({ error: 'Product not found' })
      }

      // Find complementary products based on category and style
      const complementaryCategories: any = {
        'tops': ['bottoms', 'shoes', 'accessories'],
        'bottoms': ['tops', 'shoes', 'accessories'],
        'dresses': ['shoes', 'accessories'],
        'shoes': ['tops', 'bottoms'],
        'accessories': ['tops', 'bottoms', 'shoes']
      }

      const suggestedCategories = complementaryCategories[baseProduct.category] || []

      const outfitItems = await itemsService.readByQuery({
        filter: {
          status: { _eq: 'published' },
          category: { _in: suggestedCategories },
          style: { _eq: baseProduct.style },
          id: { _neq: product_id }
        },
        limit: 6,
        sort: ['-popularity_score']
      })

      return res.json({
        base_product: baseProduct,
        outfit_items: outfitItems,
        complete_the_look: true
      })
    } catch (error: any) {
      logger.error('Error getting outfit suggestions:', error)
      return res.status(500).json({ error: error.message })
    }
  })

  /**
   * POST /petalas/fashion/sofia/track
   * Track order via Sofia
   */
  router.post('/track', async (req, res) => {
    try {
      const { order_id, context } = req.body
      const schema = await getSchema()
      const ordersService = new services.ItemsService('orders', { schema, accountability: req.accountability })

      let order

      if (order_id) {
        order = await ordersService.readOne(order_id)
      } else {
        // Get most recent order for user
        const orders = await ordersService.readByQuery({
          filter: {
            customer_email: { _eq: context?.customer_email }
          },
          limit: 1,
          sort: ['-date_created']
        })

        order = orders[0]
      }

      if (!order) {
        return res.json({
          message: 'Não encontrei nenhum pedido recente. Você pode me informar o número do pedido?',
          order_found: false
        })
      }

      // Generate friendly status message
      const statusMessages: any = {
        'pending': 'Seu pedido está sendo processado.',
        'confirmed': 'Seu pedido foi confirmado e será enviado em breve!',
        'processing': 'Estamos preparando seu pedido para envio.',
        'shipped': `Seu pedido foi enviado! Código de rastreamento: ${order.tracking_number || 'Em breve'}`,
        'delivered': 'Seu pedido foi entregue! Espero que você goste! 😊',
        'cancelled': 'Este pedido foi cancelado.',
        'refunded': 'O reembolso deste pedido foi processado.'
      }

      return res.json({
        message: statusMessages[order.status] || 'Status do pedido atualizado.',
        order_found: true,
        order: {
          id: order.id,
          order_number: order.order_number,
          status: order.status,
          tracking_number: order.tracking_number,
          estimated_delivery: order.estimated_delivery_date,
          items_count: order.items?.length || 0,
          total: order.final_price
        }
      })
    } catch (error: any) {
      logger.error('Error tracking order:', error)
      return res.status(500).json({ error: error.message })
    }
  })

  /**
   * POST /petalas/fashion/sofia/cart-assist
   * Get cart assistance from Sofia
   */
  router.post('/cart-assist', async (req, res) => {
    try {
      const { context } = req.body
      const cartItems = context?.cart_items || []
      const cartTotal = context?.cart_total || 0

      let message = ''
      const suggestions: string[] = []

      if (cartItems.length === 0) {
        message = 'Seu carrinho está vazio. Posso ajudar você a encontrar produtos incríveis!'
        suggestions.push('Ver novidades', 'Ver promoções', 'Buscar produto')
      } else if (cartTotal < 50) {
        message = `Você tem ${cartItems.length} item(ns) no carrinho. Adicione mais $${(50 - cartTotal).toFixed(2)} para ganhar frete grátis! 🚚`
        suggestions.push('Ver mais produtos', 'Ver produtos relacionados')
      } else {
        message = `Seu carrinho tem ${cartItems.length} item(ns). Você já ganhou frete grátis! 🎉 Pronto para finalizar?`
        suggestions.push('Finalizar compra', 'Aplicar cupom', 'Continuar comprando')
      }

      return res.json({
        message,
        suggestions,
        cart_summary: {
          items_count: cartItems.length,
          total: cartTotal,
          free_shipping: cartTotal >= 50
        }
      })
    } catch (error: any) {
      logger.error('Error providing cart assistance:', error)
      return res.status(500).json({ error: error.message })
    }
  })

  /**
   * POST /petalas/fashion/sofia/checkout-assist
   * Get checkout guidance from Sofia
   */
  router.post('/checkout-assist', async (req, res) => {
    try {
      const { step, context } = req.body

      const stepMessages: any = {
        'shipping': 'Por favor, preencha suas informações de entrega. Vou garantir que seu pedido chegue rapidamente! 📦',
        'payment': 'Hora de escolher a forma de pagamento. Todas as transações são 100% seguras! 🔒',
        'review': 'Revise seu pedido antes de finalizar. Está tudo certo? 👀',
        'confirmation': 'Pedido confirmado! 🎉 Você receberá um email com todos os detalhes.'
      }

      return res.json({
        message: stepMessages[step] || 'Como posso ajudar com seu pedido?',
        step: step,
        suggestions: step === 'shipping' ? ['Aplicar cupom', 'Calcular frete'] : ['Voltar', 'Continuar']
      })
    } catch (error: any) {
      logger.error('Error providing checkout guidance:', error)
      return res.status(500).json({ error: error.message })
    }
  })

  /**
   * POST /petalas/fashion/sofia/action
   * Execute action suggested by Sofia
   */
  router.post('/action', async (req, res) => {
    try {
      const { action_type, payload, context } = req.body

      // Handle different action types
      const result: any = {
        action_type,
        success: true,
        data: {}
      }

      switch (action_type) {
        case 'navigate':
          result.path = payload.path
          break

        case 'add_to_cart':
          result.message = 'Produto adicionado ao carrinho!'
          break

        case 'apply_coupon':
          result.message = `Cupom ${payload.code} aplicado com sucesso!`
          result.discount = payload.discount
          break

        case 'search_products':
          result.query = payload.query
          result.path = `/products?q=${encodeURIComponent(payload.query)}`
          break

        case 'view_product':
          result.path = `/products/${payload.product_id}`
          break

        default:
          result.message = 'Ação processada com sucesso'
      }

      return res.json(result)
    } catch (error: any) {
      logger.error('Error executing Sofia action:', error)
      return res.status(500).json({ error: error.message })
    }
  })

  /**
   * DELETE /petalas/fashion/sofia/session/:conversation_id
   * Clear Sofia conversation
   */
  router.delete('/session/:conversation_id', async (req, res) => {
    try {
      const { conversation_id } = req.params

      // In production, you would clear the session from cache/database
      // For now, just return success

      return res.json({
        message: 'Conversation cleared successfully',
        conversation_id
      })
    } catch (error: any) {
      logger.error('Error clearing Sofia conversation:', error)
      return res.status(500).json({ error: error.message })
    }
  })
})
