import {useEffect, useOptimistic} from 'react'

import {useApp} from '../../context/AppContext'
import {cartService} from '../../services'
import type {CartItem} from '../../types'

/**
 * Typy akcji dla useOptimistic reducer
 *
 * useOptimistic wymaga akcji typu { type, payload } aby wiedzieć
 * jak zaktualizować stan przed odpowiedzią API
 */
type CartAction =
  | { type: 'update-quantity'; productId: number; quantity: number }
  | { type: 'remove'; productId: number }
  | { type: 'clear' }

/**
 * useCartPage - hook dla CartPage z React 19 useOptimistic
 */
export const useCartPage = () => {
  const { state, setCart, setLoading, setError } = useApp()
  const { cart, isLoading } = state


  /**
   * useOptimistic - React 19 hook dla optymistycznych aktualizacji
   */
  const [optimisticCart, addOptimisticUpdate] = useOptimistic<CartItem[], CartAction>(
    cart,
    (state, action) => {
      // Reducer: jak zaktualizować optimistyczny stan dla każdej akcji
      switch (action.type) {
        case 'update-quantity':
          // Zmień quantity dla konkretnego produktu
          return state.map(item =>
            item.product.id === action.productId
              ? { ...item, quantity: action.quantity }
              : item
          )

        case 'remove':
          // Usuń produkt z koszyka
          return state.filter(item => item.product.id !== action.productId)

        case 'clear':
          // Wyczyść koszyk
          return []

        default:
          return state
      }
    }
  )

  // Załaduj koszyk przy pierwszym renderze
  useEffect(() => {
    const loadCart = async () => {
      setLoading(true)
      setError(null)

      try {
        const cartData = await cartService.getCart()
        setCart(cartData)
      }
      catch (error) {
        setError('Błąd podczas ładowania koszyka')
        console.error('Failed to load cart:', error)
        setCart([]) // Pusty koszyk w przypadku błędu
      }
      finally {
        setLoading(false)
      }
    }

    void loadCart()
  }, [setCart, setLoading, setError])

  /**
   * Handler: Aktualizacja ilości produktu
   */
  const handleUpdateQuantity = async (productId: number, quantity: number) => {
    // Krok 1: Optymistyczna aktualizacja
    addOptimisticUpdate({ type: 'update-quantity', productId, quantity })

    try {
      // Krok 2: API call (asynchroniczny)
      await cartService.updateQuantity(productId, quantity)

      // Krok 3: Synchronizacja
      const updatedCart = await cartService.getCart()
      setCart(updatedCart)
    }
    catch (error) {
      setError('Błąd podczas aktualizacji ilości')
      console.error('Failed to update quantity:', error)
    }
  }

  /**
   * Handler: Usunięcie produktu
   */
  const handleRemoveItem = async (productId: number) => {
    // Krok 1: Optymistyczna aktualizacja
    addOptimisticUpdate({ type: 'remove', productId })

    try {
      // Krok 2: API call
      await cartService.removeItem(productId)

      // Krok 3: Synchronizacja
      const updatedCart = await cartService.getCart()
      setCart(updatedCart)
    }
    catch (error) {
      setError('Błąd podczas usuwania produktu')
      console.error('Failed to remove item:', error)
    }
  }

  /**
   * Handler: Czyszczenie koszyka
   */
  const handleClearCart = async () => {
    // Krok 1: Optymistyczna aktualizacja
    addOptimisticUpdate({ type: 'clear' })

    try {
      // Krok 2: API call
      await cartService.clearCart()

      // Krok 3: Synchronizacja
      setCart([])
    }
    catch (error) {
      setError('Błąd podczas czyszczenia koszyka')
      console.error('Failed to clear cart:', error)
    }
  }

  /**
   * Obliczenia - używają optimisticCart!
   *
   * WAŻNE: Obliczamy na optimisticCart (nie na cart)
   * - User widzi aktualizacje stanu natychmiastowo gdy zmienia quantity
   * - Jeśli polecenie API zawiedzie - optimisticCart cofa zmiany
   */
  const totalItems = optimisticCart.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = optimisticCart.reduce((sum, item) => sum + item.product.price * item.quantity, 0)

  return {
    // state
    cart: optimisticCart,
    isLoading,
    totalItems,
    totalPrice,
    // Actions
    handleUpdateQuantity,
    handleRemoveItem,
    handleClearCart,
  }
}
