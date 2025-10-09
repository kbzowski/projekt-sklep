import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'

import { ROUTE_METADATA } from '../../lib/routes'
import ErrorBoundary from '../ErrorBoundary'
import Footer from '../Footer'
import Header from '../Header'
import styles from './Layout.module.css'

/**
 * Main Layout component using React Router's Outlet pattern
 * Best practice: Centralized layout with nested routing
 */
export default function Layout() {
  const location = useLocation()

  // Update document title based on current route
  useEffect(() => {
    const metadata = ROUTE_METADATA[location.pathname as keyof typeof ROUTE_METADATA]
    if (metadata) {
      document.title = `${metadata.title} - E-Zaliczenie`
    }
    else {
      document.title = 'E-Zaliczenie'
    }
  }, [location.pathname])

  return (
    <ErrorBoundary>
      <div className={styles.app}>
        <Header />
        <main className={styles.main}>
          {/* Outlet renders the matched child route component */}
          <Outlet />
        </main>
        <Footer />
      </div>
    </ErrorBoundary>
  )
}
