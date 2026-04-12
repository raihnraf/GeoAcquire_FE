import { useState, useEffect, useCallback } from 'react'
import L from 'leaflet'
import { parseBbox, parseStatus, buildUrlParams, type FilterState } from '@/lib/url-utils'
import type { ParcelStatus } from '@/api/types'

const DEFAULT_FILTERS: FilterState = {
  status: [],
  bbox: null,
  selected: null,
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

    const parsedFilters: FilterState = {
      status: parseStatus(statusParam),
      bbox: parseBbox(bboxParam),
      selected: selectedParam ? parseInt(selectedParam, 10) : null,
    }

    // Only update if parsed values differ from defaults
    if (
      parsedFilters.status.length > 0 ||
      parsedFilters.bbox !== null ||
      parsedFilters.selected !== null
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
  }, [])

  return {
    filters,
    setFilters,
    clearFilters,
  }
}
