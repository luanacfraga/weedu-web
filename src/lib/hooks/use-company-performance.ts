'use client'

import { useMemo } from 'react'

import { useActions } from '@/lib/hooks/use-actions'
import { DateFilterType } from '@/lib/types/action'
import type { Action } from '@/lib/types/action'
import type { TeamMetrics } from '@/lib/types/dashboard'
import type { DatePreset } from '@/lib/utils/date-presets'
import { calculateTeamMetrics, groupDeliveriesByDay } from '@/lib/utils/metrics-calculator'
import { getPresetRange, getPreviousPeriod } from '@/lib/utils/period-comparator'

interface UseCompanyPerformanceParams {
  companyId: string
  preset: DatePreset
}

interface UseCompanyPerformanceResult {
  metrics: TeamMetrics
  currentActions: Action[]
  trendData: ReturnType<typeof groupDeliveriesByDay>
  isLoading: boolean
  error: Error | null
}

export function useCompanyPerformance({
  companyId,
  preset,
}: UseCompanyPerformanceParams): UseCompanyPerformanceResult {
  const currentPeriod = useMemo(() => getPresetRange(preset), [preset])
  const previousPeriod = useMemo(() => getPreviousPeriod(preset), [preset])

  const currentQuery = useActions({
    companyId,
    dateFrom: currentPeriod.dateFrom,
    dateTo: currentPeriod.dateTo,
    dateFilterType: DateFilterType.CREATED_AT,
    page: 1,
    limit: 1000,
  })

  const previousQuery = useActions({
    companyId,
    dateFrom: previousPeriod.dateFrom,
    dateTo: previousPeriod.dateTo,
    dateFilterType: DateFilterType.CREATED_AT,
    page: 1,
    limit: 1000,
  })

  const { metrics, currentActions, trendData } = useMemo(() => {
    const current = currentQuery.data?.data ?? []
    const previous = previousQuery.data?.data ?? []

    if (!currentQuery.data || !previousQuery.data) {
      return {
        metrics: {
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
        },
        currentActions: current,
        trendData: [],
      }
    }

    const membersMap = new Map<
      string,
      {
        id: string
        firstName: string
        lastName: string
      }
    >()

    for (const action of [...current, ...previous]) {
      const responsible = action.responsible
      if (responsible && !membersMap.has(responsible.id)) {
        membersMap.set(responsible.id, {
          id: responsible.id,
          firstName: responsible.firstName,
          lastName: responsible.lastName,
        })
      }
    }

    const teamMembers = Array.from(membersMap.values())

    const scopedMetrics = calculateTeamMetrics(current, previous, teamMembers)
    const scopedTrend = groupDeliveriesByDay(current)

    return {
      metrics: scopedMetrics,
      currentActions: current,
      trendData: scopedTrend,
    }
  }, [currentQuery.data, previousQuery.data])

  return {
    metrics,
    currentActions,
    trendData,
    isLoading: currentQuery.isLoading || previousQuery.isLoading,
    error: currentQuery.error || previousQuery.error,
  }
}
