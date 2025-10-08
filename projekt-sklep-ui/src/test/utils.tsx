/**
 * Utility functions for testing
 *
 * Ten plik zawiera pomocnicze funkcje do testowania komponentów React.
 * Najważniejsza to renderWithProviders, która renderuje komponent
 * z całym kontekstem aplikacji (AppProvider).
 */

import {render, type RenderOptions} from '@testing-library/react'
import type {ReactElement} from 'react'
import { BrowserRouter } from 'react-router-dom'

import { AppProvider } from '../context/AppContext'
 
/**
 * Custom render function that wraps component with providers
 *
 * Przykład użycia:
 * ```tsx
 * const { getByText } = renderWithProviders(<MyComponent />);
 * ```
 *
 * @param ui - Komponent React do renderowania
 * @param options - Opcje renderowania z React Testing Library
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <BrowserRouter>
        <AppProvider>{children}</AppProvider>
      </BrowserRouter>
    )
  }

  return render(ui, { wrapper: Wrapper, ...options })
}

/**
 * Re-export wszystkich funkcji z @testing-library/react
 * Dzięki temu możemy importować wszystko z jednego miejsca:
 * import { renderWithProviders, screen, fireEvent } from '@/test/utils';
 */
export * from '@testing-library/react'