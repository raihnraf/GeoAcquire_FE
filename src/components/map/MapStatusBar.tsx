import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { ParcelCollection } from '@/api/types'

interface MapStatusBarProps {
  data: ParcelCollection | null
  currentPage?: number
  totalPages?: number
  onPagePrev?: () => void
  onPageNext?: () => void
}

export function MapStatusBar({
  data,
  currentPage = 1,
  totalPages = 1,
  onPagePrev,
  onPageNext,
}: MapStatusBarProps) {
  const parcelCount = data?.features.length || 0

  return (
    <footer className="absolute bottom-0 left-0 right-0 z-10 flex h-14 items-center justify-between bg-white px-4 shadow-[0_-1px_3px_rgba(0,0,0,0.1)]">
      {/* Parcel count (MAP-05) */}
      <div className="text-sm text-slate-600">
        {parcelCount === 1
          ? `${parcelCount} parcel`
          : `${parcelCount} parcels`}
      </div>

      {/* Pagination controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={onPagePrev}
          disabled={currentPage <= 1}
          className="rounded p-1 text-slate-600 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <span className="text-sm text-slate-600">
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
    </footer>
  )
}
