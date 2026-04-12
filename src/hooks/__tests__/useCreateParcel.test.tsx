import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useCreateParcel } from '../useCreateParcel'
import { api } from '@/api/axios'

vi.mock('@/api/axios')

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  })
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('useCreateParcel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create parcel successfully', async () => {
    const mockResponse = { data: { id: 1, owner_name: 'Test' } }
    vi.mocked(api.post).mockResolvedValue(mockResponse)

    const { result } = renderHook(() => useCreateParcel(), { wrapper: createWrapper() })

    await result.current.mutateAsync({
      owner_name: 'Test Owner',
      status: 'free',
      price_per_sqm: 100000,
      geometry: { type: 'Polygon', coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]] }
    })

    expect(api.post).toHaveBeenCalledWith('/parcels', expect.any(Object))
  })

  it('should invalidate parcels query on success', async () => {
    const mockResponse = { data: { id: 1 } }
    vi.mocked(api.post).mockResolvedValue(mockResponse)

    const { result } = renderHook(() => useCreateParcel(), { wrapper: createWrapper() })

    await result.current.mutateAsync({
      owner_name: 'Test',
      status: 'free',
      geometry: { type: 'Polygon', coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]] }
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })
  })

  it('should handle error gracefully', async () => {
    const mockError = { response: { data: { message: 'Error creating parcel' } } }
    vi.mocked(api.post).mockRejectedValue(mockError)

    const { result } = renderHook(() => useCreateParcel(), { wrapper: createWrapper() })

    await expect(result.current.mutateAsync({
      owner_name: 'Test',
      status: 'free',
      geometry: { type: 'Polygon', coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]] }
    })).rejects.toThrow()

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })
  })
})
