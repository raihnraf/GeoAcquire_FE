import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MapHeader } from '../MapHeader'

describe('MapHeader', () => {
  it('should render GeoAcquire logo', () => {
    render(<MapHeader />)
    expect(screen.getByText('GeoAcquire')).toBeInTheDocument()
  })

  it('should render Filter button', () => {
    render(<MapHeader />)
    expect(screen.getByLabelText(/filter/i)).toBeInTheDocument()
  })

  it('should render Import button', () => {
    render(<MapHeader />)
    expect(screen.getByLabelText(/import/i)).toBeInTheDocument()
  })

  it('should render Stats button', () => {
    render(<MapHeader />)
    expect(screen.getByLabelText(/statistics/i)).toBeInTheDocument()
  })

  it('should render Add Parcel button', () => {
    render(<MapHeader />)
    expect(screen.getByLabelText(/add new parcel/i)).toBeInTheDocument()
  })

  it('should call onFilterClick when Filter is clicked', () => {
    const onFilterClick = vi.fn()
    render(<MapHeader onFilterClick={onFilterClick} />)
    screen.getByLabelText(/filter/i).click()
    expect(onFilterClick).toHaveBeenCalledOnce()
  })
})
