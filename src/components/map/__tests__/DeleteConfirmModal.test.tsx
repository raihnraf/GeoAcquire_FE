import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DeleteConfirmModal } from '../DeleteConfirmModal'

describe('DeleteConfirmModal', () => {
  it('should not render when isOpen is false', () => {
    const onClose = vi.fn()
    const onConfirm = vi.fn()
    render(
      <DeleteConfirmModal
        isOpen={false}
        onClose={onClose}
        onConfirm={onConfirm}
      />
    )

    expect(screen.queryByText(/delete parcel/i)).not.toBeInTheDocument()
  })

  it('should render warning message when isOpen is true', () => {
    const onClose = vi.fn()
    const onConfirm = vi.fn()
    render(
      <DeleteConfirmModal
        isOpen={true}
        onClose={onClose}
        onConfirm={onConfirm}
      />
    )

    expect(screen.getByText(/delete parcel/i)).toBeInTheDocument()
    expect(screen.getByText(/are you sure/i)).toBeInTheDocument()
    expect(screen.getByText(/cannot be undone/i)).toBeInTheDocument()
  })

  it('should call onClose when cancel button clicked', () => {
    const onClose = vi.fn()
    const onConfirm = vi.fn()
    render(
      <DeleteConfirmModal
        isOpen={true}
        onClose={onClose}
        onConfirm={onConfirm}
      />
    )

    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    fireEvent.click(cancelButton)

    expect(onClose).toHaveBeenCalled()
    expect(onConfirm).not.toHaveBeenCalled()
  })

  it('should call onConfirm when delete button clicked', () => {
    const onClose = vi.fn()
    const onConfirm = vi.fn()
    render(
      <DeleteConfirmModal
        isOpen={true}
        onClose={onClose}
        onConfirm={onConfirm}
      />
    )

    const deleteButton = screen.getByRole('button', { name: /delete/i })
    fireEvent.click(deleteButton)

    expect(onConfirm).toHaveBeenCalled()
  })

  it('should disable delete button when isDeleting is true', () => {
    const onClose = vi.fn()
    const onConfirm = vi.fn()
    render(
      <DeleteConfirmModal
        isOpen={true}
        onClose={onClose}
        onConfirm={onConfirm}
        isDeleting={true}
      />
    )

    const deleteButton = screen.getByRole('button', { name: /deleting/i })
    expect(deleteButton).toBeDisabled()
  })
})
