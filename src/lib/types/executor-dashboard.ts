import type { ActionPriority, ActionStatus } from '@/lib/types/action'

export type ImpactCategory =
  | 'receita'
  | 'cliente'
  | 'eficiencia'
  | 'qualidade'
  | 'risco'
  | 'pessoas'
  | 'outro'
  | 'nao-informado'

export type ExecutorDashboardDoneTrendPoint = {
  date: string // YYYY-MM-DD
  done: number
}

export type ExecutorDashboardNextAction = {
  id: string
  title: string
  status: ActionStatus
  priority: ActionPriority
  isLate: boolean
  isBlocked: boolean
  blockedReason?: string | null
  estimatedEndDate: string
}

export type ExecutorDashboardTeamContext = {
  teamId: string
  rank: number
  totalMembers: number
  myDone: number
  averageDone: number
  percentDiffFromAverage: number
}

export type ExecutorDashboardResponse = {
  companyId: string
  userId: string
  period: {
    from: string
    to: string
    previousFrom: string
    previousTo: string
  }
  totals: {
    total: number
    todo: number
    inProgress: number
    done: number
    late: number
    blocked: number
  }
  completionRate: number
  doneInPeriod: {
    current: number
    previous: number
    delta: number
  }
  doneTrend: {
    current: ExecutorDashboardDoneTrendPoint[]
    previous: ExecutorDashboardDoneTrendPoint[]
  }
  todayTop3: ExecutorDashboardNextAction[]
  blockedActions: ExecutorDashboardNextAction[]
  impact: {
    categories: Record<ImpactCategory, number>
    topObjectives: Array<{ objective: string; count: number }>
  }
  quality: {
    doneOnTime: number
    doneLate: number
    reopened: number
    avgCycleTimeHours: number | null
    avgInProgressAgeHours: number | null
    blockedRatePercent: number
  }
  nextActions: ExecutorDashboardNextAction[]
  team: ExecutorDashboardTeamContext | null
}
