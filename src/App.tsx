import { useState, useCallback } from 'react'
import { MapView } from './components/map/MapView'
import { MapHeader } from './components/map/MapHeader'
import { MapStatusBar } from './components/map/MapStatusBar'
import { ParcelSidebar } from './components/map/ParcelSidebar'
import { useParcels } from './hooks/useParcels'
import type { ParcelFeature } from './api/types'

function App() {
  const { data } = useParcels()

  // Selected parcel state for sidebar
  const [selectedParcel, setSelectedParcel] = useState<ParcelFeature | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  // Handle parcel click from map
  const handleParcelClick = useCallback((id: number) => {
    const parcel = data?.features.find(f => f.properties?.id === id)
    if (parcel) {
      setSelectedParcel(parcel)
      setIsSidebarOpen(true)
    }
  }, [data])

  // Handle sidebar close
  const handleCloseSidebar = useCallback(() => {
    setIsSidebarOpen(false)
  }, [])

  // Placeholder handlers for header buttons (implemented in later phases)
  const handleFilterClick = () => console.log('Filter clicked')
  const handleImportClick = () => console.log('Import clicked')
  const handleStatsClick = () => console.log('Stats clicked')
  const handleAddParcelClick = () => console.log('Add parcel clicked')

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-slate-50">
      {/* Map layer at z-0 */}
      <MapView onParcelClick={handleParcelClick} />

      {/* Header overlay at z-10, top */}
      <MapHeader
        onFilterClick={handleFilterClick}
        onImportClick={handleImportClick}
        onStatsClick={handleStatsClick}
        onAddParcelClick={handleAddParcelClick}
      />

      {/* Status bar overlay at z-10, bottom */}
      <MapStatusBar data={data || null} />

      {/* Sidebar overlay at z-20, right */}
      <ParcelSidebar
        parcel={selectedParcel}
        isOpen={isSidebarOpen}
        onClose={handleCloseSidebar}
      />
    </div>
  )
}

export default App
