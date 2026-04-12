import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BufferPanel } from '../BufferPanel'

describe('BufferPanel', () => {
  const mockOnApply = vi.fn()
  const mockOnCancel = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render distance input field with default value (500)', () => {
    render(<BufferPanel onApply={mockOnApply} onCancel={mockOnCancel} />)

    const input = screen.getByLabelText('Buffer radius in meters')
    expect(input).toBeInTheDocument()
    expect(input).toHaveAttribute('type', 'number')
    expect(input).toHaveAttribute('min', '1')
    expect(input).toHaveAttribute('max', '10000')
    expect(input).toHaveValue(500)
  })

  it('should show Apply and Cancel buttons', () => {
    render(<BufferPanel onApply={mockOnApply} onCancel={mockOnCancel} />)

    const applyButton = screen.getByLabelText('Apply buffer analysis')
    const cancelButton = screen.getByLabelText('Cancel buffer analysis')

    expect(applyButton).toBeInTheDocument()
    expect(cancelButton).toBeInTheDocument()
  })

  it('should validate distance input (1-10000 range)', () => {
    render(<BufferPanel onApply={mockOnApply} onCancel={mockOnCancel} />)

    const input = screen.getByLabelText('Buffer radius in meters')
    const applyButton = screen.getByLabelText('Apply buffer analysis')

    // Test below minimum - should clamp to 1
    fireEvent.change(input, { target: { value: 0 } })
    fireEvent.click(applyButton)
    expect(mockOnApply).toHaveBeenCalledWith(1)

    // Test above maximum - should clamp to 10000
    vi.clearAllMocks()
    fireEvent.change(input, { target: { value: 15000 } })
    fireEvent.click(applyButton)
    expect(mockOnApply).toHaveBeenCalledWith(10000)

    // Test valid value
    vi.clearAllMocks()
    fireEvent.change(input, { target: { value: 750 } })
    fireEvent.click(applyButton)
    expect(mockOnApply).toHaveBeenCalledWith(750)
  })

  it('should call onApply with distance when Apply clicked', () => {
    render(<BufferPanel onApply={mockOnApply} onCancel={mockOnCancel} />)

    const input = screen.getByLabelText('Buffer radius in meters')
    const applyButton = screen.getByLabelText('Apply buffer analysis')

    fireEvent.change(input, { target: { value: 1000 } })
    fireEvent.click(applyButton)

    expect(mockOnApply).toHaveBeenCalledTimes(1)
    expect(mockOnApply).toHaveBeenCalledWith(1000)
  })

  it('should call onCancel when Cancel clicked', () => {
    render(<BufferPanel onApply={mockOnApply} onCancel={mockOnCancel} />)

    const cancelButton = screen.getByLabelText('Cancel buffer analysis')
    fireEvent.click(cancelButton)

    expect(mockOnCancel).toHaveBeenCalledTimes(1)
  })

  it('should use initialRadius prop when provided', () => {
    render(
      <BufferPanel
        initialRadius={1000}
        onApply={mockOnApply}
        onCancel={mockOnCancel}
      />
    )

    const input = screen.getByLabelText('Buffer radius in meters')
    expect(input).toHaveValue(1000)
  })
})
