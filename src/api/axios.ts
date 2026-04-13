import axios, { AxiosError } from 'axios'
import qs from 'qs'

// Create axios instance with base URL from environment
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  paramsSerializer: (params) => {
    // Use 'repeat' notation for arrays: status=free&status=negotiating
    // This format works better with PHP's built-in server
    return qs.stringify(params, { arrayFormat: 'repeat' })
  },
})

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Handle Laravel validation errors (422)
    if (error.response?.status === 422) {
      // Laravel returns: { errors: { field: ['message'] } }
      // Transform to: { errors: { field: 'message' } } for react-hook-form
      const data = error.response.data as any
      if (data?.errors) {
        const formattedErrors = Object.entries(data.errors).reduce(
          (acc, [field, messages]) => ({
            ...acc,
            [field]: Array.isArray(messages) ? messages[0] : messages,
          }),
          {}
        )
        return Promise.reject({
          ...error,
          response: {
            ...error.response,
            data: { errors: formattedErrors },
          },
        })
      }
    }

    // Handle server errors (500+)
    if (error.response?.status && error.response.status >= 500) {
      return Promise.reject(
        new Error('Server error. Please try again later.')
      )
    }

    // Handle 404 - Not found
    if (error.response?.status === 404) {
      return Promise.reject(new Error('Resource not found.'))
    }

    // Handle network errors
    if (!error.response) {
      return Promise.reject(
        new Error('Network error. Please check your connection.')
      )
    }

    return Promise.reject(error)
  }
)
