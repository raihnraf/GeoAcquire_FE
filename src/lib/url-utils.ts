import L from 'leaflet'
import type { ParcelStatus } from '@/api/types'

/**
 * Filter state interface for URL parameter synchronization
 */
export interface FilterState {
  status: ParcelStatus[]
  bbox: L.LatLngBounds | null
  selected: number | null
}

/**
 * Valid parcel status values for validation
 */
const VALID_STATUSES: ParcelStatus[] = ['free', 'negotiating', 'target']

/**
 * Parse status parameter from URL
 * @param statusParam - Comma-separated status string or null
 * @returns Array of valid ParcelStatus values
 */
export function parseStatus(statusParam: string | null): ParcelStatus[] {
  if (!statusParam) {
    return []
  }

  const parts = statusParam.split(',').map(s => s.trim().toLowerCase())
  const validParts = parts.filter(
    (s): s is ParcelStatus => s !== '' && VALID_STATUSES.includes(s as ParcelStatus)
  )

  return validParts
}

/**
 * Parse bbox parameter from URL
 * @param bboxParam - Comma-separated bbox string "minLng,minLat,maxLng,maxLat" or null
 * @returns Leaflet LatLngBounds or null
 */
export function parseBbox(bboxParam: string | null): L.LatLngBounds | null {
  if (!bboxParam) {
    return null
  }

  const parts = bboxParam.split(',')
  if (parts.length !== 4) {
    return null
  }

  const [minLng, minLat, maxLng, maxLat] = parts.map(v => parseFloat(v))

  // Validate all values are valid numbers
  if (
    isNaN(minLng) ||
    isNaN(minLat) ||
    isNaN(maxLng) ||
    isNaN(maxLat)
  ) {
    return null
  }

  try {
    return L.latLngBounds(
      [minLat, minLng],
      [maxLat, maxLng]
    )
  } catch {
    return null
  }
}

/**
 * Build URLSearchParams from filter state
 * @param filters - Current filter state
 * @returns URLSearchParams instance
 */
export function buildUrlParams(filters: FilterState): URLSearchParams {
  const params = new URLSearchParams()

  if (filters.status.length > 0) {
    params.set('status', filters.status.join(','))
  }

  if (filters.bbox) {
    const bbox = filters.bbox.toBBoxString()
    params.set('bbox', bbox)
  }

  if (filters.selected !== null) {
    params.set('selected', String(filters.selected))
  }

  return params
}
