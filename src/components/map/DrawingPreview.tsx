import { Polygon, Polyline, CircleMarker } from 'react-leaflet'

interface DrawingPreviewProps {
  points: [number, number][] // GeoJSON coordinates [lng, lat]
}

/**
 * DrawingPreview component for visual feedback during polygon drawing
 *
 * Features:
 * - Blue connecting lines between vertices
 * - Circle markers at each vertex (blue fill, white stroke)
 * - Fill preview at 30% opacity when 3+ points exist
 * - Converts GeoJSON [lng, lat] to Leaflet [lat, lng] for rendering
 *
 * Usage:
 * ```tsx
 * <DrawingPreview points={drawingPoints} />
 * ```
 */
export function DrawingPreview({ points }: DrawingPreviewProps) {
  // Return null if no points to render
  if (points.length === 0) {
    return null
  }

  // Convert GeoJSON [lng, lat] to Leaflet [lat, lng] for rendering
  const leafletPoints = points.map(
    ([lng, lat]) => [lat, lng] as [number, number]
  )

  return (
    <>
      {/* Connecting lines between vertices */}
      {leafletPoints.length >= 2 && (
        <Polyline
          positions={leafletPoints}
          color="#3b82f6" // blue-500
          weight={2}
        />
      )}

      {/* Vertex markers - blue circles with white stroke */}
      {leafletPoints.map((point, index) => (
        <CircleMarker
          key={index}
          center={point}
          radius={6}
          fillColor="#3b82f6"
          color="#ffffff" // white stroke
          weight={2}
          fillOpacity={1}
        />
      ))}

      {/* Fill preview - closed polygon with 30% opacity */}
      {leafletPoints.length >= 3 && (
        <Polygon
          positions={[...leafletPoints, leafletPoints[0]]} // close the polygon
          fillColor="#3b82f6"
          color="#3b82f6"
          fillOpacity={0.3}
          weight={2}
        />
      )}
    </>
  )
}
