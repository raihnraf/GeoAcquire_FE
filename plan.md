# GeoAcquire — Frontend Architecture & Implementation Plan

> **Repository:** Separate from backend (React SPA)
> **Backend API:** Laravel 12 REST API at `/api/v1`
> **Date:** April 11, 2026

---

## 1. Overview

GeoAcquire is a **Land Acquisition & Spatial Analysis Dashboard** for Paramount Enterprise. The frontend is a standalone React SPA that visualizes land parcels on an interactive map, enables CRUD operations for parcel management, and provides spatial analysis tools (buffer zones, bounding box queries, area aggregation).

### Core User Flows

| # | Flow | Description |
|---|------|-------------|
| F1 | **View Map** | Open dashboard → see all parcels rendered as colored polygons on a map |
| F2 | **Filter Parcels** | Filter by status (free / negotiating / target) or draw a bounding box |
| F3 | **Create Parcel** | Click "Add Parcel" → draw polygon on map or paste GeoJSON → fill form → submit |
| F4 | **Edit Parcel** | Click a parcel → sidebar shows details → edit fields or geometry → save |
| F5 | **Delete Parcel** | Click a parcel → confirm deletion → remove from map |
| F6 | **Buffer Analysis** | Click a parcel or pick a point → set radius → see nearby parcels highlighted |
| F7 | **Import GeoJSON** | Upload a GeoJSON FeatureCollection file → import up to 100 parcels at once |
| F8 | **View Statistics** | See aggregated area totals grouped by status |

---

## 2. Tech Stack Decision

| Layer | Technology | Version | Reasoning |
|-------|-----------|---------|-----------|
| **Framework** | React (via Vite) | 18+ | Project.md explicitly states "React 18". Already scaffolded in backend repo via Laravel Vite. |
| **Language** | TypeScript | 5.x | GeoJSON types are complex — TypeScript prevents coordinate order bugs (lng/lat swap is a common GIS error). |
| **Map Library** | Leaflet + react-leaflet | Leaflet 1.9 / react-leaflet 4.x | Project.md specifies Leaflet.js. react-leaflet provides React component wrappers. Open-source, no API key needed (unlike Mapbox). |
| **HTTP Client** | Axios | 1.x | Already a devDependency in `package.json`. Mature, supports interceptors for error handling, request/response transformation. |
| **Styling** | Tailwind CSS | 4.x | Already configured in backend `package.json`. Utility-first, fast prototyping, production-ready. |
| **State Management** | React Query (TanStack Query) + URL search params | v5 | Server state (parcels) is best handled by React Query's caching, deduplication, and background refetch. UI state (sidebar open, selected parcel) stays in React `useState`. URL params hold filter state for shareable links. No Redux/Zustand needed. |
| **Form Handling** | React Hook Form + Zod | RHF 7.x + Zod 3.x | RHF for performant uncontrolled forms. Zod for schema validation that mirrors backend rules. Zod schemas can generate TypeScript types automatically. |
| **GeoJSON Drawing** | leaflet-draw plugin | 1.x | Standard Leaflet plugin for drawing polygons on the map. Exports GeoJSON natively. |
| **Notifications** | react-hot-toast | 4.x | Lightweight toast library. No heavy dependency like react-toastify. |

### What We're NOT Using (and Why)

| Library | Reason |
|---------|--------|
| Redux / Zustand | Overkill. All data is server-state → React Query handles it perfectly. |
| Mapbox GL JS | Requires API key, paid tier for production. Leaflet + OSM tiles are free. |
| react-router-dom | Not needed yet. Single-page map app with URL params for filters. Add routing only if multi-page views are needed. |
| React Table | No tabular data view required. Parcels are displayed on the map. |
| Day.js / date-fns | Dates are display-only (created_at, updated_at) — simple `toLocaleDateString()` is sufficient. |

---

## 3. API Mapping

### Base URL

```
API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
API_PREFIX = '/api/v1'
```

### Complete Endpoint Map

| # | Method | Endpoint | Frontend Usage | Query Params | Body | Response Shape |
|---|--------|----------|----------------|-------------|------|----------------|
| 1 | `GET` | `/api/v1/parcels` | **Load all parcels** on map mount. Re-fetch on filter change. | `bbox` (optional): `"minLng,minLat,maxLng,maxLat"`<br>`status` (optional): `"free\|negotiating\|target"`<br>`per_page` (optional, default 20) | — | `FeatureCollection` with `metadata` (pagination) |
| 2 | `POST` | `/api/v1/parcels` | **Create a new parcel** from form or drawn polygon. | — | `{ owner_name, status?, price_per_sqm?, geometry }` | Single `Feature` |
| 3 | `GET` | `/api/v1/parcels/{id}` | **Load single parcel** details when clicked from map or list. | — | — | Single `Feature` |
| 4 | `PUT` / `PATCH` | `/api/v1/parcels/{id}` | **Update parcel** fields or geometry from edit sidebar. | — | Partial: any of `{ owner_name, status, price_per_sqm, geometry }` | Single `Feature` |
| 5 | `DELETE` | `/api/v1/parcels/{id}` | **Delete parcel** with confirmation dialog. | — | — | `{ message: "..." }` |
| 6 | `GET` | `/api/v1/parcels/{id}/buffer` | **Buffer analysis** from a selected parcel. Show parcels within radius. | `distance` (optional, default 500): 1–10000 meters | — | `FeatureCollection` (no pagination) |
| 7 | `POST` | `/api/v1/analysis/buffer` | **Buffer analysis** from an arbitrary point (not tied to existing parcel). | — | `{ lng, lat, distance }` | `FeatureCollection` (no pagination) |
| 8 | `POST` | `/api/v1/parcels/import` | **Bulk import** from uploaded GeoJSON file. | — | `{ type: "FeatureCollection", features: [...] }` (max 100) | `{ message, imported, errors }` |
| 9 | `GET` | `/api/v1/parcels/aggregate/area` | **Dashboard statistics** — total area per status. | `by` (optional, default "status") — currently only "status" supported | — | `{ data: [{ status, total_area_sqm, total_area_hectares }] }` |
| 10 | `GET` | `/api/v1/parcels/{id}/area` | **Detailed area** for a single parcel (shown in sidebar). | — | — | `{ parcel_id, area_sqm, area_hectares }` |

### Response Structure Reference

#### Single Feature (endpoints 2, 3, 4)

```json
{
  "type": "Feature",
  "id": 1,
  "geometry": {
    "type": "Polygon",
    "coordinates": [[[lng, lat], [lng, lat], ...]]
  },
  "properties": {
    "owner_name": "PT Example Land",
    "status": "free",
    "price_per_sqm": 12500000.00,
    "area_sqm": 500.25,
    "created_at": "2026-04-11T10:00:00+00:00",
    "updated_at": "2026-04-11T10:00:00+00:00"
  }
}
```

#### FeatureCollection (endpoints 1, 6, 7)

```json
{
  "type": "FeatureCollection",
  "features": [ /* Array of Feature objects */ ],
  "metadata": {
    "total": 100,
    "current_page": 1,
    "per_page": 20,
    "last_page": 5,
    "links": {
      "first": "...",
      "last": "...",
      "prev": null,
      "next": "..."
    }
  }
}
```

**Important:** Endpoints 6 (parcel buffer) and 7 (point buffer analysis) return FeatureCollection **without pagination metadata** — just `total` in metadata.

#### Error Response (422)

```json
{
  "message": "The owner name field is required. (and 1 more error)",
  "errors": {
    "owner_name": ["The owner name field is required."],
    "geometry": ["The geometry must be of type Polygon."]
  }
}
```

#### Error Response (500)

```json
{
  "message": "Failed to create parcel."
}
```

### Validation Rules (Frontend Must Mirror)

| Field | Create | Update | Notes |
|-------|--------|--------|-------|
| `owner_name` | required, string, max 255 | sometimes, string, max 255 | |
| `status` | sometimes, enum: `free\|negotiating\|target` | sometimes, enum: `free\|negotiating\|target` | Default: `free` |
| `price_per_sqm` | sometimes, nullable, numeric, min 0 | sometimes, nullable, numeric, min 0 | Can be set to `null` |
| `geometry` | required, GeoJSON Polygon | sometimes, GeoJSON Polygon | See GeoJSON rules below |

#### GeoJSON Polygon Validation Rules

The frontend must validate geometry before sending to avoid 422 errors:

- `type` must be `"Polygon"`
- `coordinates` must be an array of rings
- At least 1 ring required
- Each ring must have ≥ 4 coordinates
- Each coordinate must be `[longitude, latitude]` pair
- Longitude: -180 to 180
- Latitude: -90 to 90
- First and last coordinate of each ring should match (closed ring) — **leaflet-draw handles this automatically**

#### Buffer Analysis Validation

| Field | Rule |
|-------|------|
| `lng` | required, numeric, -180 to 180 |
| `lat` | required, numeric, -90 to 90 |
| `distance` | required, integer, 1 to 10000 (meters) |

#### Bounding Box Validation

| Field | Rule |
|-------|------|
| `bbox` | format: `"minLng,minLat,maxLng,maxLat"` |
| | Longitude: -180 to 180 |
| | Latitude: -90 to 90 |
| | minLng < maxLng, minLat < maxLat |
| `status` | nullable, one of: `free`, `negotiating`, `target` |

#### Bulk Import Validation

| Field | Rule |
|-------|------|
| `type` | must be `"FeatureCollection"` |
| `features` | required, array, 1–100 items |
| `features.*.type` | must be `"Feature"` |
| `features.*.geometry` | required, array |
| `features.*.properties` | nullable, array |

---

## 4. Pages & Routes

This is a **single-page map application**. No traditional routing is needed — all state is managed via URL search params for shareability.

### URL Search Params (for filters)

| Param | Type | Purpose |
|-------|------|---------|
| `status` | `string` | Filter parcels by status |
| `bbox` | `string` | Filter parcels within bounding box `"minLng,minLat,maxLng,maxLat"` |
| `selected` | `number` | ID of the currently selected parcel (opens sidebar) |
| `buffer` | `number` | ID of parcel for buffer analysis mode |
| `bufferDistance` | `number` | Buffer radius in meters (default 500) |
| `page` | `number` | Current page for paginated results |

### Layout Structure

```
┌─────────────────────────────────────────────────────┐
│  Header Bar (fixed top)                             │
│  [Logo]  [Filters ▼]  [Import]  [Stats]  [Add +]    │
├──────────────────────────────────────┬──────────────┤
│                                      │              │
│                                      │  Sidebar     │
│         Leaflet Map                  │  (slide-in)  │
│         (full viewport)              │              │
│                                      │  Details /   │
│                                      │  Edit Form   │
│                                      │              │
├──────────────────────────────────────┴──────────────┤
│  Status Bar (fixed bottom)                          │
│  Total: X parcels  |  Page 1/5  |  ← Prev Next →    │
└─────────────────────────────────────────────────────┘
```

### Views (controlled by UI state, not routes)

| View | Trigger | Description |
|------|---------|-------------|
| **Map View (default)** | App load | Full-screen map with all parcels |
| **Filter Panel** | Click "Filters" button | Dropdown/status chips + bbox draw mode |
| **Add Parcel Modal** | Click "Add +" button | Form with owner_name, status, price, and polygon draw |
| **Detail/Edit Sidebar** | Click a parcel on map | Slide-in panel with parcel details + edit form |
| **Buffer Analysis Mode** | Click buffer icon on parcel or header button | Distance input + radius circle drawn on map |
| **Import Modal** | Click "Import" button | File upload + drag-drop for GeoJSON |
| **Statistics Modal** | Click "Stats" button | Area breakdown by status (bar chart or table) |

---

## 5. Component Structure

```
src/
├── api/
│   ├── client.ts                    # Axios instance with base URL, interceptors
│   ├── parcels.ts                   # All parcel-related API calls
│   └── analysis.ts                  # Buffer & aggregate API calls
│
├── components/
│   ├── layout/
│   │   ├── Header.tsx               # Top bar with logo, action buttons, filters
│   │   ├── StatusBar.tsx            # Bottom bar with pagination info
│   │   └── AppLayout.tsx            # Wraps map + sidebar
│   │
│   ├── map/
│   │   ├── ParcelMap.tsx            # Main Leaflet map component
│   │   ├── ParcelLayer.tsx          # Renders all parcel polygons with color coding
│   │   ├── ParcelMarker.tsx         # Individual parcel polygon + popup click handler
│   │   ├── DrawControl.tsx          # leaflet-draw integration for polygon drawing
│   │   ├── BufferCircle.tsx         # Buffer radius visualization
│   │   ├── BoundingBoxLayer.tsx     # Bounding box draw tool visualization
│   │   └── MapControls.tsx          # Zoom, reset view, layer toggle buttons
│   │
│   ├── parcels/
│   │   ├── ParcelForm.tsx           # Create/Edit form (shared component)
│   │   ├── ParcelDetail.tsx         # Read-only parcel detail card
│   │   ├── ParcelCard.tsx           # Compact parcel summary (for list/sidebar)
│   │   ├── ParcelList.tsx           # Optional list view toggle (small table)
│   │   └── StatusBadge.tsx          # Color-coded status indicator
│   │
│   ├── analysis/
│   │   ├── BufferAnalysisForm.tsx   # Point picker + distance input
│   │   └── AreaStats.tsx            # Aggregate area display (chart/table)
│   │
│   ├── import/
│   │   ├── ImportModal.tsx          # File upload + drag-drop
│   │   └── ImportResults.tsx        # Success/error summary after import
│   │
│   └── ui/                          # Generic reusable UI components
│       ├── Modal.tsx                # Generic modal with backdrop
│       ├── Sidebar.tsx              # Slide-in panel with backdrop
│       ├── Button.tsx               # Styled button variants
│       ├── Input.tsx                # Styled input with error display
│       ├── Select.tsx               # Styled select dropdown
│       ├── Toast.tsx                # Toast notification wrapper
│       ├── LoadingSpinner.tsx       # Spinner component
│       └── EmptyState.tsx           | Empty/no-data placeholder
│
├── hooks/
│   ├── useParcels.ts                # React Query hook for listing parcels
│   ├── useParcel.ts                 # React Query hook for single parcel
│   ├── useCreateParcel.ts           # Mutation hook for creating parcel
│   ├── useUpdateParcel.ts           # Mutation hook for updating parcel
│   ├── useDeleteParcel.ts           # Mutation hook for deleting parcel
│   ├── useBufferAnalysis.ts         # Mutation hook for buffer analysis
│   ├── useAggregateArea.ts          # Query hook for aggregate statistics
│   ├── useParcelArea.ts             # Query hook for single parcel area
│   ├── useImportParcels.ts          # Mutation hook for bulk import
│   ├── useMapFilters.ts             # Hook for URL-based filter state
│   └── useGeoValidation.ts          # Hook for GeoJSON polygon validation
│
├── schemas/
│   ├── parcel.ts                    # Zod schemas for parcel form validation
│   ├── geometry.ts                  # Zod schema for GeoJSON polygon validation
│   └── buffer.ts                    # Zod schema for buffer analysis form
│
├── types/
│   ├── geojson.d.ts                 # GeoJSON type declarations (or use @types/geojson)
│   ├── parcel.ts                    # TypeScript interfaces for parcel data
│   └── api.ts                       # API request/response type definitions
│
├── utils/
│   ├── geometry.ts                  # GeoJSON helpers (validate polygon, calculate bbox, etc.)
│   ├── colors.ts                    # Status → color mapping
│   ├── formatters.ts                # Number/date/currency formatters
│   └── constants.ts                 # App-wide constants (default buffer, max import, etc.)
│
├── providers/
│   └── QueryProvider.tsx            # React Query provider with cache config
│
└── App.tsx                          # Root component
```

### Key Design Decisions

1. **Shared `ParcelForm` component** — Used for both create (modal) and edit (sidebar) via a `mode` prop (`'create' | 'edit'`). Avoids duplicating form logic.

2. **Map components are isolated** — All Leaflet-specific code lives in `components/map/`. The rest of the app never imports `leaflet` directly. This keeps the codebase testable and prevents Leaflet's global CSS side-effects from leaking.

3. **UI components are dumb** — `Modal`, `Sidebar`, `Button`, etc. have zero business logic. They accept props and render. Business logic lives in hooks and feature components.

4. **No global state library** — React Query handles server state. React `useState`/`useContext` handles UI state (sidebar open/close, modal visibility). URL search params handle filter state.

---

## 6. State Management Strategy

### Server State → React Query

All data from the API is managed by React Query. This gives us:

| Feature | How React Query Helps |
|---------|----------------------|
| **Caching** | Parcel list is cached. Re-opening the app shows cached data immediately while refetching in background. |
| **Deduplication** | Multiple components requesting the same data only trigger one API call. |
| **Background Refetch** | After creating/editing/deleting a parcel, the parcel list automatically refetches. |
| **Optimistic Updates** | (Optional) Delete a parcel → remove from UI instantly → rollback on API error. |
| **Loading/Error States** | `isLoading`, `isError`, `error`, `data` are always available from the query result. |

### Query Keys Structure

```typescript
const queryKeys = {
  parcels: {
    all: ['parcels'] as const,
    list: (filters: ParcelFilters) => ['parcels', 'list', filters] as const,
    detail: (id: number) => ['parcels', 'detail', id] as const,
    area: (id: number) => ['parcels', 'area', id] as const,
  },
  analysis: {
    buffer: (params: BufferParams) => ['analysis', 'buffer', params] as const,
    aggregateArea: () => ['analysis', 'aggregate-area'] as const,
  },
} as const;
```

### Cache Invalidation Strategy

| Action | Invalidate |
|--------|-----------|
| Create parcel | `parcels.all`, `analysis.aggregateArea` |
| Update parcel | `parcels.detail(id)`, `parcels.all`, `analysis.aggregateArea` |
| Delete parcel | `parcels.all`, `parcels.detail(id)`, `analysis.aggregateArea` |
| Import parcels | `parcels.all`, `analysis.aggregateArea` |

### UI State → React useState / useContext

| State | Scope | Storage |
|-------|-------|---------|
| Sidebar open/close | Global (Header + Sidebar) | `useState` in `App.tsx`, passed as props |
| Selected parcel ID | Global (map → sidebar) | URL search param `?selected=123` |
| Active modal (add/import/stats/buffer) | Global | `useState` in `App.tsx` |
| Drawing mode (draw polygon / draw bbox) | Global | URL search param or `useState` in map context |
| Filter values (status, bbox) | Global | URL search params |
| Form field values | Local (form component) | React Hook Form internal state |
| Map instance (Leaflet map object) | Global (map components) | `useRef` + React Context |

### Loading States

| Scenario | UI Behavior |
|----------|-------------|
| Initial map load | Show skeleton overlay on map + "Loading parcels..." text |
| Filter change | Keep existing parcels visible, show subtle loading indicator in status bar |
| Single parcel load (sidebar) | Show skeleton card in sidebar |
| Form submit | Disable submit button, show "Saving..." text + spinner |
| Buffer analysis | Draw loading circle placeholder or spinner at target point |

---

## 7. Data Flow Diagram (Textual)

```
┌──────────────────────────────────────────────────────────────────────┐
│                           INITIAL LOAD                               │
│                                                                      │
│  App mounts                                                          │
│    └→ useParcels() hook fires                                        │
│         └→ GET /api/v1/parcels                                       │
│              └→ React Query caches response                          │
│                   └→ ParcelMap receives data                         │
│                        └→ ParcelLayer renders polygons on map        │
│                             └→ Status colors applied per parcel      │
│                                                                      │
│  useAggregateArea() hook fires in parallel                           │
│    └→ GET /api/v1/parcels/aggregate/area                             │
│         └→ Stats modal can display totals                            │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│                        CREATE PARCEL FLOW                             │
│                                                                      │
│  User clicks "Add +" → Modal opens                                   │
│    └→ User fills form (owner_name, status, price)                    │
│         └→ User draws polygon on map (leaflet-draw)                  │
│              └→ GeoJSON geometry captured                            │
│                   └→ Zod validation (mirrors backend rules)          │
│                        └→ If invalid → show field errors inline      │
│                        └→ If valid → submit                          │
│                             └→ POST /api/v1/parcels                  │
│                                  └→ 201:                            │
│                                      → Close modal                   │
│                                      → Invalidate 'parcels' cache    │
│                                      → React Query refetches list    │
│                                      → New parcel appears on map     │
│                                      → Show success toast            │
│                                  └→ 422:                            │
│                                      → Map errors to form fields     │
│                                      → Show validation messages      │
│                                  └→ 500:                            │
│                                      → Show generic error toast      │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│                        SELECT & EDIT FLOW                             │
│                                                                      │
│  User clicks a parcel on map                                         │
│    └→ URL updates: ?selected=123                                    │
│         └→ useParcel(123) fires (may use cached data)               │
│              └→ Sidebar opens with ParcelDetail view                 │
│                   └→ User clicks "Edit"                              │
│                        └→ Form pre-fills with current values         │
│                             └→ User modifies fields or redraws geo   │
│                                  └→ Submits → PATCH /api/v1/parcels/123 │
│                                       └→ 200:                       │
│                                           → Sidebar shows detail view│
│                                           → Invalidate caches        │
│                                           → Map updates polygon      │
│                                           → Success toast            │
│                                       └→ 422: Show field errors     │
│                                                                      │
│  User closes sidebar → URL: remove ?selected param                   │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│                      FILTER & SPATIAL QUERY FLOW                      │
│                                                                      │
│  User selects status filter (e.g., "target")                         │
│    └→ URL updates: ?status=target                                   │
│         └→ useParcels({ status: 'target' }) fires                   │
│              └→ GET /api/v1/parcels?status=target                    │
│                   └→ Map re-renders with filtered parcels            │
│                                                                      │
│  User draws bounding box on map                                      │
│    └→ URL updates: ?bbox=106.61,-6.25,106.62,-6.26                 │
│         └→ useParcels({ bbox: '...' }) fires                        │
│              └→ GET /api/v1/parcels?bbox=...                         │
│                   └→ Map shows only parcels within bbox              │
│                                                                      │
│  User clears filters → URL params removed → fetch all parcels        │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│                      BUFFER ANALYSIS FLOW                             │
│                                                                      │
│  User clicks buffer icon on a parcel                                 │
│    └→ Buffer mode activates, distance input appears                  │
│         └→ User sets distance (e.g., 500m) → submits                │
│              └→ GET /api/v1/parcels/{id}/buffer?distance=500        │
│                   └→ Draw radius circle on map                      │
│                   └→ Highlight returned parcels (different color)    │
│                   └→ Show count in sidebar                           │
│                                                                      │
│  OR: User clicks "Buffer Analysis" from header                       │
│    └→ Click a point on map → set distance → submit                  │
│         └→ POST /api/v1/analysis/buffer                              │
│              { lng, lat, distance }                                  │
│              └→ Same visualization as above                          │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│                        IMPORT FLOW                                    │
│                                                                      │
│  User clicks "Import" → Modal opens                                  │
│    └→ Drag-drop or file select GeoJSON file                          │
│         └→ Read file as text (FileReader API)                       │
│              └→ Parse JSON → validate structure (Zod)               │
│                   └→ If invalid structure → show error immediately   │
│                   └→ If valid → confirm import (show feature count)  │
│                        └→ User confirms → POST /api/v1/parcels/import│
│                             └→ 200:                                 │
│                                 → Show ImportResults (imported count │
│                                   + any per-feature errors)          │
│                                 → Invalidate parcels cache           │
│                                 → New parcels appear on map          │
│                             └→ 422:                                 │
│                                 → Show validation error              │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│                        DELETE FLOW                                    │
│                                                                      │
│  User selects parcel → sidebar shows detail view                     │
│    └→ User clicks "Delete" button                                    │
│         └→ Confirmation dialog: "Delete this parcel? This cannot be undone." │
│              └→ User confirms → DELETE /api/v1/parcels/{id}          │
│                   └→ 200:                                           │
│                       → Close sidebar                                │
│                       → Remove parcel from map immediately (optimistic) │
│                       → Invalidate parcels cache (background verify) │
│                       → Success toast                                │
│                   └→ 500:                                           │
│                       → Show error toast, parcel remains on map      │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 8. Form Handling Strategy

### Library: React Hook Form + Zod Resolver

```typescript
// Example: Parcel form schema (mirrors backend StoreParcelRequest)
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const parcelSchema = z.object({
  owner_name: z.string().min(1, 'Owner name is required').max(255),
  status: z.enum(['free', 'negotiating', 'target']).default('free'),
  price_per_sqm: z
    .union([z.number().min(0, 'Price cannot be negative'), z.null()])
    .nullable()
    .optional(),
  geometry: z.object({
    type: z.literal('Polygon'),
    coordinates: z
      .array( // rings
        z.array( // coordinates
          z.tuple([ // [lng, lat]
            z.number().min(-180).max(180, 'Longitude out of range'),
            z.number().min(-90).max(90, 'Latitude out of range'),
          ])
        ).min(4, 'Each ring must have at least 4 coordinates')
      ).min(1, 'At least one ring is required'),
  }),
});

type ParcelFormData = z.infer<typeof parcelSchema>;

// In component:
const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<ParcelFormData>({
  resolver: zodResolver(parcelSchema),
  defaultValues: {
    owner_name: '',
    status: 'free',
    price_per_sqm: null,
    geometry: undefined,
  },
});
```

### Mapping Backend 422 Errors to Form Fields

When the API returns a 422:

```json
{
  "message": "The owner name field is required.",
  "errors": {
    "owner_name": ["The owner name field is required."],
    "geometry": ["The geometry must be of type Polygon."]
  }
}
```

The Axios error interceptor extracts `error.response.data.errors` and calls React Hook Form's `setError()`:

```typescript
// In the mutation:
try {
  await api.post('/api/v1/parcels', data);
} catch (err) {
  if (axios.isAxiosError(err) && err.response?.status === 422) {
    const apiErrors = err.response.data.errors;
    Object.keys(apiErrors).forEach((field) => {
      setError(field as keyof ParcelFormData, {
        type: 'server',
        message: apiErrors[field][0], // first error message per field
      });
    });
  }
}
```

### Geometry Input Flow

The geometry field is **not a text input**. It's populated by the `leaflet-draw` plugin:

1. User clicks "Draw polygon" on the map
2. `leaflet-draw` activates draw mode
3. User clicks to place vertices, closes the polygon
4. `draw:created` event fires → extract `layer.toGeoJSON().geometry`
5. `setValue('geometry', geojsonGeometry)` populates the form field
6. Zod validates the structure
7. If invalid, show error below the map: "Invalid polygon: each ring must have at least 4 coordinates"

### Edit Form Pre-fill

When editing an existing parcel:

```typescript
// Parse the Feature response into form values
const feature = parcelData; // from API
const defaultValues = {
  owner_name: feature.properties.owner_name,
  status: feature.properties.status,
  price_per_sqm: feature.properties.price_per_sqm,
  geometry: feature.geometry,
};
```

The geometry is pre-loaded onto the map so the user sees the existing polygon and can modify it.

---

## 9. Error Handling Strategy

### Global Axios Interceptor

```typescript
// api/client.ts
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      // Network error — server unreachable
      toast.error('Cannot connect to server. Please check your connection.');
      return Promise.reject(new Error('Network error'));
    }

    const { status, data } = error.response;

    if (status === 422) {
      // Validation error — handled by form components
      return Promise.reject(error); // let caller handle field-level errors
    }

    if (status === 404) {
      toast.error('Resource not found.');
      return Promise.reject(new Error('Not found'));
    }

    if (status >= 500) {
      toast.error(data?.message || 'An unexpected error occurred.');
      return Promise.reject(new Error('Server error'));
    }

    return Promise.reject(error);
  }
);

export default api;
```

### Per-Request Error Handling

| Scenario | Handling |
|----------|----------|
| **422 Validation** | Extract `errors` object → map to form fields via `setError()`. Show inline error messages below each field. |
| **500 Server Error** | Show generic toast: "Failed to create parcel." Form remains open so user can retry. |
| **Network Error** | Show toast: "Cannot connect to server." Retry button in toast. |
| **Timeout** | Axios timeout set to 15 seconds. On timeout: "Request timed out. Please try again." |

### Component-Level Error UI

| Component | Error Display |
|-----------|--------------|
| **ParcelMap** | If fetch fails → show overlay: "Failed to load parcels. [Retry]" |
| **ParcelForm** | Inline field errors below each input. Geometry errors below the map. |
| **Sidebar (detail)** | If parcel fetch fails → "Unable to load parcel details. [Retry]" |
| **Buffer Analysis** | If API fails → "Could not perform buffer analysis. Please try again." |
| **Import Modal** | Show per-feature errors in `ImportResults` component after import. |
| **Stats Modal** | If aggregate fetch fails → "Unable to load statistics." |

---

## 10. Edge Cases Handling

### API Failures

| Case | Handling |
|------|----------|
| **Backend not running** | Axios network error interceptor fires → toast: "Cannot connect to server." Map shows empty state with "Add Parcel" prompt. |
| **Backend returns 500** | Generic error toast. Form stays open. User can retry. |
| **Malformed response** | React Query `onError` catches parsing errors → show error state. |
| **Slow response (>5s)** | Show loading spinner. After 15s, Axios timeout fires. |

### Empty Data

| Case | Handling |
|------|----------|
| **No parcels in database** | Map shows empty state: centered message "No parcels yet. Click 'Add' to create one." with a call-to-action button. |
| **No parcels match filter** | Status bar shows "0 parcels match the current filters." Map clears all polygons. |
| **Buffer analysis returns no nearby parcels** | Draw buffer circle, show sidebar message: "No parcels found within X meters." |

### Invalid Input

| Case | Handling |
|------|----------|
| **Coordinates out of range** | Zod validation catches before submit → inline error: "Longitude must be between -180 and 180." |
| **Polygon with < 4 coordinates** | leaflet-draw prevents this by requiring closed polygon. If somehow bypassed → Zod validation error. |
| **Non-Polygon geometry type** | Zod catches `type !== 'Polygon'` → error: "Only Polygon geometry is supported." |
| **Negative price** | Zod `min(0)` → error: "Price cannot be negative." |
| **Owner name > 255 chars** | Zod `max(255)` → error: "Owner name must be at most 255 characters." |

### Partial Updates

| Case | Handling |
|------|----------|
| **Update only `price_per_sqm`** | Form sends only changed fields (React Hook Form's `formState.dirtyFields`). Backend accepts partial `PATCH`. |
| **Update `price_per_sqm` to `null`** | Form sends `{ price_per_sqm: null }`. Backend accepts (nullable rule). |
| **Update only geometry** | Form sends only `geometry` field. Backend recalculates centroid and area. Map re-renders the polygon. |

### Pagination

| Case | Handling |
|------|----------|
| **More than 20 parcels** | Status bar shows pagination controls: "Page 1 of 5 | ← Prev Next →". Only current page's parcels are on map. |
| **User changes page** | `per_page` and `page` params update → React Query refetches → map updates. |
| **Last page with few items** | Standard pagination — last page shows remaining items. |

### Concurrent Edits

| Case | Handling |
|------|----------|
| **Two users edit same parcel** | No locking (backend has no optimistic locking). Last write wins. Acceptable for portfolio/demo. |
| **Parcel deleted while being viewed** | Sidebar shows "Parcel not found" → closes sidebar automatically. |

### File Import Edge Cases

| Case | Handling |
|------|----------|
| **File > 100 features** | Zod validation → error: "Cannot import more than 100 features in a single request." |
| **Mixed valid/invalid features** | Backend returns `{ imported: N, errors: [...] }`. `ImportResults` shows which features succeeded and which failed with per-feature error messages. |
| **Non-JSON file uploaded** | `JSON.parse()` fails → show "Invalid file format. Please upload a valid GeoJSON file." |
| **Empty GeoJSON file** | Zod `features.min(1)` → error: "At least one feature is required." |

---

## 11. Missing Backend Requirements

These are items the frontend would benefit from but are **not currently in the backend API**. They are **nice-to-have** and can be addressed later.

| # | Requirement | Impact on Frontend | Suggested Backend Change |
|---|-------------|-------------------|-------------------------|
| M1 | **Authentication** | Currently no auth — anyone can modify data. For portfolio/demo this is fine. For production, add Sanctum token auth. | Add `auth:sanctum` middleware to all routes. Frontend stores token in httpOnly cookie. |
| M2 | **Image/File upload for parcels** | No way to attach photos, documents, or land certificates to a parcel. | Add `POST /api/v1/parcels/{id}/attachments` with multipart form. |
| M3 | **Search by owner name** | No text search endpoint. Users must visually scan the map or list. | Add `GET /api/v1/parcels?search=gading` for fuzzy owner name matching. |
| M4 | **Export parcels as GeoJSON** | No download endpoint. Users can't export the current map view. | Add `GET /api/v1/parcels/export` that returns the current filtered set as a downloadable GeoJSON file. |
| M5 | **Bulk delete** | Deleting 20 parcels one by one is tedious. | Add `DELETE /api/v1/parcels` with `{ ids: [1, 2, 3] }` body. |
| M6 | **WebSocket / real-time updates** | If another user modifies a parcel, the map doesn't update. | Add Laravel Echo + Pusher/Broadcaster. Frontend subscribes to `parcels` channel. |
| M7 | **Parcel area included in list response** | `area_sqm` is already in the list response properties. **Confirmed: no missing.** | — |
| M8 | **Total area on map** | No endpoint for total area of all currently visible (filtered) parcels. | Could be computed from the list response's features. Or add a dedicated endpoint. |

### Frontend Decisions for Missing Items

- **M1 (Auth):** Skip for now. Add a note in the README that auth is not implemented. If needed later, add Laravel Sanctum + login page.
- **M3 (Search):** Not blocking. Can be added as a client-side filter on the loaded parcels if dataset is small (< 200).
- **M4 (Export):** Easy to implement client-side — just stringify the current `features` array to a Blob and trigger download. No backend change needed.
- **M5 (Bulk delete):** Skip. Nice to have for future iteration.

---

## 12. Implementation Roadmap

### Phase 1: Foundation (Day 1–2)

| Step | Task | Deliverable |
|------|------|-------------|
| 1.1 | Initialize React project with Vite + TypeScript template | Scaffolded project with `tsconfig.json`, `vite.config.ts` |
| 1.2 | Install dependencies: `axios`, `leaflet`, `react-leaflet`, `react-leaflet-draw`, `@tanstack/react-query`, `react-hook-form`, `@hookform/resolvers`, `zod`, `react-hot-toast`, `@types/leaflet`, `@types/geojson` | `package.json` updated |
| 1.3 | Configure Tailwind CSS 4 (already in backend) | `tailwind.config.js`, `index.css` with Tailwind directives |
| 1.4 | Create Axios client with interceptors | `src/api/client.ts` with error handling |
| 1.5 | Define TypeScript types for API responses | `src/types/parcel.ts`, `src/types/api.ts`, `src/types/geojson.d.ts` |
| 1.6 | Define Zod schemas for validation | `src/schemas/parcel.ts`, `src/schemas/geometry.ts`, `src/schemas/buffer.ts` |
| 1.7 | Create utility functions | `src/utils/geometry.ts`, `src/utils/colors.ts`, `src/utils/formatters.ts`, `src/utils/constants.ts` |
| 1.8 | Set up React Query provider | `src/providers/QueryProvider.tsx` with query client config |
| 1.9 | Create base layout components | `Header.tsx`, `StatusBar.tsx`, `AppLayout.tsx` (static UI, no data yet) |

### Phase 2: Map Core (Day 3–4)

| Step | Task | Deliverable |
|------|------|-------------|
| 2.1 | Create `ParcelMap.tsx` with Leaflet + react-leaflet | Full-screen map with OSM tiles |
| 2.2 | Create `ParcelLayer.tsx` to render parcel polygons | Polygons with color coding by status |
| 2.3 | Create `ParcelMarker.tsx` with click handler | Click → set `?selected={id}` in URL |
| 2.4 | Create React Query hooks for parcels | `useParcels.ts`, `useParcel.ts` |
| 2.5 | Connect parcel list fetch to map | `ParcelMap` calls `useParcels()` → renders features |
| 2.6 | Create `StatusBadge.tsx` and `ParcelCard.tsx` | Reusable UI components |
| 2.7 | Create `ParcelDetail.tsx` sidebar view | Read-only detail view when parcel is selected |
| 2.8 | Implement URL param synchronization | `useMapFilters.ts` hook for `?selected`, `?status`, `?bbox` |
| 2.9 | Add loading and empty states | Skeleton overlay for loading, empty state message |

### Phase 3: CRUD Operations (Day 5–6)

| Step | Task | Deliverable |
|------|------|-------------|
| 3.1 | Create `ParcelForm.tsx` (shared create/edit) | Form with owner_name, status, price fields |
| 3.2 | Integrate `leaflet-draw` for polygon drawing | `DrawControl.tsx` → captures GeoJSON geometry |
| 3.3 | Wire form submission to API | `useCreateParcel.ts` mutation |
| 3.4 | Implement field error mapping from 422 responses | Inline error display below form fields |
| 3.5 | Create edit flow in sidebar | "Edit" button → form pre-filled → PATCH |
| 3.6 | Implement delete with confirmation | `useDeleteParcel.ts` mutation + confirm dialog |
| 3.7 | Add cache invalidation after mutations | `queryClient.invalidateQueries()` on create/update/delete |
| 3.8 | Add success/error toasts | `react-hot-toast` integration on mutation outcomes |
| 3.9 | Test full CRUD cycle manually | Create → View → Edit → Delete → Verify on map |

### Phase 4: Spatial Analysis (Day 7)

| Step | Task | Deliverable |
|------|------|-------------|
| 4.1 | Create `BufferCircle.tsx` component | Visual radius circle on map |
| 4.2 | Create `BufferAnalysisForm.tsx` | Distance input + point picker |
| 4.3 | Implement buffer from parcel | `GET /api/v1/parcels/{id}/buffer` → highlight results |
| 4.4 | Implement buffer from arbitrary point | `POST /api/v1/analysis/buffer` → visualize results |
| 4.5 | Create bounding box draw tool | `BoundingBoxLayer.tsx` → draw bbox → filter parcels |
| 4.6 | Connect bbox filter to parcel list | `?bbox=` query param triggers refetch |
| 4.7 | Add status filter dropdown in header | `?status=` query param → refetch |

### Phase 5: Import & Statistics (Day 8)

| Step | Task | Deliverable |
|------|------|-------------|
| 5.1 | Create `ImportModal.tsx` with drag-drop | File upload UI |
| 5.2 | Implement file reading and JSON parsing | `FileReader` API → validate structure |
| 5.3 | Wire import to API | `useImportParcels.ts` mutation → `POST /api/v1/parcels/import` |
| 5.4 | Create `ImportResults.tsx` component | Show imported count + per-feature errors |
| 5.5 | Create `AreaStats.tsx` for aggregate data | `useAggregateArea.ts` → bar chart or table |
| 5.6 | Add stats modal trigger in header | "Stats" button → open modal |
| 5.7 | Create `useParcelArea.ts` hook | `GET /api/v1/parcels/{id}/area` → display in sidebar |

### Phase 6: Polish & Production Readiness (Day 9–10)

| Step | Task | Deliverable |
|------|------|-------------|
| 6.1 | Responsive design audit | Ensure sidebar, modals, forms work on tablet/mobile |
| 6.2 | Pagination UI in status bar | Page controls → update `?page=` and `?per_page=` |
| 6.3 | Error boundary wrapper | `React.ErrorBoundary` around map and sidebar |
| 6.4 | Performance optimization | `React.memo` on ParcelMarker for large datasets |
| 6.5 | Client-side GeoJSON export | Download current filtered parcels as `.geojson` file |
| 6.6 | Environment configuration | `.env` with `VITE_API_URL` |
| 6.7 | Build and verify | `npm run build` → no errors |
| 6.8 | End-to-end manual testing | Test all 8 user flows (F1–F8) |
| 6.9 | README documentation | Setup, run, build, deploy instructions |

---

## Appendix A: Status Color Mapping

| Status | Color | Hex | Rationale |
|--------|-------|-----|-----------|
| `free` | Green | `#22c55e` | Available for acquisition — positive/go |
| `negotiating` | Yellow | `#eab308` | In progress — caution/active |
| `target` | Red | `#ef4444` | Priority target — attention needed |

Buffer analysis results use a **blue highlight** (`#3b82f6`) to distinguish from status colors.

---

## Appendix B: Default Map Configuration

```typescript
const MAP_CONFIG = {
  defaultCenter: [-6.2550, 106.6160] as [number, number], // Gading Serpong, Tangerang
  defaultZoom: 15,
  tileLayer: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  tileAttribution: '© OpenStreetMap contributors',
  polygonStyle: {
    free: { color: '#22c55e', weight: 2, fillOpacity: 0.3 },
    negotiating: { color: '#eab308', weight: 2, fillOpacity: 0.3 },
    target: { color: '#ef4444', weight: 2, fillOpacity: 0.3 },
  },
  selectedStyle: { weight: 4, fillOpacity: 0.5 },
  bufferStyle: { color: '#3b82f6', weight: 2, fillOpacity: 0.1, dashArray: '5, 5' },
};
```

---

## Appendix C: Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_API_URL` | Yes (development) | `http://localhost:8000` | Backend API base URL |

No other environment variables are needed. Map tiles use OpenStreetMap (no API key). No analytics, no third-party services.

---

## Appendix D: Key Constraints & Trade-offs

| Decision | Trade-off | Justification |
|----------|-----------|---------------|
| **No client-side caching beyond React Query** | Map re-renders all parcels on every refetch | Acceptable for < 500 parcels. If dataset grows, add vector tiles. |
| **No routing library** | All state in URL params | Single-page app — routing is unnecessary complexity. |
| **No authentication** | Anyone can modify data | Portfolio/demo project. Auth can be added later with Sanctum. |
| **No optimistic updates for create** | User waits for API response before seeing new parcel | Simpler rollback logic. Acceptable for demo speed. |
| **Optimistic delete** | Parcel removed instantly, rolled back on error | Delete is irreversible anyway — better UX to remove immediately. |
| **Leaflet over Mapbox** | Less performant for very large datasets | Free, no API key, sufficient for portfolio-scale data (< 500 parcels). |
| **No unit/integration tests in Phase 1** | Potential regression risk | Focus on shipping a working demo. Add tests in Phase 2 iteration. |

---

*End of Frontend Architecture & Implementation Plan.*



context:


Karena kita pakai stack Laravel (Backend) + React (Frontend), kita bakal pakai kombinasi "The Free Trio" yang paling stabil buat demo:1. Database: Aiven (MySQL Free Tier)Lu butuh database yang mendukung spatial data dan bisa diakses secara online oleh backend lu.Kenapa: Aiven punya free tier buat MySQL yang sudah mendukung fitur spatial (koordinat).Cara: Daftar di aiven.io, buat instance MySQL gratis, lalu simpan datanya buat di-input ke .env Laravel lu.2. Backend: Render (Laravel)Render adalah pilihan gratisan terbaik buat hosting aplikasi PHP/Laravel saat ini.Kenapa: Gratis, gampang konek ke GitHub, dan proses deploy-nya otomatis.Catatan: Karena gratisan, kalau aplikasinya nggak dibuka dalam waktu lama, dia bakal "tidur" (spin down). Jadi pas mau interview, pastikan lu buka dulu link-nya 1 menit sebelum mulai biar dia "bangun".3. Frontend: Vercel (React)Buat urusan frontend React, nggak ada yang ngalahin Vercel.Kenapa: Sangat cepat, gratis selamanya (buat personal), dan langsung dapet HTTPS (biar kelihatan aman).Cara: Cukup push folder frontend lu ke GitHub, lalu import di Vercel.🛠️ Rangkuman Skema Deployment GratisanKomponenPlatformPeranFrontendVercelNampilin peta Leaflet.js dan UI Dashboard lu.BackendRenderAPI Laravel buat ambil data koordinat lahan.DatabaseAivenSimpan tabel dengan tipe data POLYGON dan POINT.💡 Tips Biar "Kelihatan" Mahal (Walau Gratisan)Gunakan Custom Subdomain: Kalau lu punya domain sendiri, pasang aja. Kalau nggak, nama di Vercel/Render-nya dibuat keren, misal: geo-acquire-paramount.vercel.app.Seeding Data: Jangan biarkan peta lu kosong pas dibuka. Pakai fitur Seeder di Laravel buat masukin sekitar 10-20 titik lahan dummy di area Gading Serpong (biar relevan sama Paramount).HTTPS: Semua platform di atas otomatis kasih SSL (HTTPS). Ini penting karena beberapa browser bakal blokir fitur lokasi/peta kalau aplikasinya cuma HTTP biasa.Saran gue:Eksekusi di Render seringkali butuh sedikit konfigurasi di file Dockerfile atau setting build command. Kalau lu udah siap mau deploy, kasih tau gue, nanti gue bantu buatin command build yang pas buat Laravel 11 lu biar nggak error pas di-upload.



Ini ide *project portfolio* yang dijamin bakal bikin HRD dan *User* di Paramount Enterprise (perusahaan properti) langsung mikir, *"Wah, anak ini paham bisnis kita nih!"*

Karena mereka fokusnya di pengembangan kota terpadu dan pembebasan lahan (Land Acquisition), lu harus bikin aplikasi yang nyelesaiin masalah itu. 

### Nama Project: **GeoAcquire** (Land Acquisition & Spatial Analysis Dashboard)

**Deskripsi Singkat:** 
Sebuah *web app* untuk memetakan, mengelola, dan menganalisis status pembebasan lahan secara visual. Sistem ini mengubah data tabular menjadi peta interaktif untuk membantu divisi pengadaan lahan mengambil keputusan lebih cepat.

---

### 💡 Core Features (Fitur Utama)

1.  **Interactive Land Map (Peta Interaktif):**
    *   Menampilkan poligon (bentuk tanah) di atas peta dasar (Google Maps/OpenStreetMap).
    *   *Color-coding* otomatis: Hijau (Sudah Dibebaskan), Kuning (Sedang Nego), Merah (Target Belum Disentuh).
2.  **Spatial Data Analysis (Analisis Spasial):**
    *   Fitur menghitung total luas area (dalam meter persegi) secara otomatis berdasarkan bentuk poligon yang digambar atau di-*upload*.
    *   **Buffer Zone Analysis:** Fitur untuk mencari "Tampilkan semua lahan yang jaraknya maksimal 500 meter dari rencana jalan tol."
3.  **GeoJSON Import/Export via Python:**
    *   Fitur di mana *user* bisa *upload* data peta (*Shapefile/GeoJSON*) yang biasa dipakai orang *Engineer*, lalu di-*parsing* masuk ke *database* MySQL.

---

### 🛠️ Tech Stack (Disesuaikan sama keahlian lu)

*   **Backend:** PHP (Laravel 11). Lu bikin REST API yang *return* datanya berbentuk GeoJSON, bukan JSON biasa.
*   **Database:** MySQL 8.0. Pakai tipe data `POLYGON` untuk simpan bentuk tanah dan `POINT` untuk titik kordinat. Jangan lupa set *Spatial Index* biar *query* pencarian lokasinya ngebut.
*   **Frontend:** React 18 + Tailwind CSS. 
*   **GIS Library (Wajib masukin ini!):** **Leaflet.js** atau **Mapbox GL JS** di dalam React lu. Ini *library* JS standar industri buat nampilin peta.
*   **Data Processing:** Python (GeoPandas). Lu bikin satu *script* kecil pakai Python buat ngebaca file peta (*GeoJSON*), ngecek validitas koordinatnya, lalu *push* ke *database*. Ini membuktikan lu paham poin *"Python for Data Analysis"*.

---

### 🚀 Cara Eksekusi pake VS Code & Claude Code

Lu bisa kerjain ini cepat kalau lu manfaatin AI dengan *prompt* yang tepat. 

1.  **Minta Data Dummy ke Claude:** *"Claude, generate a GeoJSON file containing 5 contiguous land parcels in Gading Serpong, with properties: owner_name, status, and price_per_sqm."*
2.  **Bikin Backend:** Suruh Claude buatin *Migration* Laravel pakai kolom spasial dan buatin *Controller* yang nge-query lahan berdasarkan jarak (*ST_Distance* di MySQL).
3.  **Bikin Frontend:** Minta tolong Claude implementasiin `react-leaflet` buat nge-render data dari API lu ke bentuk poligon berwana di atas peta.

Kalau lu cantumin *project* ini di CV, lu udah nge-cover syarat: **PHP, Python, JS, Database Modeling, Geospatial Data, dan Land Acquisition**. Gila nggak tuh?


