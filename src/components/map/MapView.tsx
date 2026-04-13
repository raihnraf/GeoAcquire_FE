import { MapContainer, TileLayer, useMapEvents } from 'react-leaflet'
import { useEffect, useState, useRef } from 'react'
import type { Map } from 'leaflet'
import type { ParcelCollection } from '@/api/types'
import { LoadingSkeleton } from './LoadingSkeleton'
import { EmptyState } from './EmptyState'
import { ParcelLayer } from './ParcelLayer'
import { DrawingHandler } from './DrawingHandler'
import { DrawingPreview } from './DrawingPreview'
import { ModeBadge } from './ModeBadge'
import { BBoxDrawing } from './BBoxDrawing'
import { BufferVisualization } from './BufferVisualization'
import type { MapMode } from '@/hooks/useMapMode'
import type { BufferResult } from '@/api/types'
import type L from 'leaflet'

// Internal component for handling buffer-point mode clicks
interface BufferPointHandlerProps {
  mode: MapMode
  onBufferPointSelect?: (point: L.LatLng) => void
}

function BufferPointHandler({ mode, onBufferPointSelect }: BufferPointHandlerProps) {
  useMapEvents({
    click: (e) => {
      if (mode === 'buffer-point' && onBufferPointSelect) {
        onBufferPointSelect(e.latlng)
      }
    },
  })
  return null
}

interface MapViewProps {
  data?: ParcelCollection | null
  isLoading?: boolean
  isFetched?: boolean
  onParcelClick?: (id: number) => void
  isDrawingMode?: boolean
  onDrawingComplete?: (coordinates: number[][]) => void
  onDrawingCancel?: () => void
  drawingPoints?: [number, number][]
  // Props for bbox mode
  mode?: MapMode
  onBboxComplete?: (bounds: L.LatLngBounds) => void
  onExitMode?: () => void
  activeBbox?: L.LatLngBounds | null
  // Prop for buffer visualization
  bufferResult?: BufferResult | null
  // Prop for buffer point selection
  onBufferPointSelect?: (point: L.LatLng) => void
}

export function MapView({
  data,
  isLoading = false,
  isFetched = false,
  onParcelClick,
  isDrawingMode = false,
  onDrawingComplete,
  onDrawingCancel,
  drawingPoints,
  mode = 'normal',
  onBboxComplete,
  onExitMode,
  activeBbox,
  bufferResult,
  onBufferPointSelect,
}: MapViewProps) {
  const [map, setMap] = useState<Map | null>(null)
  // Preserve viewport state across re-renders (e.g., when filters change)
  const [viewport, setViewport] = useState<{ center: L.LatLngExpression; zoom: number }>({
    center: [-2.5, 118] as L.LatLngExpression,
    zoom: 5,
  })
  const isInitialized = useRef(false)

  // Change cursor to crosshair when in drawing, bbox, or buffer-point mode
  useEffect(() => {
    if (map) {
      const shouldShowCrosshair = isDrawingMode || mode === 'bbox' || mode === 'buffer-point'
      map.getContainer().style.cursor = shouldShowCrosshair ? 'crosshair' : ''
    }
  }, [map, isDrawingMode, mode])

  // Track viewport changes to preserve them across re-renders
  useEffect(() => {
    if (!map) return

    const handleMoveEnd = () => {
      const center = map.getCenter()
      const zoom = map.getZoom()
      setViewport({ center: [center.lat, center.lng], zoom })
    }

    map.on('moveend', handleMoveEnd)

    // Set initial viewport on first mount only
    if (!isInitialized.current) {
      isInitialized.current = true
    }

    return () => {
      map.off('moveend', handleMoveEnd)
    }
  }, [map])

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
      center={viewport.center}
      zoom={viewport.zoom}
      minZoom={3}
      maxZoom={19}
      className="z-0 h-full w-full"
      zoomControl={true}
    >
      {/* Map event handlers for buffer-point mode */}
      <BufferPointHandler
        mode={mode}
        onBufferPointSelect={onBufferPointSelect}
      />

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

      {/* Bounding box drawing handler - also shows when activeBbox exists */}
      {(mode === 'bbox' || activeBbox) && onBboxComplete && onExitMode && (
        <BBoxDrawing
          onComplete={onBboxComplete}
          onCancel={onExitMode}
          activeBbox={activeBbox}
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
      {data && (
        <ParcelLayer
          data={data}
          onParcelClick={onParcelClick}
          bufferResult={bufferResult}
        />
      )}

      {/* Buffer visualization overlay */}
      {bufferResult && <BufferVisualization bufferResult={bufferResult} />}
    </MapContainer>
  )
}
