import { config, env } from '@/config'
import Cookies from 'js-cookie'

export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public data?: unknown
  ) {
    super(`API Error: ${status} ${statusText}`)
    this.name = 'ApiError'
  }
}

interface RequestConfig extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>
}

class ApiClient {
  private baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  private getAuthToken(): string | undefined {
    return Cookies.get(config.cookies.tokenName)
  }

  private buildURL(
    path: string,
    params?: Record<string, string | number | boolean | undefined>
  ): string {
    // Se o path já é uma URL completa, retorna direto
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path
    }

    // Remove barra inicial duplicada se necessário
    const cleanPath = path.startsWith('/') ? path : `/${path}`
    const baseUrl = this.baseURL.endsWith('/') ? this.baseURL.slice(0, -1) : this.baseURL
    const url = new URL(cleanPath, baseUrl)

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        // Skip undefined values
        if (value !== undefined) {
          url.searchParams.append(key, String(value))
        }
      })
    }

    return url.toString()
  }

  private async request<T>(path: string, config: RequestConfig = {}): Promise<T> {
    const { params, headers, ...fetchConfig } = config

    const token = this.getAuthToken()
    const url = this.buildURL(path, params)

    const defaultHeaders: HeadersInit = {
      'Content-Type': 'application/json',
      accept: 'application/json',
    }

    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`
    }

    // Debug log (apenas em desenvolvimento)
    if (process.env.NODE_ENV === 'development') {
      console.log('🌐 API Request:', {
        method: fetchConfig.method || 'GET',
        url,
        headers: defaultHeaders,
        body: fetchConfig.body,
      })
    }

    const response = await fetch(url, {
      ...fetchConfig,
      headers: {
        ...defaultHeaders,
        ...headers,
      },
    })

    // Debug log (apenas em desenvolvimento)
    if (process.env.NODE_ENV === 'development') {
      console.log('📥 API Response:', {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
      })
    }

    // Handle non-JSON responses (like 204 No Content)
    const contentType = response.headers.get('content-type')
    const hasJSON = contentType?.includes('application/json')

    if (!response.ok) {
      const errorData = hasJSON ? await response.json() : null
      throw new ApiError(response.status, response.statusText, errorData)
    }

    // Return null for no content responses
    if (response.status === 204 || !hasJSON) {
      return null as T
    }

    return response.json()
  }

  async get<T>(path: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(path, { ...config, method: 'GET' })
  }

  async post<T>(path: string, data?: unknown, config?: RequestConfig): Promise<T> {
    return this.request<T>(path, {
      ...config,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T>(path: string, data?: unknown, config?: RequestConfig): Promise<T> {
    return this.request<T>(path, {
      ...config,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async patch<T>(path: string, data?: unknown, config?: RequestConfig): Promise<T> {
    return this.request<T>(path, {
      ...config,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T>(path: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(path, { ...config, method: 'DELETE' })
  }
}

// Create singleton instance
const apiClient = new ApiClient(env.apiUrl)

export { apiClient }
