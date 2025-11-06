/**
 * Pétala Fashion - Products Hooks
 *
 * Handles product lifecycle events:
 * - Auto-generate slug from name
 * - Update product review stats
 * - Emit product events to EventStore
 * - Track inventory changes
 */

import { defineHook } from '@directus/extensions-sdk';
import { EventEmitter } from 'events';

export default defineHook(({ filter, action }, { services, database, getSchema }) => {
  const { ItemsService } = services;

  /**
   * BEFORE CREATE: Auto-generate slug if not provided
   */
  filter('items.create', async (input, meta, context) => {
    if (meta.collection === 'products') {
      if (!input.slug && input.name) {
        input.slug = generateSlug(input.name);
      }

      // Set default values
      if (input.track_inventory === undefined) {
        input.track_inventory = true;
      }
      if (input.inventory_quantity === undefined) {
        input.inventory_quantity = 0;
      }
      if (input.status === undefined) {
        input.status = 'draft';
      }
    }
    return input;
  });

  /**
   * BEFORE UPDATE: Auto-regenerate slug if name changed
   */
  filter('items.update', async (input, meta, context) => {
    if (meta.collection === 'products') {
      if (input.name && !input.slug) {
        input.slug = generateSlug(input.name);
      }

      // Track inventory changes for event emission
      if (input.inventory_quantity !== undefined && context.accountability) {
        const previousQuantity = await getPreviousInventoryQuantity(
          meta.keys[0],
          database
        );
        context.previousInventoryQuantity = previousQuantity;
      }
    }
    return input;
  });

  /**
   * AFTER CREATE: Emit product.created event
   */
  action('items.create', async (meta, context) => {
    if (meta.collection === 'products' && meta.payload) {
      await emitProductEvent({
        type: 'petala.fashion.product.created',
        aggregateId: meta.key,
        tenantId: meta.payload.tenant_id,
        data: {
          name: meta.payload.name,
          slug: meta.payload.slug,
          price: meta.payload.price,
          status: meta.payload.status,
          category_id: meta.payload.category_id,
          brand_id: meta.payload.brand_id
        },
        database
      });

      // Update category product count
      if (meta.payload.category_id) {
        await updateCategoryProductCount(meta.payload.category_id, database, +1);
      }

      // Update brand product count
      if (meta.payload.brand_id) {
        await updateBrandProductCount(meta.payload.brand_id, database, +1);
      }
    }
  });

  /**
   * AFTER UPDATE: Emit product.updated event and track changes
   */
  action('items.update', async (meta, context) => {
    if (meta.collection === 'products' && meta.payload) {
      const changes: Record<string, any> = {};

      // Track significant changes
      if (meta.payload.price !== undefined) changes.price = meta.payload.price;
      if (meta.payload.status !== undefined) changes.status = meta.payload.status;
      if (meta.payload.inventory_quantity !== undefined) {
        changes.inventory_quantity = meta.payload.inventory_quantity;
        changes.previous_quantity = context.previousInventoryQuantity;
      }

      await emitProductEvent({
        type: 'petala.fashion.product.updated',
        aggregateId: meta.keys[0],
        tenantId: meta.payload.tenant_id || await getTenantId(meta.keys[0], database),
        data: changes,
        database
      });

      // Check low stock
      if (
        meta.payload.track_inventory &&
        meta.payload.inventory_quantity !== undefined &&
        meta.payload.inventory_quantity <= (meta.payload.low_stock_threshold || 10)
      ) {
        await emitProductEvent({
          type: 'petala.fashion.product.low_stock',
          aggregateId: meta.keys[0],
          tenantId: meta.payload.tenant_id || await getTenantId(meta.keys[0], database),
          data: {
            quantity: meta.payload.inventory_quantity,
            threshold: meta.payload.low_stock_threshold || 10
          },
          database
        });
      }
    }
  });

  /**
   * AFTER DELETE: Emit product.deleted event and update counts
   */
  action('items.delete', async (meta, context) => {
    if (meta.collection === 'products' && meta.payload) {
      await emitProductEvent({
        type: 'petala.fashion.product.deleted',
        aggregateId: meta.keys[0],
        tenantId: meta.payload.tenant_id,
        data: {
          name: meta.payload.name,
          slug: meta.payload.slug
        },
        database
      });

      // Update category product count
      if (meta.payload.category_id) {
        await updateCategoryProductCount(meta.payload.category_id, database, -1);
      }

      // Update brand product count
      if (meta.payload.brand_id) {
        await updateBrandProductCount(meta.payload.brand_id, database, -1);
      }
    }
  });
});

/**
 * Helper Functions
 */

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9]+/g, '-')     // Replace non-alphanumeric with hyphen
    .replace(/^-+|-+$/g, '');        // Remove leading/trailing hyphens
}

async function getPreviousInventoryQuantity(
  productId: string,
  database: any
): Promise<number> {
  const result = await database
    .select('inventory_quantity')
    .from('products')
    .where('id', productId)
    .first();
  return result?.inventory_quantity || 0;
}

async function getTenantId(productId: string, database: any): Promise<string> {
  const result = await database
    .select('tenant_id')
    .from('products')
    .where('id', productId)
    .first();
  return result?.tenant_id;
}

async function updateCategoryProductCount(
  categoryId: string,
  database: any,
  increment: number
): Promise<void> {
  await database('categories')
    .where('id', categoryId)
    .increment('products_count', increment);
}

async function updateBrandProductCount(
  brandId: string,
  database: any,
  increment: number
): Promise<void> {
  await database('brands')
    .where('id', brandId)
    .increment('products_count', increment);
}

async function emitProductEvent(params: {
  type: string;
  aggregateId: string;
  tenantId: string;
  data: Record<string, any>;
  database: any;
}): Promise<void> {
  const { type, aggregateId, tenantId, data, database } = params;

  await database('events').insert({
    id: generateUUID(),
    type,
    aggregate_id: aggregateId,
    tenant_id: tenantId,
    data: JSON.stringify(data),
    metadata: JSON.stringify({
      timestamp: new Date().toISOString(),
      version: 1,
      source: 'hook-products'
    }),
    created_at: database.fn.now()
  });
}

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
