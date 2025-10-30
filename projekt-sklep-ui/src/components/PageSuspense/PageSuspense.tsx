import React, { Suspense } from 'react'

import styles from './PageSuspense.module.css'

/**
 * Wrapper komponent dla React Suspense - zapewnia spójne loading states
 *
 * React 19 Suspense pozwala na deklaratywne zarządzanie loading states.
 * Zamiast ręcznego if (isLoading) return <div>Loading...</div> w każdym komponencie,
 * Suspense automatycznie pokazuje fallback podczas gdy komponenty asynchroniczne się ładują.
 *
 * Dlaczego dedykowany komponent?
 * - DRY: nie powtarzamy <Suspense fallback={...}> w każdym miejscu
 * - Spójność: wszystkie loading states wyglądają tak samo
 * - Łatwa customizacja: można podać własny fallback lub loadingText
 * - Composition pattern: łatwo rozszerzyć o dodatkowe features (np. timeout, error recovery)
 *
 * Użycie:
 * <PageSuspense loadingText="Ładowanie produktów...">
 *   <ProductsPage />
 * </PageSuspense>
 */
interface PageSuspenseProps {
  children: React.ReactNode
  /** Opcjonalny custom fallback UI - nadpisuje domyślny spinner + text */
  fallback?: React.ReactNode
  /** Tekst wyświetlany podczas ładowania (jeśli nie podano custom fallback) */
  loadingText?: string
}

export default function PageSuspense({
  children,
  fallback,
  loadingText = 'Ładowanie...',
}: PageSuspenseProps) {
  // Domyślny fallback: centered spinner + text
  const defaultFallback = (
    <div className={styles.loadingContainer}>
      <div className={styles.spinner} />
      <p className={styles.loadingText}>{loadingText}</p>
    </div>
  )

  return (
    <Suspense fallback={fallback ?? defaultFallback}>
      {children}
    </Suspense>
  )
}
