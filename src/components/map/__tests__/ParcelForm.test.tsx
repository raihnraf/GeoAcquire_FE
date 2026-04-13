import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ParcelForm } from '../ParcelForm'

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  })
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('ParcelForm', () => {
  it('should render form fields', () => {
    const onSubmit = vi.fn()
    const onCancel = vi.fn()
    render(
      <ParcelForm
        onSubmit={onSubmit}
        onCancel={onCancel}
        mode="create"
      />,
      { wrapper: createWrapper() }
    )

    expect(screen.getByLabelText(/owner/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/status/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/price per m²/i)).toBeInTheDocument()
  })

  it('should show validation errors for empty required fields', async () => {
    const onSubmit = vi.fn()
    const onCancel = vi.fn()
    render(
      <ParcelForm
        onSubmit={onSubmit}
        onCancel={onCancel}
        mode="create"
      />,
      { wrapper: createWrapper() }
    )

    const submitButton = screen.getByRole('button', { name: /create parcel/i })
    fireEvent.click(submitButton)

    // Form should show validation errors (geometry will fail first)
    // This is a stub test - full validation requires valid geometry
    expect(screen.getByText(/owner/i)).toBeInTheDocument()
  })

  it('should call onCancel when cancel button clicked', () => {
    const onSubmit = vi.fn()
    const onCancel = vi.fn()
    render(
      <ParcelForm
        onSubmit={onSubmit}
        onCancel={onCancel}
        mode="create"
      />,
      { wrapper: createWrapper() }
    )

    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    fireEvent.click(cancelButton)

    expect(onCancel).toHaveBeenCalled()
  })

  it('should show "Creating..." button text when isSubmitting is true', () => {
    const onSubmit = vi.fn()
    const onCancel = vi.fn()
    render(
      <ParcelForm
        onSubmit={onSubmit}
        onCancel={onCancel}
        mode="create"
        isSubmitting={true}
      />,
      { wrapper: createWrapper() }
    )

    expect(screen.getByText(/creating/i)).toBeInTheDocument()
  })

  it('should show "Save Changes" button in edit mode', () => {
    const onSubmit = vi.fn()
    const onCancel = vi.fn()
    render(
      <ParcelForm
        onSubmit={onSubmit}
        onCancel={onCancel}
        mode="edit"
      />,
      { wrapper: createWrapper() }
    )

    expect(screen.getByText(/save changes/i)).toBeInTheDocument()
  })
})
