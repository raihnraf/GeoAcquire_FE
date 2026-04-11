import { GeoJSON } from 'react-leaflet'
import type { ParcelCollection, ParcelFeature } from '@/api/types'
import type { Feature, Geometry } from 'geojson'
import { getParcelColor } from '@/lib/utils'

interface ParcelLayerProps {
  data: ParcelCollection
  onParcelClick?: (id: number) => void
}

export function ParcelLayer({ data, onParcelClick }: ParcelLayerProps) {
  // Style function for parcel polygons (MAP-02)
  // Use Feature<Geometry, any> to match react-leaflet's StyleFunction signature
  const getStyle = (feature: Feature<Geometry, any> | undefined) => {
    // Cast to ParcelFeature to access status property
    const parcelFeature = feature as ParcelFeature | undefined
    const status = parcelFeature?.properties?.status || 'free'
    const color = getParcelColor(status)

    return {
      color,           // Stroke color matches status
      fillColor: color, // Fill color matches status
      fillOpacity: 0.5, // 50% opacity per UI-SPEC
      weight: 2,        // 2px stroke width
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
      data={data}
      style={getStyle}
      eventHandlers={{
        click: handleClick,
      }}
    />
  )
}
