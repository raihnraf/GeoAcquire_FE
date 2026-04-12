import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { BBoxDrawing } from '../BBoxDrawing'
import L from 'leaflet'

// Store the actual handlers registered by useMapEvents
let registeredClick: ((e: any) => void) | null = null
let registeredMousemove: ((e: any) => void) | null = null
let registeredKeydown: ((e: any) => void) | null = null

// Mock react-leaflet components before importing BBoxDrawing
vi.mock('react-leaflet', () => ({
  Rectangle: ({ bounds, color, fillColor, fillOpacity, weight }: any) => (
    <div
      data-testid="bbox-rectangle"
      data-bounds={bounds ? JSON.stringify(bounds) : ''}
      data-color={color}
      data-fill-color={fillColor}
      data-fill-opacity={fillOpacity}
      data-weight={weight}
    />
  ),
  useMapEvents: ({ click, mousemove, keydown }: any) => {
    // Store the actual handlers
    registeredClick = click
    registeredMousemove = mousemove
    registeredKeydown = keydown
    return null
  },
}))

describe('BBoxDrawing', () => {
  const mockOnComplete = vi.fn()
  const mockOnCancel = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    // Reset handlers
    registeredClick = null
    registeredMousemove = null
    registeredKeydown = null
  })

  it('should not render rectangle before first click', () => {
    render(<BBoxDrawing onComplete={mockOnComplete} onCancel={mockOnCancel} />)

    // No rectangle should be rendered initially
    const rectangle = screen.queryByTestId('bbox-rectangle')
    expect(rectangle).not.toBeInTheDocument()
  })

  it('should render rectangle after first click and mousemove', () => {
    const { container } = render(
      <BBoxDrawing onComplete={mockOnComplete} onCancel={mockOnCancel} />
    )

    // Simulate first click
    act(() => {
      registeredClick?.({
        latlng: L.latLng(-6.2, 106.8),
        originalEvent: { key: '' },
      })
    })

    // Simulate mouse move
    act(() => {
      registeredMousemove?.({ latlng: L.latLng(-6.1, 106.9) })
    })

    // Rectangle should be rendered
    const rectangle = screen.queryByTestId('bbox-rectangle')
    expect(rectangle).toBeInTheDocument()
  })

  it('should call onComplete with LatLngBounds after two clicks', () => {
    render(<BBoxDrawing onComplete={mockOnComplete} onCancel={mockOnCancel} />)

    // First click at southwest corner
    act(() => {
      registeredClick?.({
        latlng: L.latLng(-6.2, 106.8),
        originalEvent: { key: '' },
      })
    })

    // Second click at northeast corner
    act(() => {
      registeredClick?.({
        latlng: L.latLng(-6.1, 106.9),
        originalEvent: { key: '' },
      })
    })

    // onComplete should have been called with bounds
    expect(mockOnComplete).toHaveBeenCalledTimes(1)
    const bounds = mockOnComplete.mock.calls[0][0]
    expect(bounds).toBeInstanceOf(L.LatLngBounds)
  })

  it('should call onCancel on Escape key press', () => {
    render(<BBoxDrawing onComplete={mockOnComplete} onCancel={mockOnCancel} />)

    // Start drawing with a click
    act(() => {
      registeredClick?.({
        latlng: L.latLng(-6.2, 106.8),
        originalEvent: { key: '' },
      })
    })

    // Press Escape
    act(() => {
      registeredKeydown?.({ originalEvent: { key: 'Escape' } })
    })

    // onCancel should be called
    expect(mockOnCancel).toHaveBeenCalledTimes(1)
  })

  it('should have correct bounds structure', () => {
    render(<BBoxDrawing onComplete={mockOnComplete} onCancel={mockOnCancel} />)

    // First click at southwest corner
    act(() => {
      registeredClick?.({
        latlng: L.latLng(-6.2, 106.8),
        originalEvent: { key: '' },
      })
    })

    // Second click at northeast corner
    act(() => {
      registeredClick?.({
        latlng: L.latLng(-6.1, 106.9),
        originalEvent: { key: '' },
      })
    })

    expect(mockOnComplete).toHaveBeenCalledTimes(1)
    const bounds = mockOnComplete.mock.calls[0][0]

    // Verify bounds structure
    expect(bounds.getSouthWest().lat).toBeCloseTo(-6.2, 4)
    expect(bounds.getSouthWest().lng).toBeCloseTo(106.8, 4)
    expect(bounds.getNorthEast().lat).toBeCloseTo(-6.1, 4)
    expect(bounds.getNorthEast().lng).toBeCloseTo(106.9, 4)
  })

  it('should have correct styling for rectangle', () => {
    render(<BBoxDrawing onComplete={mockOnComplete} onCancel={mockOnCancel} />)

    // Start drawing
    act(() => {
      registeredClick?.({
        latlng: L.latLng(-6.2, 106.8),
        originalEvent: { key: '' },
      })
    })

    // Move mouse
    act(() => {
      registeredMousemove?.({ latlng: L.latLng(-6.1, 106.9) })
    })

    const rectangle = screen.getByTestId('bbox-rectangle')
    expect(rectangle).toHaveAttribute('data-color', '#3b82f6')
    expect(rectangle).toHaveAttribute('data-fill-color', '#3b82f6')
    expect(rectangle).toHaveAttribute('data-fill-opacity', '0.1')
    expect(rectangle).toHaveAttribute('data-weight', '2')
  })
})
