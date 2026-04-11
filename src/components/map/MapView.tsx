import { MapContainer, TileLayer } from 'react-leaflet'
import { useParcels } from '@/hooks/useParcels'
import { LoadingSkeleton } from './LoadingSkeleton'
import { EmptyState } from './EmptyState'
import { ParcelLayer } from './ParcelLayer'

interface MapViewProps {
  onParcelClick?: (id: number) => void
}

export function MapView({ onParcelClick }: MapViewProps) {
  const { data, isLoading, isFetched } = useParcels()

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

      {/* Parcel layer with colored polygons (MAP-02, MAP-03) */}
      {data && <ParcelLayer data={data} onParcelClick={onParcelClick} />}
    </MapContainer>
  )
}
