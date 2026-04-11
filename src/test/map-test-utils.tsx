import { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'

// Mock MapContainer for testing (react-leaflet requires Leaflet context)
export const MockMapProvider = ({ children }: { children: ReactNode }) => {
  return <div data-testid="mock-map">{children}</div>
}

// Create a test QueryClient instance
export const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

// Wrapper with QueryClient for React Query hooks
export const createWrapper = () => {
  const queryClient = createTestQueryClient()
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <MockMapProvider>{children}</MockMapProvider>
    </QueryClientProvider>
  )
}

// Helper for rendering with map context
export const renderWithMapContext = (ui: ReactNode) => {
  const wrapper = createWrapper()
  return render(ui, { wrapper })
}
