import { describe, it, expect, vi } from 'vitest'
import { renderWithMapContext } from '@/test/map-test-utils'
import { ParcelLayer } from '../ParcelLayer'
import type { ParcelCollection, BufferResult } from '@/api/types'

// Track style function calls for testing
let capturedStyles: Array<any> = []

vi.mock('react-leaflet', () => ({
  GeoJSON: ({ data, style }: any) => {
    // Capture styles for all features to test styling logic
    capturedStyles = []
    if (data?.features) {
      data.features.forEach((feature: any) => {
        const styleFn = typeof style === 'function' ? style : () => style
        capturedStyles.push(styleFn(feature))
      })
    }
    return (
      <div
        data-testid="geojson-layer"
        data-features={data?.features?.length}
        data-styles={JSON.stringify(capturedStyles)}
      />
    )
  },
}))

describe('ParcelLayer', () => {
  const mockData: ParcelCollection = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]],
        },
        properties: {
          id: 1,
          owner_name: 'Test Owner',
          status: 'free',
          price_per_sqm: 100000,
          area_sqm: 1000,
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
        },
      },
      {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [[[2, 2], [3, 2], [3, 3], [2, 3], [2, 2]]],
        },
        properties: {
          id: 2,
          owner_name: 'Another Owner',
          status: 'negotiating',
          price_per_sqm: 150000,
          area_sqm: 2000,
          created_at: '2024-01-02',
          updated_at: '2024-01-02',
        },
      },
    ],
  }

  beforeEach(() => {
    capturedStyles = []
  })

  it('should render GeoJSON layer with parcel data', () => {
    const { getByTestId } = renderWithMapContext(
      <ParcelLayer data={mockData} />
    )
    expect(getByTestId('geojson-layer')).toBeInTheDocument()
  })

  it('should render all parcels from data', () => {
    const { getByTestId } = renderWithMapContext(
      <ParcelLayer data={mockData} />
    )
    expect(getByTestId('geojson-layer')).toHaveAttribute('data-features', '2')
  })

  describe('Buffer highlighting', () => {
    const mockBufferResult: BufferResult = {
      center: {
        type: 'Point',
        coordinates: [106.8272, -6.1751],
      },
      radius: 500,
      parcels: {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'Polygon',
              coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]],
            },
            properties: {
              id: 1,
              owner_name: 'Test Owner',
              status: 'free',
              price_per_sqm: 100000,
              area_sqm: 1000,
              created_at: '2024-01-01',
              updated_at: '2024-01-01',
            },
          },
        ],
      },
    }

    it('should highlight nearby parcels in blue', () => {
      const { getByTestId } = renderWithMapContext(
        <ParcelLayer data={mockData} bufferResult={mockBufferResult} />
      )
      const stylesAttr = getByTestId('geojson-layer').getAttribute('data-styles')
      const styles = JSON.parse(stylesAttr || '[]')

      // First parcel (id=1) is nearby - should have blue highlight
      expect(styles[0]).toMatchObject({
        color: '#3b82f6',
        fillColor: '#3b82f6',
        fillOpacity: 0.2,
        weight: 3,
      })
    })

    it('should fade non-matching parcels when buffer is active', () => {
      const { getByTestId } = renderWithMapContext(
        <ParcelLayer data={mockData} bufferResult={mockBufferResult} />
      )
      const stylesAttr = getByTestId('geojson-layer').getAttribute('data-styles')
      const styles = JSON.parse(stylesAttr || '[]')

      // Second parcel (id=2) is NOT nearby - should be faded
      expect(styles[1].fillOpacity).toBe(0.3)
      expect(styles[1].weight).toBe(2)
    })

    it('should use normal styling when no buffer result', () => {
      const { getByTestId } = renderWithMapContext(
        <ParcelLayer data={mockData} bufferResult={null} />
      )
      const stylesAttr = getByTestId('geojson-layer').getAttribute('data-styles')
      const styles = JSON.parse(stylesAttr || '[]')

      // Normal opacity without buffer
      expect(styles[0].fillOpacity).toBe(0.5)
      expect(styles[1].fillOpacity).toBe(0.5)
    })

    it('should handle empty buffer results gracefully', () => {
      const emptyBufferResult: BufferResult = {
        center: {
          type: 'Point',
          coordinates: [106.8272, -6.1751],
        },
        radius: 500,
        parcels: {
          type: 'FeatureCollection',
          features: [],
        },
      }

      const { getByTestId } = renderWithMapContext(
        <ParcelLayer data={mockData} bufferResult={emptyBufferResult} />
      )

      // Should still render without errors
      expect(getByTestId('geojson-layer')).toBeInTheDocument()
    })
  })
})
