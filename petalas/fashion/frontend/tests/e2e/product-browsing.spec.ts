import { test, expect } from '@playwright/test'

test.describe('Product Browsing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173')
  })

  test('loads homepage with featured products', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Pétala Fashion')

    // Should show featured products
    await expect(page.locator('.product-card')).toHaveCount(6)
  })

  test('navigates to product catalog', async ({ page }) => {
    await page.click('a:has-text("Shop")')

    await expect(page).toHaveURL(/.*products/)
    await expect(page.locator('h2')).toContainText('Products')
  })

  test('filters products by category', async ({ page }) => {
    await page.goto('http://localhost:5173/products')

    // Click category filter
    await page.click('text=Shirts')

    // URL should include category param
    await expect(page).toHaveURL(/.*category=shirts/)

    // Products should be filtered
    await expect(page.locator('.product-card')).toHaveCount.greaterThan(0)
  })

  test('filters products by price range', async ({ page }) => {
    await page.goto('http://localhost:5173/products')

    // Set price range
    await page.fill('input[name="priceMin"]', '20')
    await page.fill('input[name="priceMax"]', '100')
    await page.click('button:has-text("Apply Filters")')

    // Verify all visible prices are in range
    const prices = await page.locator('.product-price').allTextContents()
    prices.forEach(priceText => {
      const price = parseFloat(priceText.replace('$', ''))
      expect(price).toBeGreaterThanOrEqual(20)
      expect(price).toBeLessThanOrEqual(100)
    })
  })

  test('searches for products', async ({ page }) => {
    // Use search in header
    await page.fill('input[type="text"][placeholder*="Search"]', 'shirt')
    await page.press('input[type="text"][placeholder*="Search"]', 'Enter')

    await expect(page).toHaveURL(/.*search=shirt/)

    // Should show search results
    await expect(page.locator('.product-card')).toHaveCount.greaterThan(0)
  })

  test('sorts products by price', async ({ page }) => {
    await page.goto('http://localhost:5173/products')

    // Sort by price low to high
    await page.selectOption('select[name="sort"]', 'price_asc')

    // Verify sorting
    const prices = await page.locator('.product-price').allTextContents()
    const priceValues = prices.map(p => parseFloat(p.replace('$', '')))

    for (let i = 0; i < priceValues.length - 1; i++) {
      expect(priceValues[i]).toBeLessThanOrEqual(priceValues[i + 1])
    }
  })

  test('views product detail page', async ({ page }) => {
    await page.goto('http://localhost:5173/products')

    // Click first product
    await page.click('.product-card:first-child a')

    await expect(page).toHaveURL(/.*products\/.*/)

    // Should show product details
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('.product-price')).toBeVisible()
    await expect(page.locator('button:has-text("Add to Cart")')).toBeVisible()
  })

  test('selects product variants', async ({ page }) => {
    await page.goto('http://localhost:5173/products')
    await page.click('.product-card:first-child a')

    // Select size
    await page.click('button:has-text("M")')
    await expect(page.locator('button:has-text("M")')).toHaveClass(/selected|active/)

    // Select color
    await page.click('[data-color="red"]')
    await expect(page.locator('[data-color="red"]')).toHaveClass(/selected|active/)
  })

  test('adds product to cart from detail page', async ({ page }) => {
    await page.goto('http://localhost:5173/products')
    await page.click('.product-card:first-child a')

    // Add to cart
    await page.click('button:has-text("Add to Cart")')

    // Cart badge should update
    await expect(page.locator('.cart-badge')).toContainText('1')

    // Success message
    await expect(page.locator('text=Added to cart')).toBeVisible()
  })

  test('shows product reviews', async ({ page }) => {
    await page.goto('http://localhost:5173/products')
    await page.click('.product-card:first-child a')

    // Click reviews tab
    await page.click('button:has-text("Reviews")')

    // Should show reviews section
    await expect(page.locator('.review-item')).toHaveCount.greaterThan(0)
  })

  test('submits product review', async ({ page }) => {
    // Login first
    await page.goto('http://localhost:5173/login')
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')

    // Go to product
    await page.goto('http://localhost:5173/products')
    await page.click('.product-card:first-child a')

    // Click reviews tab
    await page.click('button:has-text("Reviews")')

    // Submit review
    await page.click('button:has-text("Write a Review")')
    await page.fill('textarea[name="comment"]', 'Great product!')
    await page.click('[data-rating="5"]')
    await page.click('button:has-text("Submit Review")')

    // Should show success message
    await expect(page.locator('text=Review submitted')).toBeVisible()
  })

  test('tries AR try-on feature', async ({ page }) => {
    await page.goto('http://localhost:5173/products')

    // Find product with AR enabled
    const arProduct = page.locator('.product-card:has(text("AR Try-On"))').first()
    await arProduct.click()

    // Click AR button
    await page.click('button:has-text("Try with AR")')

    // Should open AR experience
    await expect(page.locator('.ar-viewer')).toBeVisible()
  })

  test('shows related products', async ({ page }) => {
    await page.goto('http://localhost:5173/products')
    await page.click('.product-card:first-child a')

    // Scroll to related products
    await page.locator('text=You May Also Like').scrollIntoViewIfNeeded()

    // Should show related products
    await expect(page.locator('.related-products .product-card')).toHaveCount.greaterThan(0)
  })

  test('paginates through products', async ({ page }) => {
    await page.goto('http://localhost:5173/products')

    // Click next page
    await page.click('button:has-text("Next")')

    // URL should update with page param
    await expect(page).toHaveURL(/.*page=2/)

    // Products should load
    await expect(page.locator('.product-card')).toHaveCount.greaterThan(0)
  })

  test('toggles grid and list view', async ({ page }) => {
    await page.goto('http://localhost:5173/products')

    // Switch to list view
    await page.click('button[aria-label="List view"]')
    await expect(page.locator('.product-list')).toHaveClass(/list-view/)

    // Switch back to grid view
    await page.click('button[aria-label="Grid view"]')
    await expect(page.locator('.product-list')).toHaveClass(/grid-view/)
  })
})
