/**
 * Route constants for the application
 * Using constants ensures type safety and easy refactoring
 */
export const ROUTES = {
  HOME: '/',
  PRODUCTS: '/products',
  PRODUCT_DETAIL: '/products/:id', // For future use
  CART: '/cart',
  LOGIN: '/login',
  REGISTER: '/register',
  PROFILE: '/profile', // For future use
  CHECKOUT: '/checkout', // For future use
} as const

/**
 * Route path generators for dynamic routes
 */
export const generatePath = {
  productDetail: (id: string | number) => `/products/${id}`,
  userProfile: (userId: string | number) => `/profile/${userId}`,
} as const

/**
 * Route metadata for navigation and SEO
 */
export const ROUTE_METADATA = {
  [ROUTES.HOME]: {
    title: 'Strona Główna',
    description: 'Witamy w naszym sklepie internetowym',
    showInNav: false,
  },
  [ROUTES.PRODUCTS]: {
    title: 'Produkty',
    description: 'Przeglądaj naszą ofertę produktów',
    showInNav: true,
  },
  [ROUTES.CART]: {
    title: 'Koszyk',
    description: 'Twój koszyk zakupowy',
    showInNav: false,
  },
  [ROUTES.LOGIN]: {
    title: 'Logowanie',
    description: 'Zaloguj się do swojego konta',
    showInNav: false,
  },
  [ROUTES.REGISTER]: {
    title: 'Rejestracja',
    description: 'Utwórz nowe konto',
    showInNav: false,
  },
} as const

/**
 * Navigation items configuration
 */
export const NAV_ITEMS = [
  {
    path: ROUTES.HOME,
    label: 'Strona Główna',
    showWhenLoggedIn: true,
    showWhenLoggedOut: true,
  },
  {
    path: ROUTES.PRODUCTS,
    label: 'Produkty',
    showWhenLoggedIn: true,
    showWhenLoggedOut: true,
  },
] as const

/**
 * Routes that should redirect if user is already logged in
 */
export const AUTH_ROUTES = [
  ROUTES.LOGIN,
  ROUTES.REGISTER,
] as const
