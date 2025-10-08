import { useLocation, useNavigate } from 'react-router-dom'

import { useApp } from '../../context/AppContext'
import { ROUTES } from '../../lib/routes'
import { authService } from '../../services'

export const useHeader = () => {
  const { state, setUser, setCart } = useApp()
  const { user, cart } = state
  const navigate = useNavigate()
  const location = useLocation()

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

  return {
    user,
    cart,
    handleLogout,
  }
}
