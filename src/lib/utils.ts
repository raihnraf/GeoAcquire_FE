import type { ParcelStatus, ParcelFeature } from '../api/types'

// Status color mapping (matches REQUIREMENTS.md MAP-02)
export const STATUS_COLORS: Record<ParcelStatus, string> = {
  free: '#22c55e',       // green-500
  negotiating: '#eab308', // yellow-500
  target: '#ef4444',     // red-500
}

// Buffer/nearby highlight color (matches RESEARCH.md ANA-05)
export const BUFFER_COLOR = '#3b82f6' // blue-500

/**
 * Get color for parcel status
 */
export function getParcelColor(status: ParcelStatus): string {
  return STATUS_COLORS[status]
}

/**
 * Format area in square meters or hectares
 * Shows hectares for areas >= 10,000 sqm, otherwise square meters
 */
export function formatArea(sqm: number): string {
  if (sqm >= 10000) {
    return `${(sqm / 10000).toFixed(2)} ha`
  }
  return `${sqm.toLocaleString()} m²`
}

/**
 * Calculate polygon area using Shoelace formula
 * Returns area in square meters
 * Note: This is an approximation; for production use Turf.js or leaflet-geometryutil
 */
export function calculatePolygonArea(coordinates: number[][]): number {
  let area = 0
  const n = coordinates.length

  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n
    const [lng1, lat1] = coordinates[i]
    const [lng2, lat2] = coordinates[j]
    area += lng1 * lat2
    area -= lng2 * lat1
  }

  // Convert to square meters (approximate)
  // This is a rough calculation; for accurate results use a geospatial library
  return Math.abs(area) * 12363.5 // Approximate conversion factor
}

/**
 * Get area from parcel feature
 */
export function getParcelArea(feature: ParcelFeature): number {
  return feature.properties?.area_sqm ?? 0
}

/**
 * Format price with currency
 */
export function formatPrice(pricePerSqm: number | null, areaSqm: number): string {
  if (pricePerSqm === null) {
    return 'Price not set'
  }
  const total = pricePerSqm * areaSqm
  return `IDR ${total.toLocaleString('id-ID')}`
}

/**
 * Format date for display
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength)}...`
}

/**
 * cn utility for conditional Tailwind classes
 * (simplified version of clsx/cn for this project)
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}
