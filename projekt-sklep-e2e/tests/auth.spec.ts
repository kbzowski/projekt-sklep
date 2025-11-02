import { test, expect } from '@playwright/test';
import { TEST_USER, ROUTES } from '../helpers/test-data';

/**
 * Testy E2E uwierzytelniania - Krok po kroku
 */

test.describe('Authentication', () => {
  test('should navigate to login page', async ({ page }) => {
    await page.goto(ROUTES.LOGIN);

    // Zweryfikuj, że jesteśmy na stronie logowania
    await expect(page).toHaveURL(ROUTES.LOGIN);

    // Sprawdź elementy formularza logowania
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should login with valid credentials', async ({ page }) => {
    await page.goto(ROUTES.LOGIN);

    // Wypełnij dane logowania
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);

    // Wyślij formularz i poczekaj na nawigację
    await Promise.all([
      page.waitForNavigation({ timeout: 10000 }),
      page.click('button[type="submit"]'),
    ]);

    // Powinniśmy być na stronie głównej
    await expect(page).toHaveURL(ROUTES.HOME);

    // Zweryfikuj, że użytkownik jest zalogowany
    await expect(page.locator('button:has-text("Wyloguj")')).toBeVisible({
      timeout: 5000,
    });
  });
});