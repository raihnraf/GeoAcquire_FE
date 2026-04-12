import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api/axios'
import type { ParcelFormData } from '@/lib/zod'
import toast from 'react-hot-toast'
import { CheckCircle, XCircle } from 'lucide-react'

/**
 * React Query mutation hook for updating an existing parcel
 *
 * Features:
 * - Puts to /parcels/{id} endpoint with validated form data
 * - Invalidates parcels query cache on success
 * - Shows toast notifications for success/error
 *
 * Usage in ParcelSidebar edit mode:
 * ```tsx
 * const updateParcel = useUpdateParcel()
 * const onSubmit = (data) => updateParcel.mutate({ id: parcelId, data })
 * ```
 */
export function useUpdateParcel() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: ParcelFormData }) => {
      const response = await api.put(`/parcels/${id}`, data)
      return response.data
    },

    onSuccess: () => {
      // Invalidate and refetch parcels query to show updated parcel
      queryClient.invalidateQueries({ queryKey: ['parcels'] })

      toast.success('Parcel updated successfully', {
        duration: 3000,
        icon: <CheckCircle className="h-4 w-4 text-green-500" />,
      })
    },

    onError: (error: any) => {
      const message =
        error.response?.data?.message ||
        error.message ||
        'Failed to update parcel'

      toast.error(message, {
        duration: 5000,
        icon: <XCircle className="h-4 w-4 text-red-500" />,
      })
    },
  })
}
