import { useMapEvents, Rectangle } from 'react-leaflet'
import { useState } from 'react'
import L from 'leaflet'

interface BBoxDrawingProps {
  onComplete: (bounds: L.LatLngBounds) => void
  onCancel: () => void
}

/**
 * Bounding box drawing handler for spatial filtering
 *
 * Features:
 * - First click sets the starting corner
 * - Mouse movement updates the rectangle preview
 * - Second click completes the bounding box
 * - Escape key cancels the drawing
 * - Blue rectangle with 10% fill opacity
 *
 * Usage:
 * ```tsx
 * <BBoxDrawing
 *   onComplete={(bounds) => setFilters({ ...filters, bbox: bounds })}
 *   onCancel={() => exitMode()}
 * />
 * ```
 */
export function BBoxDrawing({ onComplete, onCancel }: BBoxDrawingProps) {
  const [startPoint, setStartPoint] = useState<L.LatLng | null>(null)
  const [currentPoint, setCurrentPoint] = useState<L.LatLng | null>(null)

  useMapEvents({
    click: (e) => {
      // Stop propagation to prevent parcel selection during drawing
      L.DomEvent.stopPropagation(e)

      if (!startPoint) {
        // First click - set starting corner
        setStartPoint(e.latlng)
      } else {
        // Second click - complete the bounding box
        const bounds = L.latLngBounds(startPoint, e.latlng)
        onComplete(bounds)
        // Reset points after completion
        setStartPoint(null)
        setCurrentPoint(null)
      }
    },

    mousemove: (e) => {
      // Update current point while drawing
      if (startPoint) {
        setCurrentPoint(e.latlng)
      }
    },

    keydown: (e) => {
      // Escape key cancels drawing
      if (e.originalEvent.key === 'Escape') {
        setStartPoint(null)
        setCurrentPoint(null)
        onCancel()
      }
    },
  })

  // Only render rectangle when we have both points
  if (!startPoint || !currentPoint) {
    return null
  }

  const bounds = L.latLngBounds(startPoint, currentPoint)

  return (
    <Rectangle
      bounds={bounds}
      color="#3b82f6"       // blue-500 stroke
      fillColor="#3b82f6"   // blue-500 fill
      fillOpacity={0.1}     // 10% fill opacity
      weight={2}
      interactive={false}   // Don't capture clicks on the rectangle itself
    />
  )
}
