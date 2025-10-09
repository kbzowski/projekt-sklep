# Budowa React E-Commerce SPA

Ten dokument opisuje krok po kroku wszystkie etapy budowy aplikacji e-commerce w React, od zera do gotowego projektu.

---

## 📋 Etapy implementacji

### **Etap 1: Konfiguracja projektu i podstawy**

#### 1.1 Konfiguracja środowiska
- [ ] Utworzenie projektu Vite + React + TypeScript
- [ ] Konfiguracja ESLint i podstawowych zasad
- [ ] Konfiguracja struktury folderów (`src/`, `public/`)
- [ ] Konfiguracja TypeScript (tryb ścisły)
- [ ] Konfiguracja React Compiler (babel-plugin-react-compiler)

#### 1.2 Podstawowa struktura
- [ ] Utworzenie struktury katalogów:
  ```
  src/
  ├── components/     # Komponenty wielokrotnego użytku
  ├── pages/          # Komponenty stron (routing)
  ├── context/        # React Context dla state management
  ├── types/          # Definicje TypeScript
  ├── lib/            # Narzędzia i funkcje pomocnicze
  ├── services/       # Klient API i serwisy komunikacji z backendem
  ├── hooks/          # Własne hooki (useConfig)
  └── test/           # Narzędzia testowe i konfiguracja
  ```

#### 1.3 Podstawowe typy TypeScript
- [ ] Definicja typu `User` (id, name, email)
- [ ] Definicja typu `Product` (id, name, price, category, categoryId, description, image)
- [ ] Definicja typu `Category` (id, name, slug)
- [ ] Definicja typu `CartItem` (product + quantity)
- [ ] Definicja typu `ProductOrderBy` ('name' | 'price-asc' | 'price-desc')
- [ ] Definicja typu `AppState` (user, cart, products, categories, filtry, paginacja, loading, error)
- [ ] Eksport wszystkich typów z `src/types/index.ts`

---

### **Etap 2: System zarządzania stanem**

#### 2.1 Konfiguracja AppContext (Wzorzec Pasywnego Kontenera Stanu)
- [ ] Utworzenie `AppContext` z React Context API
- [ ] Definicja interfejsu `AppState` zawierającego:
  - `user: User | null` (stan uwierzytelnienia)
  - `cart: CartItem[]` (koszyk)
  - `products: Product[]` (lista produktów)
  - `categories: Category[]` (kategorie)
  - `currentCategory: string | null` (aktualny filtr kategorii)
  - `sortBy: ProductOrderBy` (sortowanie)
  - `currentPage, itemsPerPage, totalPages, totalProducts` (paginacja)
  - `isLoading: boolean` (stan ładowania)
  - `error: string | null` (błędy)

#### 2.2 Funkcje zarządzania stanem (tylko settery - bez logiki biznesowej)
- [ ] Implementacja podstawowych setterów: `setUser()`, `setCart()`, `setProducts()`, `setCategories()`
- [ ] Implementacja setterów interfejsu użytkownika: `setLoading()`, `setError()`
- [ ] Implementacja filtrów: `setCategoryFilter()`, `setSortBy()`, `setPage()`, `setPagination()`
- [ ] **Wzorzec**: Context przechowuje TYLKO stan, logika biznesowa w hookach stron i serwisach

#### 2.3 Własny hook
- [ ] Utworzenie hooka `useApp()` dla łatwego dostępu do kontekstu
- [ ] Eksport AppProvider i useApp z modułu kontekstu
- [ ] Obsługa błędów dla użycia poza AppProvider

---

### **Etap 3: Klient API i Serwisy (integracja z backendem)**

#### 3.1 Konfiguracja Klienta API (Wzorzec Singletona)
- [ ] Utworzenie klasy `ApiClient` w `src/services/apiClient.ts`
- [ ] Implementacja wzorca singletona (jedna instancja w całej aplikacji)
- [ ] Konfiguracja credentials: 'include' dla ciasteczek httpOnly
- [ ] Automatyczne odświeżanie tokenów przy błędzie 401
- [ ] Mechanizm zapobiegający wielokrotnym równoczesnym wywołaniom odświeżania
- [ ] Metody HTTP: `get()`, `post()`, `put()`, `delete()`
- [ ] Obsługa błędów uwierzytelniania dla wylogowania przy wygasłym tokenie odświeżania

#### 3.2 Serwisy - warstwy komunikacji z API
- [ ] `authService.ts`: logowanie, wylogowanie, pobieranie bieżącego użytkownika, rejestracja
- [ ] `productService.ts`: pobieranie produktów z filtrowaniem i paginacją
- [ ] `categoryService.ts`: pobieranie kategorii
- [ ] `cartService.ts`: pobieranie koszyka, dodawanie do koszyka, aktualizacja elementu koszyka, usuwanie z koszyka
- [ ] `orderService.ts`: tworzenie zamówienia (zaślepka na przyszłość)
- [ ] Eksport wszystkich serwisów z `src/services/index.ts`

#### 3.3 Konfiguracja
- [ ] `ConfigProvider` - dostawca konfiguracji aplikacji (adres URL API)
- [ ] Hook `useConfig` - dostęp do konfiguracji
- [ ] Obsługa zmiennych środowiskowych (.env.local)

#### 3.4 Stałe tras
- [ ] Definicja stałych routingu w `src/lib/routes.ts`
- [ ] Eksport obiektu ROUTES z wszystkimi ścieżkami

---

### **Etap 4: Podstawowe komponenty interfejsu użytkownika**

#### 4.1 Komponent Button
- [ ] Implementacja podstawowego komponentu Button
- [ ] Moduły CSS dla Button (`Button.module.css`)
- [ ] Warianty: główny, drugorzędny, niebezpieczny
- [ ] Właściwości: wariant, pełna szerokość, wyłączony + rozszerzenie HTMLButtonElement
- [ ] Odpowiednie interfejsy TypeScript
- [ ] Testy jednostkowe (Vitest + React Testing Library)

#### 4.2 Komponenty layoutu
- [ ] Implementacja komponentu `Layout` ze wzorcem Outlet (react-router-dom)
- [ ] Implementacja komponentu `Header` z nawigacją i znacznikiem koszyka
- [ ] Implementacja komponentu `Footer`
- [ ] Moduły CSS dla każdego komponentu
- [ ] Warunkowa nawigacja na podstawie uwierzytelnienia (NavLink ze stanami aktywnymi)
- [ ] Hook `useHeader` - logika nawigacji i wylogowania
- [ ] Testy jednostkowe dla Header

#### 4.3 Granica błędów (ErrorBoundary)
- [ ] Implementacja ErrorBoundary opartego na klasie (React.Component)
- [ ] Obsługa błędów JavaScript w drzewie komponentów
- [ ] Zastępczy interfejs użytkownika z możliwością powrotu (reset stanu błędu)
- [ ] Obsługa błędów w trybie deweloperskim vs produkcyjnym
- [ ] Stylowanie za pomocą modułów CSS

---

### **Etap 5: Implementacja React Router**

#### 5.1 Konfiguracja routera
- [ ] Instalacja `react-router-dom`
- [ ] Konfiguracja BrowserRouter w App.tsx
- [ ] Konfiguracja zagnieżdżonego routingu z Layout jako trasą nadrzędną
- [ ] Kompozycja z AppProvider i ConfigProvider

#### 5.2 Definicje tras (AppRouter)
- [ ] Implementacja struktury tras w `src/components/AppRouter.tsx`:
  - `/` - Strona główna (publiczna)
  - `/products` - Strona produktów (publiczna)
  - `/cart` - Strona koszyka (chroniona, wymaga uwierzytelnienia)
  - `/login` - Strona logowania (tylko dla niezalogowanych, przekierowanie jeśli zalogowany)
  - `/register` - Strona rejestracji (tylko dla niezalogowanych, przekierowanie jeśli zalogowany)
  - `*` - Strona nie znaleziono (catch-all dla 404)

#### 5.3 Strażnicy tras
- [ ] Implementacja komponentu `ProtectedRoute`
- [ ] Sprawdzanie uwierzytelnienia użytkownika (`state.user` z AppContext)
- [ ] Przekierowania na podstawie statusu uwierzytelnienia:
  - `requireAuth={true}` → przekierowanie do /login jeśli niezalogowany
  - `requireAuth={false}` → przekierowanie do / jeśli zalogowany
- [ ] Wzorzec "zamierzonego celu" - zapisywanie oryginalnej ścieżki w location.state
- [ ] Odpowiednia obsługa przekierowań po zalogowaniu (powrót do zamierzonego celu)

#### 5.4 Nawigacja
- [ ] Implementacja NavLink ze stanami aktywnymi (w Header)
- [ ] Warunkowa nawigacja (pokazywanie różnych linków dla zalogowanych/niezalogowanych)
- [ ] Znacznik koszyka z liczbą produktów
- [ ] Nawigacja z kodu (useNavigate w wylogowaniu, logowaniu, rejestracji)

---

### **Etap 6: Strony aplikacji i Hooki Stron**

**Architektura**: Każda strona składa się z:
1. **Komponent** (.tsx) - interfejs użytkownika i prezentacja
2. **Hook Strony** (use*Page.ts) - logika biznesowa, pobieranie danych, obsługa błędów
3. **Moduł CSS** - stylowanie

#### 6.1 Strona główna (HomePage)
- [ ] Sekcja hero z tytułem i opisem
- [ ] Siatka wyróżnionych produktów (pierwsze 6 produktów)
- [ ] Przyciski wezwania do działania (do /products)
- [ ] Hook `useHomePage` - pobieranie produktów z API
- [ ] Obsługa stanów ładowania (spinner podczas ładowania)
- [ ] Obsługa błędów (wyświetlanie błędów)
- [ ] Stylowanie

#### 6.2 Strona produktów (ProductsPage)
- [ ] Lista wszystkich produktów z paginacją
- [ ] Komponent `ProductFilters` - filtrowanie po kategorii i sortowanie
- [ ] Sortowanie (nazwa, cena rosnąco, cena malejąco)
- [ ] Paginacja produktów (6 na stronę)
- [ ] Hook `useProductsPage`:
  - Pobieranie produktów z filtrowaniem i sortowaniem
  - Pobieranie kategorii
  - Reakcja na zmiany filtrów (useEffect)
  - Aktualizacja stanu paginacji
- [ ] Stan ładowania/błędu
- [ ] Stylowanie

#### 6.3 Strona koszyka (CartPage) - Trasa chroniona
- [ ] Lista produktów w koszyku (Komponent CartItem)
- [ ] Ilość produktów (+/-) z walidacją
- [ ] Funkcjonalność usuwania z koszyka
- [ ] Obliczanie ceny końcowej
- [ ] Obsługa pustego koszyka (komunikat gdy pusty)
- [ ] Przycisk finalizacji zakupu (wywołuje orderService.createOrder)
- [ ] Hook `useCartPage`:
  - Pobieranie koszyka z API
  - handleQuantityChange - optymistyczne aktualizacje
  - handleRemove - optymistyczne aktualizacje z wycofaniem
  - Obsługa błędów z wycofaniem do poprzedniego stanu
- [ ] Stylowanie za pomocą modułów CSS

#### 6.4 Strony uwierzytelniania
- [ ] **Strona logowania** z formularzem (email, hasło)
- [ ] **Strona rejestracji** z formularzem (imię, email, hasło)
- [ ] Hooki `useLoginPage` i `useRegisterPage`:
  - Zarządzanie stanem formularza
  - handleSubmit - wywołanie authService
  - Obsługa błędów (wyświetlanie błędów z API)
  - Obsługa sukcesu (pobieranie użytkownika, koszyka, przekierowanie)
  - Przekierowanie do zamierzonego celu po zalogowaniu
- [ ] Walidacja formularza (format email, długość hasła)
- [ ] Wyświetlanie komunikatów błędów
- [ ] Stany ładowania (wyłączony przycisk podczas przesyłania)
- [ ] Testy jednostkowe dla LoginPage i RegisterPage
- [ ] Stylowanie za pomocą modułów CSS (Auth.module.css)

#### 6.5 Strona nie znaleziono (NotFoundPage)
- [ ] Prosta strona 404 z komunikatem
- [ ] Link powrotu do strony głównej (/)
- [ ] Minimalistyczny design
- [ ] Stylowanie za pomocą modułów CSS

#### 6.6 Obsługa uwierzytelniania aplikacji (AppAuthHandler)
- [ ] Automatyczne odświeżanie sesji przy starcie aplikacji
- [ ] Wywołanie getCurrentUser() jeśli brak użytkownika w stanie
- [ ] Pobieranie koszyka po zalogowaniu
- [ ] Konfiguracja obsługi błędów uwierzytelniania dla ApiClient (wylogowanie przy błędzie)

---

### **Etap 7: Komponenty produktów**

#### 7.1 Karta produktu (ProductCard)
- [ ] Wyświetlanie produktu (obraz, nazwa, cena, kategoria)
- [ ] Przycisk "Dodaj do koszyka" z obsługą onClick
- [ ] Wyświetlanie znacznika kategorii
- [ ] Formatowanie ceny (PLN)
- [ ] Obsługa zastępczego obrazu
- [ ] Interfejs właściwości TypeScript
- [ ] Testy jednostkowe (Vitest)
- [ ] Stylowanie za pomocą modułów CSS (współdzielone przez ProductsPage)

#### 7.2 Filtry produktów (ProductFilters)
- [ ] Lista rozwijana z kategoriami (Wszystkie + kategorie z API)
- [ ] Lista rozwijana z opcjami sortowania:
  - Nazwa (A-Z)
  - Cena rosnąco
  - Cena malejąco
- [ ] Właściwości: kategorie, aktualna kategoria, sortowanie wg, zmiana kategorii, zmiana sortowania
- [ ] Dostępne etykiety (htmlFor)
- [ ] Stylowanie CSS (inline w komponencie)

#### 7.3 Element koszyka (CartItem)
- [ ] Wyświetlanie informacji o produkcie (obraz, nazwa, cena)
- [ ] Kontrolki ilości (- / +) ze stanami wyłączonymi
- [ ] Przycisk usuwania (Usuń)
- [ ] Obliczanie ceny częściowej (cena × ilość)
- [ ] Właściwości: element koszyka, zmiana ilości, usuwanie
- [ ] Interfejsy TypeScript
- [ ] Stylowanie za pomocą modułów CSS (współdzielone przez CartPage)

#### 7.4 Paginacja
- [ ] Wyświetlanie numerów stron (1, 2, 3...)
- [ ] Przyciski Poprzednia/Następna
- [ ] Stany wyłączone (pierwsza/ostatnia strona)
- [ ] Podświetlanie aktywnej strony
- [ ] Właściwości: aktualna strona, całkowita liczba stron, zmiana strony
- [ ] Obsługa onClick z zapobieganiem przeskoczenia strony
- [ ] Stylowanie za pomocą modułów CSS (współdzielone przez ProductsPage)

---

### **Etap 8: Stylowanie i design responsywny**

#### 8.1 Implementacja modułów CSS
- [ ] Konwersja wszystkich komponentów do modułów CSS
- [ ] Wzorzec kolokacji (komponent + CSS w tym samym folderze)
- [ ] Stylowanie w zakresie dla lepszej utrzymywalności
- [ ] Konwencja nazewnictwa: `ComponentName.module.css`
- [ ] Style globalne w `src/index.css` (reset, typografia, kolory)

#### 8.2 Design responsywny
- [ ] Podejście mobile-first (podstawowe style dla mobile)
- [ ] CSS Grid dla list produktów
- [ ] Flexbox dla komponentów layoutu

#### 8.3 Podstawy dostępności
- [ ] Odpowiedni semantyczny HTML (header, nav, main, footer, article)
- [ ] Etykiety dla pól formularza (htmlFor)
- [ ] Przycisk vs Link (button dla akcji, Link dla nawigacji)
- [ ] Tekst alternatywny dla obrazów produktów
- [ ] Wsparcie nawigacji klawiaturą (stany focus)

---

### **Etap 9: Zaawansowane funkcjonalności**

#### 9.1 Obsługa formularzy
- [ ] Komponenty kontrolowane (useState dla wartości formularza)
- [ ] Walidacja formularza (format email, długość hasła)
- [ ] Wyświetlanie komunikatów błędów (z API i lokalne)
- [ ] Obsługa przesyłania (asynchroniczna, obsługa błędów)
- [ ] Stany ładowania (wyłączony przycisk, tekst ładowania)
- [ ] Obsługa sukcesu (przekierowanie po zalogowaniu/rejestracji)

#### 9.2 Filtrowanie i sortowanie
- [ ] Filtrowanie po kategorii (ProductFilters)
- [ ] Sortowanie (nazwa, cena rosnąco/malejąco)
- [ ] Kombinacja filtrów (kategoria + sortowanie + paginacja)
- [ ] Synchronizacja parametrów zapytania z backendem

#### 9.3 Trwałość danych (przez Backend + Ciasteczka)
- [ ] **Trwałość koszyka**: koszyk przechowywany w bazie danych (dla każdego użytkownika)
- [ ] **Trwałość sesji**: tokeny JWT w ciasteczkach httpOnly
- [ ] **Automatyczne przywracanie sesji**: AppAuthHandler przy starcie aplikacji
- [ ] **Automatyczne odświeżanie tokenów**: ApiClient odświeża token dostępu automatycznie
- [ ] **Czyszczenie przy wylogowaniu**: wywołanie authService.logout czyści tokeny i sesję

#### 10.0 Konfiguracja testów
- [ ] **Testy jednostkowe (Vitest)**:
  - Button.test.tsx
  - Header.test.tsx
  - ProductCard.test.tsx
  - LoginPage.test.tsx
  - RegisterPage.test.tsx
- [ ] **Narzędzia testowe**: src/test/setup.ts, src/test/utils.tsx
- [ ] **React Testing Library**: renderowanie komponentów, zdarzenia użytkownika
- [ ] **Interfejs użytkownika Vitest**: npm run test:ui
- [ ] **Pokrycie kodu**: npm run test:coverage
- [ ] **Testy E2E (Playwright)**: pełne testowanie stosu w projekt-sklep-e2e
  - tests/auth.spec.ts
  - tests/products.spec.ts
  - tests/cart.spec.ts

---

## 📚 Zasoby dodatkowe

### Dokumentacja
- [Dokumentacja React](https://react.dev)
- [Podręcznik TypeScript](https://www.typescriptlang.org/docs/)
- [React Router](https://reactrouter.com)
- [Przewodnik Vite](https://vitejs.dev/guide/)

### Dobre praktyki
- [Dobre praktyki React](https://react.dev/learn/thinking-in-react)
- [Dobre praktyki TypeScript](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)
- [Wytyczne dostępności](https://www.w3.org/WAI/WCAG21/quickref/)