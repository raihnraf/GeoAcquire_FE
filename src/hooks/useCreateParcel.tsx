import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api/axios'
import type { ParcelFormData } from '@/lib/zod'
import toast from 'react-hot-toast'
import { CheckCircle, XCircle } from 'lucide-react'

/**
 * React Query mutation hook for creating a new parcel
 *
 * Features:
 * - Posts to /parcels endpoint with validated form data
 * - Invalidates parcels query cache on success
 * - Shows toast notifications for success/error
 *
 * Usage in ParcelForm:
 * ```tsx
 * const createParcel = useCreateParcel()
 * const onSubmit = (data) => createParcel.mutate(data)
 * ```
 */
export function useCreateParcel() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: ParcelFormData) => {
      const response = await api.post('/parcels', data)
      return response.data
    },

    onSuccess: () => {
      // Invalidate and refetch parcels query to show new parcel
      queryClient.invalidateQueries({ queryKey: ['parcels'] })

      toast.success('Parcel created successfully', {
        duration: 3000,
        icon: <CheckCircle className="h-4 w-4 text-green-500" />,
      })
    },

    onError: (error: any) => {
      const message =
        error.response?.data?.message ||
        error.message ||
        'Failed to create parcel'

      toast.error(message, {
        duration: 5000,
        icon: <XCircle className="h-4 w-4 text-red-500" />,
      })
    },
  })
}
