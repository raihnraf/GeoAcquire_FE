import { useState, useEffect, useCallback } from 'react'
import { parseBbox, parseStatus, parseBuffer, buildUrlParams, type FilterState } from '@/lib/url-utils'

const DEFAULT_FILTERS: FilterState = {
  status: [],
  bbox: null,
  selected: null,
  bufferCenter: null,
  bufferRadius: 500,
}

/**
 * Hook for managing filter state synchronized with URL parameters
 * @returns Filter state and setter functions
 */
export function useFilterParams() {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS)

  // Parse URL params on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)

    const statusParam = params.get('status')
    const bboxParam = params.get('bbox')
    const selectedParam = params.get('selected')
    const bufferParam = params.get('buffer')

    const parsedFilters: FilterState = {
      status: parseStatus(statusParam),
      bbox: parseBbox(bboxParam),
      selected: selectedParam ? parseInt(selectedParam, 10) : null,
      bufferCenter: null,
      bufferRadius: 500,
    }

    // Parse buffer parameter if present
    const bufferResult = parseBuffer(bufferParam)
    if (bufferResult) {
      parsedFilters.bufferCenter = bufferResult.bufferCenter
      parsedFilters.bufferRadius = bufferResult.bufferRadius
    }

    // Only update if parsed values differ from defaults
    if (
      parsedFilters.status.length > 0 ||
      parsedFilters.bbox !== null ||
      parsedFilters.selected !== null ||
      parsedFilters.bufferCenter !== null
    ) {
      setFilters(parsedFilters)
    }
  }, [])

  // Update URL when filters change
  useEffect(() => {
    const params = buildUrlParams(filters)
    const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`
    window.history.replaceState(null, '', newUrl)
  }, [filters])

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS)
    // Clear URL params
    window.history.replaceState({}, '', window.location.pathname)
  }, [])

  return {
    filters,
    setFilters,
    clearFilters,
  }
}
