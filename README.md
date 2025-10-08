# Edukacyjna Aplikacja E-Commerce

Aplikacja e-commerce typu full-stack demonstrująca React, NestJS oraz nowoczesne praktyki tworzenia aplikacji webowych.

## 📚 Przegląd Projektu

Jest to projekt edukacyjny prezentujący:
- **Frontend**: React 19 z TypeScript, Vite, Tailwind CSS
- **Backend**: NestJS z Prisma ORM, uwierzytelnianie JWT
- **Baza danych**: SQLite (development i testowanie)
- **Testowanie**: Vitest (jednostkowe), Playwright (e2e full-stack)

## 🏗️ Struktura Projektu

```
aplikacja-zaliczeniowa/
├── projekt-sklep-ui/        # Frontend (React + Vite)
├── projekt-sklep-api/       # Backend (NestJS + Prisma)
├── projekt-sklep-e2e/       # Testy E2E full-stack
├── INTEGRATION-GUIDE.md     # Dokumentacja integracji
└── README.md                # Ten plik
```

## 🚀 Szybki Start

### 1. Wymagania

- Node.js 18+
- npm 8+

### 2. Instalacja Zależności

```bash
# Frontend
cd projekt-sklep-ui
npm install

# Backend
cd ../projekt-sklep-api
npm install

# Testy E2E
cd ../projekt-sklep-e2e
npm install
```

### 3. Konfiguracja Zmiennych Środowiskowych

> **Ważne**: Pliki `.env` nie znajdują się w repozytorium. Należy je utworzyć ręcznie przed pierwszym uruchomieniem.

**Frontend:**
```bash
cd projekt-sklep-ui

# Skopiuj plik przykładowy
# Windows:
copy .env.example .env
# Linux/Mac:
cp .env.example .env
```

Zawartość `projekt-sklep-ui/.env`:
```
VITE_API_URL=http://localhost:9000/api
```

**Backend:**
```bash
cd projekt-sklep-api

# Skopiuj plik przykładowy
# Windows:
copy .env.example .env
# Linux/Mac:
cp .env.example .env
```

Zawartość `projekt-sklep-api/.env`:
```
DATABASE_URL="file:./dev.db"
JWT_KEY="a26IpxcFpQqQjHzGXVJypJGLuEjleNpRoIq7FaPRTZdegfEqrghu0fhZRBi5tD"
```

> **Uwaga bezpieczeństwa**: W środowisku produkcyjnym należy wygenerować unikalny `JWT_KEY` (min. 64 losowe znaki). Przykład: `openssl rand -base64 64`

### 4. Konfiguracja Bazy Danych

```bash
cd projekt-sklep-api

# Uruchom migracje
npm run db:update

# Zasilenie bazy danymi deweloperskimi
npm run db:seed

# Zasilenie bazy danymi testowymi (dla testów e2e)
npm run db:seed:test
```

### 5. Uruchomienie Serwerów Deweloperskich

**Terminal 1 - Backend:**
```bash
cd projekt-sklep-api
npm run start:dev
# Działa na http://localhost:9000
```

**Terminal 2 - Frontend:**
```bash
cd projekt-sklep-ui
npm run dev
# Działa na http://localhost:5173
```

### 6. Uruchomienie Testów

**Testy Jednostkowe (Frontend):**
```bash
cd projekt-sklep-ui
npm run test
```

**Testy E2E Full-Stack:**
```bash
cd projekt-sklep-e2e
npm run test:ui
```

## 📖 Dokumentacja

- **[INTEGRATION-GUIDE.md](./INTEGRATION-GUIDE.md)** - Kompletny przewodnik integracji
- **[projekt-sklep-ui/README.md](./projekt-sklep-ui/README.md)** - Dokumentacja frontendu
- **[projekt-sklep-e2e/README.md](./projekt-sklep-e2e/README.md)** - Przewodnik testowania E2E
- **[CLAUDE.md](./CLAUDE.md)** - Instrukcje projektu dla Claude Code

## 🎯 Kluczowe Funkcjonalności

### Frontend
- ✅ React 19 z React Compiler
- ✅ TypeScript w trybie strict
- ✅ Context API do zarządzania stanem
- ✅ React Router v7 do routingu
- ✅ Tailwind CSS do stylowania
- ✅ Vitest + React Testing Library
- ✅ Testy E2E z Playwright

### Backend
- ✅ NestJS REST API
- ✅ Prisma ORM z SQLite
- ✅ Uwierzytelnianie JWT (cookies)
- ✅ Rotacja tokenów odświeżania
- ✅ Walidacja danych wejściowych (class-validator)
- ✅ Testy jednostkowe Jest

### Testowanie Full-Stack
- ✅ Osobny projekt e2e (`projekt-sklep-e2e`)
- ✅ Testuje cały stos (React + NestJS + Baza danych)
- ✅ Rzeczywiste żądania HTTP i operacje na bazie danych
- ✅ Playwright z TypeScript

## 🧪 Testowanie

### Testy Jednostkowe Frontend
```bash
cd projekt-sklep-ui
npm run test          # Uruchom testy
npm run test:ui       # Otwórz UI Vitest
npm run test:coverage # Raport pokrycia kodu
```

### Testy Jednostkowe Backend
```bash
cd projekt-sklep-api
npm run test          # Uruchom testy
npm run test:watch    # Tryb watch
npm run test:cov      # Raport pokrycia kodu
```

### Testy E2E (Full-Stack)
```bash
cd projekt-sklep-e2e
npm test              # Uruchom wszystkie testy e2e
npm run test:ui       # Tryb UI Playwright
npm run test:headed   # Zobacz przeglądarkę
npm run test:debug    # Tryb debugowania
```

## 🔐 Dane Testowe

Dla testów e2e:
```
Email: test@example.com
Hasło: test123
```

Dla developmentu:
```
Email: admin@example.com
Hasło: admin123

Email: user@example.com
Hasło: user123
```

## 📊 Stos Technologiczny

### Frontend
- React 19.1.1
- TypeScript 5.8
- Vite 7
- React Router DOM 7.9
- Tailwind CSS
- Vitest 3.2
- Playwright 1.55

### Backend
- NestJS 11
- Prisma 6.16
- SQLite
- JWT (tokeny dostępu + odświeżania)
- Argon2 (hashowanie haseł)
- Jest 30

## 🎓 Cel Edukacyjny

Ten projekt demonstruje:

1. **Architektura Full-Stack**
   - Wyraźne rozdzielenie odpowiedzialności
   - Projektowanie RESTful API
   - Przepływ uwierzytelniania JWT

2. **Zarządzanie Stanem**
   - Wzorzec Context API
   - Własne hooki
   - Stan serwera vs stan klienta

3. **Strategie Testowania**
   - Testy jednostkowe (komponenty, serwisy)
   - Testy integracyjne (endpointy API)
   - Testy E2E (pełne przepływy użytkownika)

4. **Nowoczesne Narzędzia**
   - Vite dla szybkiego developmentu
   - Prisma dla typowo bezpiecznego dostępu do bazy danych
   - Playwright dla niezawodnego testowania e2e

5. **Dobre Praktyki**
   - TypeScript w całym projekcie
   - ESLint + Prettier
   - Przepływ pracy z Git
   - Dokumentacja

## 📁 Szczegóły Projektu

### Frontend (`projekt-sklep-ui`)
SPA w React z:
- Przeglądaniem i filtrowaniem produktów
- Zarządzaniem koszykiem
- Uwierzytelnianiem użytkownika
- Chronionymi trasami
- Responsywnym designem

### Backend (`projekt-sklep-api`)
NestJS REST API z:
- Zarządzaniem użytkownikami
- Endpointami produktów i kategorii
- Operacjami na koszyku (specyficznymi dla użytkownika)
- Uwierzytelnianiem JWT
- Migracjami bazy danych

### Testy E2E (`projekt-sklep-e2e`)
Osobny projekt testowy:
- Automatyzacja przeglądarki z Playwright
- Rzeczywiste wywołania API
- Weryfikacja stanu bazy danych
- Testowanie pełnych ścieżek użytkownika

## 🛠️ Development

### Jakość Kodu
```bash
# Frontend
cd projekt-sklep-ui
npm run lint          # ESLint
npm run build         # Sprawdzenie TypeScript + build

# Backend
cd projekt-sklep-api
npm run lint          # ESLint
npm run build         # Build
```

### Zarządzanie Bazą Danych
```bash
cd projekt-sklep-api

# Utwórz migrację
npm run db:migrate migration-name

# Zastosuj migracje
npm run db:update

# Zasilenie bazy danych
npm run db:seed

# Reset testowej bazy danych
npm run db:reset:test
```

## 🐛 Rozwiązywanie Problemów

### Port Już Zajęty
```bash
# Windows
netstat -ano | findstr :5173
netstat -ano | findstr :9000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:5173 | xargs kill -9
lsof -ti:9000 | xargs kill -9
```

### Problemy z Bazą Danych
```bash
cd projekt-sklep-api
npm run db:update     # Ponownie zastosuj migracje
npm run db:seed       # Ponownie zasilij danymi
```

### Błędy Testów
```bash
# Reset testowej bazy danych
cd projekt-sklep-api
npm run db:reset:test

# Wyczyść cache Playwright
cd ../projekt-sklep-e2e
npx playwright install --force
```

## 📝 Licencja

To jest projekt edukacyjny. Możesz go swobodnie używać do celów edukacyjnych.

## 🤝 Wkład w Projekt

To jest projekt dydaktyczny. Sugestie i ulepszenia są mile widziane!

## 📚 Zasoby Edukacyjne

- [Dokumentacja React](https://react.dev)
- [Dokumentacja NestJS](https://docs.nestjs.com)
- [Dokumentacja Prisma](https://www.prisma.io/docs)
- [Dokumentacja Playwright](https://playwright.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)