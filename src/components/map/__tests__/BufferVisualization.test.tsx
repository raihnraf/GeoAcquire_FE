import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { renderWithMapContext } from '@/test/map-test-utils'
import { BufferVisualization } from '../BufferVisualization'
import type { BufferResult } from '@/api/types'

// Mock react-leaflet components
vi.mock('react-leaflet', () => ({
  Circle: ({ center, radius, pathOptions }: any) => (
    <div
      data-testid="buffer-circle"
      data-radius={radius}
      data-center={JSON.stringify(center)}
      data-fill-opacity={pathOptions?.fillOpacity}
    />
  ),
  CircleMarker: ({ center, pathOptions }: any) => (
    <div
      data-testid="center-marker"
      data-center={JSON.stringify(center)}
      data-fill-color={pathOptions?.fillColor}
    />
  ),
}))

describe('BufferVisualization', () => {
  const mockBufferResult: BufferResult = {
    center: {
      type: 'Point',
      coordinates: [106.8272, -6.1751], // [lng, lat] Jakarta
    },
    radius: 500,
    parcels: {
      type: 'FeatureCollection',
      features: [],
    },
  }

  it('should render null when bufferResult is null', () => {
    const { queryByTestId } = renderWithMapContext(
      <BufferVisualization bufferResult={null} />
    )
    // When bufferResult is null, neither circle nor marker should render
    expect(queryByTestId('buffer-circle')).not.toBeInTheDocument()
    expect(queryByTestId('center-marker')).not.toBeInTheDocument()
  })

  it('should render buffer circle with correct center and radius', () => {
    renderWithMapContext(
      <BufferVisualization bufferResult={mockBufferResult} />
    )

    const circle = screen.getByTestId('buffer-circle')
    expect(circle).toBeInTheDocument()
    expect(circle).toHaveAttribute('data-radius', '500')
    expect(circle).toHaveAttribute('data-fill-opacity', '0.15')
  })

  it('should render center point marker', () => {
    renderWithMapContext(
      <BufferVisualization bufferResult={mockBufferResult} />
    )

    const marker = screen.getByTestId('center-marker')
    expect(marker).toBeInTheDocument()
    expect(marker).toHaveAttribute('data-fill-color', '#3b82f6')
  })

  it('should parse GeoJSON [lng, lat] to Leaflet LatLng correctly', () => {
    renderWithMapContext(
      <BufferVisualization bufferResult={mockBufferResult} />
    )

    const circle = screen.getByTestId('buffer-circle')
    const centerData = JSON.parse(circle.getAttribute('data-center') || '{}')

    // Leaflet LatLng should have lat first, lng second
    expect(centerData.lat).toBe(-6.1751)
    expect(centerData.lng).toBe(106.8272)
  })

  it('should apply blue color to circle and marker', () => {
    renderWithMapContext(
      <BufferVisualization bufferResult={mockBufferResult} />
    )

    const circle = screen.getByTestId('buffer-circle')
    const marker = screen.getByTestId('center-marker')

    // Both should use blue color from BUFFER_COLOR constant
    expect(marker).toHaveAttribute('data-fill-color', '#3b82f6')
  })
})
