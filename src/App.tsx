import { useState, useCallback, useEffect, useMemo } from 'react'
import { queryClient } from '@/lib/queryClient'
import toast from 'react-hot-toast'
import { api } from '@/api/axios'
import { MapView } from './components/map/MapView'
import { MapHeader } from './components/map/MapHeader'
import { MapStatusBar } from './components/map/MapStatusBar'
import { ParcelSidebar } from './components/map/ParcelSidebar'
import { DeleteConfirmModal } from './components/map/DeleteConfirmModal'
import { DrawingToolbar } from './components/map/DrawingToolbar'
import { BBoxFilterBadge } from './components/map/BBoxFilterBadge'
import { ImportModal } from './components/map/ImportModal'
import { StatsModal } from './components/map/StatsModal'
import { useParcels } from './hooks/useParcels'
import { useCreateParcel } from './hooks/useCreateParcel'
import { useUpdateParcel } from './hooks/useUpdateParcel'
import { useDeleteParcel } from './hooks/useDeleteParcel'
import { useFilterParams } from './hooks/useFilterParams'
import { useMapMode } from './hooks/useMapMode'
import { useBufferAnalysis } from './hooks/useBufferAnalysis'
import type { ParcelFeature, ParcelStatus, PaginatedParcelCollection } from './api/types'
import type { ParcelFormData } from './lib/zod'
import type { Polygon } from 'geojson'
import L from 'leaflet'

type SidebarMode = 'view' | 'edit' | 'create' | 'buffer'

function App() {
  // Filter params hook for URL synchronization
  const { filters, setFilters, clearFilters } = useFilterParams()

  // Map bounds state for bbox-based parcel fetching
  const [mapBounds, setMapBounds] = useState<L.LatLngBounds | null>(null)

  // Pagination state
  const [page, setPage] = useState(1)
  const perPage = 50

  // Only fetch bbox-based parcels when zoomed in enough (city-level detail)
  // Prevents fetching all 1000+ parcels when zoomed out to country level
  const MIN_ZOOM_FOR_BBOX = 10
  const bboxForQuery = (mapBounds && filters.viewportZoom >= MIN_ZOOM_FOR_BBOX)
    ? mapBounds
    : null

  // Fetch parcels with server-side status filtering and bbox filtering
  const { data, isLoading, isFetched, isPlaceholderData, isFetching } = useParcels({
    statuses: filters.status,
    page,
    perPage,
    bbox: bboxForQuery, // Only use bbox when zoomed in >= MIN_ZOOM_FOR_BBOX
  })

  // Extract pagination metadata from response
  const paginatedData = data as PaginatedParcelCollection | undefined
  const totalPages = paginatedData?.metadata?.last_page ?? 1
  const totalParcels = paginatedData?.metadata?.total ?? (data?.features.length ?? 0)

  // Mutation hooks for CRUD operations
  const createParcel = useCreateParcel()
  const updateParcel = useUpdateParcel()
  const deleteParcel = useDeleteParcel()

  // Map mode hook for bbox and buffer modes
  const { mode, enterBboxMode, enterBufferMode, exitMode } = useMapMode()

  // Selected parcel state for sidebar
  const [selectedParcel, setSelectedParcel] = useState<ParcelFeature | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [sidebarMode, setSidebarMode] = useState<SidebarMode>('view')

  // Drawing state
  const [isDrawingMode, setIsDrawingMode] = useState(false)
  const [drawingPoints, setDrawingPoints] = useState<[number, number][]>([])

  // Form state (for geometry from drawing)
  const [formGeometry, setFormGeometry] = useState<Polygon | null>(null)

  // Delete confirmation state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [parcelToDelete, setParcelToDelete] = useState<ParcelFeature | null>(null)

  // Import modal state
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)

  // Stats modal state
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false)

  // Buffer analysis hook - uses filters from useFilterParams
  const { data: bufferResult } = useBufferAnalysis(
    filters.bufferCenter,
    filters.bufferRadius
  )

  // Handle viewport change - sync with URL
  const handleViewportChange = useCallback((center: L.LatLng, zoom: number) => {
    setFilters({
      ...filters,
      viewportCenter: center,
      viewportZoom: zoom,
    })
  }, [filters, setFilters])

  // Generate shareable URL
  const shareableUrl = useCallback(() => {
    const params = new URLSearchParams(window.location.search)
    return `${window.location.origin}${window.location.pathname}?${params.toString()}`
  }, [])

  // Handle parcel click from map - uses O(1) Map lookup instead of O(n) .find()
  const parcelMap = useMemo(() => {
    const map = new Map<number, ParcelFeature>()
    data?.features.forEach(f => {
      if (f.properties?.id) {
        map.set(f.properties.id, f)
      }
    })
    return map
  }, [data])

  const handleParcelClick = useCallback((id: number) => {
    const parcel = parcelMap.get(id)
    if (parcel) {
      setSelectedParcel(parcel)
      setSidebarMode('view')
      setIsSidebarOpen(true)
    }
  }, [parcelMap])

  // Handle sidebar close
  const handleCloseSidebar = useCallback(() => {
    setIsSidebarOpen(false)
    setFormGeometry(null)
  }, [])

  // Handle Add Parcel button click - opens sidebar in create mode
  const handleAddParcelClick = useCallback(() => {
    setSelectedParcel(null)
    setFormGeometry(null)
    setDrawingPoints([])
    setIsDrawingMode(true)
    setIsSidebarOpen(true)
    setSidebarMode('create')
  }, [])

  // Handle drawing completion
  const handleDrawingComplete = useCallback((coordinates: number[][]) => {
    setFormGeometry({ type: 'Polygon', coordinates: [coordinates] })
    setIsDrawingMode(false)
    setDrawingPoints([])
  }, [])

  // Handle drawing cancel
  const handleDrawingCancel = useCallback(() => {
    setIsDrawingMode(false)
    setDrawingPoints([])
    setFormGeometry(null)
  }, [])

  // Handle drawing point update (from DrawingHandler)
  const handleDrawingPointAdd = useCallback((point: [number, number]) => {
    setDrawingPoints((prev) => [...prev, point])
  }, [])

  // Handle create parcel submission
  const handleCreateSubmit = useCallback(async (data: ParcelFormData) => {
    const geometry = (formGeometry || data.geometry) as typeof data.geometry
    await createParcel.mutateAsync({ ...data, geometry })
  }, [createParcel, formGeometry])

  // Handle edit parcel submission
  const handleEditSubmit = useCallback(async (id: number, data: ParcelFormData) => {
    await updateParcel.mutateAsync({ id, data })
  }, [updateParcel])

  // Handle delete button click
  const handleDeleteClick = useCallback(() => {
    setParcelToDelete(selectedParcel)
    setIsDeleteModalOpen(true)
  }, [selectedParcel])

  // Handle delete confirmation
  const handleDeleteConfirm = useCallback(async () => {
    if (parcelToDelete) {
      await deleteParcel.mutateAsync(parcelToDelete.properties.id)
      setIsDeleteModalOpen(false)
      setParcelToDelete(null)
      setIsSidebarOpen(false)
      setSelectedParcel(null)
    }
  }, [deleteParcel, parcelToDelete])

  // Handle status filter toggle
  const handleStatusToggle = useCallback((status: ParcelStatus) => {
    const newStatuses = filters.status.includes(status)
      ? filters.status.filter((s) => s !== status)
      : [...filters.status, status]

    // Reset to page 1 when filters change
    setPage(1)

    // If clearing the last filter, invalidate cache to force fresh data fetch
    // This ensures all parcels are shown, not stale cached data
    if (newStatuses.length === 0 && filters.status.length > 0) {
      queryClient.invalidateQueries({ queryKey: ['parcels'] })
    }

    setFilters({ ...filters, status: newStatuses })
  }, [filters, setFilters])

  // Pagination handlers
  const handlePagePrev = useCallback(() => {
    setPage((prev) => Math.max(prev - 1, 1))
  }, [])

  const handlePageNext = useCallback(() => {
    setPage((prev) => Math.min(prev + 1, totalPages))
  }, [totalPages])

  // Reset page to 1 when filters change
  useEffect(() => {
    setPage(1)
  }, [filters.status])

  // Handle bbox drawing complete
  const handleBboxComplete = useCallback((bounds: import('leaflet').LatLngBounds) => {
    setFilters({ ...filters, bbox: bounds })
    exitMode()
  }, [filters, setFilters, exitMode])

  // Handle buffer analysis start - switches sidebar to buffer mode
  const handleBufferStart = useCallback(() => {
    // Set buffer center from selected parcel geometry
    if (selectedParcel) {
      const coords = selectedParcel.geometry.coordinates[0][0]
      setFilters({
        ...filters,
        bufferCenter: L.latLng(coords[1], coords[0]),
        bufferRadius: 500,
      })
    }
    setSidebarMode('buffer')
  }, [selectedParcel, filters, setFilters])

  // Handle buffer apply - sets the center and radius for analysis
  const handleBufferApply = useCallback((radius: number) => {
    setFilters({ ...filters, bufferRadius: radius })
    // bufferCenter should already be set from parcel selection or point click
  }, [filters, setFilters])

  // Handle Draw Box button click
  const handleDrawBoxClick = useCallback(() => {
    enterBboxMode()
  }, [enterBboxMode])

  // Handle buffer point selection from map click
  const handleBufferPointSelect = useCallback((point: L.LatLng) => {
    setFilters({
      ...filters,
      bufferCenter: point,
      bufferRadius: 500,
    })
    exitMode() // Exit mode after selecting point
    setSidebarMode('buffer') // Open sidebar in buffer mode
    setIsSidebarOpen(true) // Show the sidebar
  }, [filters, setFilters, exitMode])

  // Handle Analyze Area button click
  const handleAnalyzeAreaClick = useCallback(() => {
    enterBufferMode()
    toast('Click anywhere on the map to select buffer center point', {
      icon: '📍',
      duration: 3000,
    })
  }, [enterBufferMode])

  // Handle clear filters - resets all filters, exits mode, closes sidebar
  const handleClearFilters = useCallback(() => {
    clearFilters()
    exitMode() // Exit any active mode
    setSelectedParcel(null) // Close sidebar
    setIsSidebarOpen(false)
    toast.success('Filters cleared')
  }, [clearFilters, exitMode])

  // Handle home/logo click - reset to default state
  const handleHomeClick = useCallback(() => {
    // Clear all filters and reset to page 1
    clearFilters()
    setPage(1)
    
    // Exit any active mode
    exitMode()
    
    // Close sidebar and reset drawing state
    setIsSidebarOpen(false)
    setSelectedParcel(null)
    setFormGeometry(null)
    setDrawingPoints([])
    setIsDrawingMode(false)
    
    // Close modals
    setIsDeleteModalOpen(false)
    setIsImportModalOpen(false)
    setIsStatsModalOpen(false)
    
    toast.success('Returned to home view')
  }, [clearFilters, exitMode])

  // Handle clear bbox filter only
  const handleClearBbox = useCallback(() => {
    setFilters({ ...filters, bbox: null })
  }, [filters, setFilters])

  // Placeholder handlers for header buttons (implemented in later phases)
  const handleFilterClick = () => console.log('Filter clicked')
  
  const handleImportClick = useCallback(() => {
    setIsImportModalOpen(true)
  }, [])

  const handleStatsClick = useCallback(() => {
    setIsStatsModalOpen(true)
  }, [])

  const handleImportSuccess = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['parcels'] })
  }, [])

  const handleExportClick = useCallback(async () => {
    try {
      toast.loading('Exporting parcels...', { id: 'export' })
      
      const response = await api.get('/parcels/export', {
        params: {
          status: filters.status.length > 0 ? filters.status : undefined,
        },
        responseType: 'blob',
      })

      // Create blob and download
      const blob = new Blob([response.data], { type: 'application/json' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `parcels_${new Date().toISOString().split('T')[0]}.geojson`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast.success('Parcels exported successfully', { id: 'export' })
    } catch (error: any) {
      toast.error('Failed to export parcels', { id: 'export' })
    }
  }, [filters.status])

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-slate-50">
      {/* Map layer at z-0 */}
      <MapView
        data={data}
        isLoading={isLoading}
        isFetched={isFetched}
        onParcelClick={handleParcelClick}
        isDrawingMode={isDrawingMode}
        onDrawingComplete={handleDrawingComplete}
        onDrawingPointAdd={handleDrawingPointAdd}
        onDrawingCancel={handleDrawingCancel}
        drawingPoints={drawingPoints}
        mode={mode}
        onBboxComplete={handleBboxComplete}
        onExitMode={exitMode}
        activeBbox={filters.bbox}
        bufferResult={bufferResult || null}
        bufferCenter={filters.bufferCenter}
        bufferRadius={filters.bufferRadius}
        onBufferPointSelect={handleBufferPointSelect}
        viewportCenter={filters.viewportCenter}
        viewportZoom={filters.viewportZoom}
        onViewportChange={handleViewportChange}
        onBoundsChange={setMapBounds}
      />

      {/* Header overlay at z-10, top */}
      <MapHeader
        onHomeClick={handleHomeClick}
        onFilterClick={handleFilterClick}
        onImportClick={handleImportClick}
        onExportClick={handleExportClick}
        onStatsClick={handleStatsClick}
        onAddParcelClick={handleAddParcelClick}
        onDrawBoxClick={handleDrawBoxClick}
        onAnalyzeAreaClick={handleAnalyzeAreaClick}
        shareableUrl={shareableUrl()}
        showFilterBar={true}
        filterBarProps={{
          activeStatuses: filters.status,
          onStatusToggle: handleStatusToggle,
          onClear: handleClearFilters,
        }}
      />

      {/* BBox filter badge - shows when bbox filter is active */}
      <BBoxFilterBadge
        bbox={filters.bbox}
        onClear={handleClearBbox}
      />

      {/* Status bar overlay at z-10, bottom */}
      <MapStatusBar
        data={data || null}
        currentPage={page}
        totalPages={totalPages}
        onPagePrev={handlePagePrev}
        onPageNext={handlePageNext}
        totalParcels={totalParcels}
        isFetching={isFetching || isPlaceholderData}
      />

      {/* Drawing toolbar overlay at z-[1001], bottom-right */}
      {isDrawingMode && (
        <div className="fixed bottom-6 right-6 z-[1001]">
          <DrawingToolbar
            onCancel={handleDrawingCancel}
            onComplete={() => {
              // Close polygon by adding first point at the end
              if (drawingPoints.length >= 3) {
                const closedPoints = [...drawingPoints, drawingPoints[0]]
                handleDrawingComplete(closedPoints)
              }
            }}
            canComplete={drawingPoints.length >= 3}
          />
        </div>
      )}

      {/* Sidebar overlay at z-20, right */}
      <ParcelSidebar
        parcel={selectedParcel}
        isOpen={isSidebarOpen}
        onClose={handleCloseSidebar}
        mode={sidebarMode}
        onModeChange={setSidebarMode}
        onEditSubmit={handleEditSubmit}
        onCreateSubmit={handleCreateSubmit}
        onDelete={handleDeleteClick}
        geometry={formGeometry}
        bufferResult={bufferResult}
        onBufferStart={handleBufferStart}
        onBufferApply={handleBufferApply}
        onParcelClick={handleParcelClick}
      />

      {/* Delete confirmation modal overlay at z-30 */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setParcelToDelete(null)
        }}
        onConfirm={handleDeleteConfirm}
        isDeleting={deleteParcel.isPending}
      />

      {/* Import modal overlay at z-50 */}
      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={handleImportSuccess}
      />

      {/* Stats modal overlay at z-50 */}
      <StatsModal
        isOpen={isStatsModalOpen}
        onClose={() => setIsStatsModalOpen(false)}
      />
    </div>
  )
}

export default App
