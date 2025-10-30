import { useApp } from '../context/AppContext'
import { cartService } from '../services'
import type { Product } from '../types'

/**
 * useCart - hook do operacji na koszyku
 *
 * Centralizuje logikę dodawania produktów do koszyka,
 * używaną w wielu miejscach aplikacji (HomePage, ProductsPage).
 */
export const useCart = () => {
  const { setCart, setError } = useApp()

  /**
   * Dodaje produkt do koszyka (ilość = 1)
   *
   * @param product - Produkt do dodania do koszyka
   */
  const addToCart = async (product: Product) => {
    try {
      // Krok 1: Dodaj produkt do koszyka (backend)
      await cartService.addToCart(product.id, 1)

      // Krok 2: Odśwież koszyk (pobierz aktualny stan z backendu)
      const cart = await cartService.getCart()

      // Krok 3: Zaktualizuj Context
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
