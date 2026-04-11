import { MapIcon } from 'lucide-react'

export function EmptyState() {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-50">
      <div className="text-center">
        {/* Map icon from lucide-react */}
        <div className="mb-4 flex justify-center">
          <MapIcon className="h-16 w-16 text-slate-400" />
        </div>
        <h2 className="mb-2 text-xl font-semibold text-slate-900">
          No parcels yet
        </h2>
        <p className="text-slate-600">
          Create your first parcel or import GeoJSON data to get started
        </p>
      </div>
    </div>
  )
}
