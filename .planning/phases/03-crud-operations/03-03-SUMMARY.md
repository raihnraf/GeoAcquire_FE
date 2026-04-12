---
phase: 03-crud-operations
plan: 03
subsystem: parcel-creation
tags: [mutation-hook, drawing-handler, react-query, leaflet]
dependency_graph:
  requires:
    - "src/api/axios.ts"
    - "src/lib/zod.ts"
    - "react-leaflet"
  provides:
    - "src/hooks/useCreateParcel.tsx"
    - "src/components/map/DrawingHandler.tsx"
  affects:
    - "ParcelForm (future plan)"
tech_stack:
  added:
    - "useCreateParcel: React Query useMutation with cache invalidation"
    - "DrawingHandler: Leaflet useMapEvents for map interaction"
  patterns:
    - "Mutation hooks invalidate queries on success"
    - "Toast notifications with lucide-react icons"
    - "GeoJSON coordinate order [lng, lat] per RFC 7946"
key_files:
  created:
    - path: "src/hooks/useCreateParcel.tsx"
      lines: 51
      purpose: "React Query mutation hook for creating parcels"
    - path: "src/components/map/DrawingHandler.tsx"
      lines: 86
      purpose: "Leaflet click handler for polygon drawing"
  modified:
    - path: "vitest.config.ts"
      purpose: "Fixed path alias resolution for tests"
decisions: []
metrics:
  duration: "PT5M"
  completed_date: "2026-04-12"
---

# Phase 03 Plan 03: Create Parcel Mutation Hook and Drawing Handler Summary

**One-liner:** React Query useMutation hook for parcel creation with toast notifications and Leaflet-based polygon drawing handler with click/double-click/Escape key interactions.

## Implementation Summary

This plan implemented two core pieces for the parcel creation workflow:

### 1. useCreateParcel Mutation Hook
- React Query `useMutation` hook that posts to `/parcels` endpoint
- Invalidates `['parcels']` query cache on success to trigger refetch
- Toast notifications using `react-hot-toast` with `lucide-react` icons (CheckCircle, XCircle)
- Error handling extracts message from `error.response?.data?.message`

### 2. DrawingHandler Component
- Uses `useMapEvents` from `react-leaflet` for map interaction
- Collects polygon vertices as `[lng, lat]` pairs (GeoJSON RFC 7946 order)
- **Click:** Adds vertex to polygon
- **Click near first point:** Closes polygon (circular completion)
- **Double-click:** Closes polygon with 3+ points
- **Escape:** Cancels drawing, clears points, calls `onCancel`
- Returns coordinates via `onDrawingComplete` callback
- Renders nothing (null) - only attaches event listeners

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed vitest.config.ts path alias resolution**
- **Found during:** Task 1 test execution
- **Issue:** Tests failed with "Cannot resolve import '@/api/axios'" - vitest config was missing path alias configuration
- **Fix:** Added `resolve.alias` to vitest.config.ts matching vite.config.ts
- **Files modified:** `vitest.config.ts`
- **Commit:** 903857c

**2. [Rule 1 - Bug] Renamed test files to .tsx for JSX support**
- **Found during:** Task 1 TypeScript compilation
- **Issue:** Test files contained JSX (lucide-react icons in toast calls) but had .ts extension
- **Fix:** Renamed useCreateParcel.test.ts, useDeleteParcel.test.ts, useUpdateParcel.test.ts to .tsx
- **Files modified:** Test file extensions in `src/hooks/__tests__/`

**3. [Rule 1 - Bug] Added Leaflet import to DrawingHandler.tsx**
- **Found during:** Task 2 TypeScript compilation
- **Issue:** `L.DomEvent.stopPropagation` referenced UMD global 'L' without import in module context
- **Fix:** Added `import L from 'leaflet'` at top of file
- **Files modified:** `src/components/map/DrawingHandler.tsx`

## Files Created

| File | Lines | Purpose |
|------|-------|---------|
| `src/hooks/useCreateParcel.tsx` | 51 | React Query mutation hook for parcel creation |
| `src/components/map/DrawingHandler.tsx` | 86 | Leaflet map click handler for polygon drawing |

## Tests

- `src/hooks/__tests__/useCreateParcel.test.tsx`: 3 tests passing
- `src/components/map/__tests__/DrawingHandler.test.tsx`: 4 tests passing

## Integration Points

The hook and component will be integrated in future plans:
- `useCreateParcel` will be used by `ParcelForm` onSubmit handler
- `DrawingHandler` will be rendered when user enters "draw parcel" mode
- Both components follow established patterns from `useParcels.ts` and react-leaflet

## Threat Surface

No new threat surface introduced. The plan's threat model documented:
- **T-03-03-01:** Zod parcelSchema validates data before POST
- **T-03-03-02:** Coordinates captured from Leaflet (trusted source), not user input
- **T-03-03-03:** Toast messages contain non-sensitive information only
- **T-03-03-04:** No authentication in v1 (portfolio/demo)

## Self-Check: PASSED

- [x] `src/hooks/useCreateParcel.tsx` exists at `/home/raihan/Documents/DAPAT KERJA/GeoAcquire-FS/GeoAcquire_FE/src/hooks/useCreateParcel.tsx`
- [x] `src/components/map/DrawingHandler.tsx` exists at `/home/raihan/Documents/DAPAT KERJA/GeoAcquire-FS/GeoAcquire_FE/src/components/map/DrawingHandler.tsx`
- [x] Commit 903857c exists
- [x] Commit 16daad6 exists
- [x] All tests pass
- [x] TypeScript compilation succeeds for created files
