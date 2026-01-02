import { apiClient } from '../api-client';
import type {
  Action,
  ActionFilters,
  AddChecklistItemDto,
  BlockActionDto,
  ChecklistItem,
  CreateActionDto,
  GenerateActionPlanDto,
  ActionSuggestion,
  MoveActionDto,
  UpdateActionDto,
} from '@/lib/types/action';

/**
 * Build query string from filters object
 */
function buildQueryString(filters: ActionFilters): string {
  const params = new URLSearchParams();

  // Backend supports only these query params (see tooldo-api ActionController.list)
  const supportedKeys: (keyof ActionFilters)[] = [
    'companyId',
    'teamId',
    'responsibleId',
    'status',
    'priority',
    'isLate',
    'isBlocked',
  ];

  supportedKeys.forEach((key) => {
    const value = filters[key];
    if (value !== undefined && value !== null && value !== '') {
      params.append(String(key), String(value));
    }
  });

  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
}

export const actionsApi = {
  /**
   * Get list of actions with optional filters
   */
  getAll: (filters: ActionFilters = {}): Promise<Action[]> => {
    const queryString = buildQueryString(filters);
    return apiClient.get<Action[]>(`/api/v1/actions${queryString}`);
  },

  /**
   * Create new action
   */
  create: (data: CreateActionDto): Promise<Action> => {
    return apiClient.post<Action>('/api/v1/actions', data);
  },

  /**
   * Update existing action
   */
  update: (id: string, data: UpdateActionDto): Promise<Action> => {
    return apiClient.put<Action>(`/api/v1/actions/${id}`, data);
  },

  /**
   * Delete action (soft delete)
   */
  delete: (id: string): Promise<Action> => {
    return apiClient.delete<Action>(`/api/v1/actions/${id}`);
  },

  /**
   * Move action to new status and position
   */
  move: (id: string, data: MoveActionDto): Promise<Action> => {
    return apiClient.patch<Action>(`/api/v1/actions/${id}/move`, data);
  },

  /**
   * Block action with reason
   */
  block: (id: string, data: BlockActionDto): Promise<Action> => {
    return apiClient.patch<Action>(`/api/v1/actions/${id}/block`, data);
  },

  /**
   * Unblock action
   */
  unblock: (id: string): Promise<Action> => {
    return apiClient.patch<Action>(`/api/v1/actions/${id}/unblock`);
  },

  /**
   * Add checklist item to action
   */
  addChecklistItem: (
    actionId: string,
    data: AddChecklistItemDto
  ): Promise<ChecklistItem> => {
    return apiClient.post<ChecklistItem>(`/api/v1/actions/${actionId}/checklist`, data);
  },

  /**
   * Toggle checklist item completion
   */
  toggleChecklistItem: (itemId: string): Promise<ChecklistItem> => {
    return apiClient.patch<ChecklistItem>(`/api/v1/actions/checklist/${itemId}/toggle`);
  },

  /**
   * Reorder checklist items
   */
  reorderChecklistItems: (
    actionId: string,
    itemIds: string[]
  ): Promise<ChecklistItem[]> => {
    return apiClient.patch<ChecklistItem[]>(
      `/api/v1/actions/${actionId}/checklist/reorder`,
      { itemIds }
    );
  },

  /**
   * Generate action suggestions (IA)
   */
  generate: (data: GenerateActionPlanDto): Promise<ActionSuggestion[]> => {
    return apiClient.post<ActionSuggestion[]>('/api/v1/actions/generate', data);
  },
};

export type {
  Action,
  ActionFilters,
  AddChecklistItemDto,
  BlockActionDto,
  ChecklistItem,
  CreateActionDto,
  GenerateActionPlanDto,
  ActionSuggestion,
  MoveActionDto,
  UpdateActionDto,
};
