import { useApp } from '../context/AppContext'
import { cartService } from '../services'
import type { Product } from '../types'

/**
 * useCart - reużywalny hook do operacji na koszyku
 *
 * Centralizuje logikę dodawania produktów do koszyka,
 * używaną w wielu miejscach aplikacji (HomePage, ProductsPage).
 *
 * Wzorzec "Shared Business Logic Hook":
 * - Hook enkapsuluje wspólną logikę biznesową
 * - Używany przez page hooks (useHomePage, useProductsPage)
 * - Zapobiega duplikacji kodu (DRY principle)
 * - Ułatwia utrzymanie - zmiany w jednym miejscu
 *
 * Odpowiedzialności:
 * 1. Dodawanie produktu do koszyka (API call)
 * 2. Odświeżanie stanu koszyka w Context
 * 3. Obsługa błędów z wyświetlaniem komunikatu
 *
 * Przykład użycia:
 * ```tsx
 * const { addToCart } = useCart()
 *
 * // W komponencie lub page hook:
 * <Button onClick={() => addToCart(product)}>
 *   Dodaj do koszyka
 * </Button>
 * ```
 */
export const useCart = () => {
  const { setCart, setError } = useApp()

  /**
   * Dodaje produkt do koszyka (ilość = 1)
   *
   * Flow:
   * 1. Wywołaj API: POST /cart (dodaj produkt lub zwiększ quantity)
   * 2. Odśwież stan koszyka: GET /cart (pobierz zaktualizowany koszyk)
   * 3. Zaktualizuj Context (setCart) → UI automatycznie re-renderuje
   *
   * Error handling:
   * - Wyświetla błąd w UI (setError)
   * - Loguje błąd do konsoli (console.error)
   * - Nie przerywa działania aplikacji (catch block)
   *
   * @param product - Produkt do dodania do koszyka
   */
  const addToCart = async (product: Product) => {
    try {
      // Krok 1: Dodaj produkt do koszyka (backend)
      await cartService.addToCart(product.id, 1)

      // Krok 2: Odśwież koszyk (pobierz aktualny stan z backendu)
      const cart = await cartService.getCart()

      // Krok 3: Zaktualizuj Context → UI re-render
      setCart(cart)
    }
    catch (error) {
      // Wyświetl błąd użytkownikowi
      setError('Błąd podczas dodawania do koszyka')
      console.error('Failed to add to cart:', error)
    }
  }

  return {
    addToCart,
  }
}
