'use client'

import { useQuery } from '@tanstack/react-query'
import { employeesApi } from '@/lib/api/endpoints/employees'
import { useCompanyResponsibles } from '@/lib/services/queries/use-companies'
import { useTeamResponsibles } from '@/lib/services/queries/use-teams'
import { ActionScopeFilter } from '@/lib/types/action'

interface UseScopeResponsiblesOptions {
  scopeType: ActionScopeFilter | null
  companyId: string | null
  teamId: string | null
  managerTeamIds?: string[]
}

export function useScopeResponsibles({
  scopeType,
  companyId,
  teamId,
  managerTeamIds = [],
}: UseScopeResponsiblesOptions) {
  const { data: companyUsers, isLoading: isLoadingCompanyUsers } = useCompanyResponsibles(
    companyId || ''
  )

  const { data: teamResponsibles, isLoading: isLoadingTeamResponsibles } = useTeamResponsibles(
    teamId || ''
  )

  const shouldLoadMultipleTeams = scopeType === ActionScopeFilter.ALL_MY_TEAMS && managerTeamIds.length > 1

  const isLoading =
    (scopeType === ActionScopeFilter.ENTIRE_COMPANY && isLoadingCompanyUsers) ||
    (scopeType === ActionScopeFilter.SPECIFIC_TEAM && isLoadingTeamResponsibles) ||
    (scopeType === ActionScopeFilter.ALL_MY_TEAMS && isLoadingTeamResponsibles)

  const responsibles =
    scopeType === ActionScopeFilter.ENTIRE_COMPANY
      ? companyUsers
      : scopeType === ActionScopeFilter.SPECIFIC_TEAM
        ? teamResponsibles
        : scopeType === ActionScopeFilter.ALL_MY_TEAMS
          ? teamResponsibles
          : []

  return {
    responsibles: responsibles ?? [],
    isLoading,
  }
}
