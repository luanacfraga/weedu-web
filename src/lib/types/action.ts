// Action Status Enum
export enum ActionStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}

// Action Priority Enum
export enum ActionPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

// Checklist Item (as returned inside ActionResponseDto.checklistItems)
export interface Action {
  id: string;
  title: string;
  description: string;
  status: ActionStatus;
  priority: ActionPriority;
  estimatedStartDate: string;
  estimatedEndDate: string;
  actualStartDate: string | null;
  actualEndDate: string | null;
  isLate: boolean;
  isBlocked: boolean;
  blockedReason: string | null;
  companyId: string;
  teamId: string | null;
  creatorId: string;
  responsibleId: string;
  checklistItems: ChecklistItem[];
}

// Checklist Item
export interface ChecklistItem {
  id: string;
  description: string;
  isCompleted: boolean;
  checked?: boolean;
  completedAt: string | null;
  order: number;
}

// DTOs for API requests
export interface CreateActionDto {
  title: string;
  description: string;
  estimatedStartDate: string;
  estimatedEndDate: string;
  priority: ActionPriority;
  companyId: string;
  teamId?: string;
  responsibleId: string;
}

export interface UpdateActionDto {
  title?: string;
  description?: string;
  estimatedStartDate?: string;
  estimatedEndDate?: string;
  priority?: ActionPriority;
  teamId?: string;
  responsibleId?: string;
}

export interface ActionFilters {
  status?: ActionStatus;
  priority?: ActionPriority;
  responsibleId?: string;
  companyId?: string;
  teamId?: string;
  isLate?: boolean;
  isBlocked?: boolean;
}

export interface MoveActionDto {
  toStatus: ActionStatus;
  notes?: string;
}

export interface BlockActionDto {
  reason: string;
}

export interface AddChecklistItemDto {
  description: string;
  order: number;
}

export interface GenerateActionPlanDto {
  companyId: string;
  teamId?: string;
  goal: string;
}

export interface ActionSuggestion {
  title: string;
  description: string;
  priority: ActionPriority;
  estimatedDurationDays: number;
  checklistItems: string[];
}
