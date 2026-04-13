import { useState } from 'react'
import { Edit, Trash, X, Radio } from 'lucide-react'
import type { ParcelFeature, BufferResult } from '@/api/types'
import { formatArea, formatPrice, formatDate, getParcelColor } from '@/lib/utils'
import { ParcelForm } from './ParcelForm'
import { BufferPanel } from './BufferPanel'
import type { ParcelFormData } from '@/lib/zod'

type SidebarMode = 'view' | 'edit' | 'create' | 'buffer'

interface ParcelSidebarProps {
  parcel: ParcelFeature | null
  isOpen: boolean
  onClose: () => void
  mode?: SidebarMode
  onModeChange?: (mode: SidebarMode) => void
  onDelete?: () => void
  onEditSubmit?: (id: number, data: ParcelFormData) => Promise<void>
  onCreateSubmit?: (data: ParcelFormData) => Promise<void>
  bufferResult?: BufferResult | null
  onBufferStart?: () => void
  onBufferApply?: (radius: number) => void
  onParcelClick?: (id: number) => void
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
  bufferResult,
  onBufferStart,
  onBufferApply,
  onParcelClick,
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
          geometry: parcel!.geometry as typeof DEFAULT_CREATE_VALUES.geometry,
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
          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Last Updated
            </label>
            <p className="text-sm text-slate-600">
              {formatDate(properties.updated_at)}
            </p>
          </div>

          {/* Analyze Nearby button */}
          {onBufferStart && (
            <button
              onClick={onBufferStart}
              className="w-full bg-blue-500 text-white hover:bg-blue-600 rounded-md py-2 text-sm font-medium flex items-center justify-center gap-2 transition-colors"
              aria-label="Analyze nearby parcels"
            >
              <Radio className="h-4 w-4" />
              Analyze Nearby
            </button>
          )}
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

  // Buffer mode - shows buffer panel for input or results list
  if (mode === 'buffer') {
    const parcelCount = bufferResult?.parcels.features.length ?? 0
    const radius = bufferResult?.radius ?? 0
    const hasResults = bufferResult !== null && bufferResult !== undefined

    return (
      <aside
        className={`fixed top-0 right-0 bottom-0 z-20 w-80 bg-white shadow-xl transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                {hasResults ? 'Nearby Parcels' : 'Buffer Analysis'}
              </h2>
              {hasResults && (
                <p className="text-sm text-slate-600">
                  {parcelCount} {parcelCount === 1 ? 'parcel' : 'parcels'} within {radius}m
                </p>
              )}
            </div>
            <button
              onClick={() => onModeChange?.('view')}
              className="rounded p-1 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
              aria-label="Close buffer panel"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content area */}
          <div className="flex-1 overflow-y-auto">
            {!hasResults ? (
              /* Buffer input panel */
              <div className="p-4">
                <div className="mb-4">
                  <p className="text-sm text-slate-600">
                    Set the buffer radius to find nearby parcels around the selected location.
                  </p>
                </div>
                <BufferPanel
                  initialRadius={500}
                  onApply={onBufferApply || (() => {})}
                  onCancel={() => onModeChange?.('view')}
                />
              </div>
            ) : parcelCount === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <Radio className="h-12 w-12 text-slate-400 mb-3" />
                <h3 className="text-base font-semibold text-slate-700 mb-1">
                  No parcels found
                </h3>
                <p className="text-sm text-slate-500">
                  No parcels within the specified buffer radius. Try increasing the radius.
                </p>
              </div>
            ) : (
              /* Results list */
              <div className="divide-y divide-slate-100">
                {bufferResult?.parcels.features.map((feature) => {
                  const props = feature.properties

                  return (
                    <button
                      key={props.id}
                      onClick={() => onParcelClick?.(props.id)}
                      className="w-full px-4 py-3 text-left hover:bg-slate-50 transition-colors focus:outline-none focus:bg-slate-50"
                      aria-label={`View parcel ${props.id}`}
                    >
                      {/* Owner name */}
                      <p className="text-sm font-medium text-slate-900 mb-1">
                        {props.owner_name}
                      </p>

                      {/* Status badge */}
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                          props.status === 'free'
                            ? 'bg-green-100 text-green-700'
                            : props.status === 'negotiating'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {props.status.charAt(0).toUpperCase() + props.status.slice(1)}
                      </span>

                      {/* Area */}
                      <p className="text-xs text-slate-500 mt-1">
                        {formatArea(props.area_sqm)}
                      </p>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </aside>
    )
  }

  return null
}
