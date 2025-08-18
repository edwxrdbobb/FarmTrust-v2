// Centralized API client with consistent error handling and response formatting

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const contentType = response.headers.get('content-type')
    const isJson = contentType?.includes('application/json')

    let data: any
    try {
      data = isJson ? await response.json() : await response.text()
    } catch (error) {
      throw new ApiError('Failed to parse response', response.status)
    }

    if (!response.ok) {
      const errorMessage = data?.message || data?.error || `HTTP ${response.status}`
      throw new ApiError(errorMessage, response.status, data?.code)
    }

    return {
      success: true,
      data: data?.data || data,
      message: data?.message
    }
  }

  private getHeaders(options: RequestInit = {}): Record<string, string> {
    const defaultHeaders = {
      'Content-Type': 'application/json',
    }

    return {
      ...defaultHeaders,
      ...(options.headers as Record<string, string>)
    }
  }

  async get<T>(url: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const response = await fetch(`${this.baseUrl}${url}`, {
      method: 'GET',
      credentials: 'include',
      ...options,
      headers: this.getHeaders(options)
    })

    return this.handleResponse<T>(response)
  }

  async post<T>(url: string, data?: any, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const response = await fetch(`${this.baseUrl}${url}`, {
      method: 'POST',
      credentials: 'include',
      body: data ? JSON.stringify(data) : undefined,
      ...options,
      headers: this.getHeaders(options)
    })

    return this.handleResponse<T>(response)
  }

  async put<T>(url: string, data?: any, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const response = await fetch(`${this.baseUrl}${url}`, {
      method: 'PUT',
      credentials: 'include',
      body: data ? JSON.stringify(data) : undefined,
      ...options,
      headers: this.getHeaders(options)
    })

    return this.handleResponse<T>(response)
  }

  async patch<T>(url: string, data?: any, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const response = await fetch(`${this.baseUrl}${url}`, {
      method: 'PATCH',
      credentials: 'include',
      body: data ? JSON.stringify(data) : undefined,
      ...options,
      headers: this.getHeaders(options)
    })

    return this.handleResponse<T>(response)
  }

  async delete<T>(url: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const response = await fetch(`${this.baseUrl}${url}`, {
      method: 'DELETE',
      credentials: 'include',
      ...options,
      headers: this.getHeaders(options)
    })

    return this.handleResponse<T>(response)
  }

  // Upload files with FormData
  async upload<T>(url: string, formData: FormData, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const response = await fetch(`${this.baseUrl}${url}`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
      ...options,
      // Don't set Content-Type header for FormData - let browser set it
      headers: options.headers as Record<string, string>
    })

    return this.handleResponse<T>(response)
  }
}

// Default API client instance
export const apiClient = new ApiClient()

// Helper functions for common API patterns
export async function fetchWithErrorHandling<T>(
  fetchFn: () => Promise<ApiResponse<T>>,
  defaultValue?: T
): Promise<{ data: T | undefined; error: string | null; loading: boolean }> {
  try {
    const response = await fetchFn()
    return {
      data: response.data,
      error: null,
      loading: false
    }
  } catch (error) {
    console.error('API Error:', error)
    return {
      data: defaultValue,
      error: error instanceof ApiError ? error.message : 'An unexpected error occurred',
      loading: false
    }
  }
}

// Utility function to handle API responses in components
export function handleApiError(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message
  }
  if (error instanceof Error) {
    return error.message
  }
  return 'An unexpected error occurred'
}

// Response type helpers
export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface DashboardStats {
  totalSales: number
  activeProducts: number
  pendingOrders: number
  averageRating: number
  salesGrowth?: number
  orderGrowth?: number
}

// Common API endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',
  LOGOUT: '/api/auth/logout',
  ME: '/api/auth/me',
  
  // Vendor
  VENDOR_DASHBOARD: '/api/vendor/dashboard',
  VENDOR_PROFILE: '/api/vendor/profile',
  VENDOR_PRODUCTS: '/api/vendor/products',
  VENDOR_ORDERS: '/api/vendor/orders',
  VENDOR_ANALYTICS: '/api/vendor/analytics',
  
  // Buyer
  BUYER_DASHBOARD: '/api/buyer/dashboard',
  PRODUCTS: '/api/products',
  CART: '/api/cart',
  ORDERS: '/api/orders',
  REVIEWS: '/api/reviews',
  
  // Admin
  ADMIN_DASHBOARD: '/api/admin/dashboard',
  ADMIN_USERS: '/api/admin/users',
  ADMIN_ANALYTICS: '/api/admin/analytics',
}
