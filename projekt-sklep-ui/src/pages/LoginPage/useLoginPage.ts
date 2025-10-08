import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

import { useApp } from '../../context/AppContext'
import { ROUTES } from '../../lib/routes'
import { authService, cartService } from '../../services'

/**
 * useLoginPage - custom hook orkiestrujący logikę strony logowania
 *
 * Odpowiedzialności:
 * 1. Zarządzanie stanem formularza (email, password, error, loading)
 * 2. Obsługa procesu logowania (4-krokowy flow)
 * 3. Implementacja "intended destination" pattern
 * 4. Error handling
 *
 * Pattern "Intended Destination":
 * Jeśli user próbował wejść na chronioną stronę (np. /cart) bez logowania,
 * ProtectedRoute zapisał ją w location.state.from.
 * Po zalogowaniu przekierowujemy go tam, zamiast na home page.
 */
export const useLoginPage = () => {
  // Stan lokalny formularza (nie w Context - nie jest globalny)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>('')
  const [isLoading, setIsLoading] = useState(false)

  const { setUser, setCart } = useApp()
  const navigate = useNavigate()
  const location = useLocation()

  /**
   * Odczytanie "intended destination" z location.state
   * Ustawione przez ProtectedRoute gdy user próbował wejść na chronioną stronę
   * Domyślnie: ROUTES.HOME jeśli brak state.from
   */
  const from = location.state?.from || ROUTES.HOME

  /**
   * Handler: Submit formularza logowania
   *
   * 4-krokowy flow logowania:
   * 1. Wywołaj POST /auth/login (email, password)
   *    Backend zwraca tokeny jako httpOnly cookies
   * 2. Pobierz dane zalogowanego użytkownika GET /auth/me
   *    Zapisz w Context (setUser)
   * 3. Pobierz koszyk użytkownika GET /cart
   *    Zapisz w Context (setCart)
   * 4. Przekieruj na intended destination (lub home page)
   *    replace: true → nie dodaje wpisu do historii (nie można "cofnąć" do /login)
   *
   * Error handling:
   * - Błąd logowania (401) → "Nieprawidłowy email lub hasło"
   * - Błąd koszyka → ignoruj (koszyk może być pusty), ustaw []
   *
   * Loading state:
   * - setIsLoading(true) przed fetch
   * - setIsLoading(false) w finally (zawsze wykonane)
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // Krok 1: Logowanie - ustaw tokeny (httpOnly cookies)
      await authService.login(email, password)

      // Krok 2: Pobierz dane użytkownika
      const user = await authService.getCurrentUser()
      setUser(user)

      // Krok 3: Załaduj koszyk użytkownika
      try {
        const cart = await cartService.getCart()
        setCart(cart)
      }
      catch {
        // Koszyk może być pusty - nie jest błędem
        setCart([])
      }

      // Krok 4: Przekieruj na intended destination
      // replace: true → usuwa /login z historii, zapobiega pętli nawigacji
      navigate(from, { replace: true })
    }
    catch {
      setError('Nieprawidłowy email lub hasło')
    }
    finally {
      setIsLoading(false)
    }
  }

  /**
   * Return: API hooka - stan formularza i handler submit
   * Komponent LoginPage.tsx otrzymuje gotowy interfejs do budowy formularza
   */
  return {
    // Form state
    email,
    setEmail,
    password,
    setPassword,
    error,
    isLoading,
    // Actions
    handleSubmit,
  }
}
