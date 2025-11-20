import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { CartItem, Product } from '@/types';

export const useCartStore = defineStore('cart', () => {
  // State
  const items = ref<CartItem[]>([]);
  const loading = ref(false);

  // Getters
  const itemsCount = computed(() => {
    return items.value.reduce((total, item) => total + item.quantity, 0);
  });

  const subtotal = computed(() => {
    return items.value.reduce((total, item) => {
      return total + parseFloat(item.price) * item.quantity;
    }, 0);
  });

  const isEmpty = computed(() => items.value.length === 0);

  // Actions
  function loadCart() {
    const stored = localStorage.getItem('cart_items');
    if (stored) {
      items.value = JSON.parse(stored);
    }
  }

  function saveCart() {
    localStorage.setItem('cart_items', JSON.stringify(items.value));
  }

  async function addItem(product: Product, quantity = 1) {
    const existingItem = items.value.find((item) => item.product_id === product.id);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      items.value.push({
        id: `cart_${Date.now()}`,
        product_id: product.id,
        product_name: product.name,
        product_slug: product.slug,
        product_image: product.featured_image,
        price: product.price,
        quantity,
        variant_id: null,
      });
    }

    saveCart();
    return { success: true };
  }

  async function updateQuantity(itemId: string, quantity: number) {
    const item = items.value.find((i) => i.id === itemId);
    if (item) {
      if (quantity <= 0) {
        await removeItem(itemId);
      } else {
        item.quantity = quantity;
        saveCart();
      }
    }
    return { success: true };
  }

  async function removeItem(itemId: string) {
    const index = items.value.findIndex((i) => i.id === itemId);
    if (index > -1) {
      items.value.splice(index, 1);
      saveCart();
    }
    return { success: true };
  }

  async function clearCart() {
    items.value = [];
    localStorage.removeItem('cart_items');
    return { success: true };
  }

  return {
    // State
    items,
    loading,
    // Getters
    itemsCount,
    subtotal,
    isEmpty,
    // Actions
    loadCart,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
  };
});
