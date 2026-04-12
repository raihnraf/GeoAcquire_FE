import { useState } from 'react'
import { Edit, Trash, X } from 'lucide-react'
import type { ParcelFeature } from '@/api/types'
import { formatArea, formatPrice, formatDate, getParcelColor } from '@/lib/utils'
import { ParcelForm } from './ParcelForm'
import type { ParcelFormData } from '@/lib/zod'

type SidebarMode = 'view' | 'edit' | 'create'

interface ParcelSidebarProps {
  parcel: ParcelFeature | null
  isOpen: boolean
  onClose: () => void
  mode?: SidebarMode
  onModeChange?: (mode: SidebarMode) => void
  onDelete?: () => void
  onEditSubmit?: (id: number, data: ParcelFormData) => Promise<void>
  onCreateSubmit?: (data: ParcelFormData) => Promise<void>
}

const DEFAULT_CREATE_VALUES: ParcelFormData = {
  owner_name: '',
  status: 'free',
  price_per_sqm: undefined,
  geometry: { type: 'Polygon', coordinates: [[]] },
}

export function ParcelSidebar({
  parcel,
  isOpen,
  onClose,
  mode = 'view',
  onModeChange,
  onDelete,
  onEditSubmit,
  onCreateSubmit,
}: ParcelSidebarProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Early return if no parcel and not in create mode
  if (!parcel && mode !== 'create') return null

  // Prepare default values based on mode
  const defaultValues: ParcelFormData =
    mode === 'create'
      ? DEFAULT_CREATE_VALUES
      : {
          owner_name: parcel!.properties.owner_name,
          status: parcel!.properties.status,
          price_per_sqm: parcel!.properties.price_per_sqm ?? undefined,
          geometry: parcel!.geometry,
        }

  // Handle edit submission
  const handleEditSubmit = async (data: ParcelFormData) => {
    setIsSubmitting(true)
    try {
      await onEditSubmit?.(parcel!.properties.id, data)
      onModeChange?.('view')
    } catch (error) {
      // Error handled by ParcelForm
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle create submission
  const handleCreateSubmit = async (data: ParcelFormData) => {
    setIsSubmitting(true)
    try {
      await onCreateSubmit?.(data)
      onClose()
    } catch (error) {
      // Error handled by ParcelForm
    } finally {
      setIsSubmitting(false)
    }
  }

  // View mode with read-only parcel details
  if (mode === 'view' && parcel) {
    const properties = parcel.properties
    const statusColor = getParcelColor(properties.status)

    return (
      <aside
        className={`fixed top-0 right-0 bottom-0 z-20 w-80 bg-white shadow-xl transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header with Edit and Delete buttons */}
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4">
          <h2 className="text-lg font-semibold text-slate-900">Parcel Details</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onModeChange?.('edit')}
              className="rounded p-1 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
              aria-label="Edit parcel"
            >
              <Edit className="h-4 w-4" />
            </button>
            <button
              onClick={onDelete}
              className="rounded p-1 text-red-500 transition-colors hover:bg-red-50 hover:text-red-700"
              aria-label="Delete parcel"
            >
              <Trash className="h-4 w-4" />
            </button>
            <button
              onClick={onClose}
              className="rounded p-1 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
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

  // Edit mode
  if (mode === 'edit' && parcel) {
    return (
      <aside
        className={`fixed top-0 right-0 bottom-0 z-20 w-80 bg-white shadow-xl transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4">
            <h2 className="text-lg font-semibold text-slate-900">Edit Parcel</h2>
            <button
              onClick={() => onModeChange?.('view')}
              className="rounded p-1 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
              aria-label="Cancel edit"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <ParcelForm
              mode="edit"
              defaultValues={defaultValues}
              onSubmit={handleEditSubmit}
              onCancel={() => onModeChange?.('view')}
              isSubmitting={isSubmitting}
            />
          </div>
        </div>
      </aside>
    )
  }

  // Create mode
  if (mode === 'create') {
    return (
      <aside
        className={`fixed top-0 right-0 bottom-0 z-20 w-80 bg-white shadow-xl transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4">
            <h2 className="text-lg font-semibold text-slate-900">Add Parcel</h2>
            <button
              onClick={onClose}
              className="rounded p-1 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <ParcelForm
              mode="create"
              defaultValues={defaultValues}
              onSubmit={handleCreateSubmit}
              onCancel={onClose}
              isSubmitting={isSubmitting}
            />
          </div>
        </div>
      </aside>
    )
  }

  return null
}
