import { GeoJSON } from 'react-leaflet'
import type { ParcelCollection, ParcelFeature, BufferResult } from '@/api/types'
import type { Feature, Geometry } from 'geojson'
import { getParcelColor } from '@/lib/utils'

interface ParcelLayerProps {
  data: ParcelCollection
  onParcelClick?: (id: number) => void
  bufferResult?: BufferResult | null
}

export function ParcelLayer({ data, onParcelClick, bufferResult }: ParcelLayerProps) {
  // Extract nearby parcel IDs for buffer highlighting
  const nearbyIds = new Set(
    bufferResult?.parcels.features.map(f => f.properties?.id).filter(Boolean) || []
  )

  // Style function for parcel polygons (MAP-02)
  // Use Feature<Geometry, any> to match react-leaflet's StyleFunction signature
  const getStyle = (feature: Feature<Geometry, any> | undefined) => {
    // Cast to ParcelFeature to access status property
    const parcelFeature = feature as ParcelFeature | undefined
    const status = parcelFeature?.properties?.status || 'free'
    const parcelId = parcelFeature?.properties?.id
    const isNearby = parcelId ? nearbyIds.has(parcelId) : false
    const hasBufferResult = !!bufferResult

    // Buffer highlight style (ANA-05) for nearby parcels
    if (isNearby) {
      return {
        color: '#3b82f6',           // blue-500 stroke
        fillColor: '#3b82f6',
        fillOpacity: 0.2,
        weight: 3,                  // Thicker stroke for nearby parcels
      }
    }

    // Normal status-based styling
    return {
      color: getParcelColor(status),           // Stroke color matches status
      fillColor: getParcelColor(status),       // Fill color matches status
      fillOpacity: hasBufferResult ? 0.3 : 0.5, // Fade non-matching during buffer
      weight: 2,                               // 2px stroke width
    }
  }

  // Click handler for parcel selection (MAP-03)
  const handleClick = (event: any) => {
    const layer = event.layer
    const feature = layer.feature as ParcelFeature | undefined
    const parcelId = feature?.properties?.id

    if (parcelId && onParcelClick) {
      onParcelClick(parcelId)
    }
  }

  return (
    <GeoJSON
      key={JSON.stringify(data.features.map(f => f.id))}
      data={data}
      style={getStyle}
      eventHandlers={{
        click: handleClick,
      }}
    />
  )
}
