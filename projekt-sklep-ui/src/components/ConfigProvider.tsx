import { Suspense, type ReactNode } from 'react'

import { useConfig } from '../hooks/useConfig'

interface ConfigProviderProps {
  children: ReactNode
}

// ===================================================================
// STARA WERSJA - ręczny loading state
// ===================================================================
// export function ConfigProvider({ children }: ConfigProviderProps) {
//   const { isLoading } = useConfig()
//
//   if (isLoading) {
//     return (
//       <div style={{
//         display: 'flex',
//         justifyContent: 'center',
//         alignItems: 'center',
//         height: '100vh',
//         fontFamily: 'system-ui, sans-serif',
//       }}
//       >
//         Ładowanie konfiguracji...
//       </div>
//     )
//   }
//
//   return <>{children}</>
// }
//
// Problemy starego podejścia:
// - Ręczne sprawdzanie isLoading
// - Imperatywny if/else
// - Loading state musi być przekazany z hooka
// ===================================================================

// ===================================================================
// NOWA WERSJA - Suspense boundary (React 19 z use())
// ===================================================================

/**
 * Komponent wewnętrzny - wywołuje useConfig() z use()
 *
 * WAŻNE: useConfig() używa use() hook, który "zawiesza" renderowanie
 * gdy Promise jest pending. Suspense w komponencie nadrzędnym
 * łapie to zawieszenie i pokazuje fallback.
 */
function ConfigLoader({ children }: { children: ReactNode }) {
  // useConfig() wywołuje use(loadApiUrl())
  // Jeśli Promise pending -> throw promise -> Suspense pokazuje fallback
  // Jeśli Promise resolved -> zwraca apiUrl
  useConfig()

  return <>{children}</>
}

/**
 * Provider konfiguracji z Suspense boundary
 *
 * Suspense to komponent React, który:
 * 1. Łapie "zawieszone" komponenty (gdy use() czeka na Promise)
 * 2. Pokazuje fallback podczas ładowania
 * 3. Automatycznie pokazuje children gdy Promise resolve
 *
 * Zalety vs if(isLoading):
 * - Deklaratywny zamiast imperatywnego
 * - Lepsze UX - może pokazywać różne loadery dla różnych części UI
 * - Współpracuje z Concurrent Features (React 18+)
 * - Mniej boilerplate kodu
 */
export function ConfigProvider({ children }: ConfigProviderProps) {
  return (
    <Suspense
      fallback={
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          Ładowanie konfiguracji...
        </div>
      }
    >
      <ConfigLoader>{children}</ConfigLoader>
    </Suspense>
  )
}
// ===================================================================
