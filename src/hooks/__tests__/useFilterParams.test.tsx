import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { createWrapper } from '@/test/map-test-utils'
import { useFilterParams } from '@/hooks/useFilterParams'

// Mock url-utils functions with factory function
vi.mock('@/lib/url-utils', () => ({
  parseStatus: vi.fn((status: string | null) => {
    if (!status) return []
    const valid = ['free', 'negotiating', 'target']
    return status.split(',').filter((s: string) => valid.includes(s.trim().toLowerCase()))
  }),
  parseBbox: vi.fn((bbox: string | null) => {
    if (!bbox) return null
    return { toBBoxString: () => bbox }
  }),
  parseBuffer: vi.fn((buffer: string | null) => {
    if (!buffer) return null
    const [centerStr, radiusStr] = buffer.split(':')
    const [lat, lng] = centerStr.split(',').map(Number)
    return {
      bufferCenter: { lat, lng },
      bufferRadius: parseInt(radiusStr, 10),
    }
  }),
  buildUrlParams: vi.fn((filters: any) => {
    const params = new URLSearchParams()
    if (filters.status?.length) params.set('status', filters.status.join(','))
    if (filters.bbox) params.set('bbox', filters.bbox.toBBoxString())
    if (filters.selected) params.set('selected', String(filters.selected))
    if (filters.bufferCenter) {
      const { lat, lng } = filters.bufferCenter
      params.set('buffer', `${lat},${lng}:${filters.bufferRadius}`)
    }
    return params
  }),
}))

// Mock Leaflet
vi.mock('leaflet', () => ({
  default: {
    latLngBounds: vi.fn(),
    latLng: vi.fn((lat: number, lng: number) => ({ lat, lng })),
  },
  latLngBounds: vi.fn(),
  latLng: vi.fn((lat: number, lng: number) => ({ lat, lng })),
}))

// Mock window.location.search
const mockLocation = {
  search: '',
  pathname: '/',
}

Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
})

// Mock window.history.replaceState
const mockReplaceState = vi.fn()
Object.defineProperty(window.history, 'replaceState', {
  value: mockReplaceState,
  writable: true,
})

describe('useFilterParams', () => {
  let wrapper: ReturnType<typeof createWrapper>

  beforeEach(() => {
    vi.clearAllMocks()
    wrapper = createWrapper()
    // Reset location
    mockLocation.search = ''
    mockLocation.pathname = '/'
    mockReplaceState.mockClear()
  })

  it('should initialize with default filters', () => {
    const { result } = renderHook(() => useFilterParams(), { wrapper })

    expect(result.current.filters.status).toEqual([])
    expect(result.current.filters.bbox).toBeNull()
    expect(result.current.filters.selected).toBeNull()
    expect(result.current.filters.bufferCenter).toBeNull()
    expect(result.current.filters.bufferRadius).toBe(500)
  })

  it('should parse status from URL params on mount', () => {
    mockLocation.search = '?status=free,negotiating'

    const { result } = renderHook(() => useFilterParams(), { wrapper })

    expect(result.current.filters.status).toEqual(['free', 'negotiating'])
  })

  it('should parse bbox from URL params on mount', () => {
    mockLocation.search = '?bbox=106.8,-6.2,106.9,-6.1'

    const { result } = renderHook(() => useFilterParams(), { wrapper })

    expect(result.current.filters.bbox).not.toBeNull()
  })

  it('should parse selected parcel ID from URL params', () => {
    mockLocation.search = '?selected=123'

    const { result } = renderHook(() => useFilterParams(), { wrapper })

    expect(result.current.filters.selected).toBe(123)
  })

  it('should parse all params from URL on mount', () => {
    mockLocation.search = '?status=free,negotiating,target&bbox=106.8,-6.2,106.9,-6.1&selected=456&buffer=-6.2,106.8:500'

    const { result } = renderHook(() => useFilterParams(), { wrapper })

    expect(result.current.filters.status).toEqual(['free', 'negotiating', 'target'])
    expect(result.current.filters.bbox).not.toBeNull()
    expect(result.current.filters.selected).toBe(456)
    expect(result.current.filters.bufferCenter).not.toBeNull()
    expect(result.current.filters.bufferRadius).toBe(500)
  })

  it('should update URL when filters change', async () => {
    mockLocation.search = ''

    const { result } = renderHook(() => useFilterParams(), { wrapper })

    act(() => {
      result.current.setFilters({
        status: ['free'],
        bbox: null,
        selected: null,
      })
    })

    await waitFor(() => {
      expect(mockReplaceState).toHaveBeenCalled()
    })
  })

  it('should clear all filters resets URL', async () => {
    mockLocation.search = '?status=free,negotiating&selected=123'

    const { result } = renderHook(() => useFilterParams(), { wrapper })

    expect(result.current.filters.status).toEqual(['free', 'negotiating'])

    act(() => {
      result.current.clearFilters()
    })

    await waitFor(() => {
      expect(result.current.filters.status).toEqual([])
      expect(result.current.filters.selected).toBeNull()
      expect(result.current.filters.bufferCenter).toBeNull()
      expect(mockReplaceState).toHaveBeenCalledWith({}, '', window.location.pathname)
    })
  })

  it('should provide setFilters function', () => {
    const { result } = renderHook(() => useFilterParams(), { wrapper })

    expect(typeof result.current.setFilters).toBe('function')
  })

  it('should provide clearFilters function', () => {
    const { result } = renderHook(() => useFilterParams(), { wrapper })

    expect(typeof result.current.clearFilters).toBe('function')
  })

  it('should parse buffer parameter from URL params on mount', () => {
    mockLocation.search = '?buffer=-6.2,106.8:500'

    const { result } = renderHook(() => useFilterParams(), { wrapper })

    expect(result.current.filters.bufferCenter).not.toBeNull()
    expect(result.current.filters.bufferRadius).toBe(500)
  })

  it('should include buffer in URL when buffer state changes', async () => {
    mockLocation.search = ''

    const { result } = renderHook(() => useFilterParams(), { wrapper })

    act(() => {
      result.current.setFilters({
        status: [],
        bbox: null,
        selected: null,
        bufferCenter: { lat: -6.2, lng: 106.8 },
        bufferRadius: 1000,
      })
    })

    await waitFor(() => {
      expect(mockReplaceState).toHaveBeenCalled()
    })
  })

  it('should clear all filters including buffer state', async () => {
    mockLocation.search = '?status=free&buffer=-6.2,106.8:500'

    const { result } = renderHook(() => useFilterParams(), { wrapper })

    expect(result.current.filters.status).toEqual(['free'])
    expect(result.current.filters.bufferCenter).not.toBeNull()

    act(() => {
      result.current.clearFilters()
    })

    await waitFor(() => {
      expect(result.current.filters.status).toEqual([])
      expect(result.current.filters.bufferCenter).toBeNull()
      expect(result.current.filters.bufferRadius).toBe(500) // Reset to default
    })
  })
})
