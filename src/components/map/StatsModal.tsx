import { useState, useEffect } from 'react'
import { X, TrendingUp, TrendingDown } from 'lucide-react'
import { api } from '@/api/axios'
import type { ParcelStatus } from '@/api/types'
import { STATUS_COLORS } from '@/lib/utils'
import toast from 'react-hot-toast'

interface StatsModalProps {
  isOpen: boolean
  onClose: () => void
}

interface StatusAreaData {
  status: ParcelStatus
  total_area_sqm: number
  total_area_hectares: number
}

interface AggregateStats {
  areas: StatusAreaData[]
  totalParcels: number
  totalArea: number
}

function formatArea(area: number): string {
  if (area >= 10000) {
    return `${(area / 10000).toFixed(2)} ha`
  }
  return `${area.toFixed(2)} m²`
}

const STATUS_LABELS: Record<ParcelStatus, string> = {
  free: 'Free',
  negotiating: 'Negotiating',
  target: 'Target',
}

export function StatsModal({ isOpen, onClose }: StatsModalProps) {
  const [stats, setStats] = useState<AggregateStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch statistics when modal opens
  useEffect(() => {
    if (!isOpen) return

    const fetchStats = async () => {
      setIsLoading(true)
      setError(null)
      try {
        // Fetch area aggregation
        const areaResponse = await api.get('/parcels/aggregate/area', {
          params: { by: 'status' },
        })

        // Fetch parcel count (lightweight endpoint, no GeoJSON payload)
        const countResponse = await api.get('/parcels/count')
        const totalCount = countResponse.data.total || 0

        const areaData: StatusAreaData[] = areaResponse.data.data || []

        const totalArea = areaData.reduce((sum, item) => sum + item.total_area_sqm, 0)

        setStats({
          areas: areaData,
          totalParcels: totalCount,
          totalArea,
        })
      } catch (err: any) {
        const message = err.response?.data?.message || err.message || 'Failed to load statistics'
        console.error('StatsModal error:', err)
        setError(message)
        toast.error(message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [isOpen])

  // Don't render if not open
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-white shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-slate-900">Land Statistics</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close statistics"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-blue-600" />
              <p className="ml-3 text-sm text-slate-600">Loading statistics...</p>
            </div>
          ) : error ? (
            <div className="rounded-lg bg-red-50 p-4">
              <div className="flex items-start gap-3">
                <TrendingDown className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-900">
                    Failed to Load Statistics
                  </p>
                  <p className="mt-1 text-sm text-red-800">
                    {error}
                  </p>
                  <button
                    onClick={() => {
                      setError(null)
                      setStats(null)
                    }}
                    className="mt-3 rounded-md bg-red-100 px-3 py-1.5 text-sm font-medium text-red-900 hover:bg-red-200"
                  >
                    Retry
                  </button>
                </div>
              </div>
            </div>
          ) : stats ? (
            <div className="space-y-4">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-xs text-slate-600">Total Parcels</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">
                    {stats.totalParcels}
                  </p>
                </div>
                <div className="rounded-lg bg-blue-50 p-4">
                  <p className="text-xs text-blue-600">Total Area</p>
                  <p className="mt-1 text-2xl font-bold text-blue-900">
                    {formatArea(stats.totalArea)}
                  </p>
                </div>
              </div>

              {/* Status Breakdown */}
              <div>
                <h3 className="mb-3 text-sm font-semibold text-slate-700">
                  Area by Status
                </h3>
                <div className="space-y-2">
                  {stats.areas.map((item) => {
                    const percentage = stats.totalArea > 0
                      ? ((item.total_area_sqm / stats.totalArea) * 100).toFixed(1)
                      : '0'

                    return (
                      <div
                        key={item.status}
                        className="rounded-lg border border-slate-200 p-3"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div
                              className="h-3 w-3 rounded-full"
                              style={{ backgroundColor: STATUS_COLORS[item.status] }}
                            />
                            <span className="text-sm font-medium text-slate-700">
                              {STATUS_LABELS[item.status]}
                            </span>
                          </div>
                          <span className="text-sm font-bold text-slate-900">
                            {formatArea(item.total_area_sqm)}
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full transition-all"
                            style={{
                              width: `${percentage}%`,
                              backgroundColor: STATUS_COLORS[item.status],
                            }}
                          />
                        </div>

                        <p className="mt-1 text-xs text-slate-600">
                          {percentage}% of total area
                        </p>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Insight */}
              {stats.totalParcels > 0 && (
                <div className="rounded-lg bg-amber-50 p-3">
                  <div className="flex items-start gap-2">
                    <TrendingDown className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" />
                    <div>
                      <p className="text-sm font-medium text-amber-900">
                        Quick Insight
                      </p>
                      <p className="mt-1 text-xs text-amber-800">
                        {stats.areas.find(a => a.status === 'free')?.total_area_sqm &&
                         stats.areas.find(a => a.status === 'free')!.total_area_sqm > 0 ? (
                          <>
                            {formatArea(stats.areas.find(a => a.status === 'free')!.total_area_sqm)} of available land
                            ready for immediate acquisition
                          </>
                        ) : (
                          'No free land available at this time'
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="py-12 text-center">
              <p className="text-sm text-slate-600">No statistics available</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 px-6 py-4">
          <button
            onClick={onClose}
            className="w-full rounded-md bg-slate-100 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
