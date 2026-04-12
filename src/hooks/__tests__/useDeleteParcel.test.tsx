import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useDeleteParcel } from '../useDeleteParcel'
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

describe('useDeleteParcel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should delete parcel successfully', async () => {
    const mockResponse = { data: { message: 'Parcel deleted' } }
    vi.mocked(api.delete).mockResolvedValue(mockResponse)

    const { result } = renderHook(() => useDeleteParcel(), { wrapper: createWrapper() })

    await result.current.mutateAsync(1)

    expect(api.delete).toHaveBeenCalledWith('/parcels/1')
  })

  it('should invalidate parcels query on success', async () => {
    const mockResponse = { data: { message: 'Deleted' } }
    vi.mocked(api.delete).mockResolvedValue(mockResponse)

    const { result } = renderHook(() => useDeleteParcel(), { wrapper: createWrapper() })

    await result.current.mutateAsync(1)

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })
  })

  it('should handle error gracefully', async () => {
    const mockError = { response: { data: { message: 'Error deleting parcel' } } }
    vi.mocked(api.delete).mockRejectedValue(mockError)

    const { result } = renderHook(() => useDeleteParcel(), { wrapper: createWrapper() })

    await expect(result.current.mutateAsync(1)).rejects.toThrow()

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })
  })
})
