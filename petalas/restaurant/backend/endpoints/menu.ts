/**
 * Pétala Restaurant - Menu Endpoints
 *
 * Routes for menu management:
 * - GET /menu - List all menus
 * - GET /menu/:id - Get menu details
 * - GET /menu/:id/items - Get menu items
 * - POST /menu - Create menu
 * - PATCH /menu/:id - Update menu
 * - DELETE /menu/:id - Delete menu
 */

import { defineEndpoint } from '@directus/extensions-sdk';

export default defineEndpoint((router, { services, database }) => {
  const { ItemsService } = services;

  // GET /petalas/restaurant/menu - List menus
  router.get('/', async (req, res) => {
    try {
      const { tenant_id } = req.query;

      const menus = await database('menus').where({ tenant_id }).select('*');

      res.json({ data: menus });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET /petalas/restaurant/menu/:id - Get menu details
  router.get('/:id', async (req, res) => {
    try {
      const menu = await database('menus').where({ id: req.params.id }).first();

      if (!menu) {
        return res.status(404).json({ error: 'Menu not found' });
      }

      res.json({ data: menu });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET /petalas/restaurant/menu/:id/items - Get menu items
  router.get('/:id/items', async (req, res) => {
    try {
      const { available_only = false, category } = req.query;

      let query = database('menu_items').where({ menu_id: req.params.id, status: 'published' });

      if (available_only === 'true') {
        query = query.where({ available: true });
      }

      if (category) {
        query = query.where({ category });
      }

      const items = await query.orderBy('sort_order', 'asc');

      res.json({ data: items });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET /petalas/restaurant/menu/items/search - Search menu items
  router.get('/items/search', async (req, res) => {
    try {
      const { q, tenant_id } = req.query;

      const items = await database('menu_items')
        .where('tenant_id', tenant_id)
        .where('status', 'published')
        .where(function () {
          this.where('name', 'like', `%${q}%`)
            .orWhere('description', 'like', `%${q}%`)
            .orWhere('ingredients', 'like', `%${q}%`);
        })
        .limit(20);

      res.json({ data: items });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET /petalas/restaurant/menu/items/:id - Get menu item details
  router.get('/items/:id', async (req, res) => {
    try {
      const item = await database('menu_items').where({ id: req.params.id }).first();

      if (!item) {
        return res.status(404).json({ error: 'Menu item not found' });
      }

      res.json({ data: item });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
});
