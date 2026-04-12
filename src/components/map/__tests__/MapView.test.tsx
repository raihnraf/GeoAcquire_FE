import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MapView } from '../MapView'

// Mock MapContainer with getContainer method
const mockMap = {
  getContainer: vi.fn(() => ({ style: {} })),
}

// Mock react-leaflet to avoid Leaflet dependency in tests
vi.mock('react-leaflet', () => ({
  MapContainer: ({ children, ref }: { children: React.ReactNode; ref?: (map: typeof mockMap) => void }) => {
    // Call ref with mock map if provided
    if (ref) ref(mockMap)
    return <div data-testid="map-container">{children}</div>
  },
  TileLayer: () => <div data-testid="tile-layer" />,
  GeoJSON: ({ data }: { data: unknown }) => <div data-testid="geojson-layer" data-features={JSON.stringify(data)} />,
}))

// Mock the drawing components
vi.mock('../DrawingHandler', () => ({
  DrawingHandler: () => null,
}))

vi.mock('../DrawingPreview', () => ({
  DrawingPreview: () => null,
}))

// Mock useParcels hook
vi.mock('@/hooks/useParcels', () => ({
  useParcels: () => ({
    data: {
      type: 'FeatureCollection',
      features: [{
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]
        },
        properties: {
          id: 1,
          owner_name: 'Test Owner',
          status: 'free',
          price_per_sqm: 100000,
          area_sqm: 1000,
          created_at: '2024-01-01',
          updated_at: '2024-01-01'
        }
      }]
    },
    isLoading: false,
    isFetched: true
  })
}))

describe('MapView', () => {
  it('should render map container', () => {
    render(<MapView />)
    expect(screen.getByTestId('map-container')).toBeInTheDocument()
  })

  it('should render tile layer for OSM tiles', () => {
    render(<MapView />)
    expect(screen.getByTestId('tile-layer')).toBeInTheDocument()
  })
})
