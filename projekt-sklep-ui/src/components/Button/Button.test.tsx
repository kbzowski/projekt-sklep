/**
 * Testy komponentu Button
 *
 * Ten plik demonstruje podstawowe wzorce testowania komponentów React:
 * 1. Renderowanie z różnymi propsami
 * 2. Testowanie interakcji użytkownika (kliknięcia)
 * 3. Testowanie wariantów stylowania
 * 4. Testowanie atrybutów HTML (disabled)
 * 5. Testowanie dostępności (accessibility)
 */

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'

import Button from './Button'

describe('Button Component', () => {
  /**
   * Test 1: Podstawowe renderowanie
   * Sprawdzamy, czy komponent renderuje się z tekstem
   */
  it('renders with children text', () => {
    render(<Button>Click me</Button>)

    // Szukamy przycisku z tekstem "Click me"
    const button = screen.getByRole('button', { name: /click me/i })

    // Sprawdzamy, czy przycisk jest w dokumencie
    expect(button).toBeInTheDocument()
  })

  /**
   * Test 2: Testowanie zdarzeń onClick
   * Sprawdzamy, czy funkcja onClick jest wywoływana po kliknięciu
   */
  it('calls onClick handler when clicked', async () => {
    // Tworzymy mock funkcję (symulowaną funkcję) do testowania
    const handleClick = vi.fn()

    // userEvent to API do symulowania akcji użytkownika
    const user = userEvent.setup()

    render(<Button onClick={handleClick}>Click me</Button>)

    const button = screen.getByRole('button', { name: /click me/i })

    // Symulujemy kliknięcie użytkownika
    await user.click(button)

    // Sprawdzamy, czy funkcja została wywołana dokładnie raz
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  /**
   * Test 3: Testowanie wariantów stylowania
   * Sprawdzamy, czy różne warianty mają odpowiednie klasy CSS
   */
  it('renders with primary variant by default', () => {
    render(<Button>Primary Button</Button>)

    const button = screen.getByRole('button')

    // Sprawdzamy, czy przycisk ma klasę "primary"
    expect(button.className).toContain('primary')
  })

  it('renders with secondary variant', () => {
    render(<Button variant="secondary">Secondary Button</Button>)

    const button = screen.getByRole('button')

    expect(button.className).toContain('secondary')
  })

  it('renders with danger variant', () => {
    render(<Button variant="danger">Delete</Button>)

    const button = screen.getByRole('button')

    expect(button.className).toContain('danger')
  })

  /**
   * Test 4: Testowanie fullWidth prop
   * Sprawdzamy, czy prop fullWidth dodaje odpowiednią klasę
   */
  it('renders with fullWidth class when fullWidth prop is true', () => {
    render(<Button fullWidth>Full Width Button</Button>)

    const button = screen.getByRole('button')

    expect(button.className).toContain('fullWidth')
  })

  /**
   * Test 5: Testowanie atrybutu disabled
   * Sprawdzamy, czy przycisk może być wyłączony i nie reaguje na kliknięcia
   */
  it('renders as disabled when disabled prop is true', () => {
    const handleClick = vi.fn()

    render(
      <Button disabled onClick={handleClick}>
        Disabled Button
      </Button>
    )

    const button = screen.getByRole('button')

    // Sprawdzamy, czy przycisk ma atrybut disabled
    expect(button).toBeDisabled()
  })

  it('does not call onClick when disabled', async () => {
    const handleClick = vi.fn()
    const user = userEvent.setup()

    render(
      <Button disabled onClick={handleClick}>
        Disabled Button
      </Button>
    )

    const button = screen.getByRole('button')

    // Próbujemy kliknąć wyłączony przycisk
    await user.click(button)

    // Funkcja onClick NIE powinna zostać wywołana
    expect(handleClick).not.toHaveBeenCalled()
  })

  /**
   * Test 6: Testowanie custom className
   * Sprawdzamy, czy możemy dodać własne klasy CSS
   */
  it('applies custom className', () => {
    render(<Button className="custom-class">Custom Button</Button>)

    const button = screen.getByRole('button')

    expect(button.className).toContain('custom-class')
  })

  /**
   * Test 7: Testowanie innych atrybutów HTML
   * Sprawdzamy, czy możemy przekazać inne atrybuty (type, aria-label, etc.)
   */
  it('forwards HTML button attributes', () => {
    render(
      <Button type="submit" aria-label="Submit form">
        Submit
      </Button>
    )

    const button = screen.getByRole('button', { name: /submit form/i })

    // Sprawdzamy, czy atrybut type został przekazany
    expect(button).toHaveAttribute('type', 'submit')

    // Sprawdzamy, czy atrybut aria-label został przekazany
    expect(button).toHaveAttribute('aria-label', 'Submit form')
  })

  /**
   * Test 8: Testowanie wielokrotnych kliknięć
   * Sprawdzamy, czy onClick jest wywoływane przy każdym kliknięciu
   */
  it('calls onClick multiple times when clicked multiple times', async () => {
    const handleClick = vi.fn()
    const user = userEvent.setup()

    render(<Button onClick={handleClick}>Click me</Button>)

    const button = screen.getByRole('button')

    // Klikamy 3 razy
    await user.click(button)
    await user.click(button)
    await user.click(button)

    // Funkcja powinna zostać wywołana 3 razy
    expect(handleClick).toHaveBeenCalledTimes(3)
  })
})