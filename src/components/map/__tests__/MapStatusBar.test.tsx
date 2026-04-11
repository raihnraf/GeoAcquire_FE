import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MapStatusBar } from '../MapStatusBar'
import type { ParcelCollection } from '@/api/types'

describe('MapStatusBar', () => {
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

  it('should display parcel count', () => {
    render(<MapStatusBar data={mockData} />)
    expect(screen.getByText(/1 parcel/)).toBeInTheDocument()
  })

  it('should display plural "parcels" when count > 1', () => {
    const multiParcelData: ParcelCollection = {
      ...mockData,
      features: [...mockData.features, ...mockData.features],
    }
    render(<MapStatusBar data={multiParcelData} />)
    expect(screen.getByText(/2 parcels/)).toBeInTheDocument()
  })

  it('should display current page and total pages', () => {
    render(<MapStatusBar data={mockData} currentPage={2} totalPages={5} />)
    expect(screen.getByText(/2 \/ 5/)).toBeInTheDocument()
  })
})
