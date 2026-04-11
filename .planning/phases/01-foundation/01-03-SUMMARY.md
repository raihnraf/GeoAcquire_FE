---
phase: 01-foundation
plan: 03
subsystem: "Validation & State Management"
tags: ["zod", "react-query", "validation", "cache"]
dependency_graph:
  requires: ["01-02"]
  provides: ["02-01", "03-01", "04-01"]
  affects: ["src/lib/zod.ts", "src/lib/queryClient.ts"]
tech_stack:
  added: []
  patterns:
    - "Zod schemas mirror Laravel validation rules"
    - "React Query cache strategy for geospatial data"
key_files:
  created:
    - path: "src/lib/zod.ts"
      exports: ["parcelSchema", "parcelGeometrySchema", "bufferRequestSchema", "importFileSchema", "ParcelFormData"]
      lines: 89
    - path: "src/lib/queryClient.ts"
      exports: ["queryClient"]
      lines: 24
  modified: []
decisions: []
metrics:
  duration_seconds: 46
  completed_date: "2026-04-12"
---

# Phase 1 Plan 3: Zod Schemas and React Query Client Summary

**One-liner:** Zod validation schemas mirroring Laravel rules with React Query client configured for geospatial parcel data caching.

## Overview

Created type-safe validation foundation for the GeoAcquire frontend using Zod schemas that mirror backend Laravel validation rules, and configured React Query with cache strategy optimized for relatively static geospatial parcel data.

## Artifacts Created

### 1. Zod Validation Schemas (`src/lib/zod.ts`)

**Purpose:** Validate all user input against backend rules before API calls.

**Schemas implemented:**

| Schema | Purpose | Key Validations |
|--------|---------|-----------------|
| `parcelStatusEnum` | Status dropdown | Enum: free, negotiating, target |
| `parcelGeometrySchema` | GeoJSON Polygon | [lng, lat] order, min 4 coordinates, closed ring |
| `parcelSchema` | Parcel form | owner_name (1-255 chars), status enum, price (optional, >= 0), geometry |
| `bufferRequestSchema` | Buffer analysis | lat/lng bounds, distance 1-10000m |
| `importFileSchema` | File upload | GeoJSON type only, max 5MB |

**Exported TypeScript types:**
- `ParcelFormData` - Form state type for parcel create/edit
- `BufferRequestData` - Buffer analysis parameters
- `ImportFileData` - File upload validation type

### 2. React Query Client (`src/lib/queryClient.ts`)

**Purpose:** Server state management with cache strategy for geospatial data.

**Cache configuration:**

| Setting | Value | Rationale |
|---------|-------|-----------|
| `staleTime` | 5 minutes | Parcel data is relatively static |
| `gcTime` | 30 minutes | Cache for typical user session |
| `refetchOnWindowFocus` | false | Prevents unnecessary API calls |
| `refetchOnMount` | true | Refresh if data is stale |
| `refetchOnReconnect` | false | Too aggressive for map data |
| `retry` | 1 | Single retry for transient network failures |

## Deviations from Plan

None - plan executed exactly as written.

## Verification Results

- [x] `src/lib/zod.ts` exists with all exported schemas (89 lines)
- [x] `src/lib/queryClient.ts` exists with queryClient export (24 lines)
- [x] `parcelSchema` validates owner_name, status, price_per_sqm, geometry
- [x] `bufferRequestSchema` validates lat, lng, distance
- [x] TypeScript types inferred and exported
- [x] `refetchOnWindowFocus: false` configured
- [x] `staleTime: 1000 * 60 * 5` (5 minutes) configured

## Known Stubs

None - all schemas are fully implemented with proper validation rules.

## Threat Flags

| Flag | File | Description |
|------|------|-------------|
| threat_flag: tampering | src/lib/zod.ts | Zod schemas validate all user input; max length prevents DoS via long strings |
| threat_flag: tampering | src/lib/zod.ts | File size limited to 5MB; type validation for GeoJSON only |

## Commits

| Commit | Hash | Message |
|--------|------|---------|
| Task 1 | 0c14202 | feat(01-foundation): add Zod validation schemas |
| Task 2 | d2e6348 | feat(01-foundation): configure React Query client with cache strategy |

## Self-Check: PASSED

- [x] src/lib/zod.ts exists (89 lines)
- [x] src/lib/queryClient.ts exists (24 lines)
- [x] Commit 0c14202 exists
- [x] Commit d2e6348 exists
