import {type PropsWithChildren, type ReactNode} from 'react'

import PageSuspense from './PageSuspense'
import {useConfig} from '../hooks/useConfig'

function ConfigLoader({ children }: { children: ReactNode }) {
  useConfig()

  return <>{children}</>
}

/**
 * Provider konfiguracji z Suspense boundary
 *
 * Suspense to komponent React, który:
 * 1. Łapie "zawieszone" komponenty (gdy use() czeka na Promise)
 * 2. Pokazuje fallback podczas ładowania
 * 3. Automatycznie pokazuje komponenty gdy Promise zostanie rozwiązany
 */
export function ConfigProvider({ children }: PropsWithChildren) {
  return (
    <PageSuspense loadingText="Ładowanie konfiguracji...">
      <ConfigLoader>{children}</ConfigLoader>
    </PageSuspense>
  )
}
