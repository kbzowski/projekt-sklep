import { Link } from 'react-router-dom'

import Button from '../../components/Button'
import { ROUTES } from '../../lib/routes'

import styles from './Auth.module.css'
import { useLoginPage } from './useLoginPage'

/**
 * LoginPage with React Router v6 best practices
 * Demonstrates proper redirect handling after authentication
 */
export default function LoginPage() {
  const {
    email,
    setEmail,
    password,
    setPassword,
    error,
    isLoading,
    handleSubmit,
  } = useLoginPage()

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <h1 className={styles.title}>Logowanie</h1>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="email">
            Email
          </label>
          <input
            className={styles.input}
            type="email"
            id="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="password">
            Hasło
          </label>
          <input
            className={styles.input}
            type="password"
            id="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>

        <div className={styles.submitButton}>
          <Button variant="primary" fullWidth type="submit" disabled={isLoading}>
            {isLoading ? 'Logowanie...' : 'Zaloguj się'}
          </Button>
        </div>

        {error && (
          <div className={styles.error}>
            {error}
          </div>
        )}

        <Link to={ROUTES.REGISTER} className={styles.link}>
          Nie masz konta? Zarejestruj się
        </Link>
      </form>
    </div>
  )
}
