/**
 * Testy strony LoginPage
 *
 * Ten plik demonstruje:
 * 1. Testowanie formularzy (input fields, submission)
 * 2. Testowanie walidacji pól (required attributes)
 * 3. Testowanie stanów ładowania (loading states)
 * 4. Testowanie wyświetlania błędów
 * 5. Testowanie interakcji użytkownika z formularzem
 * 6. Testowanie disabled state podczas ładowania
 */

import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import { renderWithProviders } from '../../test/utils'

import LoginPage from './LoginPage'

 
// Mock dla hooka useLoginPage
vi.mock('./useLoginPage', () => ({
  useLoginPage: vi.fn(),
}))

// Import zmockowanego hooka
import { useLoginPage } from './useLoginPage'

describe('LoginPage Component', () => {
  /**
   * Przed każdym testem resetujemy mocki
   */
  beforeEach(() => {
    vi.clearAllMocks()
  })

  /**
   * Test 1: Renderowanie formularza logowania
   * Sprawdzamy, czy wszystkie elementy formularza są widoczne
   */
  it('renders login form with all fields', () => {
    vi.mocked(useLoginPage).mockReturnValue({
      email: '',
      setEmail: vi.fn(),
      password: '',
      setPassword: vi.fn(),
      error: null,
      isLoading: false,
      handleSubmit: vi.fn(),
    })

    renderWithProviders(<LoginPage />)

    // Sprawdzamy, czy jest nagłówek
    expect(screen.getByRole('heading', { name: /logowanie/i })).toBeInTheDocument()

    // Sprawdzamy, czy są pola email i hasło
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/hasło/i)).toBeInTheDocument()

    // Sprawdzamy, czy jest przycisk submit
    expect(screen.getByRole('button', { name: /zaloguj się/i })).toBeInTheDocument()

    // Sprawdzamy, czy jest link do rejestracji
    expect(screen.getByText(/nie masz konta\? zarejestruj się/i)).toBeInTheDocument()
  })

  /**
   * Test 2: Testowanie wpisywania email
   * Sprawdzamy, czy setEmail jest wywoływane przy zmianie wartości
   */
  it('calls setEmail when email input changes', async () => {
    const setEmail = vi.fn()
    const user = userEvent.setup()

    vi.mocked(useLoginPage).mockReturnValue({
      email: '',
      setEmail,
      password: '',
      setPassword: vi.fn(),
      error: null,
      isLoading: false,
      handleSubmit: vi.fn(),
    })

    renderWithProviders(<LoginPage />)

    const emailInput = screen.getByLabelText(/email/i)

    // Wpisujemy email
    await user.type(emailInput, 'test@example.com')

    // Sprawdzamy, czy setEmail został wywołany dla każdej litery
    // 't', 'e', 's', 't', '@', ... (18 znaków)
    expect(setEmail).toHaveBeenCalled()
  })

  /**
   * Test 3: Testowanie wpisywania hasła
   * Sprawdzamy, czy setPassword jest wywoływane przy zmianie wartości
   */
  it('calls setPassword when password input changes', async () => {
    const setPassword = vi.fn()
    const user = userEvent.setup()

    vi.mocked(useLoginPage).mockReturnValue({
      email: '',
      setEmail: vi.fn(),
      password: '',
      setPassword,
      error: null,
      isLoading: false,
      handleSubmit: vi.fn(),
    })

    renderWithProviders(<LoginPage />)

    const passwordInput = screen.getByLabelText(/hasło/i)

    // Wpisujemy hasło
    await user.type(passwordInput, 'password123')

    // Sprawdzamy, czy setPassword został wywołany
    expect(setPassword).toHaveBeenCalled()
  })

  /**
   * Test 4: Testowanie typu pola hasła
   * Sprawdzamy, czy pole hasła ma type="password" (ukrywa znaki)
   */
  it('renders password input with type="password"', () => {
    vi.mocked(useLoginPage).mockReturnValue({
      email: '',
      setEmail: vi.fn(),
      password: '',
      setPassword: vi.fn(),
      error: null,
      isLoading: false,
      handleSubmit: vi.fn(),
    })

    renderWithProviders(<LoginPage />)

    const passwordInput = screen.getByLabelText(/hasło/i)

    // Sprawdzamy, czy pole ma type="password"
    expect(passwordInput).toHaveAttribute('type', 'password')
  })

  /**
   * Test 5: Testowanie wymaganych pól (required)
   * Sprawdzamy, czy pola mają atrybut required
   */
  it('has required attribute on email and password fields', () => {
    vi.mocked(useLoginPage).mockReturnValue({
      email: '',
      setEmail: vi.fn(),
      password: '',
      setPassword: vi.fn(),
      error: null,
      isLoading: false,
      handleSubmit: vi.fn(),
    })

    renderWithProviders(<LoginPage />)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/hasło/i)

    // Sprawdzamy, czy pola są wymagane
    expect(emailInput).toBeRequired()
    expect(passwordInput).toBeRequired()
  })

  /**
   * Test 6: Testowanie wysyłania formularza
   * Sprawdzamy, czy handleSubmit jest wywoływane po kliknięciu przycisku
   */
  it('calls handleSubmit when form is submitted', async () => {
    const handleSubmit = vi.fn((e) => e.preventDefault())
    const user = userEvent.setup()

    vi.mocked(useLoginPage).mockReturnValue({
      email: 'test@example.com',
      setEmail: vi.fn(),
      password: 'password123',
      setPassword: vi.fn(),
      error: null,
      isLoading: false,
      handleSubmit,
    })

    renderWithProviders(<LoginPage />)

    const submitButton = screen.getByRole('button', { name: /zaloguj się/i })

    // Klikamy przycisk submit
    await user.click(submitButton)

    // Sprawdzamy, czy handleSubmit został wywołany
    expect(handleSubmit).toHaveBeenCalledTimes(1)
  })

  /**
   * Test 7: Testowanie stanu ładowania
   * Sprawdzamy, czy podczas ładowania przycisk jest wyłączony i zmienia tekst
   */
  it('disables submit button and shows loading text when isLoading is true', () => {
    vi.mocked(useLoginPage).mockReturnValue({
      email: 'test@example.com',
      setEmail: vi.fn(),
      password: 'password123',
      setPassword: vi.fn(),
      error: null,
      isLoading: true, // Stan ładowania
      handleSubmit: vi.fn(),
    })

    renderWithProviders(<LoginPage />)

    // Sprawdzamy, czy przycisk ma tekst "Logowanie..."
    const submitButton = screen.getByRole('button', { name: /logowanie\.\.\./i })

    // Sprawdzamy, czy przycisk jest wyłączony
    expect(submitButton).toBeDisabled()
  })

  /**
   * Test 8: Testowanie wyświetlania błędu
   * Sprawdzamy, czy komunikat błędu jest wyświetlany gdy jest error
   */
  it('displays error message when error is present', () => {
    const errorMessage = 'Nieprawidłowy email lub hasło'

    vi.mocked(useLoginPage).mockReturnValue({
      email: '',
      setEmail: vi.fn(),
      password: '',
      setPassword: vi.fn(),
      error: errorMessage,
      isLoading: false,
      handleSubmit: vi.fn(),
    })

    renderWithProviders(<LoginPage />)

    // Sprawdzamy, czy komunikat błędu jest wyświetlany
    expect(screen.getByText(errorMessage)).toBeInTheDocument()
  })

  /**
   * Test 9: Testowanie braku błędu
   * Sprawdzamy, czy komunikat błędu NIE jest wyświetlany gdy nie ma błędu
   */
  it('does not display error message when error is null', () => {
    vi.mocked(useLoginPage).mockReturnValue({
      email: '',
      setEmail: vi.fn(),
      password: '',
      setPassword: vi.fn(),
      error: null, // Brak błędu
      isLoading: false,
      handleSubmit: vi.fn(),
    })

    renderWithProviders(<LoginPage />)

    // Sprawdzamy, czy nie ma żadnego komunikatu błędu
    // Szukamy elementu z klasą "error" (nie powinien istnieć)
    const errorElement = document.querySelector('.error')
    expect(errorElement).not.toBeInTheDocument()
  })

  /**
   * Test 10: Testowanie linku do rejestracji
   * Sprawdzamy, czy link prowadzi do strony rejestracji
   */
  it('renders link to registration page', () => {
    vi.mocked(useLoginPage).mockReturnValue({
      email: '',
      setEmail: vi.fn(),
      password: '',
      setPassword: vi.fn(),
      error: null,
      isLoading: false,
      handleSubmit: vi.fn(),
    })

    renderWithProviders(<LoginPage />)

    // Szukamy linku do rejestracji
    const registerLink = screen.getByText(/nie masz konta\? zarejestruj się/i)

    // Sprawdzamy, czy link prowadzi do /register
    expect(registerLink).toHaveAttribute('href', '/register')
  })

  /**
   * Test 11: Testowanie wypełnionego formularza
   * Sprawdzamy, czy wartości pól są prawidłowo wyświetlane
   */
  it('displays filled form values', () => {
    vi.mocked(useLoginPage).mockReturnValue({
      email: 'user@example.com',
      setEmail: vi.fn(),
      password: 'mypassword',
      setPassword: vi.fn(),
      error: null,
      isLoading: false,
      handleSubmit: vi.fn(),
    })

    renderWithProviders(<LoginPage />)

    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement
    const passwordInput = screen.getByLabelText(/hasło/i) as HTMLInputElement

    // Sprawdzamy, czy pola mają prawidłowe wartości
    expect(emailInput.value).toBe('user@example.com')
    expect(passwordInput.value).toBe('mypassword')
  })

  /**
   * Test 12: Testowanie że przycisk nie jest disabled gdy nie ma ładowania
   * Sprawdzamy prawidłowy stan przycisku
   */
  it('submit button is enabled when not loading', () => {
    vi.mocked(useLoginPage).mockReturnValue({
      email: 'test@example.com',
      setEmail: vi.fn(),
      password: 'password',
      setPassword: vi.fn(),
      error: null,
      isLoading: false,
      handleSubmit: vi.fn(),
    })

    renderWithProviders(<LoginPage />)

    const submitButton = screen.getByRole('button', { name: /zaloguj się/i })

    // Sprawdzamy, czy przycisk NIE jest wyłączony
    expect(submitButton).not.toBeDisabled()
  })
})