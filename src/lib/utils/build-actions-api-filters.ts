import type { ActionFilters, ActionPriority, ActionStatus } from '@/lib/types/action'

type AssignmentFilter = 'all' | 'assigned-to-me' | 'created-by-me' | 'my-teams'

export type ActionFiltersUIState = {
  statuses: ActionStatus[]
  priority: ActionPriority | 'all'
  assignment: AssignmentFilter
  companyId: string | null
  teamId: string | null
  showBlockedOnly: boolean
  showLateOnly: boolean
  searchQuery: string
}

type BuildActionsApiFiltersInput = {
  state: ActionFiltersUIState
  userId?: string
  selectedCompanyId?: string
  page: number
  limit: number
}

export function buildActionsApiFilters({
  state,
  userId,
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

  if (state.companyId) {
    filters.companyId = state.companyId
  } else if (selectedCompanyId) {
    filters.companyId = selectedCompanyId
  }

  if (state.teamId) filters.teamId = state.teamId

  const q = state.searchQuery?.trim()
  if (q) filters.q = q

  filters.page = page
  filters.limit = limit

  return filters
}


