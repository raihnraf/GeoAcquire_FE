import { Filter, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ParcelStatus } from '@/api/types'

export interface FilterBarProps {
  activeStatuses: ParcelStatus[]
  onStatusToggle: (status: ParcelStatus) => void
  onClear: () => void
}

const STATUS_OPTIONS: { value: ParcelStatus; label: string; activeClass: string }[] = [
  { value: 'free', label: 'Free', activeClass: 'bg-green-500 text-white' },
  { value: 'negotiating', label: 'Negotiating', activeClass: 'bg-yellow-500 text-white' },
  { value: 'target', label: 'Target', activeClass: 'bg-red-500 text-white' },
]

const BASE_BUTTON_CLASSES = 'rounded-md px-3 py-1.5 text-sm font-medium transition-colors'
const INACTIVE_CLASSES = 'bg-slate-100 text-slate-700 hover:bg-slate-200'

/**
 * FilterBar component for filtering parcels by status
 * Displays status filter buttons with active/inactive states
 */
export function FilterBar({ activeStatuses, onStatusToggle, onClear }: FilterBarProps) {
  const hasActiveFilters = activeStatuses.length > 0

  return (
    <div className="flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-2">
      {/* Filter icon */}
      <Filter className="h-4 w-4 text-slate-600" />

      {/* Status filter buttons */}
      {STATUS_OPTIONS.map(({ value, label, activeClass }) => {
        const isActive = activeStatuses.includes(value)

        return (
          <button
            key={value}
            onClick={() => onStatusToggle(value)}
            className={cn(
              BASE_BUTTON_CLASSES,
              isActive ? activeClass : INACTIVE_CLASSES
            )}
            aria-label={`Filter by ${label}`}
            aria-pressed={isActive}
          >
            {label}
          </button>
        )
      })}

      {/* Clear Filters button - shown when filters are active */}
      {hasActiveFilters && (
        <button
          onClick={onClear}
          className="flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-slate-900"
          aria-label="Clear all filters"
        >
          <X className="h-4 w-4" />
          <span>Clear Filters</span>
        </button>
      )}
    </div>
  )
}
