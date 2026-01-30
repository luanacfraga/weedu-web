import { apiClient } from '../api-client'
import { PaginatedResponse, PaginationParams } from '../types'
import type { Company, CreateCompanyRequest, UpdateCompanyRequest, Employee } from '@/lib/types/api'
import type { ExecutorDashboardResponse } from '@/lib/types/executor-dashboard'

export interface CompanySettings {
  company: {
    id: string
    name: string
    description: string | null
    adminId: string
    document: string
    documentType: 'CPF' | 'CNPJ'
  }
  admin: {
    id: string
    firstName: string
    lastName: string
    email: string
    phone: string
    document: string
    documentType: 'CPF' | 'CNPJ'
    role: string
  }
  plan: {
    id: string
    name: string
    maxCompanies: number
    maxManagers: number
    maxExecutors: number
    maxConsultants: number
    iaCallsLimit: number
  }
  subscription: {
    id: string
    adminId: string
    planId: string
    startedAt: string
    isActive: boolean
  }
}

export interface ActiveCompanyWithPlan {
  company: {
    id: string
    name: string
    description: string | null
    adminId: string
    isBlocked?: boolean
  }
  subscription: {
    id: string
    adminId: string
    planId: string
    startedAt: string
    isActive: boolean
  }
  plan: {
    id: string
    name: string
    maxCompanies: number
    maxManagers: number
    maxExecutors: number
    maxConsultants: number
    iaCallsLimit: number
  }
  adminName: string
}

export const companiesApi = {
  getAll: (params?: PaginationParams) =>
    apiClient.get<PaginatedResponse<Company>>('/api/v1/companies', {
      params: params as Record<string, string | number | boolean | undefined>
    }),

  getActiveWithPlans: () =>
    apiClient.get<ActiveCompanyWithPlan[]>('/api/v1/companies/active'),

  getMyCompanies: () =>
    apiClient.get<Company[]>('/api/v1/companies/me'),

  getByAdmin: (adminId: string) =>
    apiClient.get<Company[]>(`/api/v1/companies/admin/${adminId}`),

  getById: (id: string) =>
    apiClient.get<Company>(`/api/v1/companies/${id}`),

  getSettings: (id: string) =>
    apiClient.get<CompanySettings>(`/api/v1/companies/${id}/settings`),

  listResponsibles: (id: string) =>
    apiClient.get<Employee[]>(`/api/v1/companies/${id}/responsibles`),

  create: (data: CreateCompanyRequest) =>
    apiClient.post<Company>('/api/v1/companies', data),

  update: (id: string, data: UpdateCompanyRequest) =>
    apiClient.put<Company>(`/api/v1/companies/${id}`, data),

  updatePlan: (companyId: string, planId: string) =>
    apiClient.patch<{ subscriptionId: string; planId: string }>(
      `/api/v1/companies/${companyId}/plan`,
      { planId }
    ),

  setBlocked: (companyId: string, blocked: boolean) =>
    apiClient.patch<{ id: string; isBlocked: boolean }>(
      `/api/v1/companies/${companyId}/block`,
      { blocked }
    ),

  delete: (id: string) =>
    apiClient.delete<void>(`/api/v1/companies/${id}`),

  getExecutorDashboard: (
    companyId: string,
    params: { dateFrom: string; dateTo: string }
  ) =>
    apiClient.get<ExecutorDashboardResponse>(`/api/v1/companies/${companyId}/executor-dashboard`, {
      params: params as Record<string, string | number | boolean | undefined>,
    }),
}

export type { Company, CreateCompanyRequest, UpdateCompanyRequest }
