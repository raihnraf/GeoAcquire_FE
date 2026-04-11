export function LoadingSkeleton() {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-100/80">
      <div className="flex flex-col items-center gap-4">
        {/* Ring spinner per UI-SPEC: 48px, border-4, border-t-slate-900, border-slate-200 */}
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-300 border-t-slate-900" />
        <p className="text-slate-600">Loading map...</p>
      </div>
    </div>
  )
}
