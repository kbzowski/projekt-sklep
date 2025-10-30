import {BrowserRouter as Router} from 'react-router-dom'

import AppRouter from './components/AppRouter'
import {ConfigProvider} from './components/ConfigProvider'
import ErrorBoundary from './components/ErrorBoundary'
import {AppAuthHandler} from './context/AppAuthHandler'
import {AppProvider} from './context/AppContext'

/**
 * Główny komponent aplikacji
 *
 * Hierarchia komponentów:
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * ErrorBoundary
 *   - Łapie błędy z całej aplikacji
 *   - Może być umieszczony WSZĘDZIE w hierarchii
 *
 * ConfigProvider (Suspense + use())
 *   - Ładuje konfigurację API z use(configPromise)
 *
 * Router (React Router Context)
 *   - Dostarcza routing context dla <Link>, useNavigate...
 *   - Musi być PONIŻEJ ConfigProvider (potrzebuje config)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */
function App() {
  return (
    <ErrorBoundary>
      <ConfigProvider>
        <AppProvider>
          <Router>
            <AppAuthHandler>
              <AppRouter />
            </AppAuthHandler>
          </Router>
        </AppProvider>
      </ConfigProvider>
    </ErrorBoundary>
  )
}

export default App
