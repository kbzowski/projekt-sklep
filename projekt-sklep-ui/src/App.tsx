import { BrowserRouter as Router } from 'react-router-dom'

import AppRouter from './components/AppRouter'
import { ConfigProvider } from './components/ConfigProvider'
import { AppAuthHandler } from './context/AppAuthHandler'
import { AppProvider } from './context/AppContext'

/**
 * Main App component with provider setup and routing
 *
 * Key patterns demonstrated:
 * - Context provider composition for global state
 * - Router configuration with BrowserRouter
 * - Separation of concerns with dedicated AppRouter component
 */
function App() {
  return (
    <ConfigProvider>
      <AppProvider>
        <Router>
          <AppAuthHandler>
            <AppRouter />
          </AppAuthHandler>
        </Router>
      </AppProvider>
    </ConfigProvider>
  )
}

export default App
