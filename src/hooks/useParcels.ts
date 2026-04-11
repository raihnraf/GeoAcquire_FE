import { useQuery } from '@tanstack/react-query'
import { api } from '@/api/axios'
import type { ParcelCollection } from '@/api/types'

/**
 * React Query hook for fetching parcel data
 * Returns parcels as GeoJSON FeatureCollection with loading/error states
 */
export function useParcels() {
  return useQuery<ParcelCollection>({
    queryKey: ['parcels'],
    queryFn: async () => {
      const { data } = await api.get<ParcelCollection>('/parcels')
      return data
    },
    // Use staleTime from queryClient default (5 minutes)
    // Data is relatively static for land parcels
  })
}
