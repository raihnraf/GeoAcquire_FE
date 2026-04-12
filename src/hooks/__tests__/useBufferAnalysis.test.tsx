import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { createWrapper } from '@/test/map-test-utils'
import { useBufferAnalysis } from '../useBufferAnalysis'
import { api } from '@/api/axios'
import type { BufferResult } from '@/api/types'
import L from 'leaflet'

// Mock api for buffer analysis
vi.mock('@/api/axios', () => ({
  api: {
    post: vi.fn(),
  },
}))

// Mock toast for error handling
vi.mock('react-hot-toast', () => ({
  default: {
    error: vi.fn(),
    success: vi.fn(),
  },
}))

describe('useBufferAnalysis', () => {
  const mockCenter = L.latLng(-6.2088, 106.8456) // Jakarta
  const mockRadius = 500
  const mockBufferResult: BufferResult = {
    center: {
      type: 'Point',
      coordinates: [106.8456, -6.2088],
    },
    radius: 500,
    parcels: {
      type: 'FeatureCollection',
      features: [],
    },
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch buffer results from API', async () => {
    vi.mocked(api.post).mockResolvedValueOnce({ data: mockBufferResult })

    const { result } = renderHook(
      () => useBufferAnalysis(mockCenter, mockRadius),
      { wrapper: createWrapper() }
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(api.post).toHaveBeenCalledWith('/buffer', {
      lat: mockCenter.lat,
      lng: mockCenter.lng,
      distance: mockRadius,
    })
    expect(result.current.data).toEqual(mockBufferResult)
  })

  it('should pass center and radius to API', async () => {
    vi.mocked(api.post).mockResolvedValueOnce({ data: mockBufferResult })

    const testCenter = L.latLng(-6.2, 106.8)
    const testRadius = 1000

    const { result } = renderHook(
      () => useBufferAnalysis(testCenter, testRadius),
      { wrapper: createWrapper() }
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(api.post).toHaveBeenCalledWith('/buffer', {
      lat: -6.2,
      lng: 106.8,
      distance: 1000,
    })
  })

  it('should validate request with bufferRequestSchema', async () => {
    vi.mocked(api.post).mockResolvedValueOnce({ data: mockBufferResult })

    const { result } = renderHook(
      () => useBufferAnalysis(mockCenter, mockRadius),
      { wrapper: createWrapper() }
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    // Schema validation happens internally via Zod
    // If validation fails, an error would be thrown
    const callArgs = vi.mocked(api.post).mock.calls[0]
    expect(callArgs[1]).toHaveProperty('lat')
    expect(callArgs[1]).toHaveProperty('lng')
    expect(callArgs[1]).toHaveProperty('distance')
  })

  it('should enable query only when center is set', async () => {
    const { result: resultNoCenter } = renderHook(
      () => useBufferAnalysis(null, mockRadius),
      { wrapper: createWrapper() }
    )

    // Query should be disabled when center is null
    expect(resultNoCenter.current.fetchStatus).toBe('idle')

    // Now provide a center
    vi.mocked(api.post).mockResolvedValueOnce({ data: mockBufferResult })
    const { result: resultWithCenter } = renderHook(
      () => useBufferAnalysis(mockCenter, mockRadius),
      { wrapper: createWrapper() }
    )

    await waitFor(() => expect(resultWithCenter.current.isSuccess).toBe(true))
    expect(api.post).toHaveBeenCalled()
  })

  it('should handle loading and error states', async () => {
    const mockError = new Error('Network error')
    vi.mocked(api.post).mockRejectedValueOnce(mockError)

    const { result } = renderHook(
      () => useBufferAnalysis(mockCenter, mockRadius),
      { wrapper: createWrapper() }
    )

    // Initially loading
    expect(result.current.isLoading).toBe(true)

    // After error
    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error).toBeTruthy()
  })
})
