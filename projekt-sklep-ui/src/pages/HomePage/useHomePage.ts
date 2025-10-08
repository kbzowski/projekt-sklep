import { useEffect } from 'react'

import { useApp } from '../../context/AppContext'
import { productService, categoryService, cartService } from '../../services'
import type { Product } from '../../types'

export const useHomePage = () => {
  const { state, setProducts, setCategories, setLoading, setError, setCart } = useApp()
  const { products, isLoading } = state

  // Załaduj dane przy pierwszym renderze
  useEffect(() => {
    const loadData = async () => {
      if (products.length > 0) return // Już załadowane

      setLoading(true)
      setError(null)

      try {
        // Równoległe ładowanie produktów i kategorii
        const [featuredProducts, categories] = await Promise.all([
          productService.getFeaturedProducts(6),
          categoryService.getCategories(),
        ])

        setProducts(featuredProducts)
        setCategories(categories)
      }
      catch (error) {
        setError('Błąd podczas ładowania danych')
        console.error('Failed to load home page data:', error)
      }
      finally {
        setLoading(false)
      }
    }

    loadData()
  }, [products.length, setProducts, setCategories, setLoading, setError])

  const handleAddToCart = async (product: Product) => {
    try {
      await cartService.addToCart(product.id, 1)

      // Odśwież koszyk
      const cart = await cartService.getCart()
      setCart(cart)
    }
    catch (error) {
      setError('Błąd podczas dodawania do koszyka')
      console.error('Failed to add to cart:', error)
    }
  }

  const featuredProducts = products.slice(0, 6)

  return {
    featuredProducts,
    isLoading,
    handleAddToCart,
  }
}
