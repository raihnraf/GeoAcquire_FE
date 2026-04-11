import { describe, it, expect, vi } from 'vitest'
import { renderWithMapContext } from '@/test/map-test-utils'
import { MapView } from '../MapView'

// Mock react-leaflet to avoid Leaflet dependency in tests
vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="map-container">{children}</div>
  ),
  TileLayer: () => <div data-testid="tile-layer" />,
}))

describe('MapView', () => {
  it('should render map container', () => {
    const { getByTestId } = renderWithMapContext(<MapView />)
    expect(getByTestId('map-container')).toBeInTheDocument()
  })

  it('should render tile layer for OSM tiles', () => {
    const { getByTestId } = renderWithMapContext(<MapView />)
    expect(getByTestId('tile-layer')).toBeInTheDocument()
  })
})
