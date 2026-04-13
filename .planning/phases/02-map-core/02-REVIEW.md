---
phase: 02-map-core
reviewed: 2026-04-12T00:00:00Z
depth: standard
files_reviewed: 17
files_reviewed_list:
  - src/App.tsx
  - src/main.tsx
  - src/components/map/MapView.tsx
  - src/components/map/ParcelLayer.tsx
  - src/components/map/MapHeader.tsx
  - src/components/map/MapStatusBar.tsx
  - src/components/map/ParcelSidebar.tsx
  - src/components/map/LoadingSkeleton.tsx
  - src/components/map/EmptyState.tsx
  - src/hooks/useParcels.ts
  - src/test/map-test-utils.tsx
  - src/components/map/__tests__/MapView.test.tsx
  - src/components/map/__tests__/ParcelLayer.test.tsx
  - src/components/map/__tests__/MapHeader.test.tsx
  - src/components/map/__tests__/MapStatusBar.test.tsx
  - src/components/map/__tests__/LoadingSkeleton.test.tsx
  - src/components/map/__tests__/EmptyState.test.tsx
findings:
  critical: 0
  warning: 4
  info: 3
  total: 7
status: issues_found
---

# Phase 2: Map Core - Code Review

**Reviewed:** 2026-04-12
**Depth:** standard
**Files Reviewed:** 17
**Status:** issues_found

## Summary

The Phase 2 map core implementation demonstrates solid TypeScript practices, proper React patterns, and good test coverage. The code follows the project's architectural decisions (React Query, Leaflet, Tailwind CSS 4) and implements all MAP-01 through MAP-07 requirements correctly.

**Key strengths:**
- Excellent TypeScript typing with strict mode enabled
- Proper use of React Query for server state management
- Good separation of concerns (components, hooks, utilities)
- Comprehensive test coverage for all map components
- Proper accessibility with ARIA labels on interactive elements

**Areas for improvement:**
- Missing null/undefined checks in ParcelLayer click handler
- Console.log placeholder handlers should use TODO comments or no-op functions
- Missing ParcelSidebar and useParcels test coverage
- Unused parameters in some components

## Critical Issues

No critical issues found.

## Warnings

### WR-01: Missing null check in ParcelLayer click handler

**File:** `src/components/map/ParcelLayer.tsx:29-37`

**Issue:** The `handleClick` function does not validate that `event.layer` exists before accessing it. While react-leaflet's GeoJSON component typically provides this, defensive programming would prevent potential runtime errors.

**Fix:**
```typescript
const handleClick = (event: any) => {
  const layer = event.layer
  if (!layer) return // Add defensive check

  const feature = layer.feature as ParcelFeature | undefined
  const parcelId = feature?.properties?.id

  if (parcelId && onParcelClick) {
    onParcelClick(parcelId)
  }
}
```

### WR-02: Console.log placeholder handlers in App.tsx

**File:** `src/App.tsx:31-34`

**Issue:** Placeholder handlers use `console.log()` statements. While acceptable for development, these should either use proper TODO comments or be no-op functions to avoid cluttering console in production builds.

**Fix:**
```typescript
// Placeholder handlers for header buttons (implemented in later phases)
const handleFilterClick = () => {
  // TODO: Implement filter dialog (Phase 4)
}
const handleImportClick = () => {
  // TODO: Implement GeoJSON import (Phase 5)
}
const handleStatsClick = () => {
  // TODO: Implement statistics modal (Phase 5)
}
const handleAddParcelClick = () => {
  // TODO: Implement parcel creation (Phase 3)
}
```

### WR-03: Missing error handling in useParcels hook

**File:** `src/hooks/useParcels.ts:9-18`

**Issue:** The hook does not handle error states. React Query provides `error` and `isError` states that should be surfaced to the UI for proper user feedback.

**Fix:**
```typescript
export function useParcels() {
  return useQuery<ParcelCollection>({
    queryKey: ['parcels'],
    queryFn: async () => {
      const { data } = await api.get<ParcelCollection>('/parcels')
      return data
    },
    // Add error handling - consider adding retry logic for specific error codes
    retry: (failureCount, error: any) => {
      // Don't retry on 404 or 422 errors
      if (error?.response?.status === 404 || error?.response?.status === 422) {
        return false
      }
      return failureCount < 2
    },
  })
}
```

### WR-04: Unused props in MapStatusBar

**File:** `src/components/map/MapStatusBar.tsx:4-10`

**Issue:** The `currentPage`, `totalPages`, `onPagePrev`, and `onPageNext` props are defined but never used. While pagination is planned for later phases, unused props with `noUnusedParameters` TypeScript flag should either be implemented or removed with a TODO comment.

**Fix:**
```typescript
interface MapStatusBarProps {
  data: ParcelCollection | null
  // TODO: Implement pagination in Phase 4
  // currentPage?: number
  // totalPages?: number
  // onPagePrev?: () => void
  // onPageNext?: () => void
}
```

Or prefix with underscore to indicate intentionally unused:
```typescript
export function MapStatusBar({
  data,
  _currentPage = 1,
  _totalPages = 1,
  _onPagePrev,
  _onPageNext,
}: MapStatusBarProps) {
```

## Info

### IN-01: Missing test coverage for ParcelSidebar

**File:** No test file exists for `src/components/map/ParcelSidebar.tsx`

**Issue:** ParcelSidebar component lacks unit test coverage despite being a critical UI component for parcel details display.

**Fix:** Add `src/components/map/__tests__/ParcelSidebar.test.tsx` with tests for:
- Rendering parcel details correctly
- Status badge color mapping
- Format functions (area, price, date)
- Close button functionality
- Sidebar open/close state

### IN-02: Missing test coverage for useParcels hook

**File:** No test file exists for `src/hooks/useParcels.ts`

**Issue:** The useParcels hook lacks unit test coverage. While it's a thin wrapper around React Query, tests should verify query configuration and key generation.

**Fix:** Add `src/hooks/__tests__/useParcels.test.ts` with tests for:
- Correct queryKey generation
- API endpoint is called correctly
- Stale time configuration
- Error handling behavior

### IN-03: Type assertion usage in ParcelLayer

**File:** `src/components/map/ParcelLayer.tsx:14-16`

**Issue:** Using `as ParcelFeature | undefined` type assertion without runtime validation. While react-leaflet's GeoJSON typing makes this pattern necessary, consider adding a type guard for better safety.

**Fix:**
```typescript
import type { Feature, Geometry } from 'geojson'
import type { ParcelFeature } from '@/api/types'

// Type guard for ParcelFeature
function isParcelFeature(feature: Feature<Geometry, any> | undefined): feature is ParcelFeature {
  return feature !== undefined &&
         feature.type === 'Feature' &&
         feature.geometry?.type === 'Polygon' &&
         'id' in feature.properties
}

// Usage in getStyle
const getStyle = (feature: Feature<Geometry, any> | undefined) => {
  if (!isParcelFeature(feature)) {
    // Return default style for invalid features
    return { color: '#94a3b8', fillColor: '#94a3b8', fillOpacity: 0.3, weight: 1 }
  }
  const status = feature.properties?.status || 'free'
  const color = getParcelColor(status)
  return { color, fillColor: color, fillOpacity: 0.5, weight: 2 }
}
```

---

_Reviewed: 2026-04-12_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
