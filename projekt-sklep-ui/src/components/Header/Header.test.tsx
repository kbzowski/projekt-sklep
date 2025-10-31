/**
 * Testy komponentu Header
 *
 * Ten plik demonstruje:
 * 1. Testowanie komponentu z kontekstem (AppContext)
 * 2. Testowanie routingu React Router (NavLink, Link)
 * 3. Testowanie warunkowego renderowania (zalogowany/niezalogowany)
 * 4. Testowanie dynamicznych danych (licznik koszyka)
 * 5. Testowanie interakcji użytkownika (wylogowanie)
 * 6. Testowanie dostępności (aria-labels)
 */

import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import Header from './Header'
import { useApp } from '../../context/AppContext'
import { authService } from '../../services'
import { renderWithProviders } from '../../test/utils'
import type { User, CartItem, Product } from '../../types'

// Mock dla useApp - dzięki temu kontrolujemy dane testowe
// Używamy importOriginal aby zachować AppProvider dla renderWithProviders
vi.mock('../../context/AppContext', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../context/AppContext')>()
  return {
    ...actual,
    useApp: vi.fn(),
  }
})

// Mock dla authService - kontrolujemy wywołania API
// Używamy importOriginal aby zachować inne serwisy
vi.mock('../../services', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../services')>()
  return {
    ...actual,
    authService: {
      ...actual.authService,
      logout: vi.fn(),
    },
  }
})

// Mock dla react-router-dom navigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ pathname: '/' }),
  }
})

describe('Header Component', () => {
  // Mock użytkownika
  const mockUser: User = {
    id: 1,
    email: 'test@example.com',
    name: 'Jan Kowalski',
  }

  // Mock produktu dla koszyka
  const mockProduct: Product = {
    id: 1,
    name: 'Test Product',
    price: 99.99,
    category: 'Electronics',
    categoryId: 1,
    image: '/test.jpg',
    description: 'Test',
  }

  // Mock koszyka z produktami
  const mockCart: CartItem[] = [
    { product: mockProduct, quantity: 2 },
    { product: { ...mockProduct, id: 2 }, quantity: 1 },
  ]

  // Mock setterów kontekstu
  const mockSetUser = vi.fn()
  const mockSetCart = vi.fn()

  /**
   * Przed każdym testem resetujemy mocki
   */
  beforeEach(() => {
    vi.clearAllMocks()
  })

  /**
   * Test 1: Renderowanie dla niezalogowanego użytkownika
   * Sprawdzamy, czy wyświetlają się linki "Logowanie" i "Rejestracja"
   */
  it('renders login and register links when user is not logged in', () => {
    // Mockujemy useApp zwracający brak użytkownika
    vi.mocked(useApp).mockReturnValue({
      state: {
        user: null,
        cart: [],
        products: [],
        categories: [],
        currentCategory: null,
        sortBy: 'name',
        searchQuery: '',
        currentPage: 1,
        itemsPerPage: 6,
        totalPages: 1,
        totalProducts: 0,
        isLoading: false,
        error: null,
      },
      setUser: mockSetUser,
      setCart: mockSetCart,
      setProducts: vi.fn(),
      setCategories: vi.fn(),
      setLoading: vi.fn(),
      setError: vi.fn(),
      setCategoryFilter: vi.fn(),
      setSortBy: vi.fn(),
      setSearchQuery: vi.fn(),
      setPage: vi.fn(),
      setPagination: vi.fn(),
    })

    renderWithProviders(<Header />)

    // Sprawdzamy, czy są linki do logowania i rejestracji
    expect(screen.getByText('Logowanie')).toBeInTheDocument()
    expect(screen.getByText('Rejestracja')).toBeInTheDocument()

    // Sprawdzamy, czy NIE ma przycisku wylogowania
    expect(screen.queryByText('Wyloguj')).not.toBeInTheDocument()

    // Sprawdzamy, czy NIE ma powitania użytkownika
    expect(screen.queryByText(/Witaj,/)).not.toBeInTheDocument()
  })

  /**
   * Test 2: Renderowanie dla zalogowanego użytkownika
   * Sprawdzamy, czy wyświetla się powitanie i przycisk wylogowania
   */
  it('renders user greeting and logout button when user is logged in', () => {
    vi.mocked(useApp).mockReturnValue({
      state: {
        user: mockUser,
        cart: [],
        products: [],
        categories: [],
        currentCategory: null,
        sortBy: 'name',
        searchQuery: '',
        currentPage: 1,
        itemsPerPage: 6,
        totalPages: 1,
        totalProducts: 0,
        isLoading: false,
        error: null,
      },
      setUser: mockSetUser,
      setCart: mockSetCart,
      setProducts: vi.fn(),
      setCategories: vi.fn(),
      setLoading: vi.fn(),
      setError: vi.fn(),
      setCategoryFilter: vi.fn(),
      setSortBy: vi.fn(),
      setSearchQuery: vi.fn(),
      setPage: vi.fn(),
      setPagination: vi.fn(),
    })

    renderWithProviders(<Header />)

    // Sprawdzamy, czy wyświetla się powitanie z imieniem użytkownika
    expect(screen.getByText(/Witaj, Jan Kowalski!/)).toBeInTheDocument()

    // Sprawdzamy, czy jest przycisk wylogowania
    expect(screen.getByRole('button', { name: /wyloguj/i })).toBeInTheDocument()

    // Sprawdzamy, czy NIE MA linków logowania i rejestracji
    expect(screen.queryByText('Logowanie')).not.toBeInTheDocument()
    expect(screen.queryByText('Rejestracja')).not.toBeInTheDocument()
  })

  /**
   * Test 3: Testowanie logo i linku do strony głównej
   * Sprawdzamy, czy logo linkuje do strony głównej
   */
  it('renders logo with link to home page', () => {
    vi.mocked(useApp).mockReturnValue({
      state: {
        user: null,
        cart: [],
        products: [],
        categories: [],
        currentCategory: null,
        sortBy: 'name',
        searchQuery: '',
        currentPage: 1,
        itemsPerPage: 6,
        totalPages: 1,
        totalProducts: 0,
        isLoading: false,
        error: null,
      },
      setUser: mockSetUser,
      setCart: mockSetCart,
      setProducts: vi.fn(),
      setCategories: vi.fn(),
      setLoading: vi.fn(),
      setError: vi.fn(),
      setCategoryFilter: vi.fn(),
      setSortBy: vi.fn(),
      setSearchQuery: vi.fn(),
      setPage: vi.fn(),
      setPagination: vi.fn(),
    })

    renderWithProviders(<Header />)

    // Szukamy linka do strony głównej po etykiecie
    const logoLink = screen.getByLabelText('Wróć do strony głównej')

    expect(logoLink).toBeInTheDocument()
    expect(logoLink).toHaveAttribute('href', '/')
    expect(logoLink).toHaveTextContent('E-Zaliczenie')
  })

  /**
   * Test 4: Testowanie linków nawigacyjnych
   * Sprawdzamy, czy wyświetlają się linki "Strona Główna" i "Produkty"
   */
  it('renders navigation links', () => {
    vi.mocked(useApp).mockReturnValue({
      state: {
        user: null,
        cart: [],
        products: [],
        categories: [],
        currentCategory: null,
        sortBy: 'name',
        searchQuery: '',
        currentPage: 1,
        itemsPerPage: 6,
        totalPages: 1,
        totalProducts: 0,
        isLoading: false,
        error: null,
      },
      setUser: mockSetUser,
      setCart: mockSetCart,
      setProducts: vi.fn(),
      setCategories: vi.fn(),
      setLoading: vi.fn(),
      setError: vi.fn(),
      setCategoryFilter: vi.fn(),
      setSortBy: vi.fn(),
      setSearchQuery: vi.fn(),
      setPage: vi.fn(),
      setPagination: vi.fn(),
    })

    renderWithProviders(<Header />)

    // Sprawdzamy, czy są podstawowe linki nawigacyjne
    expect(screen.getByText('Strona Główna')).toBeInTheDocument()
    expect(screen.getByText('Produkty')).toBeInTheDocument()
  })

  /**
   * Test 5: Testowanie licznika koszyka (pusty koszyk)
   * Sprawdzamy, czy przycisk koszyka jest widoczny, ale bez licznika
   */
  it('renders cart button without badge when cart is empty', () => {
    vi.mocked(useApp).mockReturnValue({
      state: {
        user: mockUser,
        cart: [],
        products: [],
        categories: [],
        currentCategory: null,
        sortBy: 'name',
        searchQuery: '',
        currentPage: 1,
        itemsPerPage: 6,
        totalPages: 1,
        totalProducts: 0,
        isLoading: false,
        error: null,
      },
      setUser: mockSetUser,
      setCart: mockSetCart,
      setProducts: vi.fn(),
      setCategories: vi.fn(),
      setLoading: vi.fn(),
      setError: vi.fn(),
      setCategoryFilter: vi.fn(),
      setSortBy: vi.fn(),
      setSearchQuery: vi.fn(),
      setPage: vi.fn(),
      setPagination: vi.fn(),
    })

    renderWithProviders(<Header />)

    // Sprawdzamy, czy jest przycisk "Koszyk"
    const cartButtons = screen.getAllByText('Koszyk')
    expect(cartButtons.length).toBeGreaterThan(0)

    // Sprawdzamy, czy NIE MA licznika (badge)
    expect(screen.queryByLabelText(/przedmiotów w koszyku/)).not.toBeInTheDocument()
  })

  /**
   * Test 6: Testowanie licznika koszyka z produktami
   * Sprawdzamy, czy licznik pokazuje prawidłową sumę ilości
   */
  it('renders cart button with correct items count', () => {
    vi.mocked(useApp).mockReturnValue({
      state: {
        user: mockUser,
        cart: mockCart, // 2 + 1 = 3 przedmioty
        products: [],
        categories: [],
        currentCategory: null,
        sortBy: 'name',
        searchQuery: '',
        currentPage: 1,
        itemsPerPage: 6,
        totalPages: 1,
        totalProducts: 0,
        isLoading: false,
        error: null,
      },
      setUser: mockSetUser,
      setCart: mockSetCart,
      setProducts: vi.fn(),
      setCategories: vi.fn(),
      setLoading: vi.fn(),
      setError: vi.fn(),
      setCategoryFilter: vi.fn(),
      setSortBy: vi.fn(),
      setSearchQuery: vi.fn(),
      setPage: vi.fn(),
      setPagination: vi.fn(),
    })

    renderWithProviders(<Header />)

    // Sprawdzamy, czy licznik pokazuje "3" (suma ilości w koszyku)
    expect(screen.getByText('3')).toBeInTheDocument()

    // Sprawdzamy aria-label dla dostępności
    expect(screen.getByLabelText('3 przedmiotów w koszyku')).toBeInTheDocument()
  })

  /**
   * Test 7: Testowanie wylogowania
   * Sprawdzamy, czy kliknięcie "Wyloguj" wywołuje funkcje logout, setUser, setCart i navigate
   */
  it('calls logout, clears state and navigates when logout button is clicked', async () => {
    const user = userEvent.setup()
    vi.mocked(authService.logout).mockResolvedValue()

    vi.mocked(useApp).mockReturnValue({
      state: {
        user: mockUser,
        cart: [],
        products: [],
        categories: [],
        currentCategory: null,
        sortBy: 'name',
        searchQuery: '',
        currentPage: 1,
        itemsPerPage: 6,
        totalPages: 1,
        totalProducts: 0,
        isLoading: false,
        error: null,
      },
      setUser: mockSetUser,
      setCart: mockSetCart,
      setProducts: vi.fn(),
      setCategories: vi.fn(),
      setLoading: vi.fn(),
      setError: vi.fn(),
      setCategoryFilter: vi.fn(),
      setSortBy: vi.fn(),
      setSearchQuery: vi.fn(),
      setPage: vi.fn(),
      setPagination: vi.fn(),
    })

    renderWithProviders(<Header />)

    // Szukamy przycisku wylogowania
    const logoutButton = screen.getByRole('button', { name: /wyloguj/i })

    // Klikamy przycisk
    await user.click(logoutButton)

    // Sprawdzamy, czy authService.logout został wywołany
    expect(authService.logout).toHaveBeenCalledTimes(1)

    // Sprawdzamy, czy stan został wyczyszczony
    expect(mockSetUser).toHaveBeenCalledWith(null)
    expect(mockSetCart).toHaveBeenCalledWith([])

    // Sprawdzamy, czy nastąpiło przekierowanie do /login
    expect(mockNavigate).toHaveBeenCalledWith(
      '/login',
      expect.objectContaining({
        state: { from: '/' },
        replace: true,
      }),
    )
  })

  /**
   * Test 8: Testowanie dostępu do koszyka dla niezalogowanego użytkownika
   * Sprawdzamy, czy koszyk linkuje do strony logowania
   */
  it('redirects to login page when unauthenticated user clicks cart', () => {
    vi.mocked(useApp).mockReturnValue({
      state: {
        user: null,
        cart: [],
        products: [],
        categories: [],
        currentCategory: null,
        sortBy: 'name',
        searchQuery: '',
        currentPage: 1,
        itemsPerPage: 6,
        totalPages: 1,
        totalProducts: 0,
        isLoading: false,
        error: null,
      },
      setUser: mockSetUser,
      setCart: mockSetCart,
      setProducts: vi.fn(),
      setCategories: vi.fn(),
      setLoading: vi.fn(),
      setError: vi.fn(),
      setCategoryFilter: vi.fn(),
      setSortBy: vi.fn(),
      setSearchQuery: vi.fn(),
      setPage: vi.fn(),
      setPagination: vi.fn(),
    })

    renderWithProviders(<Header />)

    // Szukamy linku do koszyka
    const cartLink = screen.getByLabelText(/zaloguj się, aby uzyskać dostęp do koszyka/i)

    // Sprawdzamy, czy linkuje do strony logowania
    expect(cartLink).toHaveAttribute('href', '/login')
  })

  /**
   * Test 9: Testowanie dostępu do koszyka dla zalogowanego użytkownika
   * Sprawdzamy, czy koszyk linkuje bezpośrednio do strony koszyka
   */
  it('links to cart page when user is logged in', () => {
    vi.mocked(useApp).mockReturnValue({
      state: {
        user: mockUser,
        cart: mockCart,
        products: [],
        categories: [],
        currentCategory: null,
        sortBy: 'name',
        searchQuery: '',
        currentPage: 1,
        itemsPerPage: 6,
        totalPages: 1,
        totalProducts: 0,
        isLoading: false,
        error: null,
      },
      setUser: mockSetUser,
      setCart: mockSetCart,
      setProducts: vi.fn(),
      setCategories: vi.fn(),
      setLoading: vi.fn(),
      setError: vi.fn(),
      setCategoryFilter: vi.fn(),
      setSortBy: vi.fn(),
      setSearchQuery: vi.fn(),
      setPage: vi.fn(),
      setPagination: vi.fn(),
    })

    renderWithProviders(<Header />)

    // Szukamy linku do koszyka z aria-label zawierającym liczbę przedmiotów
    const cartLink = screen.getByLabelText(/koszyk \(3 przedmiotów\)/i)

    // Sprawdzamy, czy linkuje bezpośrednio do koszyka
    expect(cartLink).toHaveAttribute('href', '/cart')
  })

  /**
   * Test 10: Testowanie aria-labels dla dostępności
   * Sprawdzamy, czy komponent ma odpowiednie etykiety dla screen readerów
   */
  it('has proper accessibility labels', () => {
    vi.mocked(useApp).mockReturnValue({
      state: {
        user: mockUser,
        cart: mockCart,
        products: [],
        categories: [],
        currentCategory: null,
        sortBy: 'name',
        searchQuery: '',
        currentPage: 1,
        itemsPerPage: 6,
        totalPages: 1,
        totalProducts: 0,
        isLoading: false,
        error: null,
      },
      setUser: mockSetUser,
      setCart: mockSetCart,
      setProducts: vi.fn(),
      setCategories: vi.fn(),
      setLoading: vi.fn(),
      setError: vi.fn(),
      setCategoryFilter: vi.fn(),
      setSortBy: vi.fn(),
      setSearchQuery: vi.fn(),
      setPage: vi.fn(),
      setPagination: vi.fn(),
    })

    renderWithProviders(<Header />)

    // Sprawdzamy aria-labels
    expect(screen.getByLabelText('Wróć do strony głównej')).toBeInTheDocument()
    expect(screen.getByLabelText(/koszyk \(3 przedmiotów\)/i)).toBeInTheDocument()
    expect(screen.getByLabelText('Wyloguj się z konta')).toBeInTheDocument()
  })
})
