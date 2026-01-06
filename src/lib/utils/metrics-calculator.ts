import type { Action } from '@/lib/types/action'
import type {
  TeamMemberMetrics,
  TeamMetrics,
  MetricComparison,
  DeliveryTrendDataPoint,
} from '@/lib/types/dashboard'
import { ActionStatus } from '@/lib/types/action'

interface User {
  id: string
  firstName: string
  lastName: string
  avatar?: string
}

/**
 * Calcula métricas individuais de cada membro da equipe
 */
export function calculateTeamMemberMetrics(
  currentPeriodActions: Action[],
  previousPeriodActions: Action[],
  teamMembers: User[]
): TeamMemberMetrics[] {
  return teamMembers.map((member) => {
    // Filtrar ações do membro no período atual
    const currentActions = currentPeriodActions.filter(
      (a) => a.responsibleId === member.id
    )

    // Filtrar ações do membro no período anterior
    const previousActions = previousPeriodActions.filter(
      (a) => a.responsibleId === member.id
    )

    // Métricas atuais
    const totalActions = currentActions.length
    const totalDeliveries = currentActions.filter(
      (a) => a.status === ActionStatus.DONE
    ).length
    const completionRate = totalActions > 0 ? (totalDeliveries / totalActions) * 100 : 0
    const inProgress = currentActions.filter(
      (a) => a.status === ActionStatus.IN_PROGRESS
    ).length
    const late = currentActions.filter((a) => a.isLate).length

    // Métricas anteriores
    const previousTotalActions = previousActions.length
    const previousDeliveries = previousActions.filter(
      (a) => a.status === ActionStatus.DONE
    ).length
    const previousCompletionRate =
      previousTotalActions > 0
        ? (previousDeliveries / previousTotalActions) * 100
        : 0

    // Comparativos
    const deliveriesChange = totalDeliveries - previousDeliveries
    const deliveriesChangePercent =
      previousDeliveries > 0
        ? ((totalDeliveries - previousDeliveries) / previousDeliveries) * 100
        : totalDeliveries > 0
        ? 100
        : 0

    const completionRateChange = completionRate - previousCompletionRate

    return {
      userId: member.id,
      name: `${member.firstName} ${member.lastName}`,
      avatar: member.avatar,
      totalDeliveries,
      completionRate: Math.round(completionRate),
      inProgress,
      late,
      totalActions,
      deliveriesChange,
      deliveriesChangePercent: Math.round(deliveriesChangePercent),
      completionRateChange: Math.round(completionRateChange),
    }
  })
}

/**
 * Calcula métricas agregadas da equipe inteira
 */
export function calculateTeamMetrics(
  currentPeriodActions: Action[],
  previousPeriodActions: Action[],
  teamMembers: User[]
): TeamMetrics {
  // Métricas atuais
  const totalActions = currentPeriodActions.length
  const totalDeliveries = currentPeriodActions.filter(
    (a) => a.status === ActionStatus.DONE
  ).length
  const avgCompletionRate = totalActions > 0 ? (totalDeliveries / totalActions) * 100 : 0
  const totalLate = currentPeriodActions.filter((a) => a.isLate).length

  // Métricas anteriores
  const previousTotalActions = previousPeriodActions.length
  const previousDeliveries = previousPeriodActions.filter(
    (a) => a.status === ActionStatus.DONE
  ).length
  const previousAvgCompletionRate =
    previousTotalActions > 0
      ? (previousDeliveries / previousTotalActions) * 100
      : 0
  const previousLate = previousPeriodActions.filter((a) => a.isLate).length

  // Comparativos
  const deliveriesChange = totalDeliveries - previousDeliveries
  const deliveriesChangePercent =
    previousDeliveries > 0
      ? ((totalDeliveries - previousDeliveries) / previousDeliveries) * 100
      : totalDeliveries > 0
      ? 100
      : 0

  const completionRateChange = avgCompletionRate - previousAvgCompletionRate
  const lateChange = totalLate - previousLate

  // Velocidade (ações concluídas por semana - assumindo períodos semanais)
  const velocity = totalDeliveries
  const previousVelocity = previousDeliveries
  const velocityChange = velocity - previousVelocity

  return {
    totalDeliveries,
    avgCompletionRate: Math.round(avgCompletionRate),
    velocity,
    totalLate,
    totalMembers: teamMembers.length,
    totalActions,
    deliveriesChange,
    deliveriesChangePercent: Math.round(deliveriesChangePercent),
    velocityChange,
    lateChange,
    completionRateChange: Math.round(completionRateChange),
  }
}

/**
 * Cria objeto de comparação para exibição em cards
 */
export function createMetricComparison(
  currentValue: number,
  previousValue: number,
  isInverted = false
): MetricComparison | undefined {
  // Se ambos são zero, não mostra comparativo
  if (currentValue === 0 && previousValue === 0) {
    return undefined
  }

  const absolute = currentValue - previousValue
  const percent =
    previousValue > 0
      ? ((currentValue - previousValue) / previousValue) * 100
      : currentValue > 0
      ? 100
      : 0

  // Por padrão: aumento é melhoria
  // Se invertido (ex: atrasadas): diminuição é melhoria
  const isImprovement = isInverted ? absolute < 0 : absolute > 0

  return {
    absolute,
    percent: Math.round(percent),
    isImprovement,
    isInverted,
  }
}

/**
 * Agrupa entregas por dia para gráfico de tendência
 */
export function groupDeliveriesByDay(actions: Action[]): DeliveryTrendDataPoint[] {
  const deliveriesByDate = new Map<string, number>()

  // Contar entregas por dia (apenas ações DONE)
  actions
    .filter((a) => a.status === ActionStatus.DONE && a.actualEndDate)
    .forEach((action) => {
      const date = new Date(action.actualEndDate!)
      const dateKey = date.toISOString().split('T')[0] // YYYY-MM-DD

      const current = deliveriesByDate.get(dateKey) || 0
      deliveriesByDate.set(dateKey, current + 1)
    })

  // Converter para array e ordenar por data
  const dataPoints: DeliveryTrendDataPoint[] = Array.from(deliveriesByDate.entries())
    .map(([date, deliveries]) => ({
      date,
      deliveries,
      label: formatDateLabel(date),
    }))
    .sort((a, b) => a.date.localeCompare(b.date))

  return dataPoints
}

/**
 * Formata data para label do gráfico
 */
function formatDateLabel(dateString: string): string {
  const date = new Date(dateString)
  const day = date.getDate()
  const month = date.getMonth() + 1

  return `${day}/${month}`
}
