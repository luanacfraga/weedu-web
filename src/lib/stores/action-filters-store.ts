import type {
  ActionLateStatus,
  ActionPriority,
  ActionStatus,
} from '@/lib/types/action'
import { ActionScopeFilter, AssignmentFilter, DateFilterType, ViewMode } from '@/lib/types/action'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ActionFiltersState {
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
  viewMode: ViewMode
  sortBy: string
  sortOrder: 'asc' | 'desc'
  page: number
  pageSize: number

  scopeType: ActionScopeFilter | null
  selectedTeamId: string | null

  setFilter: <K extends keyof ActionFiltersState>(key: K, value: ActionFiltersState[K]) => void
  resetFilters: () => void
  resetToRoleDefaults: (role: string) => void
}

const initialState = {
  statuses: [] as ActionStatus[],
  priority: 'all' as const,
  assignment: AssignmentFilter.ALL,
  dateFrom: null,
  dateTo: null,
  dateFilterType: DateFilterType.ESTIMATED_START_DATE,
  companyId: null,
  teamId: null,
  responsibleId: null,
  showBlockedOnly: false,
  showLateOnly: false,
  lateStatusFilter: 'all' as const,
  searchQuery: '',
  viewMode: ViewMode.LIST,
  sortBy: 'estimatedEndDate',
  sortOrder: 'asc' as const,
  page: 1,
  pageSize: 20,

  scopeType: null,
  selectedTeamId: null,
}

export const useActionFiltersStore = create<ActionFiltersState>()(
  persist(
    (set) => ({
      ...initialState,

      setFilter: (key, value) => {
        set((state) => {
          const updates: Partial<ActionFiltersState> = {
            [key]: value,
            page: key !== 'page' && key !== 'pageSize' ? 1 : state.page,
          }

          // Cascading logic: when scope changes, reset responsible
          if (key === 'scopeType' || key === 'selectedTeamId') {
            updates.responsibleId = null
          }

          return { ...state, ...updates }
        })
      },

      resetFilters: () => {
        set((state) => ({
          ...initialState,
          scopeType: null,
          selectedTeamId: null,
        }))
      },

      resetToRoleDefaults: (role) => {
        set((state) => {
          let scopeType: ActionScopeFilter | null = null

          if (role === 'admin') {
            scopeType = ActionScopeFilter.ENTIRE_COMPANY
          } else if (role === 'manager') {
            scopeType = ActionScopeFilter.ALL_MY_TEAMS
          }
          // Executor gets null (handled by forcing responsibleId in component)

          return {
            ...initialState,
            scopeType,
            selectedTeamId: null,
            responsibleId: null,
          }
        })
      },
    }),
    {
      name: 'action-filters-storage',
      partialize: (state) => ({
        viewMode: state.viewMode,
        sortBy: state.sortBy,
        sortOrder: state.sortOrder,
        pageSize: state.pageSize,
        dateFrom: state.dateFrom,
        dateTo: state.dateTo,
        dateFilterType: state.dateFilterType,
        scopeType: state.scopeType,
        selectedTeamId: state.selectedTeamId,
      }),
    }
  )
)
