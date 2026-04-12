import { useEffect } from 'react'
import { AlertTriangle } from 'lucide-react'

export interface DeleteConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  isDeleting?: boolean
}

/**
 * Delete confirmation modal for parcel deletion
 *
 * Features:
 * - Overlay with semi-transparent background (z-index 30)
 * - AlertTriangle icon in red for warning
 * - Confirmation and cancel buttons
 * - Loading state for delete operation
 * - Keyboard support (Escape to close)
 *
 * Usage:
 * ```tsx
 * const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
 * const deleteParcel = useDeleteParcel()
 *
 * <DeleteConfirmModal
 *   isOpen={isDeleteModalOpen}
 *   onClose={() => setIsDeleteModalOpen(false)}
 *   onConfirm={() => deleteParcel.mutate(parcelId)}
 *   isDeleting={deleteParcel.isPending}
 * />
 * ```
 */
export function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  isDeleting = false,
}: DeleteConfirmModalProps) {
  // Close modal on Escape key press
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isDeleting) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose, isDeleting])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-30"
      onClick={isDeleting ? undefined : onClose}
      role="presentation"
    >
      {/* Semi-transparent overlay */}
      <div className="absolute inset-0 bg-slate-900/50 animate-in fade-in duration-200" />

      {/* Modal container */}
      <div
        className="relative bg-white rounded-lg shadow-2xl p-8 max-w-md w-full mx-4 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-modal-title"
        aria-describedby="delete-modal-description"
      >
        {/* Warning icon */}
        <div className="flex justify-center">
          <AlertTriangle className="h-12 w-12 text-red-500" />
        </div>

        {/* Heading */}
        <h2
          id="delete-modal-title"
          className="text-lg font-semibold text-slate-900 text-center mt-4"
        >
          Delete Parcel
        </h2>

        {/* Body text */}
        <p
          id="delete-modal-description"
          className="text-sm text-slate-600 text-center mt-2"
        >
          Are you sure you want to delete this parcel? This action cannot be
          undone.
        </p>

        {/* Action buttons */}
        <div className="flex gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 bg-slate-100 text-slate-700 hover:bg-slate-200 py-2 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 bg-red-500 text-white hover:bg-red-600 py-2 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}
