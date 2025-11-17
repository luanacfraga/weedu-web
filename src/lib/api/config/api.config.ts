import { apiClient } from '../api-client'

// Wrapper para manter compatibilidade com o padrão do weedu-app
// Retorna response.data diretamente como o axios faz
const api = {
  get: async <T>(
    url: string,
    config?: { params?: Record<string, string | number | boolean | undefined> }
  ) => {
    const response = await apiClient.get<T>(url, config)
    return { data: response }
  },

  post: async <T>(url: string, data?: unknown) => {
    const response = await apiClient.post<T>(url, data)
    return { data: response }
  },

  put: async <T>(url: string, data?: unknown) => {
    const response = await apiClient.put<T>(url, data)
    return { data: response }
  },

  patch: async <T>(url: string, data?: unknown) => {
    const response = await apiClient.patch<T>(url, data)
    return { data: response }
  },

  delete: async <T>(url: string) => {
    const response = await apiClient.delete<T>(url)
    return { data: response }
  },
}

export default api
