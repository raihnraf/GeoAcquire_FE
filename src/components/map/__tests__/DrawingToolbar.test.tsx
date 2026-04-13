import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DrawingToolbar } from '../DrawingToolbar'

describe('DrawingToolbar', () => {
  it('should render Cancel and Complete buttons', () => {
    const onCancel = vi.fn()
    const onComplete = vi.fn()
    render(
      <DrawingToolbar
        onCancel={onCancel}
        onComplete={onComplete}
        canComplete={false}
      />
    )

    expect(screen.getByRole('button', { name: /cancel drawing/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /complete polygon/i })).toBeInTheDocument()
  })

  it('should call onCancel when Cancel button clicked', () => {
    const onCancel = vi.fn()
    const onComplete = vi.fn()
    render(
      <DrawingToolbar
        onCancel={onCancel}
        onComplete={onComplete}
        canComplete={false}
      />
    )

    const cancelButton = screen.getByRole('button', { name: /cancel drawing/i })
    fireEvent.click(cancelButton)

    expect(onCancel).toHaveBeenCalled()
    expect(onComplete).not.toHaveBeenCalled()
  })

  it('should call onComplete when Complete button clicked', () => {
    const onCancel = vi.fn()
    const onComplete = vi.fn()
    render(
      <DrawingToolbar
        onCancel={onCancel}
        onComplete={onComplete}
        canComplete={true}
      />
    )

    const completeButton = screen.getByRole('button', { name: /complete polygon/i })
    fireEvent.click(completeButton)

    expect(onComplete).toHaveBeenCalled()
  })

  it('should disable Complete button when canComplete is false', () => {
    const onCancel = vi.fn()
    const onComplete = vi.fn()
    render(
      <DrawingToolbar
        onCancel={onCancel}
        onComplete={onComplete}
        canComplete={false}
      />
    )

    const completeButton = screen.getByRole('button', { name: /complete polygon/i })
    expect(completeButton).toBeDisabled()
  })
})
