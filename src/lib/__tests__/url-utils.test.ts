import { describe, it, expect, vi, beforeEach } from 'vitest'
import { parseStatus, parseBbox, buildUrlParams } from '../url-utils'
import type { FilterState } from '../url-utils'

// Mock Leaflet for testing - must be at top level with factory function
vi.mock('leaflet', () => {
  const mockLatLngBoundsInstances: any[] = []
  const mockLatLngBounds = vi.fn((bounds: any) => {
    const instance = {
      bounds,
      getSouthWest: () => ({ lat: bounds[0]?.[0] || -6.2, lng: bounds[0]?.[1] || 106.8 }),
      getNorthEast: () => ({ lat: bounds[1]?.[0] || -6.1, lng: bounds[1]?.[1] || 106.9 }),
      toBBoxString: () => {
        // Format: west,south,east,north (lng,lat,lng,lat)
        if (bounds && bounds[0] && bounds[1]) {
          return `${bounds[0][1]},${bounds[0][0]},${bounds[1][1]},${bounds[1][0]}`
        }
        return '106.8,-6.2,106.9,-6.1'
      },
    }
    mockLatLngBoundsInstances.push(instance)
    return instance
  })

  return {
    default: {
      latLngBounds: mockLatLngBounds,
    },
    latLngBounds: mockLatLngBounds,
  }
})

describe('url-utils', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('parseStatus', () => {
    it("should parse 'free,negotiating' returns ['free', 'negotiating']", () => {
      const result = parseStatus('free,negotiating')
      expect(result).toEqual(['free', 'negotiating'])
    })

    it('should parse null returns []', () => {
      expect(parseStatus(null)).toEqual([])
    })

    it('should parse undefined returns []', () => {
      expect(parseStatus(undefined as any)).toEqual([])
    })

    it("should parse 'invalid' returns [] (defensive)", () => {
      expect(parseStatus('invalid')).toEqual([])
    })

    it('should trim whitespace and filter empty strings', () => {
      expect(parseStatus(' free , negotiating , ')).toEqual(['free', 'negotiating'])
    })

    it('should handle case-insensitive status values', () => {
      expect(parseStatus('FREE,NEGOTIATING,TARGET')).toEqual(['free', 'negotiating', 'target'])
    })

    it('should filter out invalid status values', () => {
      expect(parseStatus('free,invalid,negotiating,wrong')).toEqual(['free', 'negotiating'])
    })

    it('should parse single status value', () => {
      expect(parseStatus('target')).toEqual(['target'])
    })

    it('should handle all three valid statuses', () => {
      expect(parseStatus('free,negotiating,target')).toEqual(['free', 'negotiating', 'target'])
    })
  })

  describe('parseBbox', () => {
    it("should parse '106.8,-6.2,106.9,-6.1' returns valid LatLngBounds", () => {
      const result = parseBbox('106.8,-6.2,106.9,-6.1')
      expect(result).not.toBeNull()
      expect(result).toHaveProperty('toBBoxString')
    })

    it('should parse null returns null', () => {
      expect(parseBbox(null)).toBeNull()
    })

    it('should parse undefined returns null', () => {
      expect(parseBbox(undefined as any)).toBeNull()
    })

    it("should parse 'invalid' returns null (defensive)", () => {
      expect(parseBbox('invalid')).toBeNull()
    })

    it('should return null for malformed bbox (wrong number of parts)', () => {
      expect(parseBbox('106.8,-6.2,106.9')).toBeNull()
      expect(parseBbox('106.8,-6.2')).toBeNull()
      expect(parseBbox('106.8')).toBeNull()
    })

    it('should return null for non-numeric values', () => {
      expect(parseBbox('abc,def,ghi,jkl')).toBeNull()
    })

    it('should parse bbox with decimal values', () => {
      const result = parseBbox('106.123,-6.456,106.789,-6.123')
      expect(result).not.toBeNull()
      expect(result).toHaveProperty('toBBoxString')
    })
  })

  describe('buildUrlParams', () => {
    it('should create URLSearchParams from filter state with status', () => {
      const filters: FilterState = {
        status: ['free', 'negotiating'],
        bbox: null,
        selected: null,
      }
      const result = buildUrlParams(filters)
      expect(result.get('status')).toBe('free,negotiating')
      expect(result.get('bbox')).toBeNull()
      expect(result.get('selected')).toBeNull()
    })

    it('should return empty URLSearchParams with empty filters', () => {
      const filters: FilterState = {
        status: [],
        bbox: null,
        selected: null,
      }
      const result = buildUrlParams(filters)
      expect(result.toString()).toBe('')
    })

    it('should include bbox in URLSearchParams when present', () => {
      const mockBounds = {
        toBBoxString: () => '106.8,-6.2,106.9,-6.1',
      } as any

      const filters: FilterState = {
        status: [],
        bbox: mockBounds,
        selected: null,
      }
      const result = buildUrlParams(filters)
      expect(result.get('bbox')).toBe('106.8,-6.2,106.9,-6.1')
    })

    it('should include selected parcel ID in URLSearchParams when present', () => {
      const filters: FilterState = {
        status: ['target'],
        bbox: null,
        selected: 123,
      }
      const result = buildUrlParams(filters)
      expect(result.get('selected')).toBe('123')
    })

    it('should include all parameters when all filters are set', () => {
      const mockBounds = {
        toBBoxString: () => '106.8,-6.2,106.9,-6.1',
      } as any

      const filters: FilterState = {
        status: ['free', 'negotiating', 'target'],
        bbox: mockBounds,
        selected: 456,
      }
      const result = buildUrlParams(filters)
      expect(result.get('status')).toBe('free,negotiating,target')
      expect(result.get('bbox')).toBe('106.8,-6.2,106.9,-6.1')
      expect(result.get('selected')).toBe('456')
    })
  })
})
