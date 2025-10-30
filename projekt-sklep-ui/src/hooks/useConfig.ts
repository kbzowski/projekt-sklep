import {use} from 'react'

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
    console.warn('Could not load config.json, using default API URL')
  }

  // Fallback na domyślny URL
  configCache = DEFAULT_API_URL
  return configCache
}


/**
 * Promise konfiguracji utworzony RAZ na poziomie modułu
 */
const configPromise = loadApiUrl()

/**
 * Hook do ładowania konfiguracji API z użyciem React 19 use()
 *
 * use() to nowe api w React 19 (nie jest to hook!), które potrafi:
 * 1. Obsłużyć Promise - czeka na jego rozwiązanie
 * 2. Automatycznie integrować się z Suspense boundary
 *
 * WAŻNE:
 * 1. Wymaga Suspense boundary w komponencie nadrzędnym!
 * 2. Przekazany promise musi być stabilny - musi być utworzony RAZ na poziomie modułu
 */
export function useConfig() {
  const apiUrl = use(configPromise)
  return { apiUrl }
}
// ===================================================================

// Export dla użycia poza React
export { loadApiUrl }
