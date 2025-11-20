import { test, expect } from '@playwright/test';

test.describe('Checkout Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Setup: Login and add items to cart
    await page.goto('http://localhost:5173/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    await page.waitForURL('http://localhost:5173/');
  });

  test('complete checkout flow successfully', async ({ page }) => {
    // Add product to cart
    await page.goto('http://localhost:5173/products');
    await page.click('.product-card:first-child button');

    // Go to cart
    await page.click('a[href="/cart"]');
    await expect(page.locator('h2')).toContainText('Shopping Cart');

    // Proceed to checkout
    await page.click('button:has-text("Proceed to Checkout")');
    await expect(page).toHaveURL(/.*checkout/);

    // Step 1: Shipping Information
    await page.fill('input[name="firstName"]', 'John');
    await page.fill('input[name="lastName"]', 'Doe');
    await page.fill('input[name="address"]', '123 Main St');
    await page.fill('input[name="city"]', 'New York');
    await page.fill('input[name="state"]', 'NY');
    await page.fill('input[name="zipCode"]', '10001');
    await page.fill('input[name="phone"]', '555-0123');

    await page.click('button:has-text("Continue to Payment")');

    // Step 2: Payment Method
    await page.click('input[value="credit_card"]');
    await page.fill('input[name="cardNumber"]', '4242424242424242');
    await page.fill('input[name="cardExpiry"]', '12/25');
    await page.fill('input[name="cardCvc"]', '123');

    await page.click('button:has-text("Continue to Review")');

    // Step 3: Review Order
    await expect(page.locator('text=Review Your Order')).toBeVisible();
    await page.check('input[type="checkbox"]'); // Accept terms

    await page.click('button:has-text("Place Order")');

    // Verify success
    await expect(page).toHaveURL(/.*order-confirmation/);
    await expect(page.locator('text=Order Confirmed')).toBeVisible();
  });

  test('validates required shipping fields', async ({ page }) => {
    await page.goto('http://localhost:5173/checkout');

    // Try to continue without filling fields
    await page.click('button:has-text("Continue to Payment")');

    // Should show validation errors
    await expect(page.locator('text=required')).toBeVisible();
  });

  test('applies coupon code', async ({ page }) => {
    // Add product and go to cart
    await page.goto('http://localhost:5173/products');
    await page.click('.product-card:first-child button');
    await page.click('a[href="/cart"]');

    // Apply coupon
    await page.fill('input[placeholder*="coupon"]', 'SAVE10');
    await page.click('button:has-text("Apply")');

    // Verify discount applied
    await expect(page.locator('text=Discount')).toBeVisible();
    await expect(page.locator('.discount-amount')).toContainText('-$');
  });

  test('shows free shipping message', async ({ page }) => {
    await page.goto('http://localhost:5173/cart');

    // Check for free shipping message
    const subtotal = await page.locator('.subtotal-amount').textContent();
    const amount = parseFloat(subtotal?.replace('$', '') || '0');

    if (amount >= 50) {
      await expect(page.locator('text=Free Shipping')).toBeVisible();
    } else {
      await expect(page.locator('text=more for free shipping')).toBeVisible();
    }
  });

  test('updates cart quantities', async ({ page }) => {
    // Add product to cart
    await page.goto('http://localhost:5173/products');
    await page.click('.product-card:first-child button');
    await page.click('a[href="/cart"]');

    // Increase quantity
    await page.click('button[aria-label="Increase quantity"]');

    // Verify quantity updated
    await expect(page.locator('input[type="number"]')).toHaveValue('2');

    // Verify total updated
    await expect(page.locator('.total-amount')).not.toContainText('$0.00');
  });

  test('removes item from cart', async ({ page }) => {
    // Add product to cart
    await page.goto('http://localhost:5173/products');
    await page.click('.product-card:first-child button');
    await page.click('a[href="/cart"]');

    // Remove item
    await page.click('button[aria-label="Remove item"]');

    // Verify cart is empty
    await expect(page.locator('text=Your cart is empty')).toBeVisible();
  });

  test('requires terms acceptance before placing order', async ({ page }) => {
    await page.goto('http://localhost:5173/checkout');

    // Fill all steps
    await page.fill('input[name="firstName"]', 'John');
    await page.fill('input[name="lastName"]', 'Doe');
    await page.fill('input[name="address"]', '123 Main St');
    await page.fill('input[name="city"]', 'New York');
    await page.fill('input[name="state"]', 'NY');
    await page.fill('input[name="zipCode"]', '10001');
    await page.click('button:has-text("Continue to Payment")');

    await page.click('input[value="credit_card"]');
    await page.click('button:has-text("Continue to Review")');

    // Try to place order without accepting terms
    await page.click('button:has-text("Place Order")');

    // Should show error or stay on same page
    await expect(page).toHaveURL(/.*checkout/);
  });
});
