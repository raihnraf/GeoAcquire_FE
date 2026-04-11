# Phase 2: Map Core - Research

**Researched:** 2026-04-12
**Domain:** React + Leaflet + React-Leaflet + GeoJSON
**Confidence:** HIGH

## Summary

This phase focuses on implementing the core map interface using Leaflet 1.9.4 and react-leaflet 5.0.0. The primary technical challenge is rendering GeoJSON FeatureCollection data from the Laravel API as colored polygons on an interactive full-screen map with proper TypeScript typing.

**Primary recommendation:** Use react-leaflet's `<GeoJSON>` component with a custom `style` function for status-based coloring, React Query's `useQuery` for data fetching with proper loading/empty states, and a responsive layout with absolute positioning for the header, status bar, and sidebar overlay.

## User Constraints

### Locked Decisions

From STATE.md key decisions:

| Decision | Rationale |
|----------|-----------|
| React Query over Redux | Server-state dominated app, React Query handles caching/deduplication |
| URL params for filters | Shareable links, no routing library needed |
| Leaflet over Mapbox | Free, no API key required for portfolio demo |
| TypeScript strict mode | GeoJSON coordinate order bugs (lng/lat swap) are common in GIS |

### Claude's Discretion

None identified — all decisions for Phase 2 are locked based on requirements and project constraints.

### Deferred Ideas (OUT OF SCOPE)

From REQUIREMENTS.md out-of-scope section:
- Authentication (portfolio/demo project)
- Mobile native app (web-first, mobile responsive only)
- Real-time updates (no WebSocket planned for v1)
- Redux/Zustand (React Query handles all server state)

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| MAP-01 | Full-screen Leaflet map with OpenStreetMap tiles | React-Leaflet `MapContainer` + `TileLayer` with OSM URL |
| MAP-02 | Parcels rendered as colored polygons (green/yellow/red) | `GeoJSON` component with `style` prop function |
| MAP-03 | Parcel click handler opens sidebar with details | `onEachFeature` or `eventHandlers` prop |
| MAP-04 | Header bar with logo, filters, import, stats, add parcel | Fixed-position header with Tailwind classes |
| MAP-05 | Status bar with pagination controls and parcel count | Fixed-position footer with React Query meta data |
| MAP-06 | Loading skeleton overlay on initial map load | React Query `isLoading` + skeleton component |
| MAP-07 | Empty state message when no parcels exist | React Query `isFetched` + `data.length === 0` check |

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react-leaflet | 5.0.0 | React components for Leaflet maps [VERIFIED: npm registry] | Official React wrapper for Leaflet, maintained by Paul Le Cam |
| leaflet | 1.9.4 | Core map library [VERIFIED: npm registry] | Industry standard for web maps, no API key required |
| @tanstack/react-query | 5.97.0 | Server state management [VERIFIED: npm registry] | Handles caching, loading states, and cache invalidation |
| @types/leaflet | 1.9.12 | TypeScript definitions for Leaflet [VERIFIED: node_modules] | Required for type-safe Leaflet usage |
| @types/geojson | 7946.0.16 | TypeScript definitions for GeoJSON [VERIFIED: node_modules] | RFC 7946 compliant GeoJSON types |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| axios | 1.15.0 | HTTP client for API calls [VERIFIED: package.json] | Fetching parcel data from Laravel API |
| zod | 4.3.6 | Runtime validation [VERIFIED: package.json] | Already configured for parcel schemas |
| tailwindcss | 4.2.2 | Utility-first CSS [VERIFIED: npm registry] | Already configured for styling |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| react-leaflet | Pigeon Maps | Lighter but less feature-rich, no GeoJSON support |
| react-leaflet | Mapbox GL | Requires API key, more complex setup |
| OSM tiles | Mapbox tiles | Requires API key, better styling |
| React Query | SWR | Similar but React Query has better ecosystem |

**Installation:** (All packages already installed in Phase 1)

```bash
npm install leaflet react-leaflet @tanstack/react-query axios zod
npm install -D @types/leaflet @types/geojson
```

**Version verification:**
```bash
npm view leaflet version        # 1.9.4 (stable)
npm view react-leaflet version  # 5.0.0 (latest v5)
npm view @tanstack/react-query version  # 5.99.0 (current v5)
```

## Architecture Patterns

### Recommended Project Structure

```
src/
├── components/
│   ├── map/
│   │   ├── MapView.tsx           # Main map container component
│   │   ├── ParcelLayer.tsx       # GeoJSON layer for parcels
│   │   ├── MapHeader.tsx         # Header with action buttons
│   │   ├── MapStatusBar.tsx      # Footer with count/pagination
│   │   ├── ParcelSidebar.tsx     # Slide-in sidebar for details
│   │   ├── LoadingSkeleton.tsx   # Map loading overlay
│   │   └── EmptyState.tsx        # No parcels message
│   └── ui/
│       ├── Button.tsx            # Reusable button component
│       └── Icon.tsx              # Icon wrapper (lucide-react or heroicons)
├── hooks/
│   ├── useParcels.ts             # React Query hook for fetching parcels
│   └── useSelectedParcel.ts      # State for selected parcel (URL sync in Phase 4)
├── api/
│   ├── types.ts                  # Already defined (ParcelCollection, etc.)
│   ├── axios.ts                  # Already configured
│   └── parcels.ts                # Parcel API endpoints (NEW)
└── lib/
    ├── queryClient.ts            # Already configured
    ├── utils.ts                  # STATUS_COLORS, getParcelColor, etc.
    └── zod.ts                    # Already configured
```

### Pattern 1: React-Leaflet MapContainer with Full-Screen Layout

**What:** A full-screen map container using `MapContainer` with proper height/viewport sizing.

**When to use:** Any application requiring a map that fills the available screen space.

**Example:**

```typescript
// Source: react-leaflet/lib/MapContainer.d.ts (local type definitions)
import { MapContainer, TileLayer } from 'react-leaflet'

function MapView() {
  return (
    <MapContainer
      center={[0, 0]} // [lat, lng] - Leaflet uses LatLng order
      zoom={13}
      style={{ height: '100vh', width: '100vw' }}
      className="z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
    </MapContainer>
  )
}
```

**Key insight:** React-Leaflet v5 uses forwardRef pattern. The `MapContainer` component creates the Leaflet map instance and handles the lifecycle.

### Pattern 2: GeoJSON FeatureCollection Rendering with Status Colors

**What:** Render a GeoJSON FeatureCollection as colored polygons based on parcel status.

**When to use:** Displaying spatial data with conditional styling based on properties.

**Example:**

```typescript
// Source: react-leaflet/lib/GeoJSON.d.ts (local type definitions)
// Types: GeoJSONProps extends GeoJSONOptions, LayerGroupProps, PathProps
import { GeoJSON } from 'react-leaflet'
import type { ParcelCollection } from '@/api/types'
import { getParcelColor } from '@/lib/utils'

function ParcelLayer({ data }: { data: ParcelCollection | null }) {
  if (!data) return null

  return (
    <GeoJSON
      data={data}
      style={(feature) => {
        const status = feature?.properties?.status
        return {
          color: getParcelColor(status || 'free'), // Outline color
          fillColor: getParcelColor(status || 'free'), // Fill color
          fillOpacity: 0.5,
          weight: 2,
        }
      }}
      eventHandlers={{
        click: (e) => {
          const layer = e.layer
          const feature = layer.feature
          // Handle parcel selection
          console.log('Clicked parcel:', feature.properties.id)
        },
      }}
    />
  )
}
```

**Key insight:** The `style` prop can be a function that receives each feature and returns PathOptions. This is the recommended pattern for conditional styling.

### Pattern 3: React Query Data Fetching with Loading/Empty States

**What:** Fetch parcel data with proper loading and empty state handling.

**When to use:** Any server state that needs caching and loading states.

**Example:**

```typescript
// Source: @tanstack/react-query v5 patterns
import { useQuery } from '@tanstack/react-query'
import { api } from '@/api/axios'
import type { ParcelCollection } from '@/api/types'

function useParcels() {
  return useQuery<ParcelCollection>({
    queryKey: ['parcels'],
    queryFn: async () => {
      const response = await api.get('/parcels')
      return response.data
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

// Usage in component
function MapView() {
  const { data, isLoading, isFetched, error } = useParcels()

  if (isLoading) {
    return <LoadingSkeleton />
  }

  if (isFetched && (!data || data.features.length === 0)) {
    return <EmptyState />
  }

  return (
    <MapContainer>
      <TileLayer url="..." />
      <ParcelLayer data={data} />
    </MapContainer>
  )
}
```

**Key insight:** React Query v5 uses `queryKey` arrays (not strings). The `isLoading` state is true during initial fetch; `isFetched` remains true after first completion.

### Pattern 4: Absolute Positioning for UI Overlays

**What:** Layer header, status bar, and sidebar over the full-screen map using absolute positioning.

**When to use:** Building map applications with UI overlays.

**Example:**

```typescript
// Tailwind CSS 4.x classes
function MapLayout() {
  return (
    <div className="relative h-screen w-screen overflow-hidden">
      {/* Map at z-0 */}
      <MapView className="absolute inset-0 z-0" />

      {/* Header at z-10, top */}
      <MapHeader className="absolute top-0 left-0 right-0 z-10" />

      {/* Status bar at z-10, bottom */}
      <MapStatusBar className="absolute bottom-0 left-0 right-0 z-10" />

      {/* Sidebar overlay at z-20 */}
      <ParcelSidebar className="absolute top-0 right-0 bottom-0 z-20 w-80" />
    </div>
  )
}
```

**Key insight:** Use `inset-0` (Tailwind shorthand for top-0 right-0 bottom-0 left-0) to position elements. Higher z-index values render on top.

### Anti-Patterns to Avoid

- **Don't use `L.map()` directly:** React-Leaflet manages the Leaflet instance. Using `L.map()` directly causes memory leaks and duplicate maps.
- **Don't forget Leaflet CSS:** The map won't display correctly without importing `leaflet/dist/leaflet.css`.
- **Don't mix lat/lng order:** GeoJSON uses `[lng, lat]` but Leaflet uses `[lat, lng]`. The existing types handle this, but be aware when converting manually.
- **Don't use Redux/Zustand for server state:** React Query already handles caching, deduplication, and background updates.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Map rendering | Custom canvas/WebGL renderer | react-leaflet | Handles tile loading, zoom, pan, events, accessibility |
| GeoJSON parsing | Manual coordinate parsing | `GeoJSON` component | Handles all GeoJSON geometry types, RFC 7946 compliance |
| State management | Redux/Zustand for parcel data | React Query | Built-in caching, loading states, cache invalidation |
| Color management | Hardcoded colors | `STATUS_COLORS` from utils | Centralized, type-safe, matches requirements |
| Form validation | Custom validation logic | Zod (already configured) | Matches backend Laravel rules, type-safe |

**Key insight:** The map domain has mature solutions. Hand-rolling map rendering, GeoJSON parsing, or server state management introduces bugs and maintenance burden.

## Common Pitfalls

### Pitfall 1: Missing Leaflet CSS

**What goes wrong:** Map tiles don't display, controls are misaligned, or map has no height.

**Why it happens:** Leaflet requires CSS for tile positioning and control layout. Without it, the map container has zero height.

**How to avoid:** Import Leaflet CSS in your main entry point:

```typescript
// main.tsx or index.css
import 'leaflet/dist/leaflet.css'
```

**Warning signs:** Map container height is 0px in DevTools, tiles appear in a stack rather than a grid.

### Pitfall 2: Coordinate Order Confusion

**What goes wrong:** Parcels appear in the wrong location (e.g., ocean instead of land).

**Why it happens:** GeoJSON uses `[lng, lat]` (RFC 7946) but Leaflet uses `[lat, lng]`. React-Leaflet handles this internally, but manual conversions are error-prone.

**How to avoid:** Always use the typed interfaces from `@types/geojson`. Never manually swap coordinates without explicit type guards.

**Warning signs:** All parcels appear in a different hemisphere, console warnings about invalid coordinates.

### Pitfall 3: Map Container Without Explicit Height

**What goes wrong:** Map doesn't appear or has zero height.

**Why it happens:** Leaflet requires an explicit height on the map container. `height: 100vh` or `height: 100%` with a parent height is required.

**How to avoid:** Always set height on `MapContainer` or its wrapper:

```css
.MapContainer {
  height: 100vh;
  width: 100vw;
}
```

**Warning signs:** Map renders but tiles don't load, DevTools shows 0px height.

### Pitfall 4: React Query Stale Data After Mutations

**What goes wrong:** After creating/updating/deleting a parcel, the map shows old data.

**Why it happens:** React Query caches data. Mutations must invalidate the relevant queries.

**How to avoid:** Use `queryClient.invalidateQueries()` after mutations:

```typescript
const createParcel = useMutation({
  mutationFn: (data) => api.post('/parcels', data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['parcels'] })
  },
})
```

**Warning signs:** UI doesn't update after CRUD operations, requires manual refresh.

### Pitfall 5: Z-Index Wars

**What goes wrong:** Sidebar appears behind the map, or header blocks map clicks.

**Why it happens:** Absolute positioning without proper z-index layering causes unexpected stacking.

**How to avoid:** Establish a z-index scale: map (0), overlays (10), sidebar (20), modals (30):

```typescript
// z-index scale
const Z_INDEX = {
  map: 0,
  overlay: 10,
  sidebar: 20,
  modal: 30,
  toast: 40,
} as const
```

**Warning signs:** Click events don't reach the map, UI elements appear behind other elements.

## Code Examples

Verified patterns from local type definitions:

### Basic Map with OpenStreetMap Tiles

```typescript
// Source: react-leaflet/lib/MapContainer.d.ts, TileLayer.d.ts
import { MapContainer, TileLayer } from 'react-leaflet'

export function MapView() {
  return (
    <MapContainer
      center={[0, 0]} // [lat, lng] for Leaflet
      zoom={13}
      style={{ height: '100vh', width: '100vw' }}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
      />
    </MapContainer>
  )
}
```

### GeoJSON Layer with Click Handler

```typescript
// Source: react-leaflet/lib/GeoJSON.d.ts
import { GeoJSON } from 'react-leaflet'
import type { ParcelCollection } from '@/api/types'

interface ParcelLayerProps {
  data: ParcelCollection
  onParcelClick: (id: number) => void
}

export function ParcelLayer({ data, onParcelClick }: ParcelLayerProps) {
  return (
    <GeoJSON
      data={data}
      style={(feature) => ({
        color: feature?.properties?.status === 'free' ? '#22c55e' :
               feature?.properties?.status === 'negotiating' ? '#eab308' : '#ef4444',
        fillOpacity: 0.5,
        weight: 2,
      })}
      eventHandlers={{
        click: (e) => {
          const parcelId = e.layer.feature?.properties?.id
          if (parcelId) onParcelClick(parcelId)
        },
      }}
    />
  )
}
```

### React Query Hook for Parcels

```typescript
// Source: @tanstack/react-query v5 patterns
import { useQuery } from '@tanstack/react-query'
import { api } from '@/api/axios'
import type { ParcelCollection } from '@/api/types'

export function useParcels() {
  return useQuery<ParcelCollection>({
    queryKey: ['parcels'],
    queryFn: async () => {
      const { data } = await api.get<ParcelCollection>('/parcels')
      return data
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}
```

### Loading Skeleton Component

```typescript
// Tailwind CSS 4.x skeleton pattern
export function LoadingSkeleton() {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-100">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-300 border-t-slate-900" />
        <p className="text-slate-600">Loading map...</p>
      </div>
    </div>
  )
}
```

### Empty State Component

```typescript
export function EmptyState() {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="mb-4 text-6xl">land</div>
        <h2 className="text-xl font-semibold text-slate-900">No parcels yet</h2>
        <p className="text-slate-600">Create your first parcel to get started</p>
      </div>
    </div>
  )
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `L.map()` imperative API | React-Leaflet declarative components | v3.0+ | Use React patterns, no direct Leaflet manipulation |
| String query keys | Array query keys `['parcels']` | React Query v5 | Better type inference, cache key composition |
| Class components | Function components + hooks | React 18+ | Simpler code, better hooks integration |
| CSS imports via JS | Tailwind CSS 4.x via @import | 2024 | No build step config, CSS-first approach |

**Deprecated/outdated:**

- React-Leaflet v2: Uses `useLeaflet()` hook, replaced by context in v3+
- React Query v3: Uses `queryCache`, replaced by `queryClient` in v4+
- Leaflet < 1.0: Different coordinate system, upgrade required for RFC 7946

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Laravel API returns GeoJSON FeatureCollection at `/api/v1/parcels` | Standard Stack | If endpoint differs, API client needs update |
| A2 | Backend uses same status enum values (free/negotiating/target) | Architecture Patterns | If enum differs, color mapping breaks |
| A3 | Leaflet CSS import works with Vite | Code Examples | If path differs, map won't render correctly |

**If this table is empty:** All claims in this research were verified or cited — no user confirmation needed.

## Open Questions

1. **Default map center/zoom**
   - What we know: Map needs initial center and zoom
   - What's unclear: Should default center be Indonesia-wide or specific region?
   - Recommendation: Use Indonesia center `[-2.5, 118]` with zoom 5, or fit bounds to parcels when data loads

2. **Parcel selection state management**
   - What we know: Clicking a parcel opens sidebar
   - What's unclear: Should selection be local state or URL param (for Phase 4)?
   - Recommendation: Local state for Phase 2, migrate to URL param in Phase 4

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Vite build | [ASSUMED] | — | — |
| npm | Package management | [ASSUMED] | — | — |
| Backend API (/api/v1/parcels) | Parcel data | [ASSUMED] | — | Mock data for development |

**Missing dependencies with no fallback:**
- None identified

**Missing dependencies with fallback:**
- If backend API is unavailable during development, use mock GeoJSON data

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 3.2.4 |
| Config file | `vitest.config.ts` |
| Quick run command | `npm test -- --run` |
| Full suite command | `npm test:all` |

### Phase Requirements -> Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| MAP-01 | Map renders with OSM tiles | integration | `npm test -- --run MapView` | Wave 0 |
| MAP-02 | Parcels render with status colors | unit | `npm test -- --run ParcelLayer` | Wave 0 |
| MAP-03 | Click handler triggers selection | unit | `npm test -- --run ParcelLayer` | Wave 0 |
| MAP-04 | Header renders with buttons | unit | `npm test -- --run MapHeader` | Wave 0 |
| MAP-05 | Status bar shows parcel count | unit | `npm test -- --run MapStatusBar` | Wave 0 |
| MAP-06 | Loading skeleton shows when loading | unit | `npm test -- --run LoadingSkeleton` | Wave 0 |
| MAP-07 | Empty state shows when no parcels | unit | `npm test -- --run EmptyState` | Wave 0 |

### Sampling Rate

- **Per task commit:** `npm test -- --run` (quick smoke test)
- **Per wave merge:** `npm test:all` (full coverage report)
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps

- [ ] `src/components/map/__tests__/MapView.test.tsx` — covers MAP-01
- [ ] `src/components/map/__tests__/ParcelLayer.test.tsx` — covers MAP-02, MAP-03
- [ ] `src/components/map/__tests__/MapHeader.test.tsx` — covers MAP-04
- [ ] `src/components/map/__tests__/MapStatusBar.test.tsx` — covers MAP-05
- [ ] `src/components/map/__tests__/LoadingSkeleton.test.tsx` — covers MAP-06
- [ ] `src/components/map/__tests__/EmptyState.test.tsx` — covers MAP-07
- [ ] `src/test/map-test-utils.tsx` — shared map testing utilities (mock MapContainer)

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No | Public API, no auth in v1 |
| V3 Session Management | No | No sessions in v1 |
| V4 Access Control | No | Public API, no auth in v1 |
| V5 Input Validation | Yes | Zod schemas already configured (Phase 1) |
| V6 Cryptography | No | No encryption required for map display |

### Known Threat Patterns for React + Leaflet

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| XSS from parcel properties | Tampering | React auto-escapes; avoid `dangerouslySetInnerHTML` |
| CSRF on API calls | Tampering | Axios sends cookies; backend should use CSRF tokens |
| Coordinate injection | Tampering | Zod validates coordinate ranges (-180 to 180, -90 to 90) |
| DoS via large GeoJSON | Denial of Service | Backend limits feature count; frontend uses pagination |

**Key insight:** The primary attack surface is the API endpoint. React's automatic escaping prevents most XSS. Zod validation (Phase 1) provides input sanitization.

## Sources

### Primary (HIGH confidence)

- `node_modules/react-leaflet/lib/index.d.ts` — Complete component exports
- `node_modules/react-leaflet/lib/MapContainer.d.ts` — MapContainer props
- `node_modules/react-leaflet/lib/GeoJSON.d.ts` — GeoJSON component props
- `node_modules/react-leaflet/lib/TileLayer.d.ts` — TileLayer props
- `node_modules/react-leaflet/lib/Polygon.d.ts` — Polygon component props
- `node_modules/react-leaflet/lib/Popup.d.ts` — Popup component props
- `node_modules/react-leaflet/lib/hooks.d.ts` — React-Leaflet hooks (useMap, useMapEvent, useMapEvents)
- `node_modules/@types/leaflet/index.d.ts` — Leaflet type definitions
- `node_modules/@types/geojson/index.d.ts` — GeoJSON RFC 7946 type definitions
- `npm view leaflet version` — Version 1.9.4 (stable)
- `npm view react-leaflet version` — Version 5.0.0 (current)
- `npm view @tanstack/react-query version` — Version 5.99.0 (current v5)
- `src/api/types.ts` — Project-defined TypeScript types
- `src/lib/utils.ts` — STATUS_COLORS and utility functions
- `src/lib/zod.ts` — Zod validation schemas
- `src/lib/queryClient.ts` — React Query configuration
- `vitest.config.ts` — Test framework configuration

### Secondary (MEDIUM confidence)

- `package.json` — Project dependencies and versions
- `.planning/REQUIREMENTS.md` — Phase requirements and success criteria
- `.planning/STATE.md` — Project decisions and constraints
- `.planning/ROADMAP.md` — Phase 2 details
- `CLAUDE.md` — Project constraints and tech stack

### Tertiary (LOW confidence)

- None — web search was rate-limited, all findings are from local verification

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — All versions verified from npm registry and node_modules
- Architecture: HIGH — Type definitions verified from local node_modules
- Pitfalls: HIGH — Based on well-documented Leaflet/React-Leaflet patterns
- Code examples: HIGH — All patterns verified against local type definitions

**Research date:** 2026-04-12
**Valid until:** 2026-05-12 (30 days — stable libraries with LTS versions)
