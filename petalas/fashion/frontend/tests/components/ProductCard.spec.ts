import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@testing-library/vue'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import ProductCard from '@/components/ProductCard.vue'
import { useCartStore } from '@/stores/cart'
import type { Product } from '@/types'

describe('ProductCard Component', () => {
  let router: any
  const mockProduct: Product = {
    id: '1',
    name: 'Test Product',
    slug: 'test-product',
    price: 99.99,
    compare_at_price: 129.99,
    featured_image: '/images/product.jpg',
    category: { id: 'cat1', name: 'Shirts' },
    rating_avg: 4.5,
    rating_count: 42,
    inventory_quantity: 10,
    ar_enabled: true,
    status: 'active'
  }

  beforeEach(() => {
    setActivePinia(createPinia())

    router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/products/:slug', name: 'product', component: { template: '<div>Product</div>' } }
      ]
    })
  })

  it('renders product information correctly', () => {
    const wrapper = mount(ProductCard, {
      props: { product: mockProduct },
      global: {
        plugins: [createPinia(), router]
      }
    })

    expect(wrapper.text()).toContain('Test Product')
    expect(wrapper.text()).toContain('$99.99')
    expect(wrapper.text()).toContain('Shirts')
  })

  it('displays AR Try-On badge when enabled', () => {
    const wrapper = mount(ProductCard, {
      props: { product: mockProduct },
      global: {
        plugins: [createPinia(), router]
      }
    })

    expect(wrapper.text()).toContain('AR Try-On')
  })

  it('does not show AR badge when disabled', () => {
    const productWithoutAR = { ...mockProduct, ar_enabled: false }

    const wrapper = mount(ProductCard, {
      props: { product: productWithoutAR },
      global: {
        plugins: [createPinia(), router]
      }
    })

    expect(wrapper.text()).not.toContain('AR Try-On')
  })

  it('shows out of stock badge when inventory is zero', () => {
    const outOfStockProduct = { ...mockProduct, inventory_quantity: 0 }

    const wrapper = mount(ProductCard, {
      props: { product: outOfStockProduct },
      global: {
        plugins: [createPinia(), router]
      }
    })

    expect(wrapper.text()).toContain('Out of Stock')
  })

  it('displays compare at price with strikethrough', () => {
    const wrapper = mount(ProductCard, {
      props: { product: mockProduct },
      global: {
        plugins: [createPinia(), router]
      }
    })

    expect(wrapper.html()).toContain('$129.99')
    expect(wrapper.html()).toContain('line-through')
  })

  it('displays rating stars and count', () => {
    const wrapper = mount(ProductCard, {
      props: { product: mockProduct },
      global: {
        plugins: [createPinia(), router]
      }
    })

    expect(wrapper.text()).toContain('4.5')
    expect(wrapper.text()).toContain('(42)')
  })

  it('calls add to cart action on button click', async () => {
    const wrapper = mount(ProductCard, {
      props: { product: mockProduct },
      global: {
        plugins: [createPinia(), router]
      }
    })

    const cartStore = useCartStore()
    const addItemSpy = vi.spyOn(cartStore, 'addItem').mockResolvedValueOnce()

    const addButton = wrapper.find('button')
    await addButton.trigger('click')

    expect(addItemSpy).toHaveBeenCalledWith(mockProduct.id, 1)
  })

  it('disables add to cart button when out of stock', () => {
    const outOfStockProduct = { ...mockProduct, inventory_quantity: 0 }

    const wrapper = mount(ProductCard, {
      props: { product: outOfStockProduct },
      global: {
        plugins: [createPinia(), router]
      }
    })

    const addButton = wrapper.find('button')
    expect(addButton.attributes('disabled')).toBeDefined()
  })

  it('links to product detail page', () => {
    const wrapper = mount(ProductCard, {
      props: { product: mockProduct },
      global: {
        plugins: [createPinia(), router]
      }
    })

    const link = wrapper.find('a[href*="/products/test-product"]')
    expect(link.exists()).toBe(true)
  })

  it('shows quick view button on hover', async () => {
    const wrapper = mount(ProductCard, {
      props: { product: mockProduct },
      global: {
        plugins: [createPinia(), router]
      }
    })

    const card = wrapper.find('.product-card')
    await card.trigger('mouseenter')

    expect(wrapper.text()).toContain('Quick View')
  })

  it('displays product image with alt text', () => {
    const wrapper = mount(ProductCard, {
      props: { product: mockProduct },
      global: {
        plugins: [createPinia(), router]
      }
    })

    const img = wrapper.find('img')
    expect(img.attributes('src')).toBe('/images/product.jpg')
    expect(img.attributes('alt')).toBe('Test Product')
  })
})
