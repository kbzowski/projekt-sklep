import { loadApiUrl } from '../hooks/useConfig'

/**
 * ========================================================================
 *                            ApiClient
 * ========================================================================
 *
 * Główna klasa do komunikacji z backendem REST API.
 *
 * FUNKCJONALNOŚCI:
 * ----------------
 * ✓ Automatyczne dołączanie adresu API (z .env.local)
 * ✓ Wysyłanie ciasteczek httpOnly z tokenami JWT (credentials: 'include')
 * ✓ Automatyczne odświeżanie access tokenu gdy wygaśnie (401)
 * ✓ Zapobieganie wielokrotnym równoczesnym wywołaniom /auth/refresh
 * ✓ Automatyczne wylogowanie gdy refresh token wygaśnie
 *
 * WZORCE PROJEKTOWE:
 * ------------------
 * • Singleton - jedna instancja w całej aplikacji (współdzielony stan)
 * • Promise chaining - zapobieganie race conditions przy refresh
 *
 * PRZYKŁAD UŻYCIA:
 * ----------------
 * ```typescript
 * import { apiClient } from './services/apiClient'
 *
 * // GET request
 * const products = await apiClient.get<Product[]>('/products')
 *
 * // POST request
 * const user = await apiClient.post<User>('/users', {
 *   email: 'jan@example.com',
 *   password: 'haslo123'
 * })
 *
 * // Rejestracja handlera wylogowania
 * apiClient.setAuthErrorHandler(() => {
 *   console.log('Sesja wygasła')
 *   // Wyczyść stan, przekieruj do /login
 * })
 * ```
 *
 * FLOW AUTORYZACJI:
 * -----------------
 *  Request → 401? → Refresh Token → Retry Request → Success
 *                         ↓
 *                    Refresh Failed → Logout User
 */
export class ApiClient {
  // === Singleton Pattern ===
  // Pole statyczne przechowujące jedyną instancję klasy
  private static instance: ApiClient

  // === Stan Klienta ===
  private authErrorHandler?: () => void           // Funkcja wywoływana przy wylogowaniu
  private apiBase: string | null = null           // Adres bazowy API (cache)
  private refreshPromise: Promise<void> | null = null  // Promise odświeżania tokenu (zapobiega race conditions)

  /**
   * Prywatny konstruktor - uniemożliwia tworzenie instancji przez 'new ApiClient()'
   *
   * Dlaczego prywatny?
   * - Wymusza używanie ApiClient.getInstance()
   * - Gwarantuje tylko jedną instancję w aplikacji (Singleton)
   */
  private constructor() {}

  /**
   * Zwraca instancję Singleton
   *
   * SINGLETON PATTERN - Po co?
   * - Współdzielony stan między wszystkimi częściami aplikacji
   * - Jeden refreshPromise zapobiega wielokrotnym wywołaniom /auth/refresh
   * - Spójna konfiguracja (apiBase, authErrorHandler)
   *
   * @returns {ApiClient} Jedyna instancja ApiClient w aplikacji
   */
  static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient()
    }
    return ApiClient.instance
  }

  /**
   * Rejestruje funkcję wywoływaną przy błędach autoryzacji (wylogowanie)
   *
   * KIEDY WYWOŁYWANA?
   * - Gdy refresh token wygasł lub jest nieprawidłowy
   * - Gdy endpoint zwraca 401 i nie można odświeżyć tokenu
   *
   * PRZYKŁAD:
   * ```typescript
   * apiClient.setAuthErrorHandler(() => {
   *   setState({ user: null, cart: [] }) // Wyczyść stan
   *   navigate('/login')                  // Przekieruj do logowania
   * })
   * ```
   *
   * @param {Function} handler - Funkcja wywoływana przy wylogowaniu
   */
  setAuthErrorHandler(handler: () => void) {
    this.authErrorHandler = handler
  }

  /**
   * Zwraca adres bazowy API (lazy loading + cache)
   *
   * OPTYMALIZACJA:
   * - Ładuje adres tylko raz przy pierwszym użyciu
   * - Kolejne wywołania zwracają wartość z cache (this.apiBase)
   *
   * ŹRÓDŁO ADRESU:
   * - ConfigProvider → .env.local → VITE_API_URL
   * - Domyślnie: http://localhost:9000
   *
   * @returns {Promise<string>} Adres bazowy API (np. 'http://localhost:9000')
   */
  private async getApiBase(): Promise<string> {
    // Jeśli już załadowane - zwróć z cache
    if (this.apiBase) {
      return this.apiBase
    }

    // Pierwsza próba - załaduj z ConfigProvider
    this.apiBase = await loadApiUrl()
    return this.apiBase
  }

  /**
   * ====================================================================
   *                    GŁÓWNA METODA REQUEST
   * ====================================================================
   *
   * Wysyła HTTP request z automatyczną obsługą błędów autoryzacji.
   *
   * FLOW:
   * -----
   * 1. Przygotuj URL (apiBase + endpoint)
   * 2. Wyślij request z ciasteczkami (credentials: 'include')
   * 3. Sprawdź odpowiedź:
   *    - 401 (Unauthorized)? → Spróbuj odświeżyć token i ponów request
   *    - 401 po retry?       → Wyloguj użytkownika
   *    - Inny błąd?          → Rzuć wyjątek
   *    - Sukces?             → Parsuj i zwróć dane
   *
   * CREDENTIALS: 'INCLUDE' - Co to znaczy?
   * --------------------------------------
   * Przeglądarki automatycznie dołącza ciasteczka httpOnly do requesta:
   * - access-token  (15 minut ważności)
   * - refresh-token (7 dni ważności)
   *
   * Backend czyta te tokeny i weryfikuje tożsamość użytkownika.
   *
   * @param {string} endpoint - Endpoint API (np. '/products', '/auth/login')
   * @param {RequestInit} options - Opcje fetch (method, body, headers, etc.)
   * @returns {Promise<T>} Odpowiedź z API (sparsowany JSON)
   */
  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    // KROK 1: Przygotuj pełny URL
    const apiBase = await this.getApiBase()
    const url = `${apiBase}${endpoint}`

    // KROK 2: Wyślij pierwszy request
    let response = await this.sendRequest(url, options)

    // KROK 3: Obsłuż błąd 401 (Unauthorized)
    if (response.status === 401) {
      response = await this.handleUnauthorized(endpoint, url, options)
    }

    // KROK 4: Parsuj odpowiedź (lub rzuć błąd)
    return this.parseResponse<T>(response)
  }

  /**
   * ====================================================================
   *              OBSŁUGA BŁĘDU 401 (Unauthorized)
   * ====================================================================
   *
   * Wywoływana gdy request zwraca 401 (access token wygasł).
   *
   * STRATEGIA:
   * ----------
   * 1. Sprawdź czy to endpoint /auth/* → Jeśli tak, wyloguj (nie próbuj refresh)
   * 2. Odśwież token (wywołaj /auth/refresh)
   * 3. Ponów oryginalny request z nowym access tokenem
   * 4. Jeśli nadal 401 → Wyloguj użytkownika
   *
   * ZAPOBIEGANIE RACE CONDITIONS:
   * ------------------------------
   * Jeśli wiele requestów dostanie 401 jednocześnie (np. 5 równoległych GET):
   *
   *  Request 1 → 401 → refreshPromise = refresh()  ← Tworzy Promise
   *  Request 2 → 401 → refreshPromise exists!      ← Czeka na ten sam Promise
   *  Request 3 → 401 → refreshPromise exists!      ← Czeka na ten sam Promise
   *  ...
   *
   * Efekt: Tylko JEDEN request wywołuje /auth/refresh, pozostałe czekają.
   *
   * DIAGRAM:
   * --------
   *  401 → Czy /auth/*? ──YES──> Wyloguj
   *           │
   *          NO
   *           │
   *           ↓
   *       refreshPromise? ──YES──> Czekaj na istniejący Promise
   *           │
   *          NO
   *           │
   *           ↓
   *     refreshPromise = refresh() → Odśwież token
   *           │
   *           ↓
   *     Ponów request → 401? ──YES──> Wyloguj
   *                       │
   *                      NO
   *                       │
   *                       ↓
   *                   Zwróć response
   *
   * @param {string} endpoint - Endpoint oryginalnego requesta
   * @param {string} url - Pełny URL
   * @param {RequestInit} options - Opcje fetch
   * @returns {Promise<Response>} Nowy response po refresh lub błąd
   */
  private async handleUnauthorized(
    endpoint: string,
    url: string,
    options: RequestInit
  ): Promise<Response> {
    // PRZYPADEK 1: Endpoint /auth/* (np. /auth/login, /auth/refresh)
    // Nie próbujemy odświeżać tokenu - od razu wyloguj
    if (endpoint.includes('/auth/')) {
      this.triggerAuthError()
      throw new Error('Unauthorized')
    }

    // PRZYPADEK 2: Normalny endpoint (np. /products, /cart)
    // Próbujemy odświeżyć token i ponowić request
    try {
      // KROK 1: Odśwież token (z zabezpieczeniem przed race conditions)
      await this.performRefresh()

      // KROK 2: Ponów oryginalny request z nowym access tokenem
      const retryResponse = await this.sendRequest(url, options)

      // KROK 3: Sprawdź czy nadal 401
      if (retryResponse.status === 401) {
        // Refresh się udał, ale nadal 401? → Token nieważny, wyloguj
        this.triggerAuthError()
        throw new Error('Unauthorized')
      }

      return retryResponse
    } catch {
      // Refresh się nie udał (refresh token wygasł) → Wyloguj
      this.triggerAuthError()
      throw new Error('Unauthorized')
    }
  }

  /**
   * Wykonuje odświeżanie tokenu z zabezpieczeniem przed race conditions
   *
   * MECHANIZM:
   * ----------
   * 1. Jeśli refreshPromise już istnieje → Czekaj na niego (ktoś inny już refreshuje)
   * 2. Jeśli nie istnieje → Utwórz nowy refreshPromise i wykonaj refresh
   * 3. Po zakończeniu → Wyczyść refreshPromise (null)
   *
   * DLACZEGO PROMISE A NIE BOOLEAN?
   * --------------------------------
   * Promise pozwala wielu requestom czekać na ten sam wynik:
   *
   * ```typescript
   * // Źle (boolean):
   * if (!isRefreshing) {
   *   isRefreshing = true
   *   await refresh()
   *   isRefreshing = false
   * }
   * // Problem: Inne requesty nie wiedzą kiedy refresh się skończy
   *
   * // Dobrze (Promise):
   * if (!refreshPromise) {
   *   refreshPromise = refresh()
   * }
   * await refreshPromise  // Wszystkie requesty czekają na ten sam Promise
   * ```
   */
  private async performRefresh(): Promise<void> {
    // Jeśli refresh już trwa - czekaj na ten sam Promise
    if (!this.refreshPromise) {
      this.refreshPromise = this.refreshToken()
    }

    await this.refreshPromise

    // Wyczyść Promise po zakończeniu (gotowy na kolejny refresh)
    this.refreshPromise = null
  }

  /**
   * Wysyła HTTP request z konfiguracją dla autentykacji JWT
   *
   * KONFIGURACJA:
   * -------------
   * - credentials: 'include' → Dołącz ciasteczka httpOnly (tokeny JWT)
   * - Content-Type: application/json → Dane w formacie JSON
   * - Merge user headers → Użytkownik może nadpisać domyślne nagłówki
   *
   * @param {string} url - Pełny URL
   * @param {RequestInit} options - Opcje fetch
   * @returns {Promise<Response>} Odpowiedź fetch
   */
  private async sendRequest(url: string, options: RequestInit): Promise<Response> {
    return fetch(url, {
      ...options,
      credentials: 'include',  // <- KLUCZOWE: Wysyła ciasteczka httpOnly z tokenami
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })
  }

  /**
   * Parsuje odpowiedź JSON lub rzuca błąd
   *
   * OBSŁUGA BŁĘDÓW:
   * ---------------
   * - 401 → Unauthorized (obsłużone wcześniej w request())
   * - 4xx/5xx → Rzuć błąd z message z backendu
   * - 2xx → Parsuj JSON (jeśli content-type: application/json)
   *
   * @param {Response} response - Odpowiedź fetch
   * @returns {Promise<T>} Sparsowany JSON
   */
  private async parseResponse<T>(response: Response): Promise<T> {
    // Błąd inny niż 401 (np. 400 Bad Request, 500 Internal Error)
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Request failed')
    }

    // Sukces - parsuj JSON (jeśli jest)
    const contentType = response.headers.get('content-type')
    if (contentType?.includes('application/json')) {
      const text = await response.text()
      return text ? JSON.parse(text) as T : {} as T
    }

    // Brak contentu (np. DELETE może zwrócić 204 No Content)
    return {} as T
  }

  /**
   * Wywołuje handler wylogowania (jeśli zarejestrowany)
   *
   * KIEDY WYWOŁYWANE?
   * -----------------
   * - Refresh token wygasł (401 z /auth/refresh)
   * - Access token wygasł i refresh się nie udał
   * - Endpoint /auth/* zwrócił 401
   */
  private triggerAuthError(): void {
    if (this.authErrorHandler) {
      this.authErrorHandler()
    }
  }

  /**
   * ====================================================================
   *                    ODŚWIEŻANIE TOKENU JWT
   * ====================================================================
   *
   * Wysyła request do /auth/refresh aby uzyskać nowy access token.
   *
   * BACKEND FLOW (TokenService + AuthController):
   * ----------------------------------------------
   * 1. Odczytaj refresh token z ciasteczka httpOnly
   * 2. Sprawdź czy token istnieje w bazie danych (tabela RefreshToken)
   * 3. Sprawdź czy nie wygasł (expiresAt > now)
   * 4. Jeśli ważny:
   *    a) Usuń stary refresh token z bazy (rotacja)
   *    b) Wygeneruj nowy access token (15 min)
   *    c) Wygeneruj nowy refresh token (7 dni)
   *    d) Zapisz nowy refresh token w bazie
   *    e) Zwróć oba tokeny jako ciasteczka httpOnly
   * 5. Przeglądarka automatycznie zapisuje nowe ciasteczka
   *
   * ROTACJA TOKENÓW - Po co?
   * -------------------------
   * Bezpieczeństwo: Jeśli ktoś ukradnie refresh token, może go użyć tylko raz.
   * Po pierwszym użyciu token jest usuwany z bazy i staje się nieważny.
   *
   * DIAGRAM SEKWENCJI:
   * ------------------
   *  Frontend                Backend                    Database
   *     │                        │                           │
   *     │───POST /auth/refresh──>│                           │
   *     │   (refresh token)      │                           │
   *     │                        │───SELECT refresh_token───>│
   *     │                        │<──token record────────────│
   *     │                        │                           │
   *     │                        │───DELETE old token───────>│
   *     │                        │───INSERT new token───────>│
   *     │                        │                           │
   *     │<──Set-Cookie───────────│                           │
   *     │   access-token (15m)   │                           │
   *     │   refresh-token (7d)   │                           │
   *
   * @throws {Error} Jeśli refresh token wygasł lub nieprawidłowy
   */
  private async refreshToken(): Promise<void> {
    const apiBase = await this.getApiBase()
    const response = await fetch(`${apiBase}/auth/refresh`, {
      method: 'POST',
      credentials: 'include', // Wysyła refresh token z ciasteczka
    })

    if (!response.ok) {
      throw new Error('Refresh token failed')
    }

    // Sukces: Nowe tokeny zapisane jako ciasteczka httpOnly
    // (przeglądarka automatycznie je przechowuje)
  }

  // =====================================================================
  //                     METODY WYGODNE (HTTP VERBS)
  // =====================================================================

  /**
   * HTTP GET request
   *
   * PRZYKŁAD:
   * ```typescript
   * const products = await apiClient.get<Product[]>('/products')
   * const user = await apiClient.get<User>('/users/123')
   * ```
   */
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  /**
   * HTTP POST request
   *
   * PRZYKŁAD:
   * ```typescript
   * const newUser = await apiClient.post<User>('/users', {
   *   email: 'jan@example.com',
   *   password: 'haslo123'
   * })
   * ```
   */
  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  /**
   * HTTP PUT request
   *
   * PRZYKŁAD:
   * ```typescript
   * const updatedProduct = await apiClient.put<Product>('/products/123', {
   *   name: 'Nowa nazwa',
   *   price: 99.99
   * })
   * ```
   */
  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  /**
   * HTTP DELETE request
   *
   * PRZYKŁAD:
   * ```typescript
   * await apiClient.delete('/products/123')
   * ```
   */
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }
}

// =====================================================================
//                    EKSPORT INSTANCJI SINGLETON
// =====================================================================

/**
 * Gotowa instancja ApiClient do użycia w całej aplikacji
 *
 * IMPORTUJ TAK:
 * ```typescript
 * import { apiClient } from './services/apiClient'
 * ```
 *
 * NIE TAK:
 * ```typescript
 * import { ApiClient } from './services/apiClient'
 * const client = new ApiClient()  // ❌ Błąd: konstruktor prywatny
 * ```
 */
export const apiClient = ApiClient.getInstance()
