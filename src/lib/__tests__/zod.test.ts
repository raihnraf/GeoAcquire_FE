import { describe, it, expect } from 'vitest'
import { parcelSchema, ParcelFormData } from '../zod'

describe('parcelSchema', () => {
  it('should validate valid parcel data', () => {
    const validData = {
      owner_name: 'Test Owner',
      status: 'free',
      price_per_sqm: 100000,
      geometry: {
        type: 'Polygon' as const,
        coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]
      }
    }
    const result = parcelSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it('should reject invalid owner_name (too long)', () => {
    const invalidData = {
      owner_name: 'a'.repeat(256),
      status: 'free',
      price_per_sqm: 100000,
      geometry: {
        type: 'Polygon' as const,
        coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]
      }
    }
    const result = parcelSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
  })

  it('should reject invalid status', () => {
    const invalidData = {
      owner_name: 'Test Owner',
      status: 'invalid',
      price_per_sqm: 100000,
      geometry: {
        type: 'Polygon' as const,
        coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]
      }
    }
    const result = parcelSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
  })

  it('should reject negative price_per_sqm', () => {
    const invalidData = {
      owner_name: 'Test Owner',
      status: 'free',
      price_per_sqm: -1,
      geometry: {
        type: 'Polygon' as const,
        coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]
      }
    }
    const result = parcelSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
  })

  it('should allow optional price_per_sqm', () => {
    const data = {
      owner_name: 'Test Owner',
      status: 'free',
      geometry: {
        type: 'Polygon' as const,
        coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]
      }
    }
    const result = parcelSchema.safeParse(data)
    expect(result.success).toBe(true)
  })
})
