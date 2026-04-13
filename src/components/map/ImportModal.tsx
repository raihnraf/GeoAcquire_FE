import { useState, useCallback } from 'react'
import { Upload, X, FileCheck, AlertCircle } from 'lucide-react'
import { api } from '@/api/axios'
import type { ParcelCollection } from '@/api/types'
import toast from 'react-hot-toast'

interface ImportModalProps {
  isOpen: boolean
  onClose: () => void
  onImportSuccess: () => void
}

interface ImportResult {
  imported: number
  errors: Array<{
    feature_index: number
    message: string
  }>
}

export function ImportModal({ isOpen, onClose, onImportSuccess }: ImportModalProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  // Handle file selection
  const handleFileSelect = useCallback((file: File) => {
    // Validate file type
    if (!file.name.endsWith('.geojson') && !file.name.endsWith('.json')) {
      toast.error('Please select a valid GeoJSON file (.geojson or .json)')
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB')
      return
    }

    setSelectedFile(file)
    setImportResult(null)
  }, [])

  // Handle drag events
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }, [handleFileSelect])

  // Validate GeoJSON structure
  const validateGeoJSON = async (file: File): Promise<ParcelCollection | null> => {
    try {
      const text = await file.text()
      const data = JSON.parse(text)

      // Basic structure validation
      if (data.type !== 'FeatureCollection') {
        toast.error('Invalid GeoJSON: Root type must be "FeatureCollection"')
        return null
      }

      if (!Array.isArray(data.features)) {
        toast.error('Invalid GeoJSON: Missing "features" array')
        return null
      }

      if (data.features.length === 0) {
        toast.error('GeoJSON file contains no features')
        return null
      }

      if (data.features.length > 100) {
        toast.error('Maximum 100 features allowed per import')
        return null
      }

      return data as ParcelCollection
    } catch (error) {
      if (error instanceof SyntaxError) {
        toast.error('Invalid JSON file format')
      } else {
        toast.error('Failed to read file')
      }
      return null
    }
  }

  // Upload file to API
  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file first')
      return
    }

    // Validate GeoJSON structure
    const geojsonData = await validateGeoJSON(selectedFile)
    if (!geojsonData) {
      return
    }

    setIsUploading(true)

    try {
      const response = await api.post('/parcels/import', geojsonData, {
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const result = response.data as { imported: number; errors: ImportResult['errors']; message: string }
      setImportResult({
        imported: result.imported,
        errors: result.errors || [],
      })

      if (result.imported > 0) {
        toast.success(result.message)
        onImportSuccess()
      } else {
        toast.error('No features were imported')
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to import GeoJSON features'
      toast.error(message)
    } finally {
      setIsUploading(false)
    }
  }

  // Close and reset modal
  const handleClose = () => {
    setSelectedFile(null)
    setImportResult(null)
    setIsUploading(false)
    onClose()
  }

  // Don't render if not open
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-lg rounded-lg bg-white shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">Import GeoJSON</h2>
          <button
            onClick={handleClose}
            className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close import modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          {/* File Upload Area */}
          {!importResult && (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
                isDragging
                  ? 'border-blue-500 bg-blue-50'
                  : selectedFile
                    ? 'border-green-500 bg-green-50'
                    : 'border-slate-300 hover:border-slate-400'
              }`}
            >
              <input
                type="file"
                accept=".geojson,.json"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    handleFileSelect(file)
                  }
                }}
                className="hidden"
                id="geojson-upload"
              />
              <label
                htmlFor="geojson-upload"
                className="cursor-pointer"
              >
                <Upload className="mx-auto h-12 w-12 text-slate-400" />
                <p className="mt-2 text-sm font-medium text-slate-700">
                  {selectedFile ? selectedFile.name : 'Drop GeoJSON file here'}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  or click to browse (max 100 features, 10MB)
                </p>
              </label>
            </div>
          )}

          {/* Import Result */}
          {importResult && (
            <div className="space-y-4">
              {/* Success Summary */}
              <div className="rounded-lg bg-green-50 p-4">
                <div className="flex items-start gap-3">
                  <FileCheck className="h-5 w-5 flex-shrink-0 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-green-900">
                      Import Complete
                    </p>
                    <p className="mt-1 text-sm text-green-700">
                      {importResult.imported} feature(s) imported successfully
                    </p>
                  </div>
                </div>
              </div>

              {/* Errors (if any) */}
              {importResult.errors.length > 0 && (
                <div className="rounded-lg bg-amber-50 p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 flex-shrink-0 text-amber-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-amber-900">
                        {importResult.errors.length} feature(s) failed
                      </p>
                      <ul className="mt-2 max-h-32 overflow-y-auto space-y-1">
                        {importResult.errors.map((err, idx) => (
                          <li key={idx} className="text-xs text-amber-800">
                            Feature #{err.feature_index + 1}: {err.message}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Info Text */}
          <div className="mt-4 rounded-lg bg-slate-50 p-3">
            <p className="text-xs text-slate-600">
              <strong>Supported format:</strong> GeoJSON FeatureCollection with Polygon geometry
            </p>
            <p className="mt-1 text-xs text-slate-600">
              <strong>Required properties:</strong> owner_name, status (free/negotiating/target)
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex gap-2 border-t border-slate-200 px-6 py-4">
          <button
            onClick={handleClose}
            disabled={isUploading}
            className="flex-1 rounded-md bg-slate-100 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {importResult ? 'Close' : 'Cancel'}
          </button>
          {!importResult && (
            <button
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
              className="flex-1 rounded-md bg-blue-500 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isUploading ? 'Importing...' : 'Import'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
