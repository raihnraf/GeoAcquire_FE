import { BoxSelect, Target, X } from 'lucide-react'
import type { MapMode } from '@/hooks/useMapMode'

interface ModeBadgeProps {
  mode: MapMode
  onExit: () => void
}

/**
 * Mode badge indicator for active map interaction modes
 *
 * Shows current mode with icon and text. Hidden when mode is 'normal'.
 * Positioned at top-left below the header (z-15).
 *
 * @example
 * ```tsx
 * <ModeBadge mode={mode} onExit={exitMode} />
 * ```
 */
export function ModeBadge({ mode, onExit }: ModeBadgeProps) {
  // Don't render anything in normal mode
  if (mode === 'normal') {
    return null
  }

  // Mode-specific icon and text
  const modeConfig = {
    'bbox': {
      icon: BoxSelect,
      text: 'Draw Box Filter',
      description: 'Click and drag on the map to filter parcels by area',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
    },
    'buffer-point': {
      icon: Target,
      text: 'Select Buffer Center',
      description: 'Click anywhere on the map to set the center point for buffer analysis',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
    },
  }[mode]

  if (!modeConfig) {
    return null
  }

  const Icon = modeConfig.icon

  return (
    <div className="absolute top-4 left-4 z-15">
      <div className={`flex flex-col gap-1 rounded-lg ${modeConfig.bgColor} border ${modeConfig.borderColor} px-5 py-4 shadow-lg`}>
        <div className="flex items-center gap-2">
          {/* Mode icon */}
          <Icon className="h-5 w-5 text-blue-600" aria-hidden="true" />

          {/* Mode text */}
          <span className="text-sm font-bold text-slate-900">
            {modeConfig.text}
          </span>

          {/* Exit button */}
          <button
            onClick={onExit}
            className="ml-2 rounded p-1 text-slate-500 transition-colors hover:bg-white/50 hover:text-slate-700"
            aria-label="Exit mode"
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Helper text */}
        <span className="text-xs font-medium text-slate-700">
          {modeConfig.description}
        </span>
      </div>
    </div>
  )
}
