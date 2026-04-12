import { MapContainer, TileLayer } from 'react-leaflet'
import { useEffect, useState } from 'react'
import type { Map } from 'leaflet'
import { useParcels } from '@/hooks/useParcels'
import { LoadingSkeleton } from './LoadingSkeleton'
import { EmptyState } from './EmptyState'
import { ParcelLayer } from './ParcelLayer'
import { DrawingHandler } from './DrawingHandler'
import { DrawingPreview } from './DrawingPreview'
import { ModeBadge } from './ModeBadge'
import { BBoxDrawing } from './BBoxDrawing'
import type { MapMode } from '@/hooks/useMapMode'
import type L from 'leaflet'

interface MapViewProps {
  onParcelClick?: (id: number) => void
  isDrawingMode?: boolean
  onDrawingComplete?: (coordinates: number[][]) => void
  onDrawingCancel?: () => void
  drawingPoints?: [number, number][]
  // New props for bbox mode
  mode?: MapMode
  onBboxComplete?: (bounds: L.LatLngBounds) => void
  onExitMode?: () => void
}

export function MapView({
  onParcelClick,
  isDrawingMode = false,
  onDrawingComplete,
  onDrawingCancel,
  drawingPoints,
  mode = 'normal',
  onBboxComplete,
  onExitMode,
}: MapViewProps) {
  const { data, isLoading, isFetched } = useParcels()
  const [map, setMap] = useState<Map | null>(null)

  // Change cursor to crosshair when in drawing or bbox mode
  useEffect(() => {
    if (map) {
      const shouldShowCrosshair = isDrawingMode || mode === 'bbox'
      map.getContainer().style.cursor = shouldShowCrosshair ? 'crosshair' : ''
    }
  }, [map, isDrawingMode, mode])

  // Loading state (MAP-06)
  if (isLoading) {
    return <LoadingSkeleton />
  }

  // Empty state (MAP-07)
  if (isFetched && (!data || data.features.length === 0)) {
    return <EmptyState />
  }

  return (
    <MapContainer
      ref={setMap}
      center={[-2.5, 118]} // Indonesia center (per RESEARCH.md)
      zoom={5}
      minZoom={3}
      maxZoom={19}
      className="z-0 h-full w-full"
      zoomControl={true}
    >
      {/* OpenStreetMap tile layer (MAP-01) */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
      />

      {/* Mode badge indicator */}
      {mode !== 'normal' && onExitMode && (
        <ModeBadge mode={mode} onExit={onExitMode} />
      )}

      {/* Bounding box drawing handler */}
      {mode === 'bbox' && onBboxComplete && onExitMode && (
        <BBoxDrawing
          onComplete={onBboxComplete}
          onCancel={onExitMode}
        />
      )}

      {/* Drawing handler for polygon drawing */}
      {isDrawingMode && onDrawingComplete && onDrawingCancel && (
        <DrawingHandler
          isActive={isDrawingMode}
          onDrawingComplete={onDrawingComplete}
          onCancel={onDrawingCancel}
        />
      )}

      {/* Drawing preview for visual feedback */}
      {drawingPoints && drawingPoints.length > 0 && (
        <DrawingPreview points={drawingPoints} />
      )}

      {/* Parcel layer with colored polygons (MAP-02, MAP-03) */}
      {data && <ParcelLayer data={data} onParcelClick={onParcelClick} />}
    </MapContainer>
  )
}
