# Requirements: GeoAcquire Frontend

**Defined:** 2026-04-11
**Core Value:** Users can visualize, manage, and analyze land parcels through an interactive map with color-coded status indicators and spatial tools.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Foundation

- [ ] **FND-01**: Project initialized with React 18 + TypeScript + Vite
- [ ] **FND-02**: Dependencies installed (axios, leaflet, react-leaflet, @tanstack/react-query, react-hook-form, zod, react-hot-toast)
- [ ] **FND-03**: Tailwind CSS 4 configured
- [ ] **FND-04**: Axios client with base URL and error interceptors
- [ ] **FND-05**: TypeScript types defined for API responses (parcel, geojson, api)
- [ ] **FND-06**: Zod schemas for validation (parcel, geometry, buffer)
- [ ] **FND-07**: React Query provider configured with cache strategy
- [ ] **FND-08**: Utility functions (geometry, colors, formatters, constants)

### Map & Layout

- [ ] **MAP-01**: Full-screen Leaflet map with OpenStreetMap tiles
- [ ] **MAP-02**: Parcels rendered as colored polygons (green=free, yellow=negotiating, red=target)
- [ ] **MAP-03**: Parcel click handler opens sidebar with details
- [ ] **MAP-04**: Header bar with logo, filters, import, stats, and add parcel buttons
- [ ] **MAP-05**: Status bar with pagination controls and parcel count
- [ ] **MAP-06**: Loading skeleton overlay on initial map load
- [ ] **MAP-07**: Empty state message when no parcels exist

### Parcel CRUD

- [x] **CRUD-01**: User can create parcel by drawing polygon on map
- [x] **CRUD-02**: User can create parcel by filling form (owner_name, status, price_per_sqm)
- [ ] **CRUD-03**: User can view parcel details in sidebar when clicked
- [ ] **CRUD-04**: User can edit parcel fields and geometry
- [ ] **CRUD-05**: User can delete parcel with confirmation dialog
- [x] **CRUD-06**: Form validation mirrors backend rules (Zod)
- [ ] **CRUD-07**: Backend 422 errors mapped to form fields inline
- [x] **CRUD-08**: Success/error toasts on mutation outcomes
- [x] **CRUD-09**: Cache invalidation after create/update/delete

### Filtering & Search

- [ ] **FLT-01**: User can filter parcels by status (free/negotiating/target)
- [ ] **FLT-02**: User can draw bounding box to filter parcels within
- [ ] **FLT-03**: URL search params sync (?status, ?bbox, ?selected)
- [ ] **FLT-04**: Shareable links work via URL params
- [ ] **FLT-05**: Clear filters resets to show all parcels

### Spatial Analysis

- [ ] **ANA-01**: User can perform buffer analysis from selected parcel
- [ ] **ANA-02**: User can perform buffer analysis from arbitrary point on map
- [ ] **ANA-03**: Buffer distance input (1-10000 meters, default 500)
- [ ] **ANA-04**: Buffer radius circle visualized on map
- [ ] **ANA-05**: Nearby parcels highlighted in blue
- [ ] **ANA-06**: Buffer results count shown in sidebar

### Import & Export

- [ ] **IMP-01**: User can upload GeoJSON FeatureCollection file
- [ ] **IMP-02**: Import validates file structure (max 100 features)
- [ ] **IMP-03**: Import shows success/error summary per feature
- [ ] **IMP-04**: User can export current filtered parcels as GeoJSON file

### Statistics

- [ ] **STAT-01**: User can view aggregate area totals by status
- [ ] **STAT-02**: Area displayed in both sqm and hectares
- [ ] **STAT-03**: Stats modal accessible from header button

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Authentication

- **AUTH-01**: User can log in with email/password
- **AUTH-02**: User session persists across browser refresh
- **AUTH-03**: Protected routes require authentication

### Additional Features

- **SRCH-01**: User can search parcels by owner name (requires backend API addition)
- **ATTACH-01**: User can upload photos/documents to parcels
- **BULK-01**: User can delete multiple parcels at once
- **REAL-01**: Map updates in real-time when other users modify data

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Authentication | Portfolio/demo project — can add Laravel Sanctum later |
| Mobile native app | Web-first, mobile responsive only |
| Real-time updates | No WebSocket planned for v1 |
| File attachments | Not in backend API v1 |
| Bulk delete | Not in backend API v1 |
| Owner name search | Not in backend API v1 |
| Routing library | Single-page app — URL params sufficient |
| Redux/Zustand | React Query handles all server state |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| FND-01 | Phase 1 | Pending |
| FND-02 | Phase 1 | Pending |
| FND-03 | Phase 1 | Pending |
| FND-04 | Phase 1 | Pending |
| FND-05 | Phase 1 | Pending |
| FND-06 | Phase 1 | Pending |
| FND-07 | Phase 1 | Pending |
| FND-08 | Phase 1 | Pending |
| MAP-01 | Phase 2 | Pending |
| MAP-02 | Phase 2 | Pending |
| MAP-03 | Phase 2 | Pending |
| MAP-04 | Phase 2 | Pending |
| MAP-05 | Phase 2 | Pending |
| MAP-06 | Phase 2 | Pending |
| MAP-07 | Phase 2 | Pending |
| CRUD-01 | Phase 3 | Complete |
| CRUD-02 | Phase 3 | Complete |
| CRUD-03 | Phase 3 | Pending |
| CRUD-04 | Phase 3 | Pending |
| CRUD-05 | Phase 3 | Pending |
| CRUD-06 | Phase 3 | Complete |
| CRUD-07 | Phase 3 | Pending |
| CRUD-08 | Phase 3 | Complete |
| CRUD-09 | Phase 3 | Complete |
| FLT-01 | Phase 4 | Pending |
| FLT-02 | Phase 4 | Pending |
| FLT-03 | Phase 4 | Pending |
| FLT-04 | Phase 4 | Pending |
| FLT-05 | Phase 4 | Pending |
| ANA-01 | Phase 4 | Pending |
| ANA-02 | Phase 4 | Pending |
| ANA-03 | Phase 4 | Pending |
| ANA-04 | Phase 4 | Pending |
| ANA-05 | Phase 4 | Pending |
| ANA-06 | Phase 4 | Pending |
| IMP-01 | Phase 5 | Pending |
| IMP-02 | Phase 5 | Pending |
| IMP-03 | Phase 5 | Pending |
| IMP-04 | Phase 5 | Pending |
| STAT-01 | Phase 5 | Pending |
| STAT-02 | Phase 5 | Pending |
| STAT-03 | Phase 5 | Pending |

**Coverage:**
- v1 requirements: 38 total
- Mapped to phases: 38 (100%)
- Unmapped: 0

---
*Requirements defined: 2026-04-11*
*Last updated: 2026-04-11 after roadmap creation*
