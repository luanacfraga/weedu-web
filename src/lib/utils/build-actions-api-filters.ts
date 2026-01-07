import type { ActionFilters, ActionPriority, ActionStatus } from '@/lib/types/action'
import type { DatePreset } from '@/lib/utils/date-presets'

type AssignmentFilter = 'all' | 'assigned-to-me' | 'created-by-me' | 'my-teams'
type DateFilterType = 'createdAt' | 'startDate'

export type ActionFiltersUIState = {
  statuses: ActionStatus[]
  priority: ActionPriority | 'all'
  assignment: AssignmentFilter
  dateFrom: string | null
  dateTo: string | null
  dateFilterType: DateFilterType
  datePreset: DatePreset | null
  companyId: string | null
  teamId: string | null
  showBlockedOnly: boolean
  showLateOnly: boolean
  searchQuery: string
  objective: string
}

type BuildActionsApiFiltersInput = {
  state: ActionFiltersUIState
  userId?: string
  /**
   * Força o filtro de responsável (ex.: executores devem ver apenas suas ações).
   * Quando definido, sobrescreve `assignment` e remove `creatorId`.
   */
  forceResponsibleId?: string
  selectedCompanyId?: string
  page: number
  limit: number
}

export function buildActionsApiFilters({
  state,
  userId,
  forceResponsibleId,
  selectedCompanyId,
  page,
  limit,
}: BuildActionsApiFiltersInput): ActionFilters {
  const filters: ActionFilters = {}

  if (state.statuses.length === 1) {
    filters.status = state.statuses[0]
  } else if (state.statuses.length > 1) {
    filters.statuses = state.statuses
  }

  if (state.priority !== 'all') filters.priority = state.priority
  if (state.showBlockedOnly) filters.isBlocked = true
  if (state.showLateOnly) filters.isLate = true

  if (state.assignment === 'assigned-to-me') {
    filters.responsibleId = userId
  }

  if (state.assignment === 'created-by-me') {
    filters.creatorId = userId
  }

  if (forceResponsibleId) {
    filters.responsibleId = forceResponsibleId
    delete filters.creatorId
  }

  if (state.companyId) {
    filters.companyId = state.companyId
  } else if (selectedCompanyId) {
    filters.companyId = selectedCompanyId
  }

  if (state.teamId) filters.teamId = state.teamId

  // Date range filters - backend handles the filtering
  if (state.dateFrom) filters.dateFrom = state.dateFrom
  if (state.dateTo) filters.dateTo = state.dateTo
  if (state.dateFrom || state.dateTo) {
    filters.dateFilterType = state.dateFilterType
  }

  const q = state.searchQuery?.trim()
  if (q) filters.q = q

  const objective = state.objective?.trim()
  if (objective) filters.objective = objective

  filters.page = page
  filters.limit = limit

  return filters
}


