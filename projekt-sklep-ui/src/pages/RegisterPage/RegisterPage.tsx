import { Link } from 'react-router-dom'

import { useRegisterPage } from './useRegisterPage'
import Button from '../../components/Button'
import { ROUTES } from '../../lib/routes'
import styles from '../../styles/Auth.module.css'


/**
 * RegisterPage with React Router v6 best practices
 * Demonstrates proper redirect handling after registration
 */
export default function RegisterPage() {
  const {
    email,
    setEmail,
    password,
    setPassword,
    name,
    setName,
    error,
    isLoading,
    handleSubmit,
  } = useRegisterPage()

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <h1 className={styles.title}>Rejestracja</h1>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="name">
            Imię i nazwisko
          </label>
          <input
            className={styles.input}
            type="text"
            id="name"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
        </div>

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
            {isLoading ? 'Rejestracja...' : 'Zarejestruj się'}
          </Button>
        </div>

        {error && (
          <div className={styles.error}>
            {error}
          </div>
        )}

        <Link to={ROUTES.LOGIN} className={styles.link}>
          Masz już konto? Zaloguj się
        </Link>
      </form>
    </div>
  )
}
