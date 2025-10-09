import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'

import { useApp } from '../../context/AppContext'
import { NAV_ITEMS, ROUTES } from '../../lib/routes'
import { authService } from '../../services'
import Button from '../Button'
import styles from '../Layout/Layout.module.css'


export default function Header() {
  const { state, setUser, setCart } = useApp()
  const { user, cart } = state
  const navigate = useNavigate()
  const location = useLocation()

  /**
   * Handler wylogowania użytkownika
   *
   * Proces wylogowania:
   * 1. Wywołaj endpoint /auth/logout (usuwa refresh token z bazy)
   * 2. Wyczyść dane użytkownika i koszyka z Context
   * 3. Przekieruj na stronę logowania z informacją o poprzedniej lokalizacji
   *    (umożliwia powrót po ponownym zalogowaniu)
   */
  const handleLogout = async () => {
    try {
      await authService.logout()
      setUser(null)
      setCart([])

      // Navigate to login with current location for potential redirect back
      navigate(ROUTES.LOGIN, {
        state: { from: location.pathname },
        replace: true,
      })
    }
    catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  // Filter navigation items based on auth state
  const visibleNavItems = NAV_ITEMS.filter(item =>
    user ? item.showWhenLoggedIn : item.showWhenLoggedOut,
  )

  return (
    <header className={styles.header}>
      <nav className={styles.nav}>
        {/* Logo with proper navigation */}
        <Link
          to={ROUTES.HOME}
          className={styles.logo}
          aria-label="Wróć do strony głównej"
        >
          E-Zaliczenie
        </Link>

        {/* Main navigation with active states */}
        <div className={styles.navLinks}>
          {visibleNavItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }: { isActive: boolean }) =>
                `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}

            >
              {item.label}
            </NavLink>
          ))}
        </div>

        {/* User section with conditional rendering */}
        <div className={styles.userSection}>
          {/* Cart always visible but behavior depends on auth */}
          {user
            ? (
              <Link to={ROUTES.CART} aria-label={`Koszyk (${cartItemsCount} przedmiotów)`} className={styles.cartContainer}>
                <Button variant="primary">
                  Koszyk
                  {cartItemsCount > 0 && (
                    <span className={styles.cartBadge} aria-label={`${cartItemsCount} przedmiotów w koszyku`}>
                      {cartItemsCount}
                    </span>
                  )}
                </Button>
              </Link>
            )
            : (
              <Link
                to={ROUTES.LOGIN}
                state={{ from: location.pathname }}
                aria-label="Zaloguj się, aby uzyskać dostęp do koszyka"
                className={styles.cartContainer}
              >
                <Button variant="primary">
                  Koszyk
                  {cartItemsCount > 0 && (
                    <span className={styles.cartBadge}>
                      {cartItemsCount}
                    </span>
                  )}
                </Button>
              </Link>
            )}

          {/* Authentication section */}
          {user
            ? (
              <>
                <span className={styles.welcomeText}>
                  Witaj,
                  {' '}
                  {user.name}
                  !
                </span>
                <Button
                  variant="secondary"
                  onClick={handleLogout}
                  aria-label="Wyloguj się z konta"
                >
                  Wyloguj
                </Button>
              </>
            )
            : (
              <>
                <NavLink
                  to={ROUTES.LOGIN}
                  className={({ isActive }: { isActive: boolean }) =>
                    `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
                  state={{ from: location.pathname }}
                >
                  Logowanie
                </NavLink>
                <NavLink
                  to={ROUTES.REGISTER}
                  className={({ isActive }: { isActive: boolean }) =>
                    `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
                >
                  Rejestracja
                </NavLink>
              </>
            )}
        </div>
      </nav>
    </header>
  )
}
