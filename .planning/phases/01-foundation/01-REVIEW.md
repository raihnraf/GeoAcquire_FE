---
phase: 01-foundation
reviewed: 2026-04-12T00:00:00Z
depth: standard
files_reviewed: 16
files_reviewed_list:
  - vitest.config.ts
  - src/test/setup.ts
  - package.json
  - vite.config.ts
  - tsconfig.json
  - tsconfig.app.json
  - tsconfig.node.json
  - src/main.tsx
  - src/App.tsx
  - src/index.css
  - src/vite-env.d.ts
  - .env.example
  - src/api/axios.ts
  - src/api/types.ts
  - src/lib/zod.ts
  - src/lib/queryClient.ts
  - src/lib/utils.ts
findings:
  critical: 0
  warning: 4
  info: 2
  total: 6
status: issues_found
---

# Phase 01: Code Review Report

**Reviewed:** 2026-04-12
**Depth:** standard
**Files Reviewed:** 16
**Status:** issues_found

## Summary

Phase 01-foundation establishes the project infrastructure with Vite, React, TypeScript, Tailwind CSS, React Query, Axios, Zod validation, and testing setup. All core configuration files and foundational modules were reviewed.

The codebase is well-structured with TypeScript strict mode enabled, proper type definitions, and good separation of concerns. The identified issues are primarily related to type safety compromises and geometric calculation accuracy that should be addressed before production use.

## Critical Issues

No critical issues found.

## Warnings

### WR-01: Type assertion bypasses error handling type safety

**File:** `src/api/axios.ts:20`
**Issue:** Using `as any` type assertion on error response data bypasses TypeScript type checking, potentially hiding type mismatches and making the code harder to maintain.

**Fix:**
```typescript
// Define proper error response type
interface LaravelErrorResponse {
  errors?: Record<string, string | string[]>
  message?: string
}

// Then use it instead of 'as any'
const data = error.response?.data as LaravelErrorResponse | undefined
if (data?.errors) {
  // ... rest of logic
}
```

### WR-02: Index signature allows untyped properties

**File:** `src/api/types.ts:15`
**Issue:** The `[key: string]: any` index signature on `ParcelProperties` interface allows any additional properties without type validation, which defeats TypeScript's type safety benefits and could lead to runtime errors.

**Fix:**
```typescript
// Define specific additional properties if known, or use a more specific type
export interface ParcelProperties {
  id: number
  owner_name: string
  status: ParcelStatus
  price_per_sqm: number | null
  area_sqm: number
  created_at: string
  updated_at: string
  // If you need flexibility, at least constrain to known types:
  [key: string]: string | number | null | undefined
}
```

### WR-03: Incorrect polygon area calculation for geographic coordinates

**File:** `src/lib/utils.ts:36-50`
**Issue:** The Shoelace formula is being applied to longitude/latitude coordinates directly, which produces incorrect results for geographic data. The formula assumes a flat Cartesian plane, but coordinates are on a sphere. Additionally, the conversion factor `12363.5` is not mathematically sound for converting square degrees to square meters.

**Fix:**
```typescript
/**
 * Calculate polygon area using Turf.js or proper geospatial library
 * Returns area in square meters
 */
export function calculatePolygonArea(coordinates: number[][]): number {
  // For production, use Turf.js area function:
  // import area from '@turf/area'
  // const polygon = { type: 'Polygon', coordinates: [coordinates] }
  // return area(polygon)

  // If you must use Shoelace, note it only works for projected coordinates
  // NOT lat/lng. For lat/lng, use a proper geospatial library.
  console.warn('calculatePolygonArea uses approximation - use Turf.js for production')

  let area = 0
  const n = coordinates.length

  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n
    const [lng1, lat1] = coordinates[i]
    const [lng2, lat2] = coordinates[j]
    // This is still an approximation
    area += (lng2 - lng1) * (2 + Math.sin(lat1 * Math.PI / 180) + Math.sin(lat2 * Math.PI / 180))
  }

  area = Math.abs(area) * 6378137 * 6378137 / 2 // Earth radius approximation
  return area
}
```

### WR-04: Unreliable file type validation

**File:** `src/lib/zod.ts:78`
**Issue:** File type validation relies on both MIME type (`application/geo+json`) and file extension. MIME types can vary by browser and operating system, and extensions can be spoofed. This may cause valid GeoJSON files to be rejected.

**Fix:**
```typescript
.file.refine((file) => {
  // Check MIME type or extension (more permissive)
  const isGeoJsonType = file.type === 'application/geo+json' ||
                        file.type === 'application/json' ||
                        file.name.endsWith('.geojson') ||
                        file.name.endsWith('.json')

  // Additional validation: try to parse and validate structure
  // This should be done when the file is actually read
  return isGeoJsonType
}, {
  message: 'File must be a GeoJSON file (.geojson or .json)',
})
```

## Info

### IN-01: Simplified cn utility lacks full clsx functionality

**File:** `src/lib/utils.ts:94-96`
**Issue:** The `cn` utility only handles string class names, while the standard `clsx` or `classnames` libraries also support objects and arrays for conditional classes (e.g., `{ 'active': isActive }`). This limits reusability.

**Fix:**
```typescript
export function cn(...classes: (string | undefined | null | false | Record<string, boolean>)[]): string {
  return classes
    .flatMap((item) => {
      if (typeof item === 'string') return item
      if (typeof item === 'object' && item !== null) {
        return Object.entries(item)
          .filter(([_, value]) => Boolean(value))
          .map(([key]) => key)
      }
      return []
    })
    .filter(Boolean)
    .join(' ')
}
```

### IN-02: Magic number without explanation

**File:** `src/lib/utils.ts:50`
**Issue:** The conversion factor `12363.5` lacks documentation explaining its derivation or source, making the code difficult to maintain and verify.

**Fix:**
```typescript
// Convert to square meters (approximate)
// Note: This is a rough approximation for square degrees at ~45 degrees latitude.
// For accurate geographic area calculation, use a geospatial library like Turf.js.
// Source: Approximation based on 1 degree ~= 111km at equator, adjusted for latitude.
const DEGREES_TO_METERS_SQ = 12363.5 // Approximate at 45° latitude
return Math.abs(area) * DEGREES_TO_METERS_SQ
```

---

_Reviewed: 2026-04-12_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
