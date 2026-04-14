import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { ParcelFormData } from '@/lib/zod'
import { parcelSchema } from '@/lib/zod'
import { FormField } from './FormField'
import { CurrencyInput } from './CurrencyInput'
import { cn } from '@/lib/utils'

export interface ParcelFormProps {
  defaultValues?: Partial<ParcelFormData>
  onSubmit: (data: ParcelFormData) => Promise<void>
  onCancel: () => void
  isSubmitting?: boolean
  mode?: 'create' | 'edit'
}

const DEFAULT_VALUES: Partial<ParcelFormData> = {
  owner_name: '',
  status: 'free',
  price_per_sqm: undefined,
  geometry: { type: 'Polygon', coordinates: [[]] },
}

export function ParcelForm({
  defaultValues = DEFAULT_VALUES,
  onSubmit,
  onCancel,
  isSubmitting = false,
  mode = 'create',
}: ParcelFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<ParcelFormData>({
    resolver: zodResolver(parcelSchema),
    defaultValues,
    mode: 'onTouched',
  })

  const handleSubmitForm = async (data: ParcelFormData) => {
    try {
      await onSubmit(data)
    } catch (error: any) {
      if (error.response?.data?.errors) {
        Object.entries(error.response.data.errors).forEach(([field, message]) => {
          setError(field as keyof ParcelFormData, { message: message as string })
        })
      }
    }
  }

  const submitButtonText = isSubmitting
    ? mode === 'create'
      ? 'Creating...'
      : 'Saving...'
    : mode === 'create'
      ? 'Create Parcel'
      : 'Save Changes'

  return (
    <form onSubmit={handleSubmit(handleSubmitForm)} className="w-full p-4">
      {/* Owner Name Field */}
      <div className="mb-4">
        <FormField
          label="Owner"
          name="owner_name"
          type="text"
          register={register('owner_name')}
          error={errors.owner_name?.message}
          placeholder="Enter owner name"
          disabled={isSubmitting}
          required
        />
      </div>

      {/* Status Field */}
      <div className="mb-4">
        <label
          htmlFor="status"
          className={cn(
            'mb-1 block text-sm font-medium',
            errors.status?.message ? 'text-red-600' : 'text-slate-700'
          )}
        >
          Status <span className="text-red-500">*</span>
        </label>
        <select
          id="status"
          disabled={isSubmitting}
          className={cn(
            'w-full rounded-md border px-3 py-2 text-sm outline-none transition-colors',
            errors.status?.message
              ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
              : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20',
            isSubmitting
              ? 'bg-slate-50 text-slate-500 cursor-not-allowed'
              : 'bg-white text-slate-900'
          )}
          {...register('status')}
        >
          <option value="free">Free</option>
          <option value="negotiating">Negotiating</option>
          <option value="target">Target</option>
        </select>
        {errors.status?.message && (
          <p className="mt-1 text-xs text-red-600">{errors.status.message}</p>
        )}
      </div>

      {/* Price per Square Meter Field */}
      <div className="mb-4">
        <CurrencyInput
          label="Price per m²"
          name="price_per_sqm"
          register={register('price_per_sqm')}
          error={errors.price_per_sqm?.message}
          placeholder="0"
          disabled={isSubmitting}
        />
        <p className="mt-1 text-xs text-slate-500">
          Harga dalam Rupiah. Contoh: 10.000.000
        </p>
      </div>

      {/* Geometry Validation Error */}
      {errors.geometry?.message && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3">
          <p className="text-sm text-red-600 font-medium">⚠️ {errors.geometry.message}</p>
          <p className="mt-1 text-xs text-red-500">
            Please draw a polygon on the map by clicking at least 3 times, then double-click to complete.
          </p>
        </div>
      )}

      {/* Form Actions */}
      <div className="flex gap-2 mt-6">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex-1 rounded-md bg-slate-100 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 rounded-md bg-blue-500 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitButtonText}
        </button>
      </div>
    </form>
  )
}
