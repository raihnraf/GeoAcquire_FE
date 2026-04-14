import { useMemo, memo } from 'react'
import { GeoJSON } from 'react-leaflet'
import type { ParcelCollection, ParcelFeature, BufferResult } from '@/api/types'
import type { Feature, Geometry } from 'geojson'
import { getParcelColor } from '@/lib/utils'
import type { LatLngBounds } from 'leaflet'

interface ParcelLayerProps {
  data: ParcelCollection
  onParcelClick?: (id: number) => void
  bufferResult?: BufferResult | null
  mapBounds?: LatLngBounds | null
}

// Check if a GeoJSON feature intersects with the map bounds
function isFeatureInBounds(feature: ParcelFeature, bounds: LatLngBounds): boolean {
  const coords = feature.geometry.coordinates
  // Polygon coordinates are [[[lng, lat], [lng, lat], ...]]
  const outerRing = coords[0]
  
  // Check if any point in the outer ring is within the bounds
  for (const [lng, lat] of outerRing) {
    if (bounds.contains([lat, lng])) {
      return true
    }
  }
  
  // Also check if bounds corner is inside polygon (for large parcels that contain viewport)
  const corners = [
    bounds.getNorthWest(),
    bounds.getNorthEast(),
    bounds.getSouthWest(),
    bounds.getSouthEast(),
  ]
  
  // Simple bounding box check for corners
  const minLng = Math.min(...outerRing.map(c => c[0]))
  const maxLng = Math.max(...outerRing.map(c => c[0]))
  const minLat = Math.min(...outerRing.map(c => c[1]))
  const maxLat = Math.max(...outerRing.map(c => c[1]))
  
  for (const corner of corners) {
    if (
      corner.lng >= minLng &&
      corner.lng <= maxLng &&
      corner.lat >= minLat &&
      corner.lat <= maxLat
    ) {
      return true
    }
  }
  
  return false
}

// Memoized component to prevent unnecessary re-renders when parent re-renders
export const ParcelLayer = memo(function ParcelLayer({ data, onParcelClick, bufferResult, mapBounds }: ParcelLayerProps) {
  // Filter features to only those visible in current viewport (performance optimization for 1000+ parcels)
  const visibleFeatures = useMemo(() => {
    if (!mapBounds) {
      return data.features // Render all if no bounds provided
    }
    
    return data.features.filter(feature => isFeatureInBounds(feature, mapBounds))
  }, [data.features, mapBounds])

  // Memoized GeoJSON data with only visible features
  const visibleData = useMemo(() => {
    return {
      ...data,
      features: visibleFeatures,
    }
  }, [data, visibleFeatures])

  // Extract nearby parcel IDs for buffer highlighting - memoized to prevent recomputation
  const nearbyIds = useMemo(() => {
    return new Set(
      bufferResult?.features?.map(f => f.properties?.id).filter(Boolean) || []
    )
  }, [bufferResult])

  const hasBufferResult = !!bufferResult

  // Style function for parcel polygons (MAP-02)
  // Use Feature<Geometry, any> to match react-leaflet's StyleFunction signature
  const getStyle = useMemo(() => {
    return (feature: Feature<Geometry, any> | undefined): any => {
      // Cast to ParcelFeature to access status property
      const parcelFeature = feature as ParcelFeature | undefined
      const status = parcelFeature?.properties?.status || 'free'
      const parcelId = parcelFeature?.properties?.id
      const isNearby = parcelId ? nearbyIds.has(parcelId) : false

      // Buffer highlight style (ANA-05) for nearby parcels
      if (isNearby) {
        return {
          color: '#3b82f6',           // blue-500 stroke
          fillColor: '#3b82f6',
          fillOpacity: 0.2,
          weight: 3,                  // Thicker stroke for nearby parcels
          pointerEvents: 'auto',      // Ensure click events work
        }
      }

      // Normal status-based styling
      return {
        color: getParcelColor(status),           // Stroke color matches status
        fillColor: getParcelColor(status),       // Fill color matches status
        fillOpacity: hasBufferResult ? 0.3 : 0.5, // Fade non-matching during buffer
        weight: 2,                               // 2px stroke width
        pointerEvents: 'auto',                   // Ensure click events work
      }
    }
  }, [nearbyIds, hasBufferResult])

  // Click handler for parcel selection (MAP-03)
  const handleClick = useMemo(() => {
    return (event: any) => {
      const layer = event.layer
      const feature = layer.feature as ParcelFeature | undefined
      const parcelId = feature?.properties?.id

      if (parcelId && onParcelClick) {
        onParcelClick(parcelId)
      }
    }
  }, [onParcelClick])

  // Stable key using data version hash (avoid expensive JSON.stringify on every render)
  // Only changes when features actually change, not on parent re-renders
  const geoJsonKey = useMemo(() => {
    // Use a lighterweight key: just IDs concatenated
    return visibleFeatures.map(f => f.id).join('-')
  }, [visibleFeatures])

  return (
    <GeoJSON
      key={geoJsonKey}
      data={visibleData}
      style={getStyle}
      eventHandlers={{
        click: handleClick,
      }}
      interactive={true}
    />
  )
})
