import {useEffect} from 'react'

import {useApp} from '../../context/AppContext'
import {cartService} from '../../services'

export const useCartPage = () => {
  const { state, setCart, setLoading, setError } = useApp()
  const { cart, isLoading } = state


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

    loadCart()
  }, [setCart, setLoading, setError])

  const handleUpdateQuantity = async (productId: number, quantity: number) => {
    try {
      await cartService.updateQuantity(productId, quantity)

      // Odśwież koszyk
      const updatedCart = await cartService.getCart()
      setCart(updatedCart)
    }
    catch (error) {
      setError('Błąd podczas aktualizacji ilości')
      console.error('Failed to update quantity:', error)
    }
  }

  const handleRemoveItem = async (productId: number) => {
    try {
      await cartService.removeItem(productId)

      // Odśwież koszyk
      const updatedCart = await cartService.getCart()
      setCart(updatedCart)
    }
    catch (error) {
      setError('Błąd podczas usuwania produktu')
      console.error('Failed to remove item:', error)
    }
  }

  const handleClearCart = async () => {
    try {
      await cartService.clearCart()
      setCart([])
    }
    catch (error) {
      setError('Błąd podczas czyszczenia koszyka')
      console.error('Failed to clear cart:', error)
    }
  }

  // Obliczenia
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0)

  return {
    // State
    cart,
    isLoading,
    totalItems,
    totalPrice,
    // Actions
    handleUpdateQuantity,
    handleRemoveItem,
    handleClearCart,
  }
}
