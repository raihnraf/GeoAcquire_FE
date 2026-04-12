import { Circle, CircleMarker } from 'react-leaflet'
import L from 'leaflet'
import type { BufferResult } from '@/api/types'
import { BUFFER_COLOR } from '@/lib/utils'

interface BufferVisualizationProps {
  bufferResult: BufferResult | null
}

/**
 * BufferVisualization component
 *
 * Renders spatial overlay for buffer analysis results:
 * - Blue circle showing the buffer radius
 * - Center point marker at the analysis location
 *
 * @param bufferResult - Buffer analysis result from API or null to hide
 */
export function BufferVisualization({ bufferResult }: BufferVisualizationProps) {
  // Return null if no buffer result
  if (!bufferResult) {
    return null
  }

  // Parse center from GeoJSON [lng, lat] format
  const centerCoords = bufferResult.center.coordinates
  const centerLatLng = L.latLng(centerCoords[1], centerCoords[0])

  return (
    <>
      {/* Buffer radius circle */}
      <Circle
        center={centerLatLng}
        radius={bufferResult.radius}
        pathOptions={{
          color: BUFFER_COLOR,           // blue-500 stroke
          fillColor: BUFFER_COLOR,
          fillOpacity: 0.15,             // 15% opacity per UI-SPEC
          weight: 2,
        }}
      />

      {/* Center point marker */}
      <CircleMarker
        center={centerLatLng}
        radius={6}
        pathOptions={{
          fillColor: BUFFER_COLOR,
          color: '#ffffff',              // white stroke
          weight: 2,
          fillOpacity: 1,
        }}
      />
    </>
  )
}
