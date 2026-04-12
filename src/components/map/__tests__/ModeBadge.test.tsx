import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ModeBadge } from '../ModeBadge'
import type { MapMode } from '@/hooks/useMapMode'

const mockOnExit = vi.fn()

describe('ModeBadge', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render mode name with icon', () => {
    render(<ModeBadge mode="bbox" onExit={mockOnExit} />)

    expect(screen.getByText('Drawing Box')).toBeInTheDocument()
  })

  it('should show correct text for bbox mode (Drawing Box)', () => {
    render(<ModeBadge mode="bbox" onExit={mockOnExit} />)

    expect(screen.getByText('Drawing Box')).toBeInTheDocument()
    expect(screen.getByLabelText('Exit mode')).toBeInTheDocument()
  })

  it('should show correct text for buffer mode (Select Center)', () => {
    render(<ModeBadge mode="buffer-point" onExit={mockOnExit} />)

    expect(screen.getByText('Select Center')).toBeInTheDocument()
  })

  it('should render exit mode button (X icon)', () => {
    render(<ModeBadge mode="bbox" onExit={mockOnExit} />)

    const exitButton = screen.getByLabelText('Exit mode')
    expect(exitButton).toBeInTheDocument()
  })

  it('should call onExit when exit button clicked', () => {
    render(<ModeBadge mode="bbox" onExit={mockOnExit} />)

    const exitButton = screen.getByLabelText('Exit mode')
    fireEvent.click(exitButton)

    expect(mockOnExit).toHaveBeenCalledTimes(1)
  })

  it('should hide when mode is normal', () => {
    const { container } = render(<ModeBadge mode="normal" onExit={mockOnExit} />)

    expect(container.firstChild).toBe(null)
  })

  it('should have correct z-index for positioning below header', () => {
    const { container } = render(<ModeBadge mode="bbox" onExit={mockOnExit} />)

    const badge = container.querySelector('.z-15')
    expect(badge).toBeInTheDocument()
  })

  it('should have absolute positioning at top-left', () => {
    const { container } = render(<ModeBadge mode="bbox" onExit={mockOnExit} />)

    const badge = container.querySelector('.absolute.top-4.left-4')
    expect(badge).toBeInTheDocument()
  })

  it('should render BoxSelect icon for bbox mode', () => {
    const { container } = render(<ModeBadge mode="bbox" onExit={mockOnExit} />)

    // Check for the lucide-square-dashed class (BoxSelect icon in lucide-react)
    const icon = container.querySelector('.lucide-square-dashed')
    expect(icon).toBeInTheDocument()
  })

  it('should render Target icon for buffer mode', () => {
    const { container } = render(<ModeBadge mode="buffer-point" onExit={mockOnExit} />)

    // Check for the lucide-target class
    const icon = container.querySelector('.lucide-target')
    expect(icon).toBeInTheDocument()
  })
})
