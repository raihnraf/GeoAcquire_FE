import { X, Check } from 'lucide-react'

export interface DrawingToolbarProps {
  onCancel: () => void
  onComplete: () => void
  canComplete: boolean // Enable/disable Complete button
}

/**
 * DrawingToolbar component for drawing mode controls
 *
 * Features:
 * - Floating toolbar at bottom-right of screen
 * - Cancel button (X icon) to cancel drawing
 * - Complete button (Check icon) to complete polygon
 * - Complete button disabled until enough points are drawn
 * - High z-index to appear above map overlays
 *
 * Usage:
 * ```tsx
 * <DrawingToolbar
 *   onCancel={() => setIsDrawingMode(false)}
 *   onComplete={() => handleDrawingComplete(drawingPoints)}
 *   canComplete={drawingPoints.length >= 3}
 * />
 * ```
 */
export function DrawingToolbar({
  onCancel,
  onComplete,
  canComplete,
}: DrawingToolbarProps) {
  return (
    <div className="absolute bottom-6 right-6 z-[1001] flex gap-1 rounded-lg bg-white p-2 shadow-lg">
      {/* Cancel button */}
      <button
        type="button"
        onClick={onCancel}
        className="rounded bg-slate-100 p-2 text-slate-700 transition-colors hover:bg-slate-200"
        aria-label="Cancel drawing"
      >
        <X className="h-5 w-5" />
      </button>

      {/* Complete button */}
      <button
        type="button"
        onClick={onComplete}
        disabled={!canComplete}
        className="rounded bg-blue-500 p-2 text-white transition-colors hover:bg-blue-600 disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed"
        aria-label="Complete polygon"
      >
        <Check className="h-5 w-5" />
      </button>
    </div>
  )
}
