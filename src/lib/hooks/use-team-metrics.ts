'use client'

import { useMemo } from 'react'
import type { DatePreset } from '@/lib/utils/date-presets'
import type { TeamMemberMetrics, TeamMetrics } from '@/lib/types/dashboard'
import type { Action } from '@/lib/types/action'
import { useActions } from './use-actions'
import { getPresetRange, getPreviousPeriod } from '@/lib/utils/period-comparator'
import {
  calculateTeamMemberMetrics,
  calculateTeamMetrics,
} from '@/lib/utils/metrics-calculator'

interface User {
  id: string
  firstName: string
  lastName: string
  avatar?: string
}

interface UseTeamMetricsParams {
  teamId: string
  preset: DatePreset
  teamMembers: User[]
}

interface UseTeamMetricsResult {
  memberMetrics: TeamMemberMetrics[]
  teamMetrics: TeamMetrics
  currentActions: Action[]
  isLoading: boolean
  error: Error | null
}

/**
 * Hook para buscar e calcular métricas da equipe
 *
 * Faz 2 chamadas paralelas à API:
 * 1. Ações do período atual
 * 2. Ações do período anterior
 *
 * Depois calcula todas as métricas e comparativos no cliente.
 */
export function useTeamMetrics({
  teamId,
  preset,
  teamMembers,
}: UseTeamMetricsParams): UseTeamMetricsResult {
  // Calcular ranges de datas
  const currentPeriod = useMemo(() => getPresetRange(preset), [preset])
  const previousPeriod = useMemo(() => getPreviousPeriod(preset), [preset])

  // Buscar ações do período atual
  const currentQuery = useActions({
    teamId,
    dateFrom: currentPeriod.dateFrom,
    dateTo: currentPeriod.dateTo,
    dateFilterType: 'createdAt',
    page: 1,
    limit: 1000,
  })

  // Buscar ações do período anterior
  const previousQuery = useActions({
    teamId,
    dateFrom: previousPeriod.dateFrom,
    dateTo: previousPeriod.dateTo,
    dateFilterType: 'createdAt',
    page: 1,
    limit: 1000,
  })

  // Calcular métricas quando ambas queries carregarem
  const memberMetrics = useMemo(() => {
    if (!currentQuery.data || !previousQuery.data) return []

    return calculateTeamMemberMetrics(
      currentQuery.data.data,
      previousQuery.data.data,
      teamMembers
    )
  }, [currentQuery.data, previousQuery.data, teamMembers])

  const teamMetrics = useMemo(() => {
    if (!currentQuery.data || !previousQuery.data) {
      return {
        totalDeliveries: 0,
        avgCompletionRate: 0,
        velocity: 0,
        totalLate: 0,
        totalMembers: 0,
        totalActions: 0,
        deliveriesChange: 0,
        deliveriesChangePercent: 0,
        velocityChange: 0,
        lateChange: 0,
        completionRateChange: 0,
      }
    }

    return calculateTeamMetrics(
      currentQuery.data.data,
      previousQuery.data.data,
      teamMembers
    )
  }, [currentQuery.data, previousQuery.data, teamMembers])

  return {
    memberMetrics,
    teamMetrics,
    currentActions: currentQuery.data?.data || [],
    isLoading: currentQuery.isLoading || previousQuery.isLoading,
    error: currentQuery.error || previousQuery.error,
  }
}
