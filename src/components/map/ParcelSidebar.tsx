import { X } from 'lucide-react'
import type { ParcelFeature } from '@/api/types'
import { formatArea, formatPrice, formatDate, getParcelColor } from '@/lib/utils'

interface ParcelSidebarProps {
  parcel: ParcelFeature | null
  isOpen: boolean
  onClose: () => void
}

export function ParcelSidebar({ parcel, isOpen, onClose }: ParcelSidebarProps) {
  if (!parcel) return null

  const properties = parcel.properties
  const statusColor = getParcelColor(properties.status)

  return (
    <aside
      className={`fixed top-0 right-0 bottom-0 z-20 w-80 bg-white shadow-xl transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      {/* Header with close button */}
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4">
        <h2 className="text-lg font-semibold text-slate-900">Parcel Details</h2>
        <button
          onClick={onClose}
          className="rounded p-1 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
          aria-label="Close sidebar"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Parcel details */}
      <div className="px-4 py-4">
        {/* Status badge */}
        <div className="mb-4">
          <span
            className="inline-block rounded-full px-3 py-1 text-sm font-medium text-white"
            style={{ backgroundColor: statusColor }}
          >
            {properties.status.charAt(0).toUpperCase() + properties.status.slice(1)}
          </span>
        </div>

        {/* Owner name */}
        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Owner
          </label>
          <p className="text-slate-900">{properties.owner_name}</p>
        </div>

        {/* Area */}
        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Area
          </label>
          <p className="text-slate-900">{formatArea(properties.area_sqm)}</p>
        </div>

        {/* Price */}
        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Price
          </label>
          <p className="text-slate-900">
            {formatPrice(properties.price_per_sqm, properties.area_sqm)}
          </p>
          {properties.price_per_sqm !== null && (
            <p className="mt-1 text-sm text-slate-500">
              IDR {properties.price_per_sqm.toLocaleString('id-ID')}/m²
            </p>
          )}
        </div>

        {/* Created date */}
        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Created
          </label>
          <p className="text-sm text-slate-600">
            {formatDate(properties.created_at)}
          </p>
        </div>

        {/* Updated date */}
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Last Updated
          </label>
          <p className="text-sm text-slate-600">
            {formatDate(properties.updated_at)}
          </p>
        </div>
      </div>
    </aside>
  )
}
