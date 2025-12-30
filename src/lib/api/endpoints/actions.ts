import { apiClient } from '../api-client';
import type {
  Action,
  ActionFilters,
  ActionMovement,
  AddChecklistItemDto,
  BlockActionDto,
  ChecklistItem,
  CreateActionDto,
  MoveActionDto,
  UpdateActionDto,
} from '@/lib/types/action';

/**
 * Build query string from filters object
 */
function buildQueryString(filters: ActionFilters): string {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, String(value));
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
   * Get single action by ID
   */
  getById: (id: string): Promise<Action> => {
    return apiClient.get<Action>(`/api/v1/actions/${id}`);
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
  delete: (id: string): Promise<void> => {
    return apiClient.delete<void>(`/api/v1/actions/${id}`);
  },

  /**
   * Move action to new status
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
  addChecklistItem: (actionId: string, data: AddChecklistItemDto): Promise<ChecklistItem> => {
    return apiClient.post<ChecklistItem>(`/api/v1/actions/${actionId}/checklist`, data);
  },

  /**
   * Toggle checklist item completion
   */
  toggleChecklistItem: (actionId: string, itemId: string): Promise<ChecklistItem> => {
    return apiClient.patch<ChecklistItem>(
      `/api/v1/actions/${actionId}/checklist/${itemId}/toggle`
    );
  },

  /**
   * Delete checklist item
   */
  deleteChecklistItem: (actionId: string, itemId: string): Promise<void> => {
    return apiClient.delete<void>(`/api/v1/actions/${actionId}/checklist/${itemId}`);
  },

  /**
   * Get action movement history
   */
  getMovements: (actionId: string): Promise<ActionMovement[]> => {
    return apiClient.get<ActionMovement[]>(`/api/v1/actions/${actionId}/movements`);
  },
};

export type {
  Action,
  ActionFilters,
  ActionMovement,
  AddChecklistItemDto,
  BlockActionDto,
  ChecklistItem,
  CreateActionDto,
  MoveActionDto,
  UpdateActionDto,
};
