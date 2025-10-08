import { loadApiUrl } from '../hooks/useConfig'

/**
 * ApiClient - główna klasa do komunikacji z backendem
 *
 * Kluczowe funkcje:
 * 1. Singleton pattern - jedna instancja w całej aplikacji
 * 2. Automatyczne odświeżanie tokenów przy błędzie 401
 * 3. Obsługa ciasteczek httpOnly (credentials: 'include')
 * 4. Zabezpieczenie przed wielokrotnymi równoczesnymi wywołaniami refresh
 */
export class ApiClient {
  private static instance: ApiClient
  private authErrorHandler?: () => void
  private apiBase: string | null = null
  private refreshPromise: Promise<void> | null = null

  // Prywatny konstruktor - wymusza używanie getInstance()
  private constructor() {}

  /**
   * Singleton pattern - zapewnia jedną instancję ApiClient w całej aplikacji
   * Korzyści: współdzielony stan (np. refreshPromise), spójność konfiguracji
   */
  static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient()
    }
    return ApiClient.instance
  }

  /**
   * Rejestruje handler wywoływany przy błędach autoryzacji (401)
   * Używane do wylogowania użytkownika gdy refresh token wygasł
   */
  setAuthErrorHandler(handler: () => void) {
    this.authErrorHandler = handler
  }

  /**
   * Lazy loading adresu API - ładowany tylko raz przy pierwszym użyciu
   * Adres pochodzi z ConfigProvider (plik .env.local)
   */
  private async getApiBase(): Promise<string> {
    if (this.apiBase) {
      return this.apiBase
    }

    this.apiBase = await loadApiUrl()
    return this.apiBase
  }

  /**
   * Główna metoda do wykonywania requestów HTTP
   *
   * Mechanizm auto-refresh tokenów:
   * 1. Wysyła request z credentials: 'include' (ciasteczka httpOnly)
   * 2. Jeśli 401 (Unauthorized) → automatycznie odświeża token
   * 3. Powtarza oryginalny request z nowym tokenem
   * 4. Jeśli refresh się nie uda → wywołuje authErrorHandler (wylogowanie)
   *
   * refreshPromise zapobiega race condition - jeśli wiele requestów dostanie 401
   * jednocześnie, tylko jeden wywoła /auth/refresh, pozostałe poczekają na ten sam Promise
   */
  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const apiBase = await this.getApiBase()
    const url = `${apiBase}${endpoint}`

    // credentials: 'include' → przeglądarki wysyła ciasteczka httpOnly z tokenami
    let response = await fetch(url, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    // Obsługa 401 - automatyczne odświeżanie tokenu
    // Nie odświeżamy dla endpointów /auth/* (np. /auth/login, /auth/refresh)
    if (response.status === 401 && !endpoint.includes('/auth/')) {
      try {
        // Zapobieganie wielokrotnym równoczesnym wywołaniom refresh
        // Jeśli już trwa odświeżanie, czekamy na ten sam Promise
        if (!this.refreshPromise) {
          this.refreshPromise = this.refreshToken()
        }

        await this.refreshPromise
        this.refreshPromise = null

        // Powtórzenie oryginalnego requesta z nowym access tokenem
        response = await fetch(url, {
          ...options,
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            ...options.headers,
          },
        })
      } catch (refreshError) {
        // Refresh nie udał się - refresh token wygasł lub nieprawidłowy
        // Wywołujemy handler (wylogowanie użytkownika)
        if (this.authErrorHandler) {
          this.authErrorHandler()
        }
        throw new Error('Unauthorized')
      }
    }

    // Jeśli nadal 401 po próbie odświeżenia lub to był endpoint /auth/*
    if (response.status === 401) {
      if (this.authErrorHandler) {
        this.authErrorHandler()
      }
      throw new Error('Unauthorized')
    }

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message)
    }

    // Parsowanie odpowiedzi JSON (jeśli jest content)
    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      const text = await response.text()
      return text ? JSON.parse(text) as T : {} as T
    }

    return {} as T
  }

  /**
   * Odświeżanie access tokenu przy użyciu refresh tokenu
   *
   * Flow:
   * 1. Wysyła POST /auth/refresh z refresh tokenem (ciasteczko httpOnly)
   * 2. Backend waliduje refresh token z bazy danych
   * 3. Jeśli ważny: rotacja tokenów (usuwa stary, tworzy nowy refresh token)
   * 4. Nowe tokeny zwracane jako ciasteczka httpOnly
   * 5. Przeglądarka automatycznie zapisuje nowe ciasteczka
   */
  private async refreshToken(): Promise<void> {
    const apiBase = await this.getApiBase()
    const response = await fetch(`${apiBase}/auth/refresh`, {
      method: 'POST',
      credentials: 'include' // Wysyła refresh token z ciasteczka
    })

    if (!response.ok) {
      throw new Error('Refresh token failed')
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }
}

export const apiClient = ApiClient.getInstance()
