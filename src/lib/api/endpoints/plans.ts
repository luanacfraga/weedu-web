import { apiClient } from '../api-client'

export interface Plan {
  id: string
  name: string
  maxCompanies: number
  maxManagers: number
  maxExecutors: number
  maxConsultants: number
  iaCallsLimit: number
}

export interface CreatePlanRequest {
  name: string
  maxCompanies: number
  maxManagers: number
  maxExecutors: number
  maxConsultants: number
  iaCallsLimit: number
}

export interface UpdatePlanRequest {
  name: string
  maxCompanies: number
  maxManagers: number
  maxExecutors: number
  maxConsultants: number
  iaCallsLimit: number
}

export const plansApi = {
  getAll: () => apiClient.get<Plan[]>('/api/v1/plan'),

  getById: (id: string) => apiClient.get<Plan>(`/api/v1/plan/${id}`),

  create: (data: CreatePlanRequest) => apiClient.post<Plan>('/api/v1/plan', data),

  update: (id: string, data: UpdatePlanRequest) =>
    apiClient.put<Plan>(`/api/v1/plan/${id}`, data),
}
