import { Circle, CircleMarker } from 'react-leaflet'
import L from 'leaflet'
import type { BufferResult } from '@/api/types'
import { BUFFER_COLOR } from '@/lib/utils'

interface BufferVisualizationProps {
  bufferResult: BufferResult | null
  center: L.LatLng | null
  radius: number
}

/**
 * BufferVisualization component
 *
 * Renders spatial overlay for buffer analysis results:
 * - Blue circle showing the buffer radius
 * - Center point marker at the analysis location
 *
 * @param bufferResult - Buffer analysis result from API or null to hide
 * @param center - Buffer center coordinates
 * @param radius - Buffer radius in meters
 */
export function BufferVisualization({ bufferResult, center, radius }: BufferVisualizationProps) {
  // Return null if no buffer result or invalid center/radius
  if (!bufferResult || !center || radius <= 0) {
    return null
  }

  return (
    <>
      {/* Buffer radius circle */}
      <Circle
        center={center}
        radius={radius}
        pathOptions={{
          color: BUFFER_COLOR,           // blue-500 stroke
          fillColor: BUFFER_COLOR,
          fillOpacity: 0.15,             // 15% opacity per UI-SPEC
          weight: 2,
        }}
        interactive={false}
      />

      {/* Center point marker */}
      <CircleMarker
        center={center}
        radius={6}
        pathOptions={{
          fillColor: BUFFER_COLOR,
          color: '#ffffff',              // white stroke
          weight: 2,
          fillOpacity: 1,
        }}
        interactive={false}
      />
    </>
  )
}
