import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ParcelSidebar } from '../ParcelSidebar'
type ParcelFeature = GeoJSON.Feature<GeoJSON.Polygon, { id: number; owner_name: string; status: string; price_per_sqm?: number }>

const mockParcel: ParcelFeature = {
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
    area_sqm: 10000,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
}

describe('ParcelSidebar', () => {
  it('should render parcel details in view mode', () => {
    const onClose = vi.fn()
    render(
      <ParcelSidebar
        parcel={mockParcel}
        isOpen={true}
        onClose={onClose}
        mode="view"
      />
    )

    expect(screen.getByText('Test Owner')).toBeInTheDocument()
    expect(screen.getByText(/free/i)).toBeInTheDocument()
  })

  it('should render ParcelForm in edit mode', () => {
    const onClose = vi.fn()
    const onModeChange = vi.fn()
    render(
      <ParcelSidebar
        parcel={mockParcel}
        isOpen={true}
        onClose={onClose}
        mode="edit"
        onModeChange={onModeChange}
      />
    )

    expect(screen.getByText(/edit parcel/i)).toBeInTheDocument()
  })

  it('should render ParcelForm in create mode', () => {
    const onClose = vi.fn()
    render(
      <ParcelSidebar
        parcel={null}
        isOpen={true}
        onClose={onClose}
        mode="create"
      />
    )

    expect(screen.getByText(/add parcel/i)).toBeInTheDocument()
  })

  it('should call onModeChange when edit button clicked', () => {
    const onClose = vi.fn()
    const onModeChange = vi.fn()
    render(
      <ParcelSidebar
        parcel={mockParcel}
        isOpen={true}
        onClose={onClose}
        mode="view"
        onModeChange={onModeChange}
      />
    )

    const editButton = screen.getByRole('button', { name: /edit/i })
    fireEvent.click(editButton)

    expect(onModeChange).toHaveBeenCalledWith('edit')
  })

  it('should call onDelete when delete button clicked', () => {
    const onClose = vi.fn()
    const onDelete = vi.fn()
    render(
      <ParcelSidebar
        parcel={mockParcel}
        isOpen={true}
        onClose={onClose}
        mode="view"
        onDelete={onDelete}
      />
    )

    const deleteButton = screen.getByRole('button', { name: /delete/i })
    fireEvent.click(deleteButton)

    expect(onDelete).toHaveBeenCalled()
  })
})
