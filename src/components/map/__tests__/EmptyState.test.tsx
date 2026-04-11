import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { EmptyState } from '../EmptyState'

describe('EmptyState', () => {
  it('should render "No parcels yet" message', () => {
    render(<EmptyState />)
    expect(screen.getByText(/no parcels yet/i)).toBeInTheDocument()
  })

  it('should render map icon', () => {
    const { container } = render(<EmptyState />)
    const icon = container.querySelector('svg')
    expect(icon).toBeInTheDocument()
  })
})
