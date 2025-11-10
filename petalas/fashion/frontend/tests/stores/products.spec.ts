import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useProductsStore } from '@/stores/products'
import { productsApi } from '@/services/api'

vi.mock('@/services/api', () => ({
  productsApi: {
    list: vi.fn(),
    getById: vi.fn(),
    search: vi.fn()
  }
}))

describe('Products Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('initializes with default state', () => {
    const store = useProductsStore()

    expect(store.products).toEqual([])
    expect(store.currentProduct).toBeNull()
    expect(store.isLoading).toBe(false)
    expect(store.filters).toEqual({
      category: null,
      priceMin: null,
      priceMax: null,
      brand: null,
      search: ''
    })
  })

  it('fetches products successfully', async () => {
    const store = useProductsStore()
    const mockProducts = {
      data: {
        data: [
          { id: '1', name: 'Product 1', price: 50, slug: 'product-1' },
          { id: '2', name: 'Product 2', price: 30, slug: 'product-2' }
        ],
        meta: { total_count: 2 }
      }
    }

    vi.mocked(productsApi.list).mockResolvedValueOnce(mockProducts)

    await store.fetchProducts()

    expect(store.products).toHaveLength(2)
    expect(store.products[0].name).toBe('Product 1')
    expect(store.isLoading).toBe(false)
  })

  it('fetches product by ID successfully', async () => {
    const store = useProductsStore()
    const mockProduct = {
      data: {
        data: {
          id: '1',
          name: 'Product 1',
          price: 50,
          slug: 'product-1',
          description: 'Test product'
        }
      }
    }

    vi.mocked(productsApi.getById).mockResolvedValueOnce(mockProduct)

    await store.fetchProductById('1')

    expect(store.currentProduct).toEqual(mockProduct.data.data)
    expect(store.currentProduct?.name).toBe('Product 1')
  })

  it('searches products', async () => {
    const store = useProductsStore()
    const mockResults = {
      data: {
        data: [
          { id: '1', name: 'Red Shirt', price: 50, slug: 'red-shirt' }
        ]
      }
    }

    vi.mocked(productsApi.search).mockResolvedValueOnce(mockResults)

    await store.searchProducts('red')

    expect(productsApi.search).toHaveBeenCalledWith('red')
    expect(store.products).toHaveLength(1)
    expect(store.products[0].name).toBe('Red Shirt')
  })

  it('applies filters correctly', async () => {
    const store = useProductsStore()

    store.setFilter('category', 'shirts')
    store.setFilter('priceMin', 20)
    store.setFilter('priceMax', 100)
    store.setFilter('brand', 'nike')

    expect(store.filters.category).toBe('shirts')
    expect(store.filters.priceMin).toBe(20)
    expect(store.filters.priceMax).toBe(100)
    expect(store.filters.brand).toBe('nike')
  })

  it('clears filters', () => {
    const store = useProductsStore()

    store.setFilter('category', 'shirts')
    store.setFilter('priceMin', 20)

    store.clearFilters()

    expect(store.filters).toEqual({
      category: null,
      priceMin: null,
      priceMax: null,
      brand: null,
      search: ''
    })
  })

  it('handles loading state during fetch', async () => {
    const store = useProductsStore()

    vi.mocked(productsApi.list).mockImplementation(() =>
      new Promise(resolve => setTimeout(() => resolve({ data: { data: [] } }), 100))
    )

    const fetchPromise = store.fetchProducts()

    expect(store.isLoading).toBe(true)

    await fetchPromise

    expect(store.isLoading).toBe(false)
  })

  it('handles fetch error', async () => {
    const store = useProductsStore()

    vi.mocked(productsApi.list).mockRejectedValueOnce(new Error('Network error'))

    await expect(store.fetchProducts()).rejects.toThrow('Network error')

    expect(store.isLoading).toBe(false)
  })

  it('filters products by category', () => {
    const store = useProductsStore()
    store.products = [
      { id: '1', name: 'Shirt', category: { id: 'cat1', name: 'Shirts' }, price: 50, slug: 's1' },
      { id: '2', name: 'Pants', category: { id: 'cat2', name: 'Pants' }, price: 60, slug: 's2' },
      { id: '3', name: 'T-Shirt', category: { id: 'cat1', name: 'Shirts' }, price: 30, slug: 's3' }
    ]

    const filtered = store.filteredProducts('cat1')

    expect(filtered).toHaveLength(2)
    expect(filtered[0].name).toBe('Shirt')
    expect(filtered[1].name).toBe('T-Shirt')
  })
})
