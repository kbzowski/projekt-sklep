import { useEffect } from 'react'

import { useApp } from '../../context/AppContext'
import { useCart } from '../../hooks/useCart'
import { productService, categoryService } from '../../services'

export const useHomePage = () => {
  const { state, setProducts, setCategories, setLoading, setError } = useApp()
  const { products, isLoading } = state
  const { addToCart } = useCart()

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

  const featuredProducts = products.slice(0, 6)

  return {
    featuredProducts,
    isLoading,
    handleAddToCart: addToCart,
  }
}
