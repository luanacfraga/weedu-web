import { employeesApi, type UpdateEmployeeRequest } from '@/lib/api/endpoints/employees'
import type { PaginationParams } from '@/lib/api/types'
import type { InviteEmployeeRequest } from '@/lib/types/api'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

const EMPLOYEES_KEY = ['employees'] as const

interface UseEmployeesParams extends PaginationParams {
  status?: string
}

export function useEmployeesByCompany(companyId: string, params?: UseEmployeesParams) {
  return useQuery({
    queryKey: [
      ...EMPLOYEES_KEY,
      'company',
      companyId,
      params?.status,
      params?.page,
      params?.limit,
      params?.sortBy,
      params?.sortOrder,
    ],
    queryFn: async () => {
      const response = await employeesApi.listByCompany(companyId, params)
      return response || { data: [], meta: { page: 1, limit: 10, total: 0, totalPages: 0 } }
    },
    enabled: !!companyId,
  })
}

export function useInviteEmployee() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: InviteEmployeeRequest) => employeesApi.invite(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: EMPLOYEES_KEY })
      queryClient.invalidateQueries({
        queryKey: [...EMPLOYEES_KEY, 'company', variables.companyId],
      })
      if (variables.role === 'manager') {
        queryClient.invalidateQueries({
          queryKey: [...EMPLOYEES_KEY, 'company', variables.companyId, 'managers'],
        })
      }
      if (variables.role === 'executor') {
        queryClient.invalidateQueries({
          queryKey: [...EMPLOYEES_KEY, 'company', variables.companyId, 'executors'],
        })
      }
    },
  })
}

export function useSuspendEmployee() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => employeesApi.suspend(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EMPLOYEES_KEY })
      queryClient.invalidateQueries({
        queryKey: [...EMPLOYEES_KEY, 'company'],
      })
    },
  })
}

export function useActivateEmployee() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => employeesApi.activate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EMPLOYEES_KEY })
      queryClient.invalidateQueries({
        queryKey: [...EMPLOYEES_KEY, 'company'],
      })
    },
  })
}

export function useRemoveEmployee() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => employeesApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EMPLOYEES_KEY })
      queryClient.invalidateQueries({
        queryKey: [...EMPLOYEES_KEY, 'company'],
      })
      queryClient.invalidateQueries({ queryKey: ['teams'] })
    },
  })
}

export function useRemoveEmployeeWithTransfer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ employeeId, newResponsibleId }: { employeeId: string; newResponsibleId: string }) =>
      employeesApi.removeWithTransfer(employeeId, { newResponsibleId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EMPLOYEES_KEY })
      queryClient.invalidateQueries({
        queryKey: [...EMPLOYEES_KEY, 'company'],
      })
      queryClient.invalidateQueries({ queryKey: ['teams'] })
      queryClient.invalidateQueries({ queryKey: ['actions'] })
    },
  })
}

export function useResendInvite() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => employeesApi.resendInvite(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EMPLOYEES_KEY })
      queryClient.invalidateQueries({
        queryKey: [...EMPLOYEES_KEY, 'company'],
      })
    },
  })
}

export function useManagersByCompany(companyId: string) {
  return useQuery({
    queryKey: [...EMPLOYEES_KEY, 'company', companyId, 'managers'],
    queryFn: async () => {
      const response = await employeesApi.listByCompany(companyId, {
        status: 'ACTIVE',
      })
      const employees = response?.data || []
      return employees.filter((employee) => employee.role === 'manager')
    },
    enabled: !!companyId,
  })
}

export function useExecutorsByCompany(companyId: string, excludeTeamId?: string) {
  return useQuery({
    queryKey: [...EMPLOYEES_KEY, 'company', companyId, 'executors', excludeTeamId],
    queryFn: async () => {
      const executors = await employeesApi.listExecutorsByCompany(companyId, {
        excludeTeamId,
      })
      return executors || []
    },
    enabled: !!companyId,
  })
}

export function useChangeEmployeeRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, newRole }: { id: string; newRole: 'manager' | 'executor' | 'consultant' }) =>
      employeesApi.changeRole(id, { newRole }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EMPLOYEES_KEY })
      queryClient.invalidateQueries({
        queryKey: [...EMPLOYEES_KEY, 'company'],
      })
      queryClient.invalidateQueries({
        queryKey: ['teams'],
      })
    },
  })
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEmployeeRequest }) =>
      employeesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EMPLOYEES_KEY })
      queryClient.invalidateQueries({
        queryKey: [...EMPLOYEES_KEY, 'company'],
      })
    },
  })
}
