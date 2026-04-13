import L from 'leaflet'
import type { ParcelStatus } from '@/api/types'

/**
 * Filter state interface for URL parameter synchronization
 */
export interface FilterState {
  status: ParcelStatus[]
  bbox: L.LatLngBounds | null
  selected: number | null
  bufferCenter: L.LatLng | null
  bufferRadius: number
}

/**
 * Valid parcel status values for validation
 */
const VALID_STATUSES: ParcelStatus[] = ['free', 'negotiating', 'target']

/**
 * Parse status parameter(s) from URL.
 * Supports multiple formats:
 * - Multiple params: status=free&status=negotiating
 * - Array-style: status[]=free&status[]=negotiating
 * - Comma-separated: status=free,negotiating
 * @param params - URLSearchParams instance
 * @returns Array of valid ParcelStatus values
 */
export function parseStatusFromParams(params: URLSearchParams): ParcelStatus[] {
  // Try multiple params first (status=free&status=negotiating)
  const statusArray = params.getAll('status')
  if (statusArray.length > 1) {
    const validParts = statusArray.filter(
      (s): s is ParcelStatus => s !== '' && VALID_STATUSES.includes(s as ParcelStatus)
    )
    if (validParts.length > 0) {
      return validParts
    }
  }

  // Try single value or comma-separated (status=free,negotiating)
  const statusParam = params.get('status')
  if (statusParam) {
    const parts = statusParam.split(',').map(s => s.trim().toLowerCase())
    const validParts = parts.filter(
      (s): s is ParcelStatus => s !== '' && VALID_STATUSES.includes(s as ParcelStatus)
    )
    if (validParts.length > 0) {
      return validParts
    }
  }

  // Try array-style format (status[]=free&status[]=negotiating) - legacy
  const statusBracketsArray = params.getAll('status[]')
  if (statusBracketsArray.length > 0) {
    const validParts = statusBracketsArray.filter(
      (s): s is ParcelStatus => s !== '' && VALID_STATUSES.includes(s as ParcelStatus)
    )
    if (validParts.length > 0) {
      return validParts
    }
  }

  return []
}

/**
 * Parse status parameter from URL (legacy function for backward compatibility)
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
 * Parse buffer parameter from URL
 * @param bufferParam - Buffer string "lat,lng:radius" or null
 * @returns Object with bufferCenter and bufferRadius, or null if invalid
 */
export function parseBuffer(
  bufferParam: string | null
): { bufferCenter: L.LatLng; bufferRadius: number } | null {
  if (!bufferParam) {
    return null
  }

  const parts = bufferParam.split(':')
  if (parts.length !== 2) {
    return null
  }

  const [centerStr, radiusStr] = parts
  const centerParts = centerStr.split(',')

  if (centerParts.length !== 2) {
    return null
  }

  const [lat, lng] = centerParts.map(v => parseFloat(v))
  const radius = parseInt(radiusStr, 10)

  // Validate all values are valid numbers
  if (isNaN(lat) || isNaN(lng) || isNaN(radius)) {
    return null
  }

  // Validate radius is within reasonable bounds (1-10000 meters)
  if (radius < 1 || radius > 10000) {
    return null
  }

  try {
    return {
      bufferCenter: L.latLng(lat, lng),
      bufferRadius: radius,
    }
  } catch {
    return null
  }
}

/**
 * Build URLSearchParams from filter state
 * Uses array-style parameters (status[]=free&status[]=negotiating) to work around
 * PHP built-in server's limitation with commas in query parameters.
 * @param filters - Current filter state
 * @returns URLSearchParams instance
 */
export function buildUrlParams(filters: FilterState): URLSearchParams {
  const params = new URLSearchParams()

  // Use plain status parameter (status=free&status=negotiating)
  // Laravel handles this as array automatically
  if (filters.status.length > 0) {
    filters.status.forEach(status => params.append('status', status))
  }

  if (filters.bbox) {
    const bbox = filters.bbox.toBBoxString()
    params.set('bbox', bbox)
  }

  if (filters.selected !== null) {
    params.set('selected', String(filters.selected))
  }

  if (filters.bufferCenter) {
    const { lat, lng } = filters.bufferCenter
    params.set('buffer', `${lat},${lng}:${filters.bufferRadius}`)
  }

  return params
}
