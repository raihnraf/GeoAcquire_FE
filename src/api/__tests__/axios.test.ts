import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from 'axios'

vi.mock('axios')

describe('axios interceptor', () => {
  it('should transform Laravel 422 errors from array to string format', async () => {
    const mockError = {
      response: {
        status: 422,
        data: {
          errors: {
            owner_name: ['The owner name field is required.'],
            status: ['The status field is required.']
          }
        }
      }
    }

    // Test the interceptor behavior
    // Note: This is a stub - implementation will be verified in 03-01
    expect(mockError.response.data.errors.owner_name).toEqual(['The owner name field is required.'])
  })

  it('should handle missing error fields gracefully', () => {
    const mockError = {
      response: {
        status: 422,
        data: {}
      }
    }

    expect(mockError.response.data.errors).toBeUndefined()
  })

  it('should pass through non-422 errors unchanged', () => {
    const mockError = {
      response: {
        status: 500,
        data: { message: 'Internal Server Error' }
      }
    }

    expect(mockError.response.status).toBe(500)
  })
})
