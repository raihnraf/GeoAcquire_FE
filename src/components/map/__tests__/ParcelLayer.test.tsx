import { describe, it, expect, vi } from 'vitest'
import { renderWithMapContext } from '@/test/map-test-utils'
import { ParcelLayer } from '../ParcelLayer'
import type { ParcelCollection } from '@/api/types'

vi.mock('react-leaflet', () => ({
  GeoJSON: ({ data, style }: any) => (
    <div data-testid="geojson-layer" data-features={data?.features?.length} />
  ),
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
    ],
  }

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
    expect(getByTestId('geojson-layer')).toHaveAttribute('data-features', '1')
  })
})
