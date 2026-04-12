import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api/axios'
import toast from 'react-hot-toast'
import { CheckCircle, XCircle } from 'lucide-react'

/**
 * React Query mutation hook for deleting a parcel
 *
 * Features:
 * - Deletes to /parcels/{id} endpoint
 * - Invalidates parcels query cache on success
 * - Shows toast notifications for success/error
 *
 * Usage in DeleteConfirmModal and ParcelSidebar:
 * ```tsx
 * const deleteParcel = useDeleteParcel()
 * const onConfirm = () => deleteParcel.mutate(parcelId)
 * ```
 */
export function useDeleteParcel() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/parcels/${id}`)
    },

    onSuccess: () => {
      // Invalidate and refetch parcels query to remove deleted parcel
      queryClient.invalidateQueries({ queryKey: ['parcels'] })

      toast.success('Parcel deleted successfully', {
        duration: 3000,
        icon: <CheckCircle className="h-4 w-4 text-green-500" />,
      })
    },

    onError: (error: any) => {
      const message =
        error.response?.data?.message ||
        error.message ||
        'Failed to delete parcel'

      toast.error(message, {
        duration: 5000,
        icon: <XCircle className="h-4 w-4 text-red-500" />,
      })
    },
  })
}
