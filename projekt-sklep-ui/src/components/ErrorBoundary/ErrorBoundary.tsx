import React, { Component, type ReactNode } from 'react'

import styles from './ErrorBoundary.module.css'

/**
 * ErrorBoundary - łapie błędy renderowania w całej aplikacji
 *
 * UWAGA: Używa <a> zamiast <Link> z react-router-dom
 *
 * Dlaczego?
 * - ErrorBoundary może być umieszczony w dowolnym miejscu hierarchii
 * - <Link> wymaga Router Context (musi być PONIŻEJ <Router>)
 * - <a> jest natywnym HTML elementem - działa WSZĘDZIE
 * - Nie ma zależności od react-router-dom
 *
 * Trade-off:
 * - <a href="/"> powoduje pełne przeładowanie strony (full page reload)
 * - <Link to="/"> to client-side navigation (szybszy, zachowuje state)
 * - W przypadku błędu, pełne przeładowanie jest pożądane (czyści state)
 */

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className={styles.container}>
          <h1 className={styles.title}>Coś poszło nie tak</h1>
          <p className={styles.description}>Wystąpił błąd aplikacji.</p>
          {this.state.error && (
            <p className={styles.error}>{this.state.error.message}</p>
          )}
          <a href="/" className={styles.link}>
            Wróć do strony głównej
          </a>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
