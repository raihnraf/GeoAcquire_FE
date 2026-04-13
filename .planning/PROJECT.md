# GeoAcquire — Frontend

## What This Is

A standalone React SPA for visualizing and managing land parcels on an interactive map. The frontend connects to a Laravel 12 REST API to provide parcel CRUD operations, spatial analysis (buffer zones, bounding box queries), and bulk GeoJSON import for Paramount Enterprise's land acquisition workflow.

## Core Value

Users can visualize, manage, and analyze land parcels through an interactive map with color-coded status indicators and spatial tools.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Interactive map displaying all parcels as colored polygons (Leaflet + OSM)
- [ ] Parcel CRUD operations (create, view, edit, delete)
- [ ] Filter parcels by status (free/negotiating/target) or bounding box
- [ ] Buffer zone analysis from parcel or arbitrary point
- [x] Bulk GeoJSON import (up to 100 parcels)
- [x] Area statistics dashboard (aggregate by status)
- [x] Export filtered parcels as GeoJSON file
- [ ] URL-based state management for shareable links

### Out of Scope

- [Authentication] — Portfolio/demo project, no auth planned
- [Mobile app] — Web-first, mobile responsive only
- [Real-time updates] — No WebSocket planned for v1
- [File attachments] — No image/document upload for parcels
- [Bulk delete] — Delete one at a time only
- [Search by owner name] — Not in backend API v1

## Context

**Organization:** Paramount Enterprise — property development company focused on land acquisition and integrated city development.

**Technical Environment:**
- Backend: Laravel 12 REST API at `/api/v1` (separate repository)
- Database: MySQL with spatial data types (POLYGON, POINT)
- Deployment: Vercel (frontend) + Render (backend) + Aiven (database)

**Project Type:** Portfolio/demo project demonstrating full-stack geospatial application skills.

**Known Constraints:**
- Backend API already exists with 10 endpoints documented in plan.md
- No authentication — public access to all operations
- Backend uses GeoJSON FeatureCollection response format
- Spatial index enabled on database for performant queries

## Constraints

- **Tech Stack**: React 18 + TypeScript + Vite — Required by project spec
- **Map Library**: Leaflet + react-leaflet — No API key needed (unlike Mapbox)
- **State Management**: React Query (TanStack Query) — No Redux/Zustand
- **Styling**: Tailwind CSS 4.x — Already configured
- **Form Validation**: Must mirror backend Laravel rules (Zod schemas)
- **Deployment Target**: Vercel (frontend) — Free tier portfolio hosting

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| React Query over Redux | Server-state dominated app, React Query handles caching/deduplication | — Pending |
| URL params for filters | Shareable links, no routing library needed | — Pending |
| Leaflet over Mapbox | Free, no API key required for portfolio demo | — Pending |
| TypeScript strict mode | GeoJSON coordinate order bugs (lng/lat swap) are common in GIS | — Pending |
| No authentication | Portfolio/demo project — can add Sanctum later if needed | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-11 after initialization*
