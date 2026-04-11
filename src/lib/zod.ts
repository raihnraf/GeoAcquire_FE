import { z } from 'zod'

// Parcel status enum (matches backend)
export const parcelStatusEnum = z.enum(['free', 'negotiating', 'target'], {
  message: 'Status must be free, negotiating, or target',
})

// GeoJSON Polygon coordinate validation
// GeoJSON uses [lng, lat] order per RFC 7946
const coordinateSchema = z.tuple([
  z.number().min(-180).max(180), // longitude
  z.number().min(-90).max(90), // latitude
])

// A ring is a closed polygon (at least 4 points: first == last)
const ringSchema = z.array(coordinateSchema).min(4, {
  message: 'Polygon must have at least 4 coordinates',
})

// GeoJSON Polygon geometry
export const parcelGeometrySchema = z.object({
  type: z.literal('Polygon', {
    message: 'Geometry type must be Polygon',
  }),
  coordinates: z.array(ringSchema).min(1, {
    message: 'Polygon must have at least one ring',
  }),
})

// Parcel form data schema (mirrors Laravel StoreParcelRequest)
export const parcelSchema = z.object({
  owner_name: z
    .string({
      message: 'Owner name is required',
    })
    .min(1, 'Owner name is required')
    .max(255, 'Owner name must not exceed 255 characters')
    .trim(),
  status: parcelStatusEnum,
  price_per_sqm: z
    .number({
      message: 'Price must be a number',
    })
    .min(0, 'Price must be positive')
    .optional(),
  geometry: parcelGeometrySchema,
})

// Buffer analysis request schema
export const bufferRequestSchema = z.object({
  parcel_id: z.number().int().positive().optional(),
  lat: z
    .number({
      message: 'Latitude is required',
    })
    .min(-90, 'Latitude must be between -90 and 90')
    .max(90, 'Latitude must be between -90 and 90'),
  lng: z
    .number({
      message: 'Longitude is required',
    })
    .min(-180, 'Longitude must be between -180 and 180')
    .max(180, 'Longitude must be between -180 and 180'),
  distance: z
    .number({
      message: 'Distance is required',
    })
    .min(1, 'Distance must be at least 1 meter')
    .max(10000, 'Distance must not exceed 10000 meters')
    .default(500),
})

// Import file validation schema
export const importFileSchema = z.object({
  file: z
    .instanceof(File, { message: 'File is required' })
    .refine((file) => file.type === 'application/geo+json' || file.name.endsWith('.geojson'), {
      message: 'File must be a GeoJSON file',
    })
    .refine((file) => file.size <= 5 * 1024 * 1024, {
      message: 'File size must not exceed 5MB',
    }),
})

// Export inferred types for use in components
export type ParcelFormData = z.infer<typeof parcelSchema>
export type BufferRequestData = z.infer<typeof bufferRequestSchema>
export type ImportFileData = z.infer<typeof importFileSchema>
