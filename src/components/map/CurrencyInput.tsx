import { useEffect, useState } from 'react'
import type { UseFormRegisterReturn } from 'react-hook-form'

export interface CurrencyInputProps {
  label: string
  name: string
  register: UseFormRegisterReturn
  error?: string
  placeholder?: string
  disabled?: boolean
  required?: boolean
  prefix?: string
}

/**
 * Format number with thousand separators (Indonesian format)
 * 1000 -> "1.000"
 * 10000 -> "10.000"
 * 1000000 -> "1.000.000"
 */
function formatNumber(value: string): string {
  // Remove all non-digit characters
  const digits = value.replace(/\D/g, '')

  if (digits === '') return ''

  // Format with thousand separators (Indonesian uses dot, but we'll use comma for international standard)
  // Actually, Indonesian uses dot for thousand separator: 1.000.000
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

/**
 * Parse formatted number back to raw number string
 * "1.000" -> "1000"
 * "10.000" -> "10000"
 */
function parseFormatted(value: string): string {
  return value.replace(/\./g, '')
}

export function CurrencyInput({
  label,
  name,
  register,
  error,
  placeholder,
  disabled = false,
  required = false,
  prefix = 'IDR ',
}: CurrencyInputProps) {
  const [displayValue, setDisplayValue] = useState('')
  const hasError = Boolean(error)

  // Get the actual value from form register
  const fieldValue = (register as any)._f?.value

  // Update display value when form value changes externally
  useEffect(() => {
    if (fieldValue !== undefined && fieldValue !== null && fieldValue !== '') {
      setDisplayValue(formatNumber(String(fieldValue)))
    } else if (fieldValue === '' || fieldValue === null || fieldValue === undefined) {
      setDisplayValue('')
    }
  }, [fieldValue])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value

    // Allow empty input
    if (rawValue === '') {
      setDisplayValue('')
      // Update form value - send undefined for optional field
      register.onChange({ target: { name, value: undefined } })
      return
    }

    // Format the input
    const formatted = formatNumber(rawValue)
    setDisplayValue(formatted)

    // Update form with raw number value (convert string to number)
    const rawNumber = parseFormatted(formatted)
    const numValue = rawNumber === '' ? undefined : Number(rawNumber)
    register.onChange({ target: { name, value: numValue } })
  }

  const handleBlur = () => {
    try {
      // Parse the display value back to a number on blur
      if (displayValue !== '') {
        const rawNumber = parseFormatted(displayValue)
        const numValue = rawNumber === '' ? undefined : Number(rawNumber)
        register.onChange?.({ target: { name, value: numValue } })
      }
    } catch (e) {
      // Ignore blur errors
    }
  }

  return (
    <div>
      <label
        htmlFor={name}
        className={`mb-1 block text-sm font-medium ${
          hasError ? 'text-red-600' : 'text-slate-700'
        }`}
      >
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">
            {prefix}
          </span>
        )}
        <input
          id={name}
          type="text"
          inputMode="numeric"
          placeholder={placeholder}
          disabled={disabled}
          value={displayValue}
          onChange={handleChange}
          onBlur={handleBlur}
          ref={register.ref}
          name={name}
          className={`w-full rounded-md border px-3 py-2 text-sm outline-none transition-colors ${
            prefix ? 'pl-12' : ''
          } ${
            hasError
              ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
              : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
          } ${
            disabled
              ? 'bg-slate-50 text-slate-500 cursor-not-allowed'
              : 'bg-white text-slate-900 placeholder:text-slate-400'
          }`}
        />
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}
