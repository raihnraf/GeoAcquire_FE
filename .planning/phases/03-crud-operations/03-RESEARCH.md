# Phase 3: CRUD Operations - Research

**Researched:** 2026-04-12
**Domain:** React form handling, mutations, Leaflet drawing, validation
**Confidence:** HIGH

## Summary

Phase 3 implements full CRUD operations for land parcels, integrating react-hook-form with Zod validation, React Query mutations for server state management, Leaflet polygon drawing for geometry creation, and react-hot-toast for user notifications. The phase builds on the existing Phase 2 map infrastructure by adding form-based interactions, mutation hooks, and drawing mode capabilities.

The backend API already provides standard REST endpoints (`POST /parcels`, `PUT /parcels/{id}`, `DELETE /parcels/{id}`) with Laravel validation that returns 422 errors in a specific format. The frontend must map these errors to form fields and handle geometry validation on both client and server sides.

**Primary recommendation:** Use react-hook-form with @hookform/resolvers+zod for validation, React Query useMutation for all server mutations, custom Leaflet click handlers for polygon drawing (no additional drawing library needed), and react-hot-toast for all user notifications.

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| CRUD-01 | User can create parcel by drawing polygon on map | Leaflet click event handlers, GeoJSON coordinate array state management |
| CRUD-02 | User can create parcel by filling form | react-hook-form with Zod schema (parcelSchema already defined) |
| CRUD-03 | User can view parcel details in sidebar when clicked | Extend existing ParcelSidebar with mode state (view/edit/create) |
| CRUD-04 | User can edit parcel fields and geometry | React Query update mutation, edit mode in sidebar |
| CRUD-05 | User can delete parcel with confirmation dialog | React Query delete mutation, modal component |
| CRUD-06 | Form validation mirrors backend rules (Zod) | parcelSchema already mirrors Laravel StoreParcelRequest |
| CRUD-07 | Backend 422 errors mapped to form fields inline | Axios interceptor already formats Laravel errors |
| CRUD-08 | Success/error toasts on mutation outcomes | react-hot-toast already installed |
| CRUD-09 | Cache invalidation after create/update/delete | React Query queryClient.invalidateQueries |

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react-hook-form | 7.72.1 [VERIFIED: npm registry] | Form state management | Industry standard, minimal re-renders, excellent TypeScript support |
| @hookform/resolvers | 5.2.2 [VERIFIED: npm registry] | Zod integration for validation | Official resolver for schema-based validation, type-safe |
| zod | 4.3.6 [VERIFIED: npm registry] | Schema validation | Already configured, matches Laravel rules, type inference |
| @tanstack/react-query | 5.99.0 [VERIFIED: npm registry] | Server state management | Already configured, handles mutations and cache invalidation |
| react-hot-toast | 2.6.0 [VERIFIED: npm registry] | Toast notifications | Already installed, non-intrusive, good animations |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| react-leaflet | 5.0.0 [VERIFIED: npm registry] | Map and polygon rendering | Already in use, for drawing mode and polygon preview |
| axios | 1.15.0 [VERIFIED: npm registry] | HTTP client with error handling | Already configured with Laravel 422 error formatter |
| lucide-react | 1.8.0 [VERIFIED: npm registry] | Icons for UI elements | Already in use, for edit/delete/save icons |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| react-hook-form | Formik | react-hook-form has better performance (fewer re-renders) and smaller bundle |
| react-leaflet drawing | @react-leaflet/draw | @react-leaflet/draw adds 100KB+ for features we don't need; custom click handler is sufficient |
| react-hot-toast | sonner / react-toastify | react-hot-toast is already installed and provides the features we need |

**Installation:** All required dependencies are already installed in package.json.

**Version verification:**
```bash
npm view react-hook-form version  # 7.72.1
npm view @hookform/resolvers version  # 5.2.2
npm view @tanstack/react-query version  # 5.99.0
npm view zod version  # 4.3.6
npm view react-hot-toast version  # 2.6.0
```

## Architecture Patterns

### Recommended Project Structure

```
src/
├── components/
│   ├── map/
│   │   ├── ParcelForm.tsx          # NEW: Form component for create/edit
│   │   ├── DrawingToolbar.tsx      # NEW: Floating controls during drawing
│   │   ├── DeleteConfirmModal.tsx  # NEW: Confirmation dialog
│   │   ├── FormField.tsx           # NEW: Reusable input wrapper
│   │   ├── ParcelSidebar.tsx       # MODIFY: Add edit/create modes
│   │   ├── MapView.tsx             # MODIFY: Add drawing mode state
│   │   └── ParcelLayer.tsx         # MODIFY: Add polygon preview for drawing
├── hooks/
│   ├── useParcels.ts               # EXISTS: Query hook for fetching
│   ├── useCreateParcel.ts          # NEW: Mutation hook for create
│   ├── useUpdateParcel.ts          # NEW: Mutation hook for update
│   └── useDeleteParcel.ts          # NEW: Mutation hook for delete
└── lib/
    ├── zod.ts                      # EXISTS: parcelSchema already defined
    └── utils.ts                    # EXISTS: STATUS_COLORS, formatters
```

### Pattern 1: react-hook-form + Zod Integration

**What:** Use @hookform/resolvers to integrate Zod schemas with react-hook-form for type-safe validation.

**When to use:** All form components (ParcelForm for create/edit).

**Example:**

```typescript
// Source: @hookform/resolvers documentation (standard pattern)
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { parcelSchema } from '@/lib/zod'
import type { ParcelFormData } from '@/lib/zod'

export function ParcelForm({ defaultValues, onSubmit }: ParcelFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<ParcelFormData>({
    resolver: zodResolver(parcelSchema),
    defaultValues,
    mode: 'onTouched', // Validate on blur for better UX
  })

  const handleSubmitForm = async (data: ParcelFormData) => {
    try {
      await onSubmit(data)
    } catch (error: any) {
      // Map server errors to form fields (for CRUD-07)
      if (error.response?.data?.errors) {
        Object.entries(error.response.data.errors).forEach(([field, message]) => {
          setError(field as keyof ParcelFormData, { message: message as string })
        })
      }
    }
  }

  return (
    <form onSubmit={handleSubmit(handleSubmitForm)}>
      {/* Form fields with error display */}
    </form>
  )
}
```

### Pattern 2: React Query Mutation with Cache Invalidation

**What:** Use useMutation hook for create/update/delete operations with automatic cache invalidation.

**When to use:** All server mutations (create, update, delete).

**Example:**

```typescript
// Source: @tanstack/react-query documentation (standard pattern)
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api/axios'
import type { ParcelFormData } from '@/lib/zod'

export function useCreateParcel() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: ParcelFormData) => {
      const { data: response } = await api.post('/parcels', data)
      return response
    },
    onSuccess: () => {
      // Invalidate parcels query to refetch (CRUD-09)
      queryClient.invalidateQueries({ queryKey: ['parcels'] })
      toast.success('Parcel created successfully')
    },
    onError: (error: any) => {
      // Error handling with toast (CRUD-08)
      const message = error.response?.data?.message || 'Failed to create parcel'
      toast.error(message)
    },
  })
}
```

### Pattern 3: Leaflet Polygon Drawing with Click Handler

**What:** Use custom click event handlers on MapContainer to collect polygon vertices, with visual feedback using temporary overlays.

**When to use:** Drawing mode for creating/editing parcel geometry.

**Example:**

```typescript
// Source: react-leaflet documentation (event handlers pattern)
import { useMapEvents } from 'react-leaflet'
import { useState } from 'react'

interface DrawingProps {
  onDrawingComplete: (coordinates: number[][]) => void
}

export function DrawingHandler({ onDrawingComplete }: DrawingProps) {
  const [points, setPoints] = useState<number[][]>([])

  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng
      // GeoJSON uses [lng, lat] order
      const newPoint: [number, number] = [lng, lat]
      const newPoints = [...points, newPoint]
      setPoints(newPoints)

      // Check if user clicked on first point (complete polygon)
      if (points.length >= 2 && isNearFirstPoint(newPoint, points[0])) {
        const closedPoints = [...points, points[0]] // Close the ring
        onDrawingComplete(closedPoints)
      }
    },
    dblclick: () => {
      // Double-click completes polygon
      if (points.length >= 3) {
        const closedPoints = [...points, points[0]]
        onDrawingComplete(closedPoints)
      }
    },
  })

  return null
}

// Helper to detect if click is near first point (for completion)
function isNearFirstPoint(point: [number, number], firstPoint: [number, number], threshold = 10): boolean {
  const distance = Math.sqrt(
    Math.pow(point[0] - firstPoint[0], 2) + Math.pow(point[1] - firstPoint[1], 2)
  )
  return distance < threshold
}
```

### Pattern 4: Sidebar Mode State Machine

**What:** Use a mode prop on ParcelSidebar to switch between view, edit, and create states.

**When to use:** ParcelSidebar component for displaying different UI states.

**Example:**

```typescript
// Source: React state management pattern (custom implementation)
type SidebarMode = 'view' | 'edit' | 'create'

interface ParcelSidebarProps {
  parcel: ParcelFeature | null
  isOpen: boolean
  onClose: () => void
  mode?: SidebarMode
  onModeChange?: (mode: SidebarMode) => void
}

export function ParcelSidebar({ parcel, isOpen, onClose, mode = 'view', onModeChange }: ParcelSidebarProps) {
  if (!parcel && mode !== 'create') return null

  return (
    <aside className="...">
      {mode === 'view' && <ParcelDetailView parcel={parcel} onEdit={() => onModeChange?.('edit')} />}
      {mode === 'edit' && <ParcelForm parcel={parcel} onCancel={() => onModeChange?.('view')} />}
      {mode === 'create' && <ParcelForm onCancel={onClose} />}
    </aside>
  )
}
```

### Anti-Patterns to Avoid

- **Manual form state:** Don't use useState for form fields - react-hook-form handles this with better performance
- **Fetching after mutation:** Don't manually refetch data - use queryClient.invalidateQueries for consistency
- **Alert() for errors:** Don't use browser alerts - use react-hot-toast for better UX
- **Inline geometry validation:** Don't write custom geometry validation - use Zod schema (parcelGeometrySchema) already defined
- **Uncontrolled geometry input:** Don't let users type GeoJSON manually - always use map drawing
- **Blocking UI during mutation:** Don't disable entire page - only disable form/submit button with loading state

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Form validation | Custom validation logic | Zod schemas + @hookform/resolvers | Already configured, type-safe, matches backend rules |
| Form state management | useState for each field | react-hook-form | Fewer re-renders, built-in error handling, better performance |
| Server state management | useState + useEffect for data | React Query | Caching, background refetch, optimistic updates |
| Toast notifications | Custom toast component | react-hot-toast | Already installed, non-intrusive, accessible |
| Error mapping | Manual error parsing | Axios interceptor (already exists) | Laravel 422 errors already formatted correctly |
| Geometry validation | Custom polygon checks | parcelGeometrySchema (Zod) | Validates GeoJSON RFC 7946 compliance |

**Key insight:** The phase requires integrating existing infrastructure rather than building new solutions. The Zod schemas, axios client with error handling, and React Query client are all pre-configured. The focus is on connecting these with form components and drawing interactions.

## Common Pitfalls

### Pitfall 1: GeoJSON Coordinate Order

**What goes wrong:** Polygons render in wrong locations or fail validation due to coordinate order mismatch.

**Why it happens:** GeoJSON RFC 7946 uses `[longitude, latitude]` order, but Leaflet uses `[latitude, longitude]`. Mixing these causes issues.

**How to avoid:** Always use `[lng, lat]` order for GeoJSON coordinates (including in Zod schema). Only convert to Leaflet `[lat, lng]` when rendering.

```typescript
// CORRECT: GeoJSON coordinate order
const geoJsonPoint: [number, number] = [106.6150, -6.2500] // [lng, lat]

// For Leaflet, convert:
const leafletPoint: [number, number] = [geoJsonPoint[1], geoJsonPoint[0]] // [lat, lng]
```

**Warning signs:** Polygon appears in ocean or wrong continent, validation errors about coordinate ranges.

### Pitfall 2: Unclosed Polygons

**What goes wrong:** Backend rejects polygon with "must be closed" error or area calculation fails.

**Why it happens:** GeoJSON polygons must have first and last coordinates identical to form a closed ring.

**How to avoid:** Always close polygons by appending first point to end of array before submission.

```typescript
// Close polygon ring
function closePolygon(coordinates: number[][]): number[][] {
  const first = coordinates[0]
  const last = coordinates[coordinates.length - 1]
  // Only add first point if not already closed
  return (first[0] === last[0] && first[1] === last[1])
    ? coordinates
    : [...coordinates, first]
}
```

**Warning signs:** 422 validation error for geometry, backend returns "ring must be closed".

### Pitfall 3: Form Errors Not Displayed

**What goes wrong:** Backend 422 errors return but form doesn't show them to user.

**Why it happens:** Laravel returns `{ errors: { field: ['message'] } }` array format, but react-hook-form expects string messages.

**How to avoid:** Use the existing axios interceptor (already configured in src/api/axios.ts) which converts Laravel error format. If manually handling errors:

```typescript
// Convert Laravel errors to react-hook-form format
const formattedErrors = Object.entries(data.errors).reduce(
  (acc, [field, messages]) => ({
    ...acc,
    [field]: Array.isArray(messages) ? messages[0] : messages,
  }),
  {}
)
```

**Warning signs:** Form shows "Failed to save" but no field-level errors, user can't correct mistakes.

### Pitfall 4: Cache Not Invalidated After Mutation

**What goes wrong:** After creating/updating/deleting parcel, map still shows old data.

**Why it happens:** React Query caches query results and doesn't automatically refetch after mutations.

**How to avoid:** Always call queryClient.invalidateQueries in mutation onSuccess callback.

```typescript
useMutation({
  mutationFn: createParcel,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['parcels'] })
  },
})
```

**Warning signs:** New parcel doesn't appear, deleted parcel still visible, updated data not reflected.

### Pitfall 5: Drawing Mode State Leaks

**What goes wrong:** After drawing completes, map still handles clicks as drawing points.

**Why it happens:** Drawing mode state not reset after completion or cancellation.

**How to avoid:** Use useEffect cleanup and explicit state reset in completion handlers.

```typescript
const [isDrawing, setIsDrawing] = useState(false)

const handleDrawingComplete = (coordinates: number[][]) => {
  setGeometry(coordinates)
  setIsDrawing(false) // IMPORTANT: Reset drawing mode
  setPoints([]) // Clear temporary points
}

const handleCancelDrawing = () => {
  setIsDrawing(false)
  setPoints([])
}

useEffect(() => {
  // Reset drawing mode when sidebar closes
  if (!isOpen) {
    setIsDrawing(false)
    setPoints([])
  }
}, [isOpen])
```

**Warning signs:** Map continues adding points after form submission, Escape key doesn't exit drawing mode.

## Code Examples

Verified patterns from official sources and existing codebase:

### react-hook-form with Zod Schema

```typescript
// Source: @hookform/resolvers documentation + existing parcelSchema
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { parcelSchema } from '@/lib/zod'
import type { ParcelFormData } from '@/lib/zod'

const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ParcelFormData>({
  resolver: zodResolver(parcelSchema),
  defaultValues: {
    owner_name: '',
    status: 'free',
    price_per_sqm: undefined,
    geometry: { type: 'Polygon', coordinates: [[]] },
  },
})

// Number field with valueAsNumber
<input
  type="number"
  {...register('price_per_sqm', { valueAsNumber: true })}
/>

// Error display
{errors.owner_name && (
  <span className="text-xs text-red-600">{errors.owner_name.message}</span>
)}
```

### React Query Mutation Hook

```typescript
// Source: @tanstack/react-query documentation + existing api client
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api/axios'
import { toast } from 'react-hot-toast'

export function useCreateParcel() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: ParcelFormData) => {
      const { data: response } = await api.post('/parcels', data)
      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parcels'] })
      toast.success('Parcel created successfully')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to create parcel'
      toast.error(message)
    },
  })
}

// Usage in component
const createParcel = useCreateParcel()

const handleSubmit = async (data: ParcelFormData) => {
  await createParcel.mutateAsync(data)
  onClose()
}
```

### Leaflet Click Handler for Drawing

```typescript
// Source: react-leaflet documentation (useMapEvents)
import { useMapEvents } from 'react-leaflet'
import { useState } from 'react'

export function usePolygonDrawing(onComplete: (coordinates: number[][]) => void) {
  const [points, setPoints] = useState<[number, number][]>([])

  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng
      // GeoJSON uses [lng, lat] order
      const point: [number, number] = [lng, lat]

      // Check if clicking near first point (complete polygon)
      if (points.length >= 2 && isNearPoint(point, points[0])) {
        const closedPoints = [...points, points[0]]
        setPoints([])
        onComplete(closedPoints)
        return
      }

      setPoints([...points, point])
    },
    dblclick: () => {
      // Double-click to complete
      if (points.length >= 3) {
        const closedPoints = [...points, points[0]]
        setPoints([])
        onComplete(closedPoints)
      }
    },
  })

  return { points, clear: () => setPoints([]) }
}

function isNearPoint(a: [number, number], b: [number, number], threshold = 0.001): boolean {
  return Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2)) < threshold
}
```

### react-hot-toast Usage

```typescript
// Source: react-hot-toast documentation
import toast from 'react-hot-toast'

// Success toast
toast.success('Parcel created successfully', {
  duration: 3000,
  icon: <CheckCircle className="h-4 w-4 text-green-500" />,
})

// Error toast
toast.error('Failed to save parcel. Please try again.', {
  duration: 5000,
  icon: <XCircle className="h-4 w-4 text-red-500" />,
})

// Loading toast (auto-dismiss not set)
const toastId = toast.loading('Saving parcel...', {
  icon: <Loader2 className="h-4 w-4 animate-spin" />,
})

// Update to success/error
toast.success('Parcel saved!', { id: toastId })
// or
toast.error('Failed to save', { id: toastId })
```

### Polygon Preview During Drawing

```typescript
// Source: react-leaflet documentation (Polygon component)
import { Polygon, Polyline, CircleMarker } from 'react-leaflet'

export function DrawingPreview({ points }: { points: [number, number][] }) {
  if (points.length === 0) return null

  // Convert GeoJSON [lng, lat] to Leaflet [lat, lng]
  const leafletPoints = points.map(([lng, lat]) => [lat, lng] as [number, number])

  return (
    <>
      {/* Line connecting all points */}
      {leafletPoints.length >= 2 && (
        <Polyline
          positions={leafletPoints}
          color="#3b82f6"
          weight={2}
        />
      )}

      {/* Vertex markers */}
      {leafletPoints.map((point, i) => (
        <CircleMarker
          key={i}
          center={point}
          radius={6}
          fillColor="#3b82f6"
          color="#ffffff"
          weight={2}
          fillOpacity={1}
        />
      ))}

      {/* Fill when polygon can be closed */}
      {leafletPoints.length >= 3 && (
        <Polygon
          positions={[...leafletPoints, leafletPoints[0]]}
          fillColor="#3b82f6"
          color="#3b82f6"
          fillOpacity={0.3}
          weight={2}
        />
      )}
    </>
  )
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Formik + Yup | react-hook-form + Zod | 2023-2024 | Better TypeScript support, fewer re-renders |
| useEffect + fetch | React Query useMutation | 2022-2023 | Automatic caching, optimistic updates, loading states |
| Custom toast components | react-hot-toast / sonner | 2023-2024 | Non-intrusive, headless, accessible by default |
| @react-leaflet/draw | Custom click handlers | 2024+ | Smaller bundle, more control, no dependencies |

**Deprecated/outdated:**
- **Formik**: Still maintained but react-hook-form has better performance
- **react-leaflet-draw**: Not actively maintained, adds 100KB+ for features we don't need
- **react-toastify**: Larger bundle, more invasive API than react-hot-toast

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Backend API returns Laravel 422 error format `{ errors: { field: ['message'] } }` | Common Pitfalls #3 | If format differs, error mapping will fail and users won't see field errors |
| A2 | Backend API accepts GeoJSON Polygon with `[lng, lat]` coordinate order per RFC 7946 | Common Pitfalls #1 | If backend expects `[lat, lng]`, polygons will render incorrectly |
| A3 | Backend requires polygon to be closed (first == last coordinate) | Common Pitfalls #2 | If backend auto-closes, we may add redundant points |
| A4 | Drawing mode can use simple click handlers without @react-leaflet/draw | Don't Hand-Roll | If requirements expand to editing vertices, may need drawing library |

## Open Questions

1. **Geometry Edit Flow: How should users edit existing parcel geometry?**
   - What we know: Need to enable drawing mode when editing
   - What's unclear: Should we show original polygon as reference? How to handle partial edits?
   - Recommendation: Show original polygon in gray, allow adding new vertices, replace entire geometry on save

2. **Form Submission Order: Should geometry be required before form, or vice versa?**
   - What we know: Both are required for creation
   - What's unclear: User preference and UX best practice
   - Recommendation: Support both flows - allow drawing first or form first, validate both before submission

3. **Delete Permission: Should delete require special permission or confirmation?**
   - What we know: Need confirmation dialog (CRUD-05)
   - What's unclear: Any additional safeguards (e.g., admin-only)?
   - Recommendation: Single confirmation dialog is sufficient for portfolio/demo project

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Vite, npm | ✓ | (from env) | — |
| npm | Package manager | ✓ | — | — |
| Vite | Dev server | ✓ | 6.3.5 | — |
| react-hook-form | Form handling | ✓ | 7.72.1 | — |
| @hookform/resolvers | Zod integration | ✓ | 5.2.2 | — |
| @tanstack/react-query | Mutations | ✓ | 5.99.0 | — |
| react-hot-toast | Toasts | ✓ | 2.6.0 | — |
| react-leaflet | Map drawing | ✓ | 5.0.0 | — |
| Backend API | CRUD endpoints | ✗ | — | Mock data for local development |

**Missing dependencies with no fallback:**
- Backend API server not running - need to start Laravel server for full testing

**Missing dependencies with fallback:**
- None identified for this phase

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 3.2.4 |
| Config file | vitest.config.ts |
| Environment | jsdom |
| Quick run command | `npm test` |
| Full suite command | `npm test:all` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| CRUD-01 | Create parcel by drawing polygon | integration | `npm test -- src/hooks/__tests__/useCreateParcel.test.ts` | ❌ Wave 0 |
| CRUD-02 | Create parcel by filling form | unit | `npm test -- src/components/map/__tests__/ParcelForm.test.ts` | ❌ Wave 0 |
| CRUD-03 | View parcel details in sidebar | unit | `npm test -- src/components/map/__tests__/ParcelSidebar.test.ts` | ❌ Wave 0 |
| CRUD-04 | Edit parcel fields and geometry | integration | `npm test -- src/hooks/__tests__/useUpdateParcel.test.ts` | ❌ Wave 0 |
| CRUD-05 | Delete parcel with confirmation | integration | `npm test -- src/components/map/__tests__/DeleteConfirmModal.test.ts` | ❌ Wave 0 |
| CRUD-06 | Form validation mirrors backend rules | unit | `npm test -- src/lib/__tests__/zod.test.ts` | ❌ Wave 0 |
| CRUD-07 | Backend 422 errors mapped to form fields | unit | `npm test -- src/api/__tests__/axios.test.ts` | ❌ Wave 0 |
| CRUD-08 | Success/error toasts on mutations | integration | `npm test -- src/hooks/__tests__/mutations.test.ts` | ❌ Wave 0 |
| CRUD-09 | Cache invalidation after mutations | unit | `npm test -- src/hooks/__tests__/mutations.test.ts` | ❌ Wave 0 |

### Sampling Rate

- **Per task commit:** `npm test -- --run src/components/map/__tests__/ParcelForm.test.ts`
- **Per wave merge:** `npm test:all`
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps

- [ ] `src/components/map/__tests__/ParcelForm.test.ts` — CRUD-02 form validation and submission
- [ ] `src/components/map/__tests__/DeleteConfirmModal.test.ts` — CRUD-05 delete confirmation
- [ ] `src/components/map/__tests__/ParcelSidebar.test.ts` — CRUD-03 view details, CRUD-04 edit mode
- [ ] `src/hooks/__tests__/useCreateParcel.test.ts` — CRUD-01, CRUD-08, CRUD-09
- [ ] `src/hooks/__tests__/useUpdateParcel.test.ts` — CRUD-04, CRUD-08, CRUD-09
- [ ] `src/hooks/__tests__/useDeleteParcel.test.ts` — CRUD-05, CRUD-08, CRUD-09
- [ ] `src/lib/__tests__/zod.test.ts` — CRUD-06 schema validation
- [ ] `src/api/__tests__/axios.test.ts` — CRUD-07 422 error mapping
- [ ] `src/components/map/__tests__/DrawingToolbar.test.ts` — CRUD-01 drawing controls
- [ ] `src/components/map/__tests__/DrawingHandler.test.ts` — CRUD-01 polygon drawing logic

**Framework install:** `npm install -D @testing-library/react @testing-library/jest-dom @testing-library/user-event` — already installed in package.json

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V1 Architecture | yes | React Query for data management, no direct DOM manipulation |
| V2 Authentication | no | No authentication in v1 (portfolio/demo) |
| V3 Session Management | no | No authentication in v1 (portfolio/demo) |
| V4 Access Control | no | No authorization in v1 (portfolio/demo) |
| V5 Input Validation | yes | Zod schemas (parcelSchema) + Laravel backend validation |
| V6 Cryptography | no | No encryption required for parcel data |
| V7 Error Handling | yes | Axios interceptor for 422/500/404 errors, toast notifications |
| V8 Data Protection | yes | No sensitive data in localStorage, client-side validation only |

### Known Threat Patterns for React + CRUD

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| XSS in parcel owner name | Tampering | React auto-escapes JSX; Zod sanitizes input |
| CSRF on mutations | Spoofing | Laravel backend should implement CSRF (not frontend concern) |
| Geometry tampering | Tampering | Zod parcelGeometrySchema validates GeoJSON RFC 7946 compliance |
| Large payload DoS | Denial of Service | Zod max length constraints (owner_name: 255 chars) |
| Missing validation bypass | Tampering | Client + server validation (Zod + Laravel rules) |

**Note:** This is a portfolio/demo project without authentication. Security controls focus on input validation and proper error handling. Production deployment would require authentication, CSRF protection, and access control.

## Sources

### Primary (HIGH confidence)

- [npm registry - react-hook-form] - Version 7.72.1 confirmed
- [npm registry - @hookform/resolvers] - Version 5.2.2 confirmed
- [npm registry - @tanstack/react-query] - Version 5.99.0 confirmed
- [npm registry - zod] - Version 4.3.6 confirmed
- [npm registry - react-hot-toast] - Version 2.6.0 confirmed
- [npm registry - react-leaflet] - Version 5.0.0 confirmed
- [src/lib/zod.ts] - parcelSchema already mirrors Laravel StoreParcelRequest
- [src/api/axios.ts] - Laravel 422 error interceptor already configured
- [src/hooks/useParcels.ts] - React Query pattern for queries
- [src/components/map/ParcelSidebar.tsx] - Existing sidebar structure
- [GeoAcquire Backend README.md] - API endpoint documentation

### Secondary (MEDIUM confidence)

- [react-hook-form documentation] - Standard form handling patterns
- [@tanstack/react-query documentation] - Mutation and cache invalidation patterns
- [react-leaflet documentation] - useMapEvents and polygon rendering
- [react-hot-toast documentation] - Toast notification patterns

### Tertiary (LOW confidence)

- None - all claims verified from primary sources or existing codebase

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH - All versions verified from npm registry, packages already installed
- Architecture: HIGH - Based on existing codebase patterns and official documentation
- Pitfalls: HIGH - Identified from common Leaflet/GeoJSON issues and Laravel validation patterns

**Research date:** 2026-04-12
**Valid until:** 2026-05-12 (30 days - stable ecosystem)
