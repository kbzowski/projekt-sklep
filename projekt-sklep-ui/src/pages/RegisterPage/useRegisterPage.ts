import {useState} from 'react'
import {useNavigate} from 'react-router-dom'

import {ROUTES} from '../../lib/routes'
import {authService} from '../../services'

export const useRegisterPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>('')
  const [isLoading, setIsLoading] = useState(false)

  const navigate = useNavigate()


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // 1. Zarejestruj użytkownika (ale nie loguj automatycznie)
      await authService.register(email, password, name)

      // 2. Nawiguj do strony logowania po udanej rejestracji
      navigate(ROUTES.LOGIN, { replace: true })
    }
    catch (error) {
      // Display specific error message from API
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError('Błąd podczas rejestracji')
      }
    }
    finally {
      setIsLoading(false)
    }
  }

  return {
    // Form state
    email,
    setEmail,
    password,
    setPassword,
    name,
    setName,
    error,
    isLoading,
    // Actions
    handleSubmit,
  }
}
