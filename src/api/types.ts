import type { FeatureCollection, Feature, Polygon, Point } from 'geojson'

// Parcel status enum (matches backend)
export type ParcelStatus = 'free' | 'negotiating' | 'target'

// Parcel properties (matches Laravel Parcel model)
export interface ParcelProperties {
  id: number
  owner_name: string
  status: ParcelStatus
  price_per_sqm: number | null
  area_sqm: number
  created_at: string
  updated_at: string
  [key: string]: any // Allow additional GeoJSON properties
}

// GeoJSON Feature for a single parcel
export type ParcelFeature = Feature<Polygon, ParcelProperties>

// GeoJSON FeatureCollection for parcel lists
export type ParcelCollection = FeatureCollection<Polygon, ParcelProperties>

// Pagination metadata (returned in ParcelCollection.metadata when paginated)
export interface ParcelCollectionMetadata {
  total: number
  current_page?: number
  per_page?: number
  last_page?: number
  links?: {
    first?: string
    last?: string
    prev?: string | null
    next?: string | null
  }
}

// Extended ParcelCollection with metadata (for paginated responses)
export interface PaginatedParcelCollection extends ParcelCollection {
  metadata?: ParcelCollectionMetadata
}

// Buffer analysis result (point + nearby parcels)
export interface BufferPoint extends Point {
  coordinates: [number, number] // [lng, lat] per GeoJSON spec
}

export interface BufferResult {
  type: 'FeatureCollection'
  features: ParcelFeature[]
  metadata?: {
    total: number
  }
  center?: BufferPoint
  radius?: number
  parcels?: ParcelCollection
}

// Generic API response wrapper
export interface ApiResponse<T> {
  data: T
  message?: string
  errors?: Record<string, string>
}

// Paginated response (for parcel list)
export interface PaginatedResponse<T> {
  data: T
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
  links?: {
    first?: string
    last?: string
    prev?: string | null
    next?: string | null
  }
}

// Import result for GeoJSON bulk upload
export interface ImportResult {
  success: number
  failed: number
  errors?: Array<{
    feature: number
    message: string
  }>
}

// Parcel count response (lightweight endpoint for StatsModal)
export interface ParcelCountResponse {
  total: number
  by_status: Record<ParcelStatus, number>
}

// Form data types (re-exported from zod for consistency)
export type { ParcelFormData } from '@/lib/zod'
