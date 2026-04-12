import { useQuery } from '@tanstack/react-query'
import { api } from '@/api/axios'
import type { BufferResult } from '@/api/types'
import { bufferRequestSchema } from '@/lib/zod'
import L from 'leaflet'

/**
 * React Query hook for buffer analysis
 *
 * Features:
 * - Fetches parcels within a specified radius of a center point
 * - Validates request with bufferRequestSchema before API call
 * - Query is enabled only when center is set and radius is valid
 * - 5 minute stale time for spatial data caching
 *
 * Usage in BufferPanel or MapView:
 * ```tsx
 * const { data, isLoading, error, refetch } = useBufferAnalysis(center, radius)
 * ```
 *
 * @param center - Leaflet LatLng object for buffer center (null to disable query)
 * @param radius - Buffer radius in meters (1-10000)
 * @returns React Query result with BufferResult data
 */
export function useBufferAnalysis(center: L.LatLng | null, radius: number) {
  return useQuery<BufferResult>({
    queryKey: ['buffer', center?.lat, center?.lng, radius],
    queryFn: async () => {
      if (!center) {
        throw new Error('Center is required for buffer analysis')
      }

      // Prepare request data
      const requestData = {
        lat: center.lat,
        lng: center.lng,
        distance: radius,
      }

      // Validate with Zod schema before sending to API
      const validated = bufferRequestSchema.parse(requestData)

      // Post to buffer endpoint
      const { data } = await api.post<BufferResult>('/buffer', validated)
      return data
    },
    enabled: !!center && radius > 0 && radius <= 10000,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}
