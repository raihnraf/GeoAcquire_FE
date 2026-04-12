import { useState, useCallback } from 'react'
import { MapView } from './components/map/MapView'
import { MapHeader } from './components/map/MapHeader'
import { MapStatusBar } from './components/map/MapStatusBar'
import { ParcelSidebar } from './components/map/ParcelSidebar'
import { DeleteConfirmModal } from './components/map/DeleteConfirmModal'
import { DrawingToolbar } from './components/map/DrawingToolbar'
import { useParcels } from './hooks/useParcels'
import { useCreateParcel } from './hooks/useCreateParcel'
import { useUpdateParcel } from './hooks/useUpdateParcel'
import { useDeleteParcel } from './hooks/useDeleteParcel'
import { useFilterParams } from './hooks/useFilterParams'
import { useMapMode } from './hooks/useMapMode'
import { useBufferAnalysis } from './hooks/useBufferAnalysis'
import type { ParcelFeature, ParcelStatus } from './api/types'
import type { ParcelFormData } from './lib/zod'
import type { Polygon } from 'geojson'
import L from 'leaflet'

type SidebarMode = 'view' | 'edit' | 'create' | 'buffer'

function App() {
  const { data } = useParcels()

  // Mutation hooks for CRUD operations
  const createParcel = useCreateParcel()
  const updateParcel = useUpdateParcel()
  const deleteParcel = useDeleteParcel()

  // Filter params hook for URL synchronization
  const { filters, setFilters, clearFilters } = useFilterParams()

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

  // Buffer analysis hook - uses filters from useFilterParams
  const { data: bufferResult } = useBufferAnalysis(
    filters.bufferCenter,
    filters.bufferRadius
  )

  // Handle parcel click from map
  const handleParcelClick = useCallback((id: number) => {
    const parcel = data?.features.find(f => f.properties?.id === id)
    if (parcel) {
      setSelectedParcel(parcel)
      setSidebarMode('view')
      setIsSidebarOpen(true)
    }
  }, [data])

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
  // const handleDrawingPointAdd = useCallback((point: [number, number]) => {
  //   setDrawingPoints((prev) => [...prev, point])
  // }, [])

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
    setFilters({ ...filters, status: newStatuses })
  }, [filters, setFilters])

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
  }, [filters, setFilters, exitMode])

  // Handle Analyze Area button click
  const handleAnalyzeAreaClick = useCallback(() => {
    enterBufferMode()
  }, [enterBufferMode])

  // Placeholder handlers for header buttons (implemented in later phases)
  const handleFilterClick = () => console.log('Filter clicked')
  const handleImportClick = () => console.log('Import clicked')
  const handleStatsClick = () => console.log('Stats clicked')

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-slate-50">
      {/* Map layer at z-0 */}
      <MapView
        onParcelClick={handleParcelClick}
        isDrawingMode={isDrawingMode}
        onDrawingComplete={handleDrawingComplete}
        onDrawingCancel={handleDrawingCancel}
        drawingPoints={drawingPoints}
        mode={mode}
        onBboxComplete={handleBboxComplete}
        onExitMode={exitMode}
        bufferResult={bufferResult || null}
        onBufferPointSelect={handleBufferPointSelect}
      />

      {/* Header overlay at z-10, top */}
      <MapHeader
        onFilterClick={handleFilterClick}
        onImportClick={handleImportClick}
        onStatsClick={handleStatsClick}
        onAddParcelClick={handleAddParcelClick}
        onDrawBoxClick={handleDrawBoxClick}
        onAnalyzeAreaClick={handleAnalyzeAreaClick}
        showFilterBar={true}
        filterBarProps={{
          activeStatuses: filters.status,
          onStatusToggle: handleStatusToggle,
          onClear: clearFilters,
        }}
      />

      {/* Status bar overlay at z-10, bottom */}
      <MapStatusBar data={data || null} />

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
    </div>
  )
}

export default App
