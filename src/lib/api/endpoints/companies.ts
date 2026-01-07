import { apiClient } from '../api-client'
import { PaginatedResponse, PaginationParams } from '../types'
import type { Company, CreateCompanyRequest, UpdateCompanyRequest } from '@/lib/types/api'
import type { ExecutorDashboardResponse } from '@/lib/types/executor-dashboard'

export const companiesApi = {
  getAll: (params?: PaginationParams) =>
    apiClient.get<PaginatedResponse<Company>>('/api/v1/companies', {
      params: params as Record<string, string | number | boolean | undefined>
    }),

  getMyCompanies: () =>
    apiClient.get<Company[]>('/api/v1/companies/me'),

  getByAdmin: (adminId: string) =>
    apiClient.get<Company[]>(`/api/v1/companies/admin/${adminId}`),

  getById: (id: string) =>
    apiClient.get<Company>(`/api/v1/companies/${id}`),

  create: (data: CreateCompanyRequest) =>
    apiClient.post<Company>('/api/v1/companies', data),

  update: (id: string, data: UpdateCompanyRequest) =>
    apiClient.put<Company>(`/api/v1/companies/${id}`, data),

  delete: (id: string) =>
    apiClient.delete<void>(`/api/v1/companies/${id}`),

  getExecutorDashboard: (
    companyId: string,
    params: { dateFrom: string; dateTo: string; objective?: string }
  ) =>
    apiClient.get<ExecutorDashboardResponse>(`/api/v1/companies/${companyId}/executor-dashboard`, {
      params: params as Record<string, string | number | boolean | undefined>,
    }),
}

export type { Company, CreateCompanyRequest, UpdateCompanyRequest }
