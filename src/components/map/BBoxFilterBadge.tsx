import { BoxSelect, X } from 'lucide-react'
import L from 'leaflet'

interface BBoxFilterBadgeProps {
  bbox: L.LatLngBounds | null
  onClear: () => void
}

/**
 * Badge indicator for active bounding box filter
 *
 * Shows when a bbox filter is applied, displaying the bounds
 * and providing a clear button.
 *
 * @example
 * ```tsx
 * <BBoxFilterBadge
 *   bbox={filters.bbox}
 *   onClear={() => setFilters({ ...filters, bbox: null })}
 * />
 * ```
 */
export function BBoxFilterBadge({ bbox, onClear }: BBoxFilterBadgeProps) {
  if (!bbox) {
    return null
  }

  return (
    <div className="absolute top-4 left-4 z-15">
      <div className="flex items-center gap-2 rounded-full bg-blue-50 border border-blue-200 px-3 py-2 shadow-sm">
        {/* Filter icon */}
        <BoxSelect className="h-4 w-4 text-blue-600" aria-hidden="true" />

        {/* Filter text */}
        <span className="text-sm font-medium text-blue-900">
          BBox Filter Active
        </span>

        {/* Bounds hint */}
        <span className="text-xs text-blue-600 hidden sm:inline">
          {bbox.getWest().toFixed(2)}, {bbox.getSouth().toFixed(2)} to {bbox.getEast().toFixed(2)}, {bbox.getNorth().toFixed(2)}
        </span>

        {/* Clear button */}
        <button
          onClick={onClear}
          className="ml-1 rounded-full p-0.5 text-blue-600 transition-colors hover:bg-blue-200 hover:text-blue-900"
          aria-label="Clear bbox filter"
          type="button"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}
