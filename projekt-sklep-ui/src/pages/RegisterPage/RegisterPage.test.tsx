/**
 * Testy strony RegisterPage
 *
 * Ten plik demonstruje:
 * 1. Testowanie formularza rejestracji z wieloma polami
 * 2. Testowanie walidacji różnych typów pól (text, email, password)
 * 3. Testowanie stanów ładowania i błędów
 * 4. Testowanie nawigacji między stronami (link do logowania)
 * 5. Podobieństwa i różnice z testowaniem LoginPage
 */
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import RegisterPage from './RegisterPage'
import { useRegisterPage } from './useRegisterPage'
import { renderWithProviders } from '../../test/utils'

// Mock dla hooka useRegisterPage
vi.mock('./useRegisterPage', () => ({
  useRegisterPage: vi.fn(),
}))

describe('RegisterPage Component', () => {
  /**
   * Przed każdym testem resetujemy mocki
   */
  beforeEach(() => {
    vi.clearAllMocks()
  })

  /**
   * Test 1: Renderowanie formularza rejestracji
   * Sprawdzamy, czy wszystkie elementy formularza są widoczne
   */
  it('renders registration form with all fields', () => {
    vi.mocked(useRegisterPage).mockReturnValue({
      name: '',
      setName: vi.fn(),
      email: '',
      setEmail: vi.fn(),
      password: '',
      setPassword: vi.fn(),
      error: null,
      isLoading: false,
      handleSubmit: vi.fn(),
    })

    renderWithProviders(<RegisterPage />)

    // Sprawdzamy, czy jest nagłówek
    expect(screen.getByRole('heading', { name: /rejestracja/i })).toBeInTheDocument()

    // Sprawdzamy, czy są wszystkie pola formularza
    expect(screen.getByLabelText(/imię i nazwisko/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/hasło/i)).toBeInTheDocument()

    // Sprawdzamy, czy jest przycisk submit
    expect(screen.getByRole('button', { name: /zarejestruj się/i })).toBeInTheDocument()

    // Sprawdzamy, czy jest link do logowania
    expect(screen.getByText(/masz już konto\? zaloguj się/i)).toBeInTheDocument()
  })

  /**
   * Test 2: Testowanie wpisywania imienia i nazwiska
   * Sprawdzamy, czy setName jest wywoływane przy zmianie wartości
   */
  it('calls setName when name input changes', async () => {
    const setName = vi.fn()
    const user = userEvent.setup()

    vi.mocked(useRegisterPage).mockReturnValue({
      name: '',
      setName,
      email: '',
      setEmail: vi.fn(),
      password: '',
      setPassword: vi.fn(),
      error: null,
      isLoading: false,
      handleSubmit: vi.fn(),
    })

    renderWithProviders(<RegisterPage />)

    const nameInput = screen.getByLabelText(/imię i nazwisko/i)

    // Wpisujemy imię i nazwisko
    await user.type(nameInput, 'Jan Kowalski')

    // Sprawdzamy, czy setName został wywołany
    expect(setName).toHaveBeenCalled()
  })

  /**
   * Test 3: Testowanie wpisywania email
   * Sprawdzamy, czy setEmail jest wywoływane przy zmianie wartości
   */
  it('calls setEmail when email input changes', async () => {
    const setEmail = vi.fn()
    const user = userEvent.setup()

    vi.mocked(useRegisterPage).mockReturnValue({
      name: '',
      setName: vi.fn(),
      email: '',
      setEmail,
      password: '',
      setPassword: vi.fn(),
      error: null,
      isLoading: false,
      handleSubmit: vi.fn(),
    })

    renderWithProviders(<RegisterPage />)

    const emailInput = screen.getByLabelText(/email/i)

    // Wpisujemy email
    await user.type(emailInput, 'test@example.com')

    // Sprawdzamy, czy setEmail został wywołany
    expect(setEmail).toHaveBeenCalled()
  })

  /**
   * Test 4: Testowanie wpisywania hasła
   * Sprawdzamy, czy setPassword jest wywoływane przy zmianie wartości
   */
  it('calls setPassword when password input changes', async () => {
    const setPassword = vi.fn()
    const user = userEvent.setup()

    vi.mocked(useRegisterPage).mockReturnValue({
      name: '',
      setName: vi.fn(),
      email: '',
      setEmail: vi.fn(),
      password: '',
      setPassword,
      error: null,
      isLoading: false,
      handleSubmit: vi.fn(),
    })

    renderWithProviders(<RegisterPage />)

    const passwordInput = screen.getByLabelText(/hasło/i)

    // Wpisujemy hasło
    await user.type(passwordInput, 'password123')

    // Sprawdzamy, czy setPassword został wywołany
    expect(setPassword).toHaveBeenCalled()
  })

  /**
   * Test 5: Testowanie typów pól formularza
   * Sprawdzamy, czy pola mają prawidłowe typy HTML
   */
  it('renders inputs with correct types', () => {
    vi.mocked(useRegisterPage).mockReturnValue({
      name: '',
      setName: vi.fn(),
      email: '',
      setEmail: vi.fn(),
      password: '',
      setPassword: vi.fn(),
      error: null,
      isLoading: false,
      handleSubmit: vi.fn(),
    })

    renderWithProviders(<RegisterPage />)

    const nameInput = screen.getByLabelText(/imię i nazwisko/i)
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/hasło/i)

    // Sprawdzamy typy pól
    expect(nameInput).toHaveAttribute('type', 'text')
    expect(emailInput).toHaveAttribute('type', 'email')
    expect(passwordInput).toHaveAttribute('type', 'password')
  })

  /**
   * Test 6: Testowanie wymaganych pól (required)
   * Sprawdzamy, czy wszystkie pola mają atrybut required
   */
  it('has required attribute on all input fields', () => {
    vi.mocked(useRegisterPage).mockReturnValue({
      name: '',
      setName: vi.fn(),
      email: '',
      setEmail: vi.fn(),
      password: '',
      setPassword: vi.fn(),
      error: null,
      isLoading: false,
      handleSubmit: vi.fn(),
    })

    renderWithProviders(<RegisterPage />)

    const nameInput = screen.getByLabelText(/imię i nazwisko/i)
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/hasło/i)

    // Sprawdzamy, czy wszystkie pola są wymagane
    expect(nameInput).toBeRequired()
    expect(emailInput).toBeRequired()
    expect(passwordInput).toBeRequired()
  })

  /**
   * Test 7: Testowanie wysyłania formularza
   * Sprawdzamy, czy handleSubmit jest wywoływane po kliknięciu przycisku
   */
  it('calls handleSubmit when form is submitted', async () => {
    const handleSubmit = vi.fn((e) => e.preventDefault())
    const user = userEvent.setup()

    vi.mocked(useRegisterPage).mockReturnValue({
      name: 'Jan Kowalski',
      setName: vi.fn(),
      email: 'test@example.com',
      setEmail: vi.fn(),
      password: 'password123',
      setPassword: vi.fn(),
      error: null,
      isLoading: false,
      handleSubmit,
    })

    renderWithProviders(<RegisterPage />)

    const submitButton = screen.getByRole('button', { name: /zarejestruj się/i })

    // Klikamy przycisk submit
    await user.click(submitButton)

    // Sprawdzamy, czy handleSubmit został wywołany
    expect(handleSubmit).toHaveBeenCalledTimes(1)
  })

  /**
   * Test 8: Testowanie stanu ładowania
   * Sprawdzamy, czy podczas ładowania przycisk jest wyłączony i zmienia tekst
   */
  it('disables submit button and shows loading text when isLoading is true', () => {
    vi.mocked(useRegisterPage).mockReturnValue({
      name: 'Jan Kowalski',
      setName: vi.fn(),
      email: 'test@example.com',
      setEmail: vi.fn(),
      password: 'password123',
      setPassword: vi.fn(),
      error: null,
      isLoading: true, // Stan ładowania
      handleSubmit: vi.fn(),
    })

    renderWithProviders(<RegisterPage />)

    // Sprawdzamy, czy przycisk ma tekst "Rejestracja..."
    const submitButton = screen.getByRole('button', { name: /rejestracja\.\.\./i })

    // Sprawdzamy, czy przycisk jest wyłączony
    expect(submitButton).toBeDisabled()
  })

  /**
   * Test 9: Testowanie wyświetlania błędu
   * Sprawdzamy, czy komunikat błędu jest wyświetlany gdy jest error
   */
  it('displays error message when error is present', () => {
    const errorMessage = 'Ten email jest już zajęty'

    vi.mocked(useRegisterPage).mockReturnValue({
      name: '',
      setName: vi.fn(),
      email: '',
      setEmail: vi.fn(),
      password: '',
      setPassword: vi.fn(),
      error: errorMessage,
      isLoading: false,
      handleSubmit: vi.fn(),
    })

    renderWithProviders(<RegisterPage />)

    // Sprawdzamy, czy komunikat błędu jest wyświetlany
    expect(screen.getByText(errorMessage)).toBeInTheDocument()
  })

  /**
   * Test 10: Testowanie braku błędu
   * Sprawdzamy, czy komunikat błędu NIE jest wyświetlany gdy nie ma błędu
   */
  it('does not display error message when error is null', () => {
    vi.mocked(useRegisterPage).mockReturnValue({
      name: '',
      setName: vi.fn(),
      email: '',
      setEmail: vi.fn(),
      password: '',
      setPassword: vi.fn(),
      error: null, // Brak błędu
      isLoading: false,
      handleSubmit: vi.fn(),
    })

    renderWithProviders(<RegisterPage />)

    // Sprawdzamy, czy nie ma żadnego komunikatu błędu
    const errorElement = document.querySelector('.error')
    expect(errorElement).not.toBeInTheDocument()
  })

  /**
   * Test 11: Testowanie linku do logowania
   * Sprawdzamy, czy link prowadzi do strony logowania
   */
  it('renders link to login page', () => {
    vi.mocked(useRegisterPage).mockReturnValue({
      name: '',
      setName: vi.fn(),
      email: '',
      setEmail: vi.fn(),
      password: '',
      setPassword: vi.fn(),
      error: null,
      isLoading: false,
      handleSubmit: vi.fn(),
    })

    renderWithProviders(<RegisterPage />)

    // Szukamy linku do logowania
    const loginLink = screen.getByText(/masz już konto\? zaloguj się/i)

    // Sprawdzamy, czy link prowadzi do /login
    expect(loginLink).toHaveAttribute('href', '/login')
  })

  /**
   * Test 12: Testowanie wypełnionego formularza
   * Sprawdzamy, czy wartości pól są prawidłowo wyświetlane
   */
  it('displays filled form values', () => {
    vi.mocked(useRegisterPage).mockReturnValue({
      name: 'Jan Kowalski',
      setName: vi.fn(),
      email: 'jan@example.com',
      setEmail: vi.fn(),
      password: 'mypassword',
      setPassword: vi.fn(),
      error: null,
      isLoading: false,
      handleSubmit: vi.fn(),
    })

    renderWithProviders(<RegisterPage />)

    const nameInput = screen.getByLabelText(/imię i nazwisko/i) as HTMLInputElement
    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement
    const passwordInput = screen.getByLabelText(/hasło/i) as HTMLInputElement

    // Sprawdzamy, czy pola mają prawidłowe wartości
    expect(nameInput.value).toBe('Jan Kowalski')
    expect(emailInput.value).toBe('jan@example.com')
    expect(passwordInput.value).toBe('mypassword')
  })

  /**
   * Test 13: Testowanie że przycisk nie jest disabled gdy nie ma ładowania
   * Sprawdzamy prawidłowy stan przycisku
   */
  it('submit button is enabled when not loading', () => {
    vi.mocked(useRegisterPage).mockReturnValue({
      name: 'Jan Kowalski',
      setName: vi.fn(),
      email: 'test@example.com',
      setEmail: vi.fn(),
      password: 'password',
      setPassword: vi.fn(),
      error: null,
      isLoading: false,
      handleSubmit: vi.fn(),
    })

    renderWithProviders(<RegisterPage />)

    const submitButton = screen.getByRole('button', { name: /zarejestruj się/i })

    // Sprawdzamy, czy przycisk NIE jest wyłączony
    expect(submitButton).not.toBeDisabled()
  })

  /**
   * Test 14: Testowanie kompletnego scenariusza wypełniania formularza
   * Integracyjny test symulujący prawdziwego użytkownika
   */
  it('allows filling out the entire form', async () => {
    const setName = vi.fn()
    const setEmail = vi.fn()
    const setPassword = vi.fn()
    const user = userEvent.setup()

    vi.mocked(useRegisterPage).mockReturnValue({
      name: '',
      setName,
      email: '',
      setEmail,
      password: '',
      setPassword,
      error: null,
      isLoading: false,
      handleSubmit: vi.fn(),
    })

    renderWithProviders(<RegisterPage />)

    // Wypełniamy wszystkie pola formularza
    await user.type(screen.getByLabelText(/imię i nazwisko/i), 'Anna Nowak')
    await user.type(screen.getByLabelText(/email/i), 'anna@example.com')
    await user.type(screen.getByLabelText(/hasło/i), 'securepass123')

    // Sprawdzamy, czy wszystkie settery zostały wywołane
    expect(setName).toHaveBeenCalled()
    expect(setEmail).toHaveBeenCalled()
    expect(setPassword).toHaveBeenCalled()
  })
})