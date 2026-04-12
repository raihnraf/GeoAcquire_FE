import { Filter, FileUp, BarChart3, Plus, BoxSelect, Target, Share2 } from 'lucide-react'
import { FilterBar } from '@/components/map/FilterBar'
import type { ParcelStatus } from '@/api/types'
import toast from 'react-hot-toast'
import { useCallback } from 'react'

export interface MapHeaderProps {
  onFilterClick?: () => void
  onImportClick?: () => void
  onStatsClick?: () => void
  onAddParcelClick?: () => void
  onDrawBoxClick?: () => void
  onAnalyzeAreaClick?: () => void
  shareableUrl?: string
  showFilterBar?: boolean
  filterBarProps?: {
    activeStatuses: ParcelStatus[]
    onStatusToggle: (status: ParcelStatus) => void
    onClear: () => void
  }
}

export function MapHeader({
  onFilterClick,
  onImportClick,
  onStatsClick,
  onAddParcelClick,
  onDrawBoxClick,
  onAnalyzeAreaClick,
  shareableUrl,
  showFilterBar = false,
  filterBarProps,
}: MapHeaderProps) {
  // Handle share button click
  const handleShareClick = useCallback(() => {
    const url = shareableUrl || window.location.href
    navigator.clipboard.writeText(url).then(() => {
      toast.success('Link copied to clipboard')
    }).catch(() => {
      toast.error('Failed to copy link')
    })
  }, [shareableUrl])

  return (
    <>
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-10 flex h-16 items-center justify-between bg-white px-4 shadow-sm">
        {/* Logo */}
        <div className="flex items-center">
          <h1 className="text-xl font-semibold text-slate-900">GeoAcquire</h1>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {/* Filter button */}
          <button
            onClick={onFilterClick}
            className="flex items-center gap-2 rounded-md bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200"
            aria-label="Filter parcels"
          >
            <Filter className="h-4 w-4" />
            <span className="hidden sm:inline">Filter</span>
          </button>

          {/* Draw Box button */}
          <button
            onClick={onDrawBoxClick}
            className="flex items-center gap-2 rounded-md bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200"
            aria-label="Draw bounding box"
          >
            <BoxSelect className="h-4 w-4" />
            <span className="hidden sm:inline">Draw Box</span>
          </button>

          {/* Analyze Area button */}
          {onAnalyzeAreaClick && (
            <button
              onClick={onAnalyzeAreaClick}
              className="flex items-center gap-2 rounded-md bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200"
              aria-label="Analyze area with buffer"
            >
              <Target className="h-4 w-4" />
              <span className="hidden sm:inline">Analyze Area</span>
            </button>
          )}

          {/* Share button */}
          <button
            onClick={handleShareClick}
            className="flex items-center gap-2 rounded-md bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200"
            aria-label="Share current view"
          >
            <Share2 className="h-4 w-4" />
            <span className="hidden sm:inline">Share</span>
          </button>

          {/* Import button */}
          <button
            onClick={onImportClick}
            className="flex items-center gap-2 rounded-md bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200"
            aria-label="Import GeoJSON"
          >
            <FileUp className="h-4 w-4" />
            <span className="hidden sm:inline">Import</span>
          </button>

          {/* Stats button */}
          <button
            onClick={onStatsClick}
            className="flex items-center gap-2 rounded-md bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200"
            aria-label="View statistics"
          >
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Stats</span>
          </button>

          {/* Add Parcel button - primary action */}
          <button
            onClick={onAddParcelClick}
            className="flex items-center gap-2 rounded-md bg-blue-500 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600"
            aria-label="Add new parcel"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Parcel</span>
          </button>
        </div>
      </header>

      {/* FilterBar - shown when showFilterBar is true */}
      {showFilterBar && filterBarProps && (
        <div className="absolute top-16 left-0 right-0 z-10">
          <FilterBar
            activeStatuses={filterBarProps.activeStatuses}
            onStatusToggle={filterBarProps.onStatusToggle}
            onClear={filterBarProps.onClear}
          />
        </div>
      )}
    </>
  )
}
