import { useState, useEffect, useCallback } from 'react'
import L from 'leaflet'

/**
 * Map mode types for different interaction states
 *
 * - normal: Default map interaction (pan, zoom, parcel selection)
 * - bbox: Drawing bounding box for spatial filtering
 * - buffer-point: Selecting center point for buffer analysis
 */
export type MapMode = 'normal' | 'bbox' | 'buffer-point'

/**
 * Mode data associated with active map modes
 *
 * - bbox: LatLngBounds of completed bounding box drawing
 * - bufferCenter: Center point for buffer analysis
 * - bufferRadius: Radius in meters for buffer analysis
 */
export interface ModeData {
  bbox?: L.LatLngBounds
  bufferCenter?: L.LatLng
  bufferRadius?: number
}

/**
 * Map mode state machine hook
 *
 * Manages map interaction modes with proper cleanup and keyboard shortcuts.
 * Escape key always exits the current mode.
 *
 * @example
 * ```tsx
 * const { mode, modeData, setModeData, enterBboxMode, enterBufferMode, exitMode } = useMapMode()
 *
 * return (
 *   <>
 *     {mode === 'bbox' && <BBoxDrawing onComplete={(bounds) => { setModeData({ bbox: bounds }); exitMode() }} />}
 *     <ModeBadge mode={mode} onExit={exitMode} />
 *   </>
 * )
 * ```
 */
export function useMapMode() {
  const [mode, setMode] = useState<MapMode>('normal')
  const [modeData, setModeData] = useState<ModeData>({})

  /**
   * Enter bounding box drawing mode
   * Clears any previous mode data
   */
  const enterBboxMode = useCallback(() => {
    setMode('bbox')
    setModeData({})
  }, [])

  /**
   * Enter buffer point selection mode
   * Clears any previous mode data
   */
  const enterBufferMode = useCallback(() => {
    setMode('buffer-point')
    setModeData({})
  }, [])

  /**
   * Exit current mode and return to normal
   * Clears all mode data
   */
  const exitMode = useCallback(() => {
    setMode('normal')
    setModeData({})
  }, [])

  /**
   * Handle Escape key to exit current mode
   * Event listener attached on mount, removed on unmount
   */
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mode !== 'normal') {
        exitMode()
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [mode, exitMode])

  return {
    mode,
    modeData,
    setModeData,
    enterBboxMode,
    enterBufferMode,
    exitMode,
  }
}
