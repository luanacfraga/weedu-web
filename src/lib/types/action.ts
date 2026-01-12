export enum ActionStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}

export enum ActionPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum ActionLateStatus {
  LATE_TO_START = 'LATE_TO_START',
  LATE_TO_FINISH = 'LATE_TO_FINISH',
  COMPLETED_LATE = 'COMPLETED_LATE',
}

export interface KanbanOrder {
  id: string
  column: ActionStatus
  position: number
  sortOrder: number
  lastMovedAt: string
}

export interface Action {
  id: string
  title: string
  description: string
  status: ActionStatus
  priority: ActionPriority
  estimatedStartDate: string
  estimatedEndDate: string
  actualStartDate: string | null
  actualEndDate: string | null
  isLate: boolean
  isBlocked: boolean
  blockedReason: string | null
  companyId: string
  teamId: string | null
  creatorId: string
  responsibleId: string
  responsible?: {
    id: string
    firstName: string
    lastName: string
  } | null
  checklistItems: ChecklistItem[]
  lateStatus: ActionLateStatus | null
  kanbanOrder: KanbanOrder | null
}

export interface ChecklistItem {
  id: string
  description: string
  isCompleted: boolean
  checked?: boolean
  completedAt: string | null
  order: number
}

export interface UpsertChecklistItemInput {
  description: string
  isCompleted?: boolean
  order?: number
}

export interface CreateActionDto {
  title: string
  description: string
  estimatedStartDate: string
  estimatedEndDate: string
  priority: ActionPriority
  companyId: string
  teamId?: string
  responsibleId: string
  isBlocked?: boolean
  checklistItems?: UpsertChecklistItemInput[]
}

export interface UpdateActionDto {
  title?: string
  description?: string
  estimatedStartDate?: string
  estimatedEndDate?: string
  priority?: ActionPriority
  teamId?: string
  responsibleId?: string
  isBlocked?: boolean
  actualStartDate?: string | null
  actualEndDate?: string | null
  checklistItems?: UpsertChecklistItemInput[]
}

export interface ActionFilters {
  status?: ActionStatus
  statuses?: ActionStatus[]
  priority?: ActionPriority
  responsibleId?: string
  creatorId?: string
  companyId?: string
  teamId?: string
  isLate?: boolean
  isBlocked?: boolean
  lateStatus?: ActionLateStatus | ActionLateStatus[]
  q?: string
  dateFrom?: string
  dateTo?: string
  dateFilterType?: 'createdAt' | 'startDate'
  page?: number
  limit?: number
}

export interface MoveActionDto {
  toStatus: ActionStatus
  position?: number
  notes?: string
}

export interface BlockActionDto {
  reason: string
}

export interface AddChecklistItemDto {
  description: string
  order: number
}

export interface GenerateActionPlanDto {
  companyId: string
  teamId?: string
  goal: string
}

export interface ActionSuggestion {
  title: string
  description: string
  priority: ActionPriority
  estimatedDurationDays: number
  checklistItems: string[]
}
