import { useMapEvents } from 'react-leaflet'
import { useState, useEffect } from 'react'
import L from 'leaflet'

interface DrawingHandlerProps {
  onDrawingComplete: (coordinates: number[][]) => void
  onPointAdd?: (point: [number, number]) => void
  onCancel: () => void
  isActive: boolean
}

/**
 * Helper function to check if two points are near each other
 * Uses Euclidean distance in coordinate space
 */
function isNearPoint(
  a: [number, number],
  b: [number, number],
  threshold = 0.001
): boolean {
  return Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2)) < threshold
}

/**
 * DrawingHandler component for polygon drawing on Leaflet map
 *
 * Features:
 * - Click to add polygon vertices
 * - Click near first point to close polygon (circular completion)
 * - Double-click to close polygon
 * - Escape key to cancel drawing
 * - Returns GeoJSON coordinates in [lng, lat] order (RFC 7946)
 *
 * Usage:
 * ```tsx
 * <DrawingHandler
 *   isActive={isDrawing}
 *   onDrawingComplete={(coords) => setPolygon(coords)}
 *   onCancel={() => setIsDrawing(false)}
 * />
 * ```
 */
export function DrawingHandler({
  onDrawingComplete,
  onPointAdd,
  onCancel,
  isActive,
}: DrawingHandlerProps) {
  const [points, setPoints] = useState<[number, number][]>([])

  // Clear points when drawing is deactivated
  useEffect(() => {
    if (!isActive) {
      setPoints([])
    }
  }, [isActive])

  // Only attach event listeners when actively drawing
  useMapEvents({
    click: (e) => {
      if (!isActive) return

      const { lat, lng } = e.latlng
      // GeoJSON uses [lng, lat] order per RFC 7946
      const newPoint: [number, number] = [lng, lat]

      // Check if clicking near first point (complete polygon)
      if (points.length >= 2 && isNearPoint(newPoint, points[0])) {
        const closedPoints = [...points, points[0]]
        setPoints([])
        onDrawingComplete(closedPoints)
        return
      }

      setPoints([...points, newPoint])

      // Notify parent about the new point for visual feedback
      if (onPointAdd) {
        onPointAdd(newPoint)
      }
    },

    dblclick: (e) => {
      if (!isActive || points.length < 3) return

      // Close polygon by adding first point at the end
      const closedPoints = [...points, points[0]]
      setPoints([])
      onDrawingComplete(closedPoints)

      // Prevent map zoom on double-click
      L.DomEvent.stopPropagation(e)
    },

    keydown: (e) => {
      if (!isActive) return

      if (e.originalEvent.key === 'Escape') {
        setPoints([])
        onCancel()
      }
    },
  })

  // This component doesn't render anything - it only attaches event listeners
  return null
}
