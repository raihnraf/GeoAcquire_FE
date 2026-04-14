import { useState, ChangeEvent } from 'react'
import { Check, X } from 'lucide-react'

export interface BufferPanelProps {
  initialRadius?: number
  onApply: (radius: number) => void
  onCancel: () => void
}

/**
 * BufferPanel component for buffer analysis distance input
 *
 * Features:
 * - Floating panel with distance input (1-10000 meters)
 * - Default radius of 500 meters
 * - Apply button triggers buffer analysis with selected radius
 * - Cancel button closes panel
 * - Positioned top-right of map with z-15
 *
 * Usage in MapView:
 * ```tsx
 * <BufferPanel
 *   initialRadius={500}
 *   onApply={(radius) => startBufferAnalysis(center, radius)}
 *   onCancel={() => setBufferMode(false)}
 * />
 * ```
 */
export function BufferPanel({
  initialRadius = 500,
  onApply,
  onCancel,
}: BufferPanelProps) {
  const [distance, setDistance] = useState(initialRadius)
  const [inputValue, setInputValue] = useState(String(initialRadius))

  const handleDistanceChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)
    
    // Only update distance if value is a valid number
    if (value === '' || value === '-') {
      // Allow empty input while typing
      return
    }
    
    const numValue = Number(value)
    if (!isNaN(numValue)) {
      setDistance(numValue)
    }
  }

  const handleDistanceBlur = () => {
    // Validate and clamp on blur
    if (inputValue === '' || inputValue === '-') {
      setInputValue('500')
      setDistance(500)
    }
  }

  const handleApply = () => {
    // Validate distance range
    let validatedDistance = distance
    if (distance < 1) {
      validatedDistance = 1
    }
    if (distance > 10000) {
      validatedDistance = 10000
    }
    
    setInputValue(String(validatedDistance))
    setDistance(validatedDistance)
    onApply(validatedDistance)
  }

  const handleCancel = () => {
    onCancel()
  }

  return (
    <div className="bg-white rounded-lg p-3 w-full">
      {/* Label */}
      <label className="block text-sm font-medium text-slate-700 mb-2">
        Buffer Radius
      </label>

      {/* Input container */}
      <div className="flex items-center gap-2">
        <input
          type="number"
          data-testid="distance-input"
          min={1}
          max={10000}
          step={10}
          value={inputValue}
          onChange={handleDistanceChange}
          onBlur={handleDistanceBlur}
          className="rounded-md border border-slate-200 px-3 py-1.5 text-sm flex-1 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
          aria-label="Buffer radius in meters"
        />
        <span className="text-slate-500 text-sm">meters</span>
      </div>

      {/* Buttons container */}
      <div className="flex items-center gap-2 mt-3">
        {/* Apply button */}
        <button
          type="button"
          onClick={handleApply}
          className="flex-1 bg-blue-500 text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-1"
          aria-label="Apply buffer analysis"
        >
          <Check className="h-4 w-4" />
          Apply
        </button>

        {/* Cancel button */}
        <button
          type="button"
          onClick={handleCancel}
          className="flex-1 bg-slate-100 text-slate-700 px-3 py-1.5 rounded-md text-sm font-medium hover:bg-slate-200 transition-colors flex items-center justify-center gap-1"
          aria-label="Cancel buffer analysis"
        >
          <X className="h-4 w-4" />
          Cancel
        </button>
      </div>
    </div>
  )
}
