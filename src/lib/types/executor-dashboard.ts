import { ActionPriority, ActionStatus } from './action'

/**
 * Métricas pessoais do executor
 */
export interface ExecutorMetrics {
  // Identificação
  userId: string

  // Métricas do período atual
  totalDeliveries: number // Ações DONE
  goal: number // Meta do período (semanal/mensal)
  goalProgress: number // (deliveries / goal) * 100
  completionRate: number // (DONE / TOTAL) * 100
  inProgress: number // Ações IN_PROGRESS
  late: number // Ações isLate
  totalActions: number // Total de ações

  // Comparativos com período anterior
  deliveriesChange: number // +3 ou -2
  deliveriesChangePercent: number // +25% ou -15%
  completionRateChange: number // +10 ou -5 (pontos percentuais)
  lateChange: number // +1 ou -2

  // Contexto da equipe
  teamPosition: number // 3 (posição no ranking)
  totalTeamMembers: number // 8
  teamAvgDeliveries: number // 10
  percentVsAverage: number // +20% ou -10%
  isAboveAverage: boolean
}

/**
 * Próxima ação a ser executada
 */
export interface NextAction {
  id: string
  title: string
  priority: ActionPriority
  isLate: boolean
  estimatedEndDate: Date | null
}

/**
 * Métricas de posição na equipe
 */
export interface TeamPositionMetrics {
  teamPosition: number
  totalTeamMembers: number
  teamAvgDeliveries: number
  percentVsAverage: number
  isAboveAverage: boolean
}

/**
 * Configuração de metas do usuário
 */
export interface UserGoals {
  weeklyGoal: number // Default: 15
  monthlyGoal: number // Default: 60
}
