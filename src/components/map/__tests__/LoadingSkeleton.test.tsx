import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LoadingSkeleton } from '../LoadingSkeleton'

describe('LoadingSkeleton', () => {
  it('should render loading spinner', () => {
    render(<LoadingSkeleton />)
    expect(screen.getByText(/loading map/i)).toBeInTheDocument()
  })

  it('should have correct z-index for overlay', () => {
    const { container } = render(<LoadingSkeleton />)
    const overlay = container.querySelector('.z-50')
    expect(overlay).toBeInTheDocument()
  })
})
