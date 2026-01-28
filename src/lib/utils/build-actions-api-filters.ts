import type {
  ActionFilters,
  ActionLateStatus,
  ActionPriority,
  ActionStatus,
} from '@/lib/types/action'
import { AssignmentFilter, DateFilterType } from '@/lib/types/action'

export type ActionFiltersUIState = {
  statuses: ActionStatus[]
  priority: ActionPriority | 'all'
  assignment: AssignmentFilter
  dateFrom: string | null
  dateTo: string | null
  dateFilterType: DateFilterType
  companyId: string | null
  teamId: string | null
  responsibleId: string | null
  showBlockedOnly: boolean
  showLateOnly: boolean
  lateStatusFilter: ActionLateStatus | 'all' | null
  searchQuery: string
}

type BuildActionsApiFiltersInput = {
  state: ActionFiltersUIState
  userId?: string
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
  if (state.showLateOnly) {
    filters.isLate = true
  }

  if (state.lateStatusFilter && state.lateStatusFilter !== 'all') {
    filters.lateStatus = [state.lateStatusFilter]
    delete filters.isLate
  }

  if (state.assignment === AssignmentFilter.ASSIGNED_TO_ME) {
    filters.responsibleId = userId
  }

  if (state.assignment === AssignmentFilter.CREATED_BY_ME) {
    filters.creatorId = userId
  }

  if (state.responsibleId) {
    filters.responsibleId = state.responsibleId
    delete filters.creatorId
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

  if (state.dateFrom) filters.dateFrom = state.dateFrom
  if (state.dateTo) filters.dateTo = state.dateTo
  if (state.dateFrom || state.dateTo) {
    filters.dateFilterType = state.dateFilterType
  }

  const q = state.searchQuery?.trim()
  if (q) filters.q = q

  filters.page = page
  filters.limit = limit

  return filters
}
