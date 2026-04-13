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
      text: 'Drawing Box Filter',
      description: 'Click and drag on map',
    },
    'buffer-point': {
      icon: Target,
      text: 'Select Buffer Center',
      description: 'Click a point on the map',
    },
  }[mode]

  if (!modeConfig) {
    return null
  }

  const Icon = modeConfig.icon

  return (
    <div className="absolute top-4 left-4 z-15">
      <div className="flex flex-col gap-1 rounded-lg bg-white px-4 py-3 shadow-md">
        <div className="flex items-center gap-2">
          {/* Mode icon */}
          <Icon className="h-4 w-4 text-blue-500" aria-hidden="true" />

          {/* Mode text */}
          <span className="text-sm font-semibold text-slate-900">
            {modeConfig.text}
          </span>

          {/* Exit button */}
          <button
            onClick={onExit}
            className="ml-1 rounded p-0.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
            aria-label="Exit mode"
            type="button"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
        
        {/* Helper text */}
        <span className="text-xs text-slate-600">
          {modeConfig.description}
        </span>
      </div>
    </div>
  )
}
