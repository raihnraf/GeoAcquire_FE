<!-- GSD:project-start source:PROJECT.md -->
## Project

**GeoAcquire — Frontend**

A standalone React SPA for visualizing and managing land parcels on an interactive map. The frontend connects to a Laravel 12 REST API to provide parcel CRUD operations, spatial analysis (buffer zones, bounding box queries), and bulk GeoJSON import for Paramount Enterprise's land acquisition workflow.

**Core Value:** Users can visualize, manage, and analyze land parcels through an interactive map with color-coded status indicators and spatial tools.

### Constraints

- **Tech Stack**: React 18 + TypeScript + Vite — Required by project spec
- **Map Library**: Leaflet + react-leaflet — No API key needed (unlike Mapbox)
- **State Management**: React Query (TanStack Query) — No Redux/Zustand
- **Styling**: Tailwind CSS 4.x — Already configured
- **Form Validation**: Must mirror backend Laravel rules (Zod schemas)
- **Deployment Target**: Vercel (frontend) — Free tier portfolio hosting
<!-- GSD:project-end -->

<!-- GSD:stack-start source:STACK.md -->
## Technology Stack

Technology stack not yet documented. Will populate after codebase mapping or first phase.
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->
## Project Skills

No project skills found. Add skills to any of: `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, or `.github/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
