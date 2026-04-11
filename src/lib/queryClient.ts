import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data is fresh for 5 minutes (parcel data doesn't change often)
      staleTime: 1000 * 60 * 5,
      // Cache for 30 minutes (session duration)
      gcTime: 1000 * 60 * 30,
      // Single retry for network failures
      retry: 1,
      // Don't refetch on window focus (map data)
      refetchOnWindowFocus: false,
      // Refetch on mount if data is stale
      refetchOnMount: true,
      // Don't refetch on reconnect (too aggressive for map data)
      refetchOnReconnect: false,
    },
    mutations: {
      // Single retry for mutations
      retry: 1,
    },
  },
})
