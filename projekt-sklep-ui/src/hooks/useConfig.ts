import { use } from 'react'

const DEFAULT_API_URL = 'http://localhost:9000/api'

let configCache: string | null = null

async function loadApiUrl(): Promise<string> {
  // Jeśli już mamy cache, zwróć go
  if (configCache) {
    return configCache
  }

  try {
    // Spróbuj załadować config.json
    const response = await fetch('/config.json')

    if (response.ok) {
      const config = await response.json()

      if (config.apiUrl) {
        const apiUrl = config.apiUrl
        configCache = apiUrl
        return apiUrl
      }
    }
  }
  catch {
    console.warn('Could not load config.json')
  }

  // Fallback na domyślny URL
  configCache = DEFAULT_API_URL
  return configCache
}

// ===================================================================
// STARA WERSJA - useState + useEffect (klasyczne podejście React)
// ===================================================================
// export function useConfig() {
//   const [apiUrl, setApiUrl] = useState<string | null>(configCache)
//   const [isLoading, setIsLoading] = useState(!configCache)
//
//   useEffect(() => {
//     if (apiUrl) return // Już załadowane
//
//     loadApiUrl()
//       .then(setApiUrl)
//       .finally(() => setIsLoading(false))
//   }, [apiUrl])
//
//   return { apiUrl, isLoading }
// }
//
// Problemy starego podejścia:
// - Wymaga 2 state hooks (apiUrl, isLoading)
// - Wymaga useEffect z dependency array
// - Ręczne zarządzanie loading state
// - Więcej boilerplate kodu
// - Loading state zarządzany lokalnie w hooku
// ===================================================================

// ===================================================================
// NOWA WERSJA - use() hook (React 19)
// ===================================================================
/**
 * Hook do ładowania konfiguracji API z użyciem React 19 use()
 *
 * use() to nowy hook w React 19, który potrafi:
 * 1. "Unwrapować" Promise - czeka na jego rozwiązanie
 * 2. Automatycznie integrować się z Suspense boundary
 * 3. Cache'ować wyniki (dzięki configCache nie będzie wielokrotnych fetchów)
 *
 * Różnice vs useState + useEffect:
 * - Brak potrzeby ręcznego zarządzania loading state
 * - Brak useEffect - kod jest bardziej deklaratywny
 * - Loading state zarządzany przez Suspense w komponencie nadrzędnym
 * - Mniej boilerplate - 1 linijka zamiast 10+
 *
 * WAŻNE: Wymaga Suspense boundary w komponencie nadrzędnym!
 * Zobacz ConfigProvider.tsx dla przykładu użycia.
 */
export function useConfig() {
  // use() automatycznie:
  // - Wywołuje loadApiUrl()
  // - Zawiesza renderowanie (throw promise) jeśli Promise pending
  // - Zwraca wartość gdy Promise resolve
  // - Rzuca błąd gdy Promise reject
  const apiUrl = use(loadApiUrl())

  // Nie potrzebujemy isLoading - Suspense to obsługuje!
  return { apiUrl }
}
// ===================================================================

// Export dla użycia poza React
export { loadApiUrl }
