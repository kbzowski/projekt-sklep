import React, { Component, type ReactNode } from 'react'
import { Link } from 'react-router-dom'

import { ROUTES } from '../../lib/routes'

import styles from './ErrorBoundary.module.css'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): State {
    return { hasError: true }
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
          <Link to={ROUTES.HOME} className={styles.link}>
            Wróć do strony głównej
          </Link>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
