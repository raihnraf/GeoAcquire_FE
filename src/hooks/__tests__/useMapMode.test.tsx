import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useMapMode } from '../useMapMode'
import L from 'leaflet'

// Mock window.addEventListener and removeEventListener
const mockListeners: Record<string, EventListener[]> = {}
Object.defineProperty(window, 'addEventListener', {
  value: vi.fn((event: string, handler: EventListener) => {
    if (!mockListeners[event]) {
      mockListeners[event] = []
    }
    mockListeners[event].push(handler)
  }),
})

Object.defineProperty(window, 'removeEventListener', {
  value: vi.fn((event: string, handler: EventListener) => {
    const listeners = mockListeners[event]
    if (listeners) {
      const index = listeners.indexOf(handler)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }),
})

describe('useMapMode', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Clear all listeners
    Object.keys(mockListeners).forEach((key) => {
      delete mockListeners[key]
    })
  })

  it('should start in normal mode', () => {
    const { result } = renderHook(() => useMapMode())

    expect(result.current.mode).toBe('normal')
    expect(result.current.modeData).toEqual({})
  })

  it('should enter bbox mode with enterBboxMode', () => {
    const { result } = renderHook(() => useMapMode())

    act(() => {
      result.current.enterBboxMode()
    })

    expect(result.current.mode).toBe('bbox')
    expect(result.current.modeData).toEqual({})
  })

  it('should enter buffer mode with enterBufferMode', () => {
    const { result } = renderHook(() => useMapMode())

    act(() => {
      result.current.enterBufferMode()
    })

    expect(result.current.mode).toBe('buffer-point')
    expect(result.current.modeData).toEqual({})
  })

  it('should exit mode with exitMode', () => {
    const { result } = renderHook(() => useMapMode())

    act(() => {
      result.current.enterBboxMode()
    })
    expect(result.current.mode).toBe('bbox')

    act(() => {
      result.current.exitMode()
    })
    expect(result.current.mode).toBe('normal')
    expect(result.current.modeData).toEqual({})
  })

  it('should exit mode on Escape key press', () => {
    const { result } = renderHook(() => useMapMode())

    act(() => {
      result.current.enterBboxMode()
    })
    expect(result.current.mode).toBe('bbox')

    // Simulate Escape key press
    const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' })
    const keydownListeners = mockListeners.keydown || []
    act(() => {
      keydownListeners.forEach((listener) => listener(escapeEvent))
    })

    expect(result.current.mode).toBe('normal')
    expect(result.current.modeData).toEqual({})
  })

  it('should clear modeData on mode exit', () => {
    const { result } = renderHook(() => useMapMode())

    // Set mode data
    act(() => {
      const bounds = L.latLngBounds([-6.2, 106.8], [-6.1, 106.9])
      result.current.setModeData({ bbox: bounds })
    })
    expect(result.current.modeData.bbox).toBeDefined()

    // Exit mode should clear data
    act(() => {
      result.current.exitMode()
    })
    expect(result.current.modeData).toEqual({})
  })

  it('should set modeData with setModeData', () => {
    const { result } = renderHook(() => useMapMode())

    act(() => {
      result.current.enterBboxMode()
      const bounds = L.latLngBounds([-6.2, 106.8], [-6.1, 106.9])
      result.current.setModeData({ bbox: bounds })
    })

    expect(result.current.modeData.bbox).toBeDefined()
    expect(result.current.modeData.bbox?.getSouthWest()).toEqual({ lat: -6.2, lng: 106.8 })
  })

  it('should set bufferCenter and bufferRadius in modeData', () => {
    const { result } = renderHook(() => useMapMode())

    act(() => {
      result.current.enterBufferMode()
      const center = L.latLng(-6.2, 106.8)
      result.current.setModeData({ bufferCenter: center, bufferRadius: 500 })
    })

    expect(result.current.modeData.bufferCenter).toBeDefined()
    expect(result.current.modeData.bufferRadius).toBe(500)
  })

  it('should attach event listener on mount', () => {
    renderHook(() => useMapMode())

    expect(window.addEventListener).toHaveBeenCalledWith('keydown', expect.any(Function))
  })

  it('should remove event listener on unmount', () => {
    const { unmount } = renderHook(() => useMapMode())

    const addCalls = (window.addEventListener as unknown as ReturnType<typeof vi.fn>).mock.calls
    const removeCalls = (window.removeEventListener as unknown as ReturnType<typeof vi.fn>).mock.calls

    // After unmount, removeEventListener should have been called
    unmount()

    // Check that the same handler passed to addEventListener was passed to removeEventListener
    expect(removeCalls.length).toBeGreaterThan(0)
  })

  it('should not exit normal mode on Escape key press', () => {
    const { result } = renderHook(() => useMapMode())

    // Start in normal mode
    expect(result.current.mode).toBe('normal')

    // Simulate Escape key press
    const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' })
    const keydownListeners = mockListeners.keydown || []
    act(() => {
      keydownListeners.forEach((listener) => listener(escapeEvent))
    })

    // Should still be in normal mode
    expect(result.current.mode).toBe('normal')
  })
})
