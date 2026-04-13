import { useMapEvents, Rectangle } from 'react-leaflet'
import { useState } from 'react'
import L from 'leaflet'

interface BBoxDrawingProps {
  onComplete: (bounds: L.LatLngBounds) => void
  onCancel: () => void
  activeBbox?: L.LatLngBounds | null  // Persist bbox after completion
}

/**
 * Bounding box drawing handler for spatial filtering
 *
 * Features:
 * - First click sets the starting corner
 * - Mouse movement updates the rectangle preview
 * - Second click completes the bounding box
 * - Escape key cancels the drawing
 * - Active bbox persists with subtle styling (outline only)
 *
 * Usage:
 * ```tsx
 * <BBoxDrawing
 *   onComplete={(bounds) => setFilters({ ...filters, bbox: bounds })}
 *   onCancel={() => exitMode()}
 *   activeBbox={filters.bbox}
 * />
 * ```
 */
export function BBoxDrawing({ onComplete, onCancel, activeBbox }: BBoxDrawingProps) {
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

  // Show active bbox if exists (filter applied)
  if (activeBbox && !startPoint) {
    return (
      <Rectangle
        bounds={activeBbox}
        color="#3b82f6"       // blue-500 stroke
        fillColor="#3b82f6"   // blue-500 fill
        fillOpacity={0.05}    // More subtle fill for active bbox
        weight={2}
        dashArray="5, 5"      // Dashed line for active filter indicator
        interactive={false}    // Don't capture clicks on the rectangle itself
      />
    )
  }

  // Only render preview rectangle when drawing
  if (!startPoint || !currentPoint) {
    return null
  }

  const bounds = L.latLngBounds(startPoint, currentPoint)

  return (
    <Rectangle
      bounds={bounds}
      color="#3b82f6"       // blue-500 stroke
      fillColor="#3b82f6"   // blue-500 fill
      fillOpacity={0.15}    // 15% fill opacity for drawing preview
      weight={2}
      interactive={false}    // Don't capture clicks on the rectangle itself
    />
  )
}
