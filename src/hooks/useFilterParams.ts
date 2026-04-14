import { useState, useEffect, useCallback } from 'react'
import { parseBbox, parseStatusFromParams, parseBuffer, parseViewport, buildUrlParams, type FilterState } from '@/lib/url-utils'

const DEFAULT_FILTERS: FilterState = {
  status: [],
  bbox: null,
  selected: null,
  bufferCenter: null,
  bufferRadius: 500,
  viewportCenter: null,
  viewportZoom: 5,
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

    const bboxParam = params.get('bbox')
    const selectedParam = params.get('selected')
    const bufferParam = params.get('buffer')
    const centerParam = params.get('center')
    const zoomParam = params.get('zoom')

    const parsedFilters: FilterState = {
      status: parseStatusFromParams(params),
      bbox: parseBbox(bboxParam),
      selected: selectedParam ? parseInt(selectedParam, 10) : null,
      bufferCenter: null,
      bufferRadius: 500,
      viewportCenter: null,
      viewportZoom: 5,
    }

    // Parse buffer parameter if present
    const bufferResult = parseBuffer(bufferParam)
    if (bufferResult) {
      parsedFilters.bufferCenter = bufferResult.bufferCenter
      parsedFilters.bufferRadius = bufferResult.bufferRadius
    }

    // Parse viewport parameter if present
    const viewportResult = parseViewport(centerParam, zoomParam)
    if (viewportResult) {
      parsedFilters.viewportCenter = viewportResult.viewportCenter
      parsedFilters.viewportZoom = viewportResult.viewportZoom
    }

    // Only update if parsed values differ from defaults
    if (
      parsedFilters.status.length > 0 ||
      parsedFilters.bbox !== null ||
      parsedFilters.selected !== null ||
      parsedFilters.bufferCenter !== null ||
      parsedFilters.viewportCenter !== null
    ) {
      setFilters(parsedFilters)
    }
  }, [])

  // Update URL when filters change
  useEffect(() => {
    const params = buildUrlParams(filters)
    const queryString = params.toString()

    // Clear URL params when all filters are empty (including status=[])
    if (queryString) {
      const newUrl = `${window.location.pathname}?${queryString}`
      window.history.replaceState(null, '', newUrl)
    } else {
      // Remove all query params when no filters active
      window.history.replaceState(null, '', window.location.pathname)
    }
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
