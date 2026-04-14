import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { api } from '@/api/axios'
import type { ParcelCollection, ParcelStatus } from '@/api/types'
import type { LatLngBounds } from 'leaflet'

interface UseParcelsOptions {
  statuses?: ParcelStatus[]
  page?: number
  perPage?: number
  bbox?: LatLngBounds | null
}

// Maximum parcels to fetch per bbox query to prevent oversized payloads
const BBOX_MAX_PARCELS = 250

/**
 * React Query hook for fetching parcel data with optional status filter, bbox filter, and pagination
 * Returns parcels as GeoJSON FeatureCollection with loading/error states
 * Uses keepPreviousData to prevent UI jumping during pagination (TanStack Query best practice)
 */
export function useParcels({ statuses, page = 1, perPage = 50, bbox }: UseParcelsOptions = {}) {
  // Build query params
  const params: Record<string, any> = {}

  if (statuses && statuses.length > 0) {
    params.status = statuses
  }

  // Add bbox filter if provided (overrides pagination)
  if (bbox) {
    const sw = bbox.getSouthWest()
    const ne = bbox.getNorthEast()
    // Format: minLng,minLat,maxLng,maxLat
    params.bbox = `${sw.lng},${sw.lat},${ne.lng},${ne.lat}`
    // Limit results to prevent oversized payloads
    params.limit = BBOX_MAX_PARCELS
  } else {
    // Add pagination params only when no bbox filter
    params.page = page
    params.per_page = perPage
  }

  // Normalize undefined and empty array to 'all' for consistent query key
  const normalizedStatuses = statuses && statuses.length > 0 ? statuses : 'all'
  // Spatial hash: round to 2 decimal places (~1.1km precision) so nearby viewports
  // hit the same cache entry instead of triggering new fetches on small pans
  const bboxKey = bbox ? `${bbox.getSouthWest().lat.toFixed(2)},${bbox.getSouthWest().lng.toFixed(2)}-${bbox.getNorthEast().lat.toFixed(2)},${bbox.getNorthEast().lng.toFixed(2)}` : 'none'

  return useQuery<ParcelCollection>({
    queryKey: ['parcels', normalizedStatuses, bbox ? 'bbox' : 'page', bboxKey, page, perPage],
    queryFn: async () => {
      // Laravel API returns wrapped response: { data: { type: "FeatureCollection", features: [...] } }
      const response = await api.get('/parcels', { params })
      return response.data.data // Unwrap to get the FeatureCollection
    },
    placeholderData: keepPreviousData, // Keep previous data while fetching new page
    // Use staleTime from queryClient default (5 minutes)
    // Data is relatively static for land parcels
  })
}
