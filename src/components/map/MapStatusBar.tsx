import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import type { ParcelCollection } from '@/api/types'

interface MapStatusBarProps {
  data: ParcelCollection | null
  currentPage?: number
  totalPages?: number
  onPagePrev?: () => void
  onPageNext?: () => void
  totalParcels?: number
  isFetching?: boolean
}

export function MapStatusBar({
  data,
  currentPage = 1,
  totalPages = 1,
  onPagePrev,
  onPageNext,
  totalParcels,
  isFetching,
}: MapStatusBarProps) {
  const displayedCount = data?.features.length || 0
  const totalCount = totalParcels ?? displayedCount

  return (
    <footer className="absolute bottom-0 left-0 right-0 z-10 flex h-14 items-center justify-between bg-white px-4 shadow-[0_-1px_3px_rgba(0,0,0,0.1)]">
      {/* Parcel count */}
      <div className="flex items-center gap-2 text-sm text-slate-600">
        {isFetching && <Loader2 className="h-4 w-4 animate-spin text-slate-400" />}
        <span>
          {totalCount === 1
            ? `${totalCount} parcel`
            : `${totalCount} parcels`}
          {totalPages > 1 && (
            <span className="ml-1 text-xs text-slate-400">
              (showing {displayedCount} on page {currentPage})
            </span>
          )}
        </span>
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex items-center gap-2">
          <button
            onClick={onPagePrev}
            disabled={currentPage <= 1}
            className="rounded p-1 text-slate-600 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Previous page"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <span className="min-w-[4rem] text-center text-sm text-slate-600">
            {currentPage} / {totalPages}
          </span>

          <button
            onClick={onPageNext}
            disabled={currentPage >= totalPages}
            className="rounded p-1 text-slate-600 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Next page"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}
    </footer>
  )
}
