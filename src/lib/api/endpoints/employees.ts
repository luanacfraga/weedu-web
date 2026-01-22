import { PaginatedResponse, PaginationParams } from '@/lib/api/types'
import type { Employee, InviteEmployeeRequest } from '@/lib/types/api'
import { apiClient } from '../api-client'

interface AcceptInviteRequest {
  token: string
  password: string
  document?: string
}

interface ListEmployeesParams extends PaginationParams {
  status?: string
}

interface ListExecutorsParams {
  excludeTeamId?: string
}

interface ChangeRoleRequest {
  newRole: 'manager' | 'executor' | 'consultant'
}

interface UpdateEmployeeRequest {
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  document?: string
  position?: string
  notes?: string
  role?: 'manager' | 'executor' | 'consultant'
}

export const employeesApi = {
  invite: (data: InviteEmployeeRequest) =>
    apiClient.post<Employee>('/api/v1/employees/invite', data),

  acceptInvite: (data: AcceptInviteRequest) =>
    apiClient.post<Employee>('/api/v1/employees/accept-invite-by-token', data),

  listByCompany: (companyId: string, params?: ListEmployeesParams) =>
    apiClient.get<PaginatedResponse<Employee>>(`/api/v1/employees/company/${companyId}`, {
      params: params as Record<string, string | number | boolean | undefined>,
    }),

  listExecutorsByCompany: (companyId: string, params?: ListExecutorsParams) =>
    apiClient.get<Employee[]>(`/api/v1/employees/company/${companyId}/executors`, {
      params: params as Record<string, string | number | boolean | undefined>,
    }),

  suspend: (id: string) => apiClient.put<Employee>(`/api/v1/employees/${id}/suspend`),

  activate: (id: string) => apiClient.put<Employee>(`/api/v1/employees/${id}/activate`),

  remove: (id: string) => apiClient.delete<Employee>(`/api/v1/employees/${id}`),

  resendInvite: (id: string) => apiClient.post<Employee>(`/api/v1/employees/${id}/resend-invite`),

  changeRole: (id: string, data: ChangeRoleRequest) =>
    apiClient.patch<Employee>(`/api/v1/employees/${id}/role`, data),

  update: (id: string, data: UpdateEmployeeRequest) =>
    apiClient.put<Employee>(`/api/v1/employees/${id}`, data),
}

export type { Employee, InviteEmployeeRequest, UpdateEmployeeRequest }
