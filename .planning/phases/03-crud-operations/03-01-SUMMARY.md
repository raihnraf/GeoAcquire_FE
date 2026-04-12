---
phase: 03-crud-operations
plan: 01
subsystem: validation-layer
tags: [zod, axios, validation, types]
dependency_graph:
  requires: [02-05]
  provides: [03-02, 03-03, 03-06]
  affects: []
tech_stack:
  added: []
  patterns: [zod-validation, laravel-error-interception]
key_files:
  created: []
  modified: [src/api/types.ts]
decisions: []
metrics:
  duration: 6
  completed_date: 2026-04-12
---

# Phase 3 Plan 01: Form Validation Foundation Summary

**One-liner:** Zod parcelSchema validates all form fields with Laravel-mirrored constraints; Axios interceptor converts 422 errors to react-hook-form format; ParcelFormData type exported for type-safe forms.

## Overview

This plan verified and enhanced the form validation foundation for CRUD operations. The existing Zod parcelSchema was confirmed to have all required validations matching Laravel backend rules. The Axios 422 error interceptor was verified to correctly transform Laravel validation errors to react-hook-form format. A missing type re-export was added for consistency.

## Tasks Completed

| Task | Name | Commit | Files |
| ---- | ----- | ------ | ----- |
| 1 | Verify and enhance Zod parcelSchema | (verified) | src/lib/zod.ts |
| 2 | Verify Axios 422 error interceptor | (verified) | src/api/axios.ts |
| 3 | Export ParcelFormData type | 94624d3 | src/api/types.ts |

## Implementation Details

### Task 1: Zod parcelSchema Verification

The existing parcelSchema in `src/lib/zod.ts` already includes all required validations:

- **owner_name**: string, required, min 1 char, max 255 chars, trimmed
- **status**: enum('free', 'negotiating', 'target'), required
- **price_per_sqm**: number, optional, min 0 (positive)
- **geometry**: GeoJSON Polygon with proper coordinate validation

All validation rules match Laravel backend validation rules exactly. No changes were needed.

### Task 2: Axios 422 Error Interceptor Verification

The existing Axios response interceptor in `src/api/axios.ts` correctly handles Laravel 422 validation errors:

- Detects 422 status code from backend
- Parses Laravel error format: `{ errors: { field: ['message'] } }`
- Transforms to react-hook-form format: `{ errors: { field: 'message' } }`
- Extracts first message from array if present

No changes were needed to the interceptor implementation.

### Task 3: ParcelFormData Type Export

Added the missing re-export of ParcelFormData type in `src/api/types.ts`:

```typescript
export type { ParcelFormData } from '@/lib/zod'
```

This ensures form components can import ParcelFormData from either location for consistency across the codebase.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Functionality] Added ParcelFormData re-export to types.ts**
- **Found during:** Task 3
- **Issue:** ParcelFormData type was not re-exported from src/api/types.ts, creating inconsistent import paths across the codebase
- **Fix:** Added `export type { ParcelFormData } from '@/lib/zod'` to src/api/types.ts
- **Files modified:** src/api/types.ts
- **Commit:** 94624d3

## Verification Results

All tests passed:
- `src/lib/__tests__/zod.test.ts`: 5 tests passed
- `src/api/__tests__/axios.test.ts`: 3 tests passed

Test coverage confirms:
- Valid parcel data is accepted
- Invalid owner_name (too long) is rejected
- Invalid status enum values are rejected
- Negative price_per_sqm is rejected
- Optional price_per_sqm works correctly
- 422 errors are transformed from array to string format
- Missing error fields are handled gracefully
- Non-422 errors pass through unchanged

## Known Issues

The following pre-existing issues were discovered but are **out of scope** for this plan (deferred to `deferred-items.md`):

1. **Test files with JSX syntax errors**: `src/hooks/__tests__/useCreateParcel.test.ts`, `src/hooks/__tests__/useDeleteParcel.test.ts`, `src/hooks/__tests__/useUpdateParcel.test.ts` have TypeScript compilation errors related to JSX syntax in test files. These will need to be fixed when implementing those hooks in plans 03-03 and 03-06.

2. **Missing test utilities**: `@/test/map-test-utils` is referenced but doesn't exist, affecting some map component tests.

3. **Missing lib/utils**: `@/lib/utils` is imported by ParcelSidebar but doesn't exist yet.

## Threat Surface Scan

No new threat surfaces introduced in this plan. The validation layer provides defense-in-depth:
- Zod schema validates all input on client-side (non-authoritative, server-side Laravel validation is authoritative)
- owner_name max 255 chars prevents DoS via long strings
- price_per_sqm min(0) prevents negative prices
- GeoJSON RFC 7946 validation ensures coordinate bounds and polygon closure
- Error messages formatted as plain text (not HTML), React auto-escapes when rendering

## Next Steps

With the validation foundation verified, form components can now be built in plan 03-02 (ParcelForm) using:
- `zodResolver(parcelSchema)` for validation
- `ParcelFormData` type for type-safe form handling
- Axios `api.post/put` methods with automatic 422 error formatting
