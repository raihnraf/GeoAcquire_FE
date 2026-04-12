import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { FilterBar } from '@/components/map/FilterBar'
import type { ParcelStatus } from '@/api/types'

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Filter: ({ className }: { className: string }) => (
    <svg data-testid="filter-icon" className={className} />
  ),
  X: ({ className }: { className: string }) => (
    <svg data-testid="x-icon" className={className} />
  ),
}))

// Mock cn utility
vi.mock('@/lib/utils', () => ({
  cn: (...classes: (string | undefined | null | false)[]) => {
    return classes.filter(Boolean).join(' ')
  },
}))

describe('FilterBar', () => {
  let mockOnStatusToggle: ReturnType<typeof vi.fn>
  let mockOnClear: ReturnType<typeof vi.fn>

  beforeEach(() => {
    mockOnStatusToggle = vi.fn()
    mockOnClear = vi.fn()
  })

  it('should render status filter buttons (Free, Negotiating, Target)', () => {
    render(
      <FilterBar
        activeStatuses={[]}
        onStatusToggle={mockOnStatusToggle}
        onClear={mockOnClear}
      />
    )

    expect(screen.getByRole('button', { name: /filter by free/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /filter by negotiating/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /filter by target/i })).toBeInTheDocument()
  })

  it('should toggle status filters on button click', () => {
    const { rerender } = render(
      <FilterBar
        activeStatuses={[]}
        onStatusToggle={mockOnStatusToggle}
        onClear={mockOnClear}
      />
    )

    // Click Free button
    fireEvent.click(screen.getByRole('button', { name: /filter by free/i }))
    expect(mockOnStatusToggle).toHaveBeenCalledWith('free')

    // Click Negotiating button
    fireEvent.click(screen.getByRole('button', { name: /filter by negotiating/i }))
    expect(mockOnStatusToggle).toHaveBeenCalledWith('negotiating')

    // Click Target button
    fireEvent.click(screen.getByRole('button', { name: /filter by target/i }))
    expect(mockOnStatusToggle).toHaveBeenCalledWith('target')
  })

  it('should show Clear Filters button when filters are active', () => {
    const { rerender } = render(
      <FilterBar
        activeStatuses={[]}
        onStatusToggle={mockOnStatusToggle}
        onClear={mockOnClear}
      />
    )

    // No active filters - Clear button should not be visible
    expect(screen.queryByRole('button', { name: /clear all filters/i })).not.toBeInTheDocument()

    // With active filters
    rerender(
      <FilterBar
        activeStatuses={['free']}
        onStatusToggle={mockOnStatusToggle}
        onClear={mockOnClear}
      />
    )

    // Clear button should be visible
    expect(screen.getByRole('button', { name: /clear all filters/i })).toBeInTheDocument()
  })

  it('should clear all filters on Clear button click', () => {
    render(
      <FilterBar
        activeStatuses={['free', 'negotiating']}
        onStatusToggle={mockOnStatusToggle}
        onClear={mockOnClear}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: /clear all filters/i }))
    expect(mockOnClear).toHaveBeenCalled()
  })

  it('should mark active status buttons with aria-pressed', () => {
    render(
      <FilterBar
        activeStatuses={['free', 'target']}
        onStatusToggle={mockOnStatusToggle}
        onClear={mockOnClear}
      />
    )

    expect(screen.getByRole('button', { name: /filter by free/i })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: /filter by negotiating/i })).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByRole('button', { name: /filter by target/i })).toHaveAttribute('aria-pressed', 'true')
  })

  it('should render filter icon', () => {
    render(
      <FilterBar
        activeStatuses={[]}
        onStatusToggle={mockOnStatusToggle}
        onClear={mockOnClear}
      />
    )

    expect(screen.getByTestId('filter-icon')).toBeInTheDocument()
  })

  it('should render X icon on Clear button when filters are active', () => {
    render(
      <FilterBar
        activeStatuses={['free']}
        onStatusToggle={mockOnStatusToggle}
        onClear={mockOnClear}
      />
    )

    expect(screen.getByTestId('x-icon')).toBeInTheDocument()
  })
})
