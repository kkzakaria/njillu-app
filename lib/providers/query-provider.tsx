'use client'

import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

interface QueryProviderProps {
  children: React.ReactNode
}

export function QueryProvider({ children }: QueryProviderProps) {
  // Create query client avec configuration optimisée
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Temps de mise en cache des données (5 minutes)
            staleTime: 5 * 60 * 1000,
            // Temps de conservation en mémoire (10 minutes)
            gcTime: 10 * 60 * 1000,
            // Retry policy personnalisée
            retry: (failureCount, error) => {
              // Ne pas retry sur 404 ou erreurs auth
              if (error && typeof error === 'object' && 'status' in error) {
                const status = error.status as number
                if (status === 404 || status === 401 || status === 403) {
                  return false
                }
              }
              // Retry jusqu'à 2 fois pour autres erreurs
              return failureCount < 2
            },
            // Délai de retry avec backoff exponentiel
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
          },
          mutations: {
            // Retry des mutations en cas d'erreur network
            retry: 1,
            retryDelay: 1000,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* DevTools seulement en développement */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  )
}