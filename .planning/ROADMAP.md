# GeoAcquire Frontend — Roadmap

**Created:** 2026-04-11
**Granularity:** Standard
**Coverage:** 38/38 v1 requirements mapped

## Phases

- [x] **Phase 1: Foundation** - Project setup, dependencies, base layout, and core infrastructure (Completed: 2026-04-12)
- [x] **Phase 2: Map Core** - Interactive Leaflet map with parcel rendering and sidebar (Completed: 2026-04-12)
- [ ] **Phase 3: CRUD Operations** - Create, edit, view, and delete parcels with forms
- [ ] **Phase 4: Spatial Analysis** - Buffer analysis and bounding box filtering
- [ ] **Phase 5: Import & Statistics** - GeoJSON import and area statistics dashboard
- [ ] **Phase 6: Polish & Production** - Responsive design, pagination, and error handling

## Phase Details

### Phase 1: Foundation

**Goal**: Project infrastructure ready for development with all dependencies configured and type-safe API client.

**Depends on**: Nothing (first phase)

**Requirements**: FND-01, FND-02, FND-03, FND-04, FND-05, FND-06, FND-07, FND-08

**Success Criteria** (what must be TRUE):
1. Project builds and runs with `npm run dev` showing a blank white page
2. TypeScript compiles without errors using strict mode
3. Tailwind classes are processed and applied to test elements
4. Axios can successfully fetch from the backend API with proper error handling
5. React Query cache strategy prevents unnecessary refetches on window focus

**Plans**: 5 plans complete

---

### Phase 2: Map Core

**Goal**: Interactive map displays parcels as colored polygons with clickable interactions and responsive layout.

**Depends on**: Phase 1

**Requirements**: MAP-01, MAP-02, MAP-03, MAP-04, MAP-05, MAP-06, MAP-07

**Success Criteria** (what must be TRUE):
1. User sees a full-screen map with OpenStreetMap tiles loading
2. Parcels appear as colored polygons (green/yellow/red) based on status
3. Clicking a polygon opens sidebar showing parcel details
4. Header contains buttons for filters, import, stats, and add parcel
5. Status bar shows total parcel count and pagination controls
6. Loading skeleton appears on initial load, empty state shows when no parcels exist

**Plans**: 5 plans

- [x] 02-01-PLAN.md — Install lucide-react, import Leaflet CSS, create test utilities, build LoadingSkeleton and EmptyState components
- [x] 02-02-PLAN.md — Create useParcels React Query hook and MapHeader component with action buttons
- [x] 02-03-PLAN.md — Create MapView with Leaflet MapContainer, ParcelLayer with GeoJSON rendering, and MapStatusBar
- [x] 02-04-PLAN.md — Create ParcelSidebar with slide-in animation for parcel details
- [x] 02-05-PLAN.md — Wire all components in App.tsx with full-screen layout

**UI hint**: yes

---

### Phase 3: CRUD Operations

**Goal**: Users can create, view, edit, and delete parcels through both map interactions and form inputs.

**Depends on**: Phase 2

**Requirements**: CRUD-01, CRUD-02, CRUD-03, CRUD-04, CRUD-05, CRUD-06, CRUD-07, CRUD-08, CRUD-09

**Success Criteria** (what must be TRUE):
1. User can draw a polygon on map to create a new parcel
2. User can fill a form with owner name, status, and price to create parcel
3. User can view complete parcel details in sidebar after clicking
4. User can edit both parcel fields and geometry polygon
5. User can delete parcel with confirmation dialog
6. Form shows inline errors for invalid inputs matching backend rules
7. Toast notifications appear for successful and failed operations
8. Map refreshes automatically after any create/update/delete operation

**Plans**: 8 plans

- [x] 03-00-PLAN.md — Wave 0: Test infrastructure setup (all test stubs)
- [x] 03-01-PLAN.md — Form validation and API error handling (CRUD-06, CRUD-07)
- [x] 03-02-PLAN.md — FormField and ParcelForm components (CRUD-02)
- [x] 03-03-PLAN.md — useCreateParcel hook and DrawingHandler (CRUD-01, CRUD-08, CRUD-09)
- [x] 03-04-PLAN.md — DrawingPreview and MapView drawing integration (CRUD-01)
- [ ] 03-05-PLAN.md — ParcelSidebar view/edit/create modes (CRUD-03, CRUD-04)
- [ ] 03-06-PLAN.md — useUpdateParcel, useDeleteParcel hooks and DeleteConfirmModal (CRUD-04, CRUD-05, CRUD-08, CRUD-09)
- [ ] 03-07-PLAN.md — DrawingToolbar and App-level workflow integration (CRUD-01, CRUD-03, CRUD-04, CRUD-05)

**UI hint**: yes

---

### Phase 4: Spatial Analysis

**Goal**: Users can filter parcels by status and bounding box, plus perform buffer analysis to find nearby parcels.

**Depends on**: Phase 3

**Requirements**: FLT-01, FLT-02, FLT-03, FLT-04, FLT-05, ANA-01, ANA-02, ANA-03, ANA-04, ANA-05, ANA-06

**Success Criteria** (what must be TRUE):
1. User can filter parcels by clicking status buttons (free/negotiating/target)
2. User can draw a bounding box on map to show only parcels within
3. URL updates with ?status, ?bbox, and ?selected parameters
4. Opening a shared URL restores the exact filter and selection state
5. Clear filters button resets map to show all parcels
6. User can click buffer button to see parcels within radius of selected parcel
7. User can click anywhere on map to perform buffer analysis from that point
8. Buffer distance input accepts 1-10000 meters with 500 as default
9. Buffer radius appears as a circle on the map
10. Parcels within buffer are highlighted in blue
11. Sidebar shows count of parcels found within buffer

**Plans**: TBD
**UI hint**: yes

---

### Phase 5: Import & Statistics

**Goal**: Users can bulk import parcels from GeoJSON files and view aggregate area statistics by status.

**Depends on**: Phase 4

**Requirements**: IMP-01, IMP-02, IMP-03, IMP-04, STAT-01, STAT-02, STAT-03

**Success Criteria** (what must be TRUE):
1. User can upload a GeoJSON file via import dialog
2. Import rejects invalid files with error message
3. Import shows summary of successful and failed feature imports
4. User can export currently filtered parcels as GeoJSON file
5. User can click stats button to see modal with area totals
6. Stats modal shows area in both square meters and hectares
7. Stats are broken down by parcel status (free/negotiating/target)

**Plans**: TBD
**UI hint**: yes

---

### Phase 6: Polish & Production

**Goal**: Application is production-ready with responsive design, robust error handling, and smooth user experience.

**Depends on**: Phase 5

**Requirements**: (Polish items — responsive design, edge cases, accessibility)

**Success Criteria** (what must be TRUE):
1. Layout adapts to mobile screens with collapsible sidebar
2. All buttons have proper hover and focus states
3. Network errors show user-friendly messages with retry options
4. Page loads show progressive loading states
5. Application works on major browsers (Chrome, Firefox, Safari)
6. Keyboard navigation works for all interactive elements
7. Color contrast meets accessibility standards

**Plans**: TBD
**UI hint**: yes

---

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 5/5 | Complete | 2026-04-12 |
| 2. Map Core | 5/5 | Complete | 2026-04-12 |
| 3. CRUD Operations | 4/8 | In Progress|  |
| 4. Spatial Analysis | 0/5 | Not started | - |
| 5. Import & Statistics | 0/4 | Not started | - |
| 6. Polish & Production | 0/4 | Not started | - |

---

## Requirement Coverage

| Category | Requirements | Phase |
|----------|--------------|-------|
| Foundation | FND-01 through FND-08 (8) | Phase 1 |
| Map & Layout | MAP-01 through MAP-07 (7) | Phase 2 |
| Parcel CRUD | CRUD-01 through CRUD-09 (9) | Phase 3 |
| Filtering & Search | FLT-01 through FLT-05 (5) | Phase 4 |
| Spatial Analysis | ANA-01 through ANA-06 (6) | Phase 4 |
| Import & Export | IMP-01 through IMP-04 (4) | Phase 5 |
| Statistics | STAT-01 through STAT-03 (3) | Phase 5 |
| **Total v1** | **38 requirements** | **6 phases** |

**Coverage: 38/38 (100%)**

---

*Last updated: 2026-04-12*
