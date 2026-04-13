import { useQuery } from '@tanstack/react-query'
import { api } from '@/api/axios'
import type { ParcelCollection, ParcelStatus } from '@/api/types'

interface UseParcelsOptions {
  statuses?: ParcelStatus[]
}

/**
 * React Query hook for fetching parcel data with optional status filter
 * Returns parcels as GeoJSON FeatureCollection with loading/error states
 */
export function useParcels({ statuses }: UseParcelsOptions = {}) {
  // Build query params from statuses
  // Use array format (status[]=free&status[]=negotiating) to work around
  // PHP built-in server's limitation with commas in query parameters
  const params = statuses && statuses.length > 0
    ? { status: statuses }
    : undefined

  // Normalize undefined and empty array to 'all' for consistent query key
  // This ensures ['parcels', undefined] and ['parcels', []] use the same cache entry
  const normalizedStatuses = statuses && statuses.length > 0 ? statuses : 'all'

  return useQuery<ParcelCollection>({
    queryKey: ['parcels', normalizedStatuses],
    queryFn: async () => {
      // Laravel API returns wrapped response: { data: { type: "FeatureCollection", features: [...] } }
      const response = await api.get('/parcels', { params })
      return response.data.data // Unwrap to get the FeatureCollection
    },
    // Use staleTime from queryClient default (5 minutes)
    // Data is relatively static for land parcels
  })
}
