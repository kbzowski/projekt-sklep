import { test, expect } from '@playwright/test';
import { ROUTES } from '../helpers/test-data';
import { loginAsTestUser } from '../helpers/auth-helpers';

/**
 * Testy koszyka - Krok po kroku
 */

test.describe('Cart - bez uwierzytelnienia', () => {
  test('should redirect to login when accessing cart without auth', async ({ page }) => {
    await page.goto(ROUTES.CART);

    // Powinno przekierować do logowania
    await page.waitForURL(ROUTES.LOGIN, { timeout: 5000 });
    await expect(page).toHaveURL(ROUTES.LOGIN);
  });
});

test.describe('Cart - z uwierzytelnieniem', () => {
  // Zaloguj przed każdym testem
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
  });

  test('should show empty cart initially', async ({ page }) => {
    await page.goto(ROUTES.CART);

    // Sprawdź, że koszyk jest pusty
    await expect(page.locator('text=Twój koszyk jest pusty')).toBeVisible();
    await expect(page.locator('text=Przejdź do sklepu')).toBeVisible();
  });

  test('should add product to cart', async ({ page }) => {
    // Przejdź do strony głównej
    await page.goto(ROUTES.HOME);

    // Znajdź pierwszy produkt i dodaj do koszyka
    const firstProduct = page.locator('[data-testid="product-card"]').first();
    const productName = await firstProduct.locator('[data-testid="product-title"]').textContent();
    const productPrice = await firstProduct.locator('[data-testid="product-price"]').textContent();

    await firstProduct.locator('button:has-text("Dodaj do koszyka")').click();

    // Przejdź do koszyka
    await page.goto(ROUTES.CART);

    // Sprawdź, że produkt jest w koszyku
    const cartItem = page.locator('[data-testid="cart-item"]').first();
    await expect(cartItem.locator('[data-testid="product-title"]')).toHaveText(productName || '');
    await expect(cartItem.locator('[data-testid="cart-quantity"]')).toHaveText('1');
  });

  test('should increase product quantity', async ({ page }) => {
    // Dodaj produkt do koszyka
    await page.goto(ROUTES.HOME);
    await page.locator('[data-testid="product-card"]').first()
      .locator('button:has-text("Dodaj do koszyka")').click();

    // Przejdź do koszyka
    await page.goto(ROUTES.CART);

    // Zwiększ ilość produktu
    const cartItem = page.locator('[data-testid="cart-item"]').first();
    await cartItem.locator('button:has-text("+")').click();

    // Sprawdź, że ilość wzrosła
    await expect(cartItem.locator('[data-testid="cart-quantity"]')).toHaveText('2');
  });

  test('should decrease product quantity', async ({ page }) => {
    // Dodaj produkt do koszyka dwukrotnie
    await page.goto(ROUTES.HOME);
    const addButton = page.locator('[data-testid="product-card"]').first()
      .locator('button:has-text("Dodaj do koszyka")');
    await addButton.click();
    await addButton.click();

    // Przejdź do koszyka
    await page.goto(ROUTES.CART);

    // Zmniejsz ilość produktu
    const cartItem = page.locator('[data-testid="cart-item"]').first();
    await cartItem.locator('button:has-text("-")').click();

    // Sprawdź, że ilość zmalała
    await expect(cartItem.locator('[data-testid="cart-quantity"]')).toHaveText('1');
  });

  test('should remove product from cart', async ({ page }) => {
    // Dodaj produkt do koszyka
    await page.goto(ROUTES.HOME);
    await page.locator('[data-testid="product-card"]').first()
      .locator('button:has-text("Dodaj do koszyka")').click();

    // Przejdź do koszyka
    await page.goto(ROUTES.CART);

    // Usuń produkt z koszyka
    await page.locator('button:has-text("Usuń")').first().click();

    // Sprawdź, że koszyk jest pusty
    await expect(page.locator('text=Twój koszyk jest pusty')).toBeVisible();
  });

  test('should calculate total price correctly', async ({ page }) => {
    // Przejdź do strony głównej
    await page.goto(ROUTES.HOME);

    // Dodaj pierwszy produkt
    const firstProduct = page.locator('[data-testid="product-card"]').first();
    const firstPriceText = await firstProduct.locator('[data-testid="product-price"]').textContent();
    const firstPrice = parseFloat(firstPriceText?.replace(',', '.').replace(/[^\d.]/g, '') || '0');
    await firstProduct.locator('button:has-text("Dodaj do koszyka")').click();

    // Dodaj drugi produkt
    const secondProduct = page.locator('[data-testid="product-card"]').nth(1);
    const secondPriceText = await secondProduct.locator('[data-testid="product-price"]').textContent();
    const secondPrice = parseFloat(secondPriceText?.replace(',', '.').replace(/[^\d.]/g, '') || '0');
    await secondProduct.locator('button:has-text("Dodaj do koszyka")').click();

    // Przejdź do koszyka
    await page.goto(ROUTES.CART);

    // Sprawdź sumę całkowitą
    const expectedTotal = (firstPrice + secondPrice).toFixed(2);
    const totalText = await page.locator('[data-testid="cart-total"]').textContent();
    const actualTotal = totalText?.trim().split(' ')[0] || '0';

    expect(actualTotal).toBe(expectedTotal);
  });

  test('should clear entire cart', async ({ page }) => {
    // Dodaj produkty do koszyka
    await page.goto(ROUTES.HOME);
    await page.locator('[data-testid="product-card"]').first()
      .locator('button:has-text("Dodaj do koszyka")').click();
    await page.locator('[data-testid="product-card"]').nth(1)
      .locator('button:has-text("Dodaj do koszyka")').click();

    // Przejdź do koszyka
    await page.goto(ROUTES.CART);

    // Wyczyść koszyk
    await page.locator('button:has-text("Wyczyść koszyk")').click();

    // Sprawdź, że koszyk jest pusty
    await expect(page.locator('text=Twój koszyk jest pusty')).toBeVisible();
  });

  test('should persist cart after page reload', async ({ page }) => {
    // Dodaj produkt do koszyka
    await page.goto(ROUTES.HOME);
    const firstProduct = page.locator('[data-testid="product-card"]').first();
    const productName = await firstProduct.locator('[data-testid="product-title"]').textContent();
    await firstProduct.locator('button:has-text("Dodaj do koszyka")').click();

    // Odśwież stronę
    await page.reload();

    // Przejdź do koszyka
    await page.goto(ROUTES.CART);

    // Sprawdź, że produkt nadal jest w koszyku
    const cartItem = page.locator('[data-testid="cart-item"]').first();
    await expect(cartItem.locator('[data-testid="product-title"]')).toHaveText(productName || '');
  });
});