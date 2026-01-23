import { env } from '@/config/env'
import { config } from '@/config/config'
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
  private isRefreshing = false
  private failedQueue: Array<{
    resolve: (value: unknown) => void
    reject: (reason?: unknown) => void
  }> = []

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  private getAuthToken(): string | undefined {
    return Cookies.get(config.cookies.tokenName)
  }

  private getRefreshToken(): string | undefined {
    return Cookies.get(config.cookies.refreshTokenName)
  }

  private processQueue(error: Error | null, token: string | null = null) {
    this.failedQueue.forEach((prom) => {
      if (error) {
        prom.reject(error)
      } else {
        prom.resolve(token)
      }
    })

    this.failedQueue = []
  }

  private async refreshAccessToken(): Promise<string> {
    const refreshToken = this.getRefreshToken()

    if (!refreshToken) {
      throw new Error('No refresh token available')
    }

    try {
      const response = await fetch(this.buildURL('/auth/refresh'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      })

      if (!response.ok) {
        throw new Error('Failed to refresh token')
      }

      const data = await response.json()

      // Atualiza os tokens nos cookies
      Cookies.set(config.cookies.tokenName, data.access_token, {
        expires: config.cookies.maxAge,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
      })

      Cookies.set(config.cookies.refreshTokenName, data.refresh_token, {
        expires: config.cookies.refreshTokenMaxAge,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
      })

      return data.access_token
    } catch (error) {
      // Remove tokens inválidos
      Cookies.remove(config.cookies.tokenName)
      Cookies.remove(config.cookies.refreshTokenName)
      throw error
    }
  }

  private buildURL(
    path: string,
    params?: Record<string, string | number | boolean | undefined>
  ): string {
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path
    }

    const cleanPath = path.startsWith('/') ? path : `/${path}`
    const baseUrl = this.baseURL.endsWith('/') ? this.baseURL.slice(0, -1) : this.baseURL
    const url = new URL(cleanPath, baseUrl)

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.append(key, String(value))
        }
      })
    }

    return url.toString()
  }

  private async request<T>(
    path: string,
    config: RequestConfig = {},
    retrying = false
  ): Promise<T> {
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

    const response = await fetch(url, {
      ...fetchConfig,
      headers: {
        ...defaultHeaders,
        ...headers,
      },
    })

    const contentType = response.headers.get('content-type')
    const hasJSON = contentType?.includes('application/json')

    // Intercepta erro 401 (Unauthorized)
    if (response.status === 401 && !retrying && !path.includes('/auth/')) {
      // Evita tentar refresh em rotas de autenticação e evita loops

      if (this.isRefreshing) {
        // Se já está refreshando, coloca a requisição na fila
        return new Promise((resolve, reject) => {
          this.failedQueue.push({ resolve, reject })
        })
          .then(() => {
            // Tenta novamente com o novo token
            return this.request<T>(path, config, true)
          })
          .catch((err) => {
            return Promise.reject(err)
          })
      }

      this.isRefreshing = true

      try {
        const newToken = await this.refreshAccessToken()
        this.isRefreshing = false
        this.processQueue(null, newToken)

        // Tenta novamente com o novo token
        return this.request<T>(path, config, true)
      } catch (refreshError) {
        this.isRefreshing = false
        this.processQueue(refreshError as Error, null)

        // Redireciona para login após falha no refresh
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }

        throw refreshError
      }
    }

    if (!response.ok) {
      const errorData = hasJSON ? await response.json() : null
      throw new ApiError(response.status, response.statusText, errorData)
    }

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

  async delete<T>(path: string, data?: unknown, config?: RequestConfig): Promise<T> {
    return this.request<T>(path, {
      ...config,
      method: 'DELETE',
      body: data ? JSON.stringify(data) : undefined,
    })
  }
}

const apiClient = new ApiClient(env.apiUrl)

export { apiClient }
