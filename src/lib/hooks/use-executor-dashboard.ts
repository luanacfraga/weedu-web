'use client'

import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import { companiesApi } from '@/lib/api/endpoints/companies'
import type { ExecutorDashboardResponse } from '@/lib/types/executor-dashboard'

export const executorDashboardKeys = {
  all: ['executor-dashboard'] as const,
  byCompany: (companyId: string) => [...executorDashboardKeys.all, companyId] as const,
  byCompanyAndPeriod: (companyId: string, dateFrom: string, dateTo: string, objective?: string) =>
    [...executorDashboardKeys.byCompany(companyId), dateFrom, dateTo, objective ?? ''] as const,
}

export function useExecutorDashboard(input: {
  companyId: string
  dateFrom: string
  dateTo: string
  objective?: string
}): UseQueryResult<ExecutorDashboardResponse, Error> {
  return useQuery({
    queryKey: executorDashboardKeys.byCompanyAndPeriod(
      input.companyId,
      input.dateFrom,
      input.dateTo,
      input.objective
    ),
    queryFn: () =>
      companiesApi.getExecutorDashboard(input.companyId, {
        dateFrom: input.dateFrom,
        dateTo: input.dateTo,
        objective: input.objective,
      }),
    enabled: !!input.companyId && !!input.dateFrom && !!input.dateTo,
  })
}


