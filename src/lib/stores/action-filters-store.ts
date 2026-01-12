import type {
  ActionLateStatus,
  ActionPriority,
  ActionStatus,
} from '@/lib/types/action'
import type { DatePreset } from '@/lib/utils/date-presets'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type AssignmentFilter = 'all' | 'assigned-to-me' | 'created-by-me' | 'my-teams'
type DateFilterType = 'createdAt' | 'startDate'

interface ActionFiltersState {
  // Filter values
  statuses: ActionStatus[]
  priority: ActionPriority | 'all'
  assignment: AssignmentFilter
  dateFrom: string | null // ISO string
  dateTo: string | null // ISO string
  dateFilterType: DateFilterType // Filter by creation date or start date
  datePreset: DatePreset | null // tracks active preset
  companyId: string | null
  teamId: string | null
  /**
   * Filtro explícito por responsável.
   * Para gestores/admins, permite selecionar um membro da equipe/empresa.
   */
  responsibleId: string | null
  showBlockedOnly: boolean
  showLateOnly: boolean
  lateStatusFilter: ActionLateStatus | 'all' | null
  searchQuery: string

  // Table preferences
  viewMode: 'list' | 'kanban'
  sortBy: string
  sortOrder: 'asc' | 'desc'
  page: number
  pageSize: number

  // Actions
  setFilter: <K extends keyof ActionFiltersState>(key: K, value: ActionFiltersState[K]) => void
  resetFilters: () => void
}

const initialState = {
  statuses: [] as ActionStatus[],
  priority: 'all' as const,
  assignment: 'all' as AssignmentFilter,
  dateFrom: null,
  dateTo: null,
  dateFilterType: 'createdAt' as DateFilterType,
  datePreset: null,
  companyId: null,
  teamId: null,
  responsibleId: null,
  showBlockedOnly: false,
  showLateOnly: false,
  lateStatusFilter: 'all' as const,
  searchQuery: '',
  viewMode: 'list' as const,
  sortBy: 'estimatedEndDate',
  sortOrder: 'asc' as const,
  page: 1,
  pageSize: 20,
}

export const useActionFiltersStore = create<ActionFiltersState>()(
  persist(
    (set) => ({
      ...initialState,

      setFilter: (key, value) => {
        set((state) => ({
          ...state,
          [key]: value,
          // Reset page when filters change
          page: key !== 'page' && key !== 'pageSize' ? 1 : state.page,
        }))
      },

      resetFilters: () => {
        set(initialState)
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
        datePreset: state.datePreset,
      }),
    }
  )
)
