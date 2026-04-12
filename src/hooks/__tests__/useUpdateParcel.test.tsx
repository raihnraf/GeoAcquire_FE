import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useUpdateParcel } from '../useUpdateParcel'
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

describe('useUpdateParcel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should update parcel successfully', async () => {
    const mockResponse = { data: { id: 1, owner_name: 'Updated' } }
    vi.mocked(api.put).mockResolvedValue(mockResponse)

    const { result } = renderHook(() => useUpdateParcel(), { wrapper: createWrapper() })

    await result.current.mutateAsync({
      id: 1,
      data: {
        owner_name: 'Updated Owner',
        status: 'negotiating',
        price_per_sqm: 150000,
        geometry: { type: 'Polygon', coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]] }
      }
    })

    expect(api.put).toHaveBeenCalledWith('/parcels/1', expect.any(Object))
  })

  it('should invalidate parcels query on success', async () => {
    const mockResponse = { data: { id: 1 } }
    vi.mocked(api.put).mockResolvedValue(mockResponse)

    const { result } = renderHook(() => useUpdateParcel(), { wrapper: createWrapper() })

    await result.current.mutateAsync({
      id: 1,
      data: {
        owner_name: 'Test',
        status: 'free',
        geometry: { type: 'Polygon', coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]] }
      }
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })
  })

  it('should handle error gracefully', async () => {
    const mockError = { response: { data: { message: 'Error updating parcel' } } }
    vi.mocked(api.put).mockRejectedValue(mockError)

    const { result } = renderHook(() => useUpdateParcel(), { wrapper: createWrapper() })

    await expect(result.current.mutateAsync({
      id: 1,
      data: {
        owner_name: 'Test',
        status: 'free',
        geometry: { type: 'Polygon', coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]] }
      }
    })).rejects.toThrow()

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })
  })
})
