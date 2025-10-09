import { Routes, Route } from 'react-router-dom'

import Layout from './Layout'
import ProtectedRoute from './ProtectedRoute'
import { ROUTES } from '../lib/routes'
import CartPage from '../pages/CartPage'
import HomePage from '../pages/HomePage'
import LoginPage from '../pages/LoginPage'
import NotFoundPage from '../pages/NotFoundPage'
import ProductsPage from '../pages/ProductsPage'
import RegisterPage from '../pages/RegisterPage'


/**
 * AppRouter - definicje wszystkich tras w aplikacji
 *
 * Wzorce routing:
 * 1. Nested routes - Layout jako parent route, dzieci renderowane przez <Outlet />
 * 2. Route guards - ProtectedRoute chroni trasy przed nieautoryzowanym dostępem
 * 3. Route constants (ROUTES) - łatwiejsza refaktoryzacja i brak literałów
 * 4. Catch-all route (*) - obsługa 404 dla nieistniejących tras
 *
 * Typy tras:
 * - Public: dostępne dla wszystkich (/, /products)
 * - Auth-only: dostępne tylko dla niezalogowanych (/login, /register)
 * - Protected: wymagają autentykacji (/cart)
 */
function AppRouter() {
  return (
    <Routes>
      {/*
        Layout route - wspólny layout (Header, Footer) dla wszystkich podstron
        Dzieci renderowane przez <Outlet /> w komponencie Layout
      */}
      <Route path="/" element={<Layout />}>
        {/* === TRASY PUBLICZNE === */}
        <Route index element={<HomePage />} />
        <Route path={ROUTES.PRODUCTS} element={<ProductsPage />} />

        {/*
          === TRASY TYLKO DLA NIEZALOGOWANYCH ===
          requireAuth={false} → jeśli user zalogowany, redirect na stronę główną
          Zapobiega sytuacji: zalogowany user wchodzi na /login → zobaczy stronę główną
        */}
        <Route
          path={ROUTES.LOGIN}
          element={(
            <ProtectedRoute requireAuth={false}>
              <LoginPage />
            </ProtectedRoute>
          )}
        />
        <Route
          path={ROUTES.REGISTER}
          element={(
            <ProtectedRoute requireAuth={false}>
              <RegisterPage />
            </ProtectedRoute>
          )}
        />

        {/*
          === TRASY CHRONIONE (WYMAGAJĄ AUTENTYKACJI) ===
          requireAuth={true} (domyślne) → jeśli user niezalogowany, redirect na /login

          Pattern "intended destination":
          1. User próbuje wejść na /cart bez logowania
          2. ProtectedRoute zapisuje /cart w location.state.from
          3. Przekierowuje na /login
          4. Po zalogowaniu, useLoginPage odczytuje location.state.from
          5. Przekierowuje użytkownika na oryginalnie żądaną stronę (/cart)
        */}
        <Route
          path={ROUTES.CART}
          element={(
            <ProtectedRoute>
              <CartPage />
            </ProtectedRoute>
          )}
        />

        {/* Future protected routes can be added here */}
        {/*
        <Route
          path={ROUTES.PROFILE}
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        */}
      </Route>

      {/* Catch-all route for 404 - must be last */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default AppRouter
