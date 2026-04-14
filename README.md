# GeoAcquire Frontend

Interactive map-based web application for land acquisition management. View, create, edit, and analyze land parcels with spatial features like buffer analysis and bounding box filtering.

**Live Demo:** [Deploy on Vercel](https://geoacquire-fe.vercel.app) *(update after deploy)*

---

## Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | React 19 + TypeScript |
| **Build Tool** | Vite 6 |
| **Styling** | Tailwind CSS 4 |
| **Map Engine** | Leaflet + react-leaflet |
| **Data Fetching** | TanStack React Query 5 |
| **HTTP Client** | Axios |
| **Form Validation** | React Hook Form + Zod 4 |
| **Testing** | Vitest + Testing Library |
| **Deployment** | Vercel |

---

## Features

- **Interactive Map** — Pan, zoom, and view land parcels rendered as colored polygons on Leaflet
- **Status Filtering** — Filter parcels by status: `free`, `negotiating`, `target`
- **Bounding Box Drawing** — Draw custom areas on the map to filter parcels within bounds
- **Buffer Analysis** — Analyze parcels within a radius of a selected point or parcel
- **CRUD Operations** — Create, edit, and delete parcel records with drawn or manual geometry
- **Import/Export** — Bulk import and export parcels as GeoJSON
- **URL State Sync** — Shareable URLs preserve filters, viewport, and drawing state
- **Performance Optimized** — Debounced viewport queries, zoom-level thresholds, spatial hash caching, and fetch limits

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+
- GeoAcquire Backend API running (Laravel)

### Installation

```bash
# Clone repository
git clone git@github.com:raihnraf/GeoAcquire_FE.git
cd GeoAcquire_FE

# Install dependencies
npm install

# Copy environment file and configure API URL
cp .env.example .env
# Edit .env → set VITE_API_URL to your backend URL
```

### Development

```bash
npm run dev
```

Opens at `http://localhost:5173`. The Vite dev server proxies `/api` requests to `http://localhost:8000`.

### Production Build

```bash
npm run build
npm run preview
```

### Testing

```bash
# Run all tests
npm run test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:all
```

### Linting

```bash
npm run lint
```

---

## Project Structure

```
src/
├── api/                  # API client, types, adapters
│   ├── axios.ts          # Axios instance with interceptors
│   └── types.ts          # TypeScript types for API responses
├── components/map/       # Map-related components
│   ├── MapView.tsx       # Main Leaflet map wrapper
│   ├── ParcelLayer.tsx   # GeoJSON polygon rendering
│   ├── BBoxDrawing.tsx   # Bounding box drawing tool
│   ├── BufferVisualization.tsx  # Buffer analysis overlay
│   ├── ParcelSidebar.tsx # Parcel detail/edit/create sidebar
│   ├── MapHeader.tsx     # Top toolbar with actions
│   ├── MapStatusBar.tsx  # Bottom status/pagination bar
│   └── ...               # Additional UI components
├── hooks/                # Custom React hooks
│   ├── useParcels.ts     # Parcel data fetching (React Query)
│   ├── useCreateParcel.ts
│   ├── useUpdateParcel.ts
│   ├── useDeleteParcel.ts
│   ├── useBufferAnalysis.ts
│   ├── useFilterParams.ts  # URL-synchronized filter state
│   └── useMapMode.ts       # Map mode state machine
├── lib/                  # Utilities
│   ├── utils.ts          # Color helpers, geometry utils
│   ├── queryClient.ts    # React Query configuration
│   └── zod.ts            # Form validation schemas
└── App.tsx               # Root component
```

---

## Configuration

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_API_URL` | **Yes** (production) | `/api/v1` | Backend API base URL |

### Vercel Deployment

Set `VITE_API_URL` in Vercel Dashboard → Settings → Environment Variables:

```
VITE_API_URL=https://your-backend.onrender.com/api/v1
```

### `vercel.json`

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }],
  "headers": [
    { "source": "/assets/(.*)", "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }] },
    { "source": "/(.*)", "headers": [{ "key": "X-Content-Type-Options", "value": "nosniff" }, { "key": "X-Frame-Options", "value": "DENY" }] }
  ]
}
```

---

## Architecture

```
┌──────────────┐      HTTP/JSON       ┌──────────────┐
│  GeoAcquire  │ ──────────────────>   │  GeoAcquire  │
│  Frontend    │  GET/POST/PUT/DELETE  │  Backend     │
│  (Vercel)    │ <──────────────────   │  (Render)    │
│              │   GeoJSON responses   │  (Laravel)   │
└──────────────┘                      └──────────────┘
```

---

## Performance Optimizations

| Optimization | Impact |
|---|---|
| 400ms debounce on map pan/zoom | Prevents API spam during rapid map movement |
| Zoom threshold (min zoom 10 for bbox queries) | Prevents fetching 1000+ parcels when zoomed out |
| Fetch limit (max 250 parcels per bbox query) | Caps payload size |
| Spatial hash caching (2 decimal places, ~1.1km) | Nearby viewport pans hit the same cache entry |

---

## Backend Repository

The Laravel backend is in a separate repository: [GeoAcquire_BE](https://github.com/raihnraf/GeoAcquire_BE)

---

## License

MIT
