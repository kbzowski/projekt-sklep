import { Page } from '@playwright/test';
import { TEST_USER, ROUTES } from './test-data';

/**
 * Helper uwierzytelniania dla testów e2e
 *
 * Funkcje pomocnicze do logowania użytkowników testowych.
 */

/**
 * Loguje testowego użytkownika
 *
 * @param page - Instancja Playwright Page
 */
export async function loginAsTestUser(page: Page): Promise<void> {
  await page.goto(ROUTES.LOGIN);

  // Wypełnij dane logowania
  await page.fill('input[type="email"]', TEST_USER.email);
  await page.fill('input[type="password"]', TEST_USER.password);

  // Wyślij formularz i poczekaj na przekierowanie na stronę główną
  await page.click('button[type="submit"]');
  await page.waitForURL(ROUTES.HOME, { timeout: 10000 });

  // Poczekaj na przycisk "Wyloguj" żeby upewnić się że użytkownik jest zalogowany
  await page.locator('button:has-text("Wyloguj")').waitFor({ state: 'visible', timeout: 5000 });

  // KLUCZOWE: Poczekaj na pełne załadowanie danych użytkownika
  // Wymuszamy network idle żeby upewnić się że wszystkie requesty (getCurrentUser, getCart) się zakończyły
  await page.waitForLoadState('networkidle', { timeout: 10000 });
}

/**
 * Czyści koszyk użytkownika
 *
 * Przydatne do izolacji testów - każdy test ma czysty koszyk.
 *
 * @param page - Instancja Playwright Page
 */
export async function clearCart(page: Page): Promise<void> {
  await page.goto(ROUTES.CART);

  // Poczekaj na załadowanie koszyka (albo pusty koszyk, albo items)
  // Używamy Promise.race żeby poczekać na JEDEN z dwóch stanów
  await Promise.race([
    page.locator('text=Twój koszyk jest pusty').waitFor({ timeout: 5000 }).catch(() => {}),
    page.locator('[data-testid="cart-item"]').first().waitFor({ timeout: 5000 }).catch(() => {}),
  ]);

  // Sprawdź czy są jakieś elementy w koszyku
  const cartItems = page.locator('[data-testid="cart-item"]');
  const count = await cartItems.count();

  // Jeśli koszyk nie jest pusty, wyczyść go
  if (count > 0) {
    await page.locator('button:has-text("Wyczyść koszyk")').click();

    // Poczekaj aż koszyk będzie pusty
    await page.locator('text=Twój koszyk jest pusty').waitFor({ timeout: 5000 });
  }
}
