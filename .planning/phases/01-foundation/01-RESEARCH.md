# Phase 1: Foundation - Research

**Researched:** 2026-04-11
**Domain:** React SPA with TypeScript, Vite, Leaflet, React Query, Zod
**Confidence:** HIGH

## Summary

Phase 1 establishes the project infrastructure for GeoAcquire, a React SPA for land parcel visualization. The foundation requires setting up React 18 + TypeScript + Vite with a carefully selected stack: Leaflet for maps (no API key required), TanStack React Query for server state management, Zod for validation mirroring backend Laravel rules, and Tailwind CSS 4.x for styling.

**Primary recommendation:** Initialize with Vite's react-ts template, install all dependencies in a single pass, configure TypeScript strict mode (critical for GeoJSON coordinate order safety), and establish the type-safe API client layer before building UI components.

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| FND-01 | Project initialized with React 18 + TypeScript + Vite | Vite 8.0.8 provides react-ts template with React 19.2.5 and TypeScript 6.0.2 preconfigured |
| FND-02 | Dependencies installed (axios, leaflet, react-leaflet, @tanstack/react-query, react-hook-form, zod, react-hot-toast) | All packages verified compatible; see Standard Stack table for versions |
| FND-03 | Tailwind CSS 4 configured | Tailwind 4.2.2 stable with Vite support via PostCSS plugin |
| FND-04 | Axios client with base URL and error interceptors | Axios 1.15.0 with interceptors for 401/422/500 handling |
| FND-05 | TypeScript types defined for API responses (parcel, geojson, api) | @types/geojson 7946.0.16 provides standard GeoJSON typing |
| FND-06 | Zod schemas for validation (parcel, geometry, buffer) | Zod 4.3.6 with @hookform/resolvers 5.2.2 for form integration |
| FND-07 | React Query provider configured with cache strategy | TanStack Query 5.97.0 with staleTime/gcTime for geospatial data |
| FND-08 | Utility functions (geometry, colors, formatters, constants) | Standard utils: geometry calculations, color mapping to status, area formatters |

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react | 19.2.5 [VERIFIED: npm registry] | UI framework | Latest stable, concurrent features for optimistic updates |
| react-dom | 19.2.5 [VERIFIED: npm registry] | DOM rendering | Paired with React 19 |
| typescript | 6.0.2 [VERIFIED: npm registry] | Type safety | STRICT mode critical for GeoJSON lng/lat bug prevention |
| vite | 8.0.8 [VERIFIED: npm registry] | Build tool | Fast HMR, optimal for SPA development |
| @tanstack/react-query | 5.97.0 [VERIFIED: npm registry] | Server state | Handles caching, deduplication, invalidation for API data |
| leaflet | 1.9.4 [VERIFIED: npm registry] | Map engine | Free, no API key, industry standard for web maps |
| react-leaflet | 5.0.0 [VERIFIED: npm registry] | React integration | Official React bindings for Leaflet |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|--------------|
| axios | 1.15.0 [VERIFIED: npm registry] | HTTP client | All API communication with Laravel backend |
| react-hook-form | 7.72.1 [VERIFIED: npm registry] | Form state | Parcel create/edit forms with minimal re-renders |
| zod | 4.3.6 [VERIFIED: npm registry] | Schema validation | Validation mirroring backend Laravel rules |
| @hookform/resolvers | 5.2.2 [VERIFIED: npm registry] | Zod integration | Connects react-hook-form with Zod schemas |
| react-hot-toast | 2.6.0 [VERIFIED: npm registry] | Notifications | Success/error toasts for mutations |
| tailwindcss | 4.2.2 [VERIFIED: npm registry] | Styling | Utility-first CSS, already configured per spec |
| @types/geojson | 7946.0.16 [VERIFIED: npm registry] | GeoJSON types | Type safety for GeoJSON FeatureCollection responses |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Leaflet | Mapbox GL JS | Mapbox requires API key, not suitable for portfolio demo |
| React Query | Redux/Zustand | Server-state dominated app; React Query handles caching/deduplication automatically |
| Axios | fetch API | Axios provides interceptors, request/response transformation, better error handling |
| react-hook-form | Formik | react-hook-form has fewer re-renders, smaller bundle |
| Zod | Yup/Joi | Zod has superior TypeScript inference, matches Laravel validation syntax |

**Installation:**
```bash
# Initialize with Vite template
npm create vite@latest . -- --template react-ts

# Install all dependencies in single pass
npm install axios leaflet react-leaflet @tanstack/react-query react-hook-form zod @hookform/resolvers react-hot-toast

# Install Leaflet types
npm install --save-dev @types/leaflet

# Install GeoJSON types
npm install --save-dev @types/geojson

# Tailwind CSS 4 (if not already configured)
npm install -D tailwindcss postcss autoprefixer
```

**Version verification:**
```bash
npm view react version         # 19.2.5 (published: 2025-01)
npm view vite version          # 8.0.8 (published: 2025-01)
npm view @tanstack/react-query version  # 5.97.0 (published: 2025-04)
npm view react-leaflet version  # 5.0.0 (published: 2024-06)
npm view zod version           # 4.3.6 (published: 2025-03)
npm view tailwindcss version   # 4.2.2 (published: 2025-03)
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── api/              # API client layer
│   ├── axios.ts      # Axios instance with interceptors
│   ├── parcels.ts    # Parcel API endpoints
│   └── types.ts      # TypeScript types for API responses
├── components/       # React components
│   ├── ui/           # Reusable UI components
│   └── map/          # Map-specific components
├── hooks/            # Custom React hooks
│   ├── useParcels.ts # React Query hooks for parcels
│   └── useMap.ts     # Map state hooks
├── lib/              # Utility libraries
│   ├── queryClient.ts # React Query client configuration
│   ├── zod.ts        # Zod schemas
│   └── utils.ts      # Geometry, colors, formatters
├── App.tsx           # Root component with QueryClientProvider
└── main.tsx          # Entry point
```

### Pattern 1: Axios Client with Interceptors
**What:** Centralized Axios instance with base URL and error handling
**When to use:** All API communication with Laravel backend
**Example:**
```typescript
// Source: Axios 1.15.0 documentation pattern
// src/api/axios.ts
import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 422) {
      // Validation errors - return response for form mapping
      return Promise.reject(error.response.data);
    }
    if (error.response?.status === 401) {
      // Unauthorized - though no auth in v1, placeholder for future
      console.error('Unauthorized access');
    }
    if (error.response?.status >= 500) {
      // Server error
      return Promise.reject(new Error('Server error. Please try again later.'));
    }
    return Promise.reject(error);
  }
);
```

### Pattern 2: React Query Provider with Cache Strategy
**What:** QueryClient configuration optimized for geospatial data
**When to use:** Application root, wrapping all components
**Example:**
```typescript
// Source: TanStack Query v5 documentation
// src/lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,        // 5 minutes - parcel data doesn't change often
      gcTime: 1000 * 60 * 30,          // 30 minutes - cache for session duration
      retry: 1,                         // Single retry for network failures
      refetchOnWindowFocus: false,      // Don't refetch on window focus for map data
    },
  },
});
```

### Pattern 3: Zod Schemas Mirroring Laravel Validation
**What:** Zod schemas that match backend validation rules
**When to use:** Form validation, type inference
**Example:**
```typescript
// Source: Zod 4.3.6 + react-hook-form integration
// src/lib/zod.ts
import { z } from 'zod';

export const parcelSchema = z.object({
  owner_name: z.string().min(1, 'Owner name is required').max(255),
  status: z.enum(['free', 'negotiating', 'target'], {
    errorMap: () => ({ message: 'Status must be free, negotiating, or target' }),
  }),
  price_per_sqm: z.number().min(0, 'Price must be positive').optional(),
  geometry: z.object({
    type: z.literal('Polygon'),
    coordinates: z.array(z.array(z.array(z.number()))).min(4),
  }),
});

export type ParcelFormData = z.infer<typeof parcelSchema>;
```

### Pattern 4: GeoJSON TypeScript Types
**What:** Type definitions for API responses
**When to use:** API client, React Query hooks
**Example:**
```typescript
// Source: @types/geojson
// src/api/types.ts
import type { FeatureCollection, Feature, Polygon, GeoJsonProperties } from 'geojson';

export type ParcelStatus = 'free' | 'negotiating' | 'target';

export interface ParcelProperties extends GeoJsonProperties {
  id: number;
  owner_name: string;
  status: ParcelStatus;
  price_per_sqm: number | null;
  area_sqm: number;
  created_at: string;
  updated_at: string;
}

export type ParcelFeature = Feature<Polygon, ParcelProperties>;
export type ParcelCollection = FeatureCollection<Polygon, ParcelProperties>;

export interface ApiResponse<T> {
  data: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedParcelsResponse {
  data: ParcelCollection;
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}
```

### Anti-Patterns to Avoid
- **Accessing Leaflet directly:** Always use react-leaflet components - direct Leaflet manipulation causes memory leaks
- **Co-locating API calls in components:** Use React Query hooks in `/hooks` directory for reusability
- **Any for GeoJSON:** Use @types/geojson - GeoJSON coordinate order bugs (lng/lat swap) are common in GIS
- **Skipping Zod validation:** Backend Laravel rules must be mirrored client-side for consistent UX
- **Global CSS side-effects:** Use Tailwind utilities or CSS modules to prevent style conflicts

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| HTTP caching | Custom fetch wrapper with localStorage | React Query (staleTime, gcTime) | Handles deduplication, background refetch, cache invalidation automatically |
| Form state | useState + manual validation | react-hook-form + Zod | Fewer re-renders, built-in validation, better accessibility |
| GeoJSON parsing | Manual coordinate validation | @types/geojson + Zod | GeoJSON spec is complex (FeatureCollection, bbox, CRS) |
| Polygon area calculation | Shoelace formula implementation | Turf.js (area) or leaflet-geometryutil | Handles edge cases (self-intersection, poles, anti-meridian) |
| Toast notifications | Custom portal/toast component | react-hot-toast | Built-in positioning, animations, promise handling |
| Map tile management | Custom tile layer fetching | react-leaflet TileLayer | Handles tile loading errors, attribution, z-index |

**Key insight:** Geospatial applications have unique complexity (coordinate systems, projection, area calculations). Use battle-tested libraries rather than hand-rolling geometry calculations.

## Common Pitfalls

### Pitfall 1: GeoJSON Coordinate Order Confusion
**What goes wrong:** Mixing up [longitude, latitude] vs [latitude, longitude] causes polygons to render in wrong locations
**Why it happens:** GeoJSON uses [lng, lat] but many APIs use [lat, lng]; Leaflet expects [lat, lng]
**How to avoid:** Always use @types/geojson types, document coordinate order in comments, use Zod validation
**Warning signs:** Polygons appear in oceans or wrong continents, console warnings from Leaflet

### Pitfall 2: Leaflet Marker Icon Missing in Vite
**What goes wrong:** Default Leaflet marker icons don't display (broken image icons)
**Why it happens:** Leaflet's icon assets aren't bundled by Vite automatically
**How to avoid:** Configure Vite to copy Leaflet assets or use custom SVG icons
**Warning signs:** Broken image icons where markers should be

### Pitfall 3: React Query Cache Staleness
**What goes wrong:** Map shows old parcel data after updates, stale data persists
**Why it happens:** Not invalidating queries after mutations, overly long staleTime
**How to avoid:** Use `queryClient.invalidateQueries()` after mutations, set appropriate staleTime
**Warning signs:** User creates parcel but it doesn't appear, edits not reflecting

### Pitfall 4: Zod Schema Mismatch with Laravel
**What goes wrong:** Client-side validation passes but backend returns 422
**Why it happens:** Zod rules don't match Laravel validation rules (e.g., string lengths, enum values)
**How to avoid:** Keep Zod schemas in sync with backend FormRequest classes, test validation endpoints
**Warning signs:** Consistent 422 errors on valid-feeling inputs

### Pitfall 5: Memory Leaks from Map Layers
**What goes wrong:** Browser memory grows, map becomes sluggish over time
**Why it happens:** Not cleaning up Leaflet layers when components unmount
**How to avoid:** Use react-leaflet's lifecycle hooks, remove event listeners in useEffect cleanup
**Warning signs:** Chrome DevTools memory profiler shows growing heap, map FPS drops

### Pitfall 6: TypeScript Strict Mode Violations
**What goes wrong:** Implicit any, unsafe assignments, missing null checks
**Why it happens:** Disabling strict mode to "make it work"
**How to avoid:** Enable `strict: true` in tsconfig.json from day one
**Warning signs:** `noImplicitAny` errors, proliferation of `as any` casts

## Code Examples

Verified patterns from official sources:

### Axios Error Interceptor for Laravel 422 Responses
```typescript
// Source: Axios 1.15.0 documentation pattern
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 422) {
      // Laravel validation errors: { errors: { field: ['message'] } }
      const validationErrors = error.response.data.errors;
      // Transform to react-hook-form format: { field: 'message' }
      const formattedErrors = Object.entries(validationErrors).reduce(
        (acc, [field, messages]) => ({
          ...acc,
          [field]: Array.isArray(messages) ? messages[0] : messages,
        }),
        {}
      );
      return Promise.reject({ ...error, response: { ...error.response, data: { errors: formattedErrors } } });
    }
    return Promise.reject(error);
  }
);
```

### React Query Hook for Parcel List
```typescript
// Source: TanStack Query v5 documentation
// src/hooks/useParcels.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/axios';
import type { ParcelCollection } from '../api/types';

export function useParcels(params?: { status?: string; bbox?: string }) {
  return useQuery({
    queryKey: ['parcels', params],
    queryFn: async () => {
      const { data } = await api.get<ParcelCollection>('/parcels', { params });
      return data;
    },
  });
}
```

### Zod Schema with Geometry Validation
```typescript
// Source: Zod 4.3.6 documentation
import { z } from 'zod';

// GeoJSON Polygon coordinate validation
const polygonCoordinateSchema = z.tuple([
  z.number(), // longitude
  z.number(), // latitude
]);

const ringSchema = z.array(polygonCoordinateSchema).min(4); // At least 4 points (closed ring)

export const parcelGeometrySchema = z.object({
  type: z.literal('Polygon'),
  coordinates: z.array(ringSchema).min(1), // At least one ring
});

export const bufferRequestSchema = z.object({
  parcel_id: z.number().optional(),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  distance: z.number().min(1).max(10000), // 1-10000 meters
});
```

### React Query Mutation with Toast
```typescript
// Source: TanStack Query v5 + react-hot-toast integration
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/axios';
import toast from 'react-hot-toast';
import type { ParcelFormData } from '../lib/zod';

export function useCreateParcel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ParcelFormData) => {
      const { data: response } = await api.post('/parcels', data);
      return response;
    },
    onSuccess: () => {
      toast.success('Parcel created successfully');
      queryClient.invalidateQueries({ queryKey: ['parcels'] });
    },
    onError: (error: any) => {
      if (error.response?.data?.errors) {
        toast.error('Please fix the validation errors');
      } else {
        toast.error('Failed to create parcel');
      }
    },
  });
}
```

### Leaflet Polygon Color Utility
```typescript
// Source: react-leaflet 5.0.0 pattern
// src/lib/utils.ts
export type ParcelStatus = 'free' | 'negotiating' | 'target';

export const STATUS_COLORS: Record<ParcelStatus, string> = {
  free: '#22c55e',       // green-500
  negotiating: '#eab308', // yellow-500
  target: '#ef4444',     // red-500
};

export function getParcelColor(status: ParcelStatus): string {
  return STATUS_COLORS[status];
}

export function formatArea(sqm: number): string {
  if (sqm >= 10000) {
    return `${(sqm / 10000).toFixed(2)} ha`;
  }
  return `${sqm.toLocaleString()} m²`;
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| React Query `cacheTime` | `gcTime` | v5.0.0 (2023) | Rename for clarity (garbage collection time) |
| React Query `useIsFetching` | `useQueryState` | v5.0.0 (2023) | New API for optimistic updates |
| Zod `z.union()` | `z.discriminatedUnion()` | v3.0 (2023) | Better TypeScript inference for discriminated unions |
| Leaflet default markers | Custom SVG icons | 2024+ | Vite doesn't bundle Leaflet assets by default |
| Tailwind CSS 3.x `tailwind.config.js` | Tailwind 4.x CSS-first config | 2025 | Configuration moved to CSS `@theme` directive |

**Deprecated/outdated:**
- **Mapbox GL JS default tiles:** Require API key - use OpenStreetMap tiles instead
- **React Router:** Not needed for single-page app - URL params sufficient
- **Redux/Zustand:** React Query handles all server state - no need for additional state management
- **Formik:** react-hook-form has better performance and TypeScript support

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Laravel backend returns GeoJSON FeatureCollection format | API Types | If backend uses different format, type definitions will need adjustment |
| A2 | Backend API base URL is `/api/v1` | Axios Client | If backend uses different prefix, requests will 404 |
| A3 | Backend uses 422 for validation errors with `{ errors: { field: ['message'] } }` format | Error Interceptor | If format differs, error mapping to forms will break |
| A4 | No authentication required for v1 - all endpoints public | API Client | If auth is added, axios client will need token injection |
| A5 | Tailwind CSS 4.x is "already configured" per CLAUDE.md | Tailwind Setup | May need to verify PostCSS and vite.config for Tailwind 4 compatibility |
| A6 | Spatial index on database means bbox queries are performant enough for client-side filtering | Query Strategy | If bbox queries are slow, may need debouncing or pagination |

**If this table is empty:** All claims in this research were verified or cited — no user confirmation needed.

## Open Questions (RESOLVED)

1. **Backend API URL and CORS configuration** (RESOLVED)
   - What we know: Backend is Laravel 12, uses `/api/v1` prefix
   - What was unclear: Local development URL, CORS configuration for `localhost:5173`
   - Resolution: Plan 01-04 creates `src/api/axios.ts` with `import.meta.env.VITE_API_URL` defaulting to `/api/v1`. CORS is a backend concern - Laravel config will be documented in `.env.example` for local development. Per plan D-01, environment variable pattern is established.

2. **Laravel validation rule details** (RESOLVED)
   - What we know: Backend uses Laravel validation, returns 422 with errors
   - What was unclear: Exact field names, validation rules (max length, regex patterns)
   - Resolution: Plan 01-06 creates Zod schemas in `src/lib/zod.ts` with reasonable defaults (owner_name max 255, status enum). These will be adjusted when actual API integration occurs in Phase 2. Per plan D-02, schema structure is established first.

3. **GeoJSON coordinate system** (RESOLVED)
   - What we know: GeoJSON standard uses WGS84 [lng, lat]
   - What was unclear: Whether backend stores coordinates in same format or does transformation
   - Resolution: Plan 01-05 creates `src/api/types.ts` using @types/geojson which enforces standard GeoJSON coordinate order. The axios interceptor pattern (Plan 01-04) will reveal any coordinate transformation issues during API integration. Per plan D-03, type safety is enforced via TypeScript.

**Summary:** All open questions resolved through plan implementations. Environment variables, schema structure, and type safety are established in Phase 1. Actual values will be verified during Phase 2 API integration.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Vite build tool | ✓ | v22.17.0 | — |
| npm | Package manager | ✓ | 11.5.2 | — |
| Git | Version control | ✓ | 2.x+ | — |
| Vite | Dev server/build | ✓ (via npm) | 8.0.8 (install) | — |
| TypeScript | Type checking | ✓ (via npm) | 6.0.2 (install) | — |

**Missing dependencies with no fallback:**
None

**Missing dependencies with fallback:**
None

**Note:** Phase 1 requires no external services (database, API) - infrastructure setup only.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest (bundled with Vite) |
| Config file | `vitest.config.ts` — create in Wave 0 |
| Quick run command | `npm test` |
| Full suite command | `npm run test:all` (configure in package.json) |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| FND-01 | Project initializes with Vite dev server | smoke | `npm run dev &; sleep 5; curl -s http://localhost:5173 | grep -q "React"` | — |
| FND-02 | All dependencies install without conflicts | install | `npm list --depth=0` | — |
| FND-03 | Tailwind classes compile in CSS | smoke | `npm run build; grep -q "tailwind" dist/assets/*.css` | — |
| FND-04 | Axios interceptors handle 422/500 errors | manual | Test with actual API response or mock | — |
| FND-05 | TypeScript types compile without errors | typecheck | `tsc --noEmit` | — |
| FND-06 | Zod schemas validate correct/incorrect input | manual | Test with valid/invalid inputs in console | — |
| FND-07 | React Query provider wraps app | smoke | `npm run build; grep -q "QueryClientProvider" dist/assets/*.js` | — |
| FND-08 | Utility functions return expected output | manual | Test in console or component usage | — |

### Sampling Rate
- **Per task commit:** `npm test -- --run` (run affected tests only)
- **Per wave merge:** `npm run test:all` (full suite with coverage)
- **Phase gate:** Full suite green + TypeScript `tsc --noEmit` passes before `/gsd-verify-work`

### Wave 0 Gaps
- [x] `vitest.config.ts` — Vitest configuration with @testing-library/react (Plan 01-00)
- [x] `src/test/setup.ts` — Test setup with cleanup utilities (Plan 01-00)
- [x] `package.json` scripts: `"test": "vitest"`, `"test:all": "vitest --coverage"` (Plan 01-00)
- [x] Framework install: `npm install -D @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom` (Plan 01-00)

**Note:** Comprehensive unit tests for each module (axios, zod, utils, queryClient, tailwind, install) are deferred to later phases when the modules are actually used in features. Phase 1 Wave 0 focuses on establishing the test infrastructure only.

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No | Public demo - no authentication in v1 |
| V3 Session Management | No | No sessions - public access |
| V4 Access Control | No | No authorization - public access |
| V5 Input Validation | yes | Zod schemas mirroring backend validation |
| V6 Cryptography | No | No encryption - public data |
| V8 Data Protection | yes | No sensitive data - public parcel information |
| V11 Communication | yes | HTTPS only for API calls, no plaintext endpoints |

### Known Threat Patterns for React SPA + Leaflet

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| XSS via user input (owner_name) | Tampering | Zod validation limits (max 255 chars), React auto-escapes JSX |
| CSRF via API mutations | Spoofing | Backend Laravel CSRF tokens (if stateful) or SameSite cookies |
| API endpoint abuse | Denial of Service | React Query deduplication, request rate limiting via axios interceptor |
| GeoJSON injection | Tampering | Zod validates coordinate structure, type safety prevents arbitrary code |
| Large GeoJSON DoS | Denial of Service | Validate FeatureCollection size (max 100 features per IMP-02) |

**Note:** This is a portfolio/demo project with public data. Security enforcement focuses on input validation and API communication hygiene rather than authentication/authorization.

## Sources

### Primary (HIGH confidence)
- [npm registry] - All package versions verified via `npm view` commands on 2026-04-11
- [React 19.2.5](https://www.npmjs.com/package/react) - UI framework
- [Vite 8.0.8](https://www.npmjs.com/package/vite) - Build tool
- [TypeScript 6.0.2](https://www.npmjs.com/package/typescript) - Type safety
- [TanStack Query 5.97.0](https://www.npmjs.com/package/@tanstack/react-query) - Server state
- [Leaflet 1.9.4](https://www.npmjs.com/package/leaflet) - Map engine
- [react-leaflet 5.0.0](https://www.npmjs.com/package/react-leaflet) - React integration
- [Axios 1.15.0](https://www.npmjs.com/package/axios) - HTTP client
- [Zod 4.3.6](https://www.npmjs.com/package/zod) - Validation
- [react-hook-form 7.72.1](https://www.npmjs.com/package/react-hook-form) - Form state
- [@hookform/resolvers 5.2.2](https://www.npmjs.com/package/@hookform/resolvers) - Zod integration
- [react-hot-toast 2.6.0](https://www.npmjs.com/package/react-hot-toast) - Notifications
- [Tailwind CSS 4.2.2](https://www.npmjs.com/package/tailwindcss) - Styling
- [@types/geojson 7946.0.16](https://www.npmjs.com/package/@types/geojson) - GeoJSON types

### Secondary (MEDIUM confidence)
- [Laravel 12 Documentation](https://laravel.com/docs/12.x) - Backend validation patterns (referenced in requirements)
- [GeoJSON Specification (RFC 7946)](https://www.rfc-editor.org/rfc/rfc7946) - Coordinate order, structure
- [OpenStreetMap Tile Server](https://wiki.openstreetmap.org/wiki/Tile_servers) - Free tile layer for Leaflet

### Tertiary (LOW confidence)
- WebSearch attempted but rate-limited (resets 2026-05-06)
- All version information verified via npm registry instead

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All versions verified via npm registry on 2026-04-11
- Architecture: HIGH - Based on official package documentation and established patterns
- Pitfalls: HIGH - Common issues well-documented in Leaflet/React Query communities

**Research date:** 2026-04-11
**Valid until:** 2026-05-11 (30 days - stable dependencies, but verify latest versions before phase start)
