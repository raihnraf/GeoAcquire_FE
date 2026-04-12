import type { UseFormRegisterReturn } from 'react-hook-form'

export interface FormFieldProps {
  label: string
  name: string
  type?: 'text' | 'number' | 'email'
  register: UseFormRegisterReturn
  error?: string
  placeholder?: string
  disabled?: boolean
  required?: boolean
}

export function FormField({
  label,
  name,
  type = 'text',
  register,
  error,
  placeholder,
  disabled = false,
  required = false,
}: FormFieldProps) {
  const hasError = Boolean(error)

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
      <input
        id={name}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full rounded-md border px-3 py-2 text-sm outline-none transition-colors ${
          hasError
            ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
            : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
        } ${
          disabled
            ? 'bg-slate-50 text-slate-500 cursor-not-allowed'
            : 'bg-white text-slate-900 placeholder:text-slate-400'
        }`}
        {...register}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}
