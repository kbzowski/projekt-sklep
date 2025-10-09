/**
 * Testy komponentu ProductCard
 *
 * Ten plik demonstruje:
 * 1. Testowanie komponentu z mockowanymi danymi
 * 2. Testowanie renderowania złożonych struktur (tekst, obrazy, ceny)
 * 3. Testowanie interakcji z funkcjami callback (onAddToCart)
 * 4. Testowanie formatowania danych (ceny)
 * 5. Testowanie obrazów z fallback (placeholder)
 */

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'

import ProductCard from './ProductCard'
import type { Product } from '../../types'



describe('ProductCard Component', () => {
  /**
   * Mock product data - przykładowe dane produktu do testów
   * W prawdziwej aplikacji takie dane przychodzą z API
   */
  const mockProduct: Product = {
    id: 1,
    name: 'Test Product',
    price: 99.99,
    category: 'Electronics',
    categoryId: 1,
    image: '/test-image.jpg',
    description: 'This is a test product description',
  }

  /**
   * Test 1: Renderowanie wszystkich informacji o produkcie
   * Sprawdzamy, czy wszystkie dane produktu są wyświetlane
   */
  it('renders product information correctly', () => {
    const handleAddToCart = vi.fn()

    render(<ProductCard product={mockProduct} onAddToCart={handleAddToCart} />)

    // Sprawdzamy, czy nazwa produktu jest wyświetlana
    expect(screen.getByText('Test Product')).toBeInTheDocument()

    // Sprawdzamy, czy kategoria jest wyświetlana
    expect(screen.getByText('Electronics')).toBeInTheDocument()

    // Sprawdzamy, czy opis jest wyświetlany
    expect(screen.getByText('This is a test product description')).toBeInTheDocument()

    // Sprawdzamy, czy cena jest wyświetlana z formatowaniem (2 miejsca po przecinku)
    // Używamy regex, bo cena może być rozdzielona na osobne węzły tekstowe
    expect(screen.getByText(/99\.99/)).toBeInTheDocument()
    expect(screen.getByText(/zł/)).toBeInTheDocument()
  })

  /**
   * Test 2: Testowanie obrazu produktu
   * Sprawdzamy, czy obraz ma prawidłowy src i alt
   */
  it('renders product image with correct src and alt', () => {
    const handleAddToCart = vi.fn()

    render(<ProductCard product={mockProduct} onAddToCart={handleAddToCart} />)

    // Szukamy obrazu po alt text
    const image = screen.getByAltText('Test Product')

    // Sprawdzamy, czy obraz ma prawidłowy src
    expect(image).toHaveAttribute('src', '/test-image.jpg')
  })

  /**
   * Test 3: Testowanie fallback obrazu (placeholder)
   * Sprawdzamy, czy gdy produkt nie ma obrazu, wyświetlany jest placeholder
   */
  it('renders placeholder image when product has no image', () => {
    const productWithoutImage: Product = {
      ...mockProduct,
      image: '', // Pusty string dla obrazu
    }

    const handleAddToCart = vi.fn()

    render(<ProductCard product={productWithoutImage} onAddToCart={handleAddToCart} />)

    const image = screen.getByAltText('Test Product')

    // Sprawdzamy, czy użyty jest placeholder
    expect(image).toHaveAttribute('src', '/placeholder.svg')
  })

  /**
   * Test 4: Testowanie przycisku "Dodaj do koszyka"
   * Sprawdzamy, czy przycisk wywołuje funkcję onAddToCart z właściwym produktem
   */
  it('calls onAddToCart with product when "Dodaj do koszyka" is clicked', async () => {
    const handleAddToCart = vi.fn()
    const user = userEvent.setup()

    render(<ProductCard product={mockProduct} onAddToCart={handleAddToCart} />)

    // Szukamy przycisku "Dodaj do koszyka"
    const addButton = screen.getByRole('button', { name: /dodaj do koszyka/i })

    // Klikamy przycisk
    await user.click(addButton)

    // Sprawdzamy, czy funkcja została wywołana raz
    expect(handleAddToCart).toHaveBeenCalledTimes(1)

    // Sprawdzamy, czy funkcja została wywołana z właściwym produktem
    expect(handleAddToCart).toHaveBeenCalledWith(mockProduct)
  })

  /**
   * Test 5: Testowanie formatowania ceny
   * Sprawdzamy, czy cena jest zawsze wyświetlana z 2 miejscami po przecinku
   */
  it('formats price with two decimal places', () => {
    const productWithRoundPrice: Product = {
      ...mockProduct,
      price: 100, // Cena bez miejsc po przecinku
    }

    const handleAddToCart = vi.fn()

    render(<ProductCard product={productWithRoundPrice} onAddToCart={handleAddToCart} />)

    // Sprawdzamy, czy cena jest wyświetlana jako "100.00" (a nie "100")
    expect(screen.getByText(/100\.00/)).toBeInTheDocument()
  })

  /**
   * Test 6: Testowanie różnych produktów
   * Sprawdzamy, czy komponent poprawnie renderuje różne produkty
   */
  it('renders different products correctly', () => {
    const anotherProduct: Product = {
      id: 2,
      name: 'Another Product',
      price: 49.5,
      category: 'Books',
      categoryId: 2,
      image: '/another-image.jpg',
      description: 'Another description',
    }

    const handleAddToCart = vi.fn()

    render(<ProductCard product={anotherProduct} onAddToCart={handleAddToCart} />)

    expect(screen.getByText('Another Product')).toBeInTheDocument()
    expect(screen.getByText('Books')).toBeInTheDocument()
    expect(screen.getByText('Another description')).toBeInTheDocument()
    expect(screen.getByText(/49\.50/)).toBeInTheDocument()
  })

  /**
   * Test 7: Testowanie wielokrotnego dodawania do koszyka
   * Sprawdzamy, czy możemy wielokrotnie kliknąć "Dodaj do koszyka"
   */
  it('allows adding product to cart multiple times', async () => {
    const handleAddToCart = vi.fn()
    const user = userEvent.setup()

    render(<ProductCard product={mockProduct} onAddToCart={handleAddToCart} />)

    const addButton = screen.getByRole('button', { name: /dodaj do koszyka/i })

    // Klikamy 3 razy
    await user.click(addButton)
    await user.click(addButton)
    await user.click(addButton)

    // Funkcja powinna zostać wywołana 3 razy
    expect(handleAddToCart).toHaveBeenCalledTimes(3)

    // Za każdym razem z tym samym produktem
    expect(handleAddToCart).toHaveBeenCalledWith(mockProduct)
  })
})