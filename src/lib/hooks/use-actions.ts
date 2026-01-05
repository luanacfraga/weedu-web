import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from '@tanstack/react-query';
import { keepPreviousData } from '@tanstack/react-query';
import { actionsApi } from '@/lib/api/endpoints/actions';
import type { PaginatedResponse } from '@/lib/api/types';
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
import { useCompany } from '@/lib/hooks/use-company';

// Query keys
export const actionKeys = {
  all: ['actions'] as const,
  lists: () => [...actionKeys.all, 'list'] as const,
  list: (filters: ActionFilters) => [...actionKeys.lists(), filters] as const,
  details: () => [...actionKeys.all, 'detail'] as const,
  detail: (id: string) => [...actionKeys.details(), id] as const,
};

/**
 * Hook to fetch actions with filters
 */
export function useActions(
  filters: ActionFilters = {}
): UseQueryResult<PaginatedResponse<Action>, Error> {
  // Backend returns an empty list when no scope is provided.
  // Guard here to avoid flashing empty state during store hydration / view switches.
  const hasScope = !!(filters.companyId || filters.teamId || filters.responsibleId);
  return useQuery({
    queryKey: actionKeys.list(filters),
    queryFn: () => actionsApi.getAll(filters),
    staleTime: 1000 * 60, // 1 minute
    placeholderData: keepPreviousData,
    enabled: hasScope,
  });
}

/**
 * Hook to fetch single action by ID.
 *
 * Note: backend currently does not expose GET /actions/:id, so we resolve the action
 * by listing actions (scoped to selected company when available) and finding by id.
 */
export function useAction(id: string): UseQueryResult<Action, Error> {
  return useQuery({
    queryKey: actionKeys.detail(id),
    queryFn: async () => {
      return actionsApi.getById(id);
    },
    enabled: !!id,
  });
}

/**
 * Hook to create action
 */
export function useCreateAction(): UseMutationResult<Action, Error, CreateActionDto> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: actionsApi.create,
    onSuccess: () => {
      // Invalidate all action lists
      queryClient.invalidateQueries({ queryKey: actionKeys.lists() });
    },
  });
}

/**
 * Hook to update action
 */
export function useUpdateAction(): UseMutationResult<
  Action,
  Error,
  { id: string; data: UpdateActionDto }
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => actionsApi.update(id, data),
    onSuccess: (updatedAction) => {
      // Update cache for specific action
      queryClient.setQueryData(actionKeys.detail(updatedAction.id), updatedAction);
      // Invalidate lists to refresh
      queryClient.invalidateQueries({ queryKey: actionKeys.lists() });
    },
  });
}

/**
 * Hook to delete action
 */
export function useDeleteAction(): UseMutationResult<Action, Error, string> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: actionsApi.delete,
    onSuccess: (deletedAction) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: actionKeys.detail(deletedAction.id) });
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: actionKeys.lists() });
    },
  });
}

/**
 * Hook to move action status
 */
export function useMoveAction(): UseMutationResult<
  Action,
  Error,
  { id: string; data: MoveActionDto }
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => actionsApi.move(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: actionKeys.detail(id) });

      // Snapshot previous value
      const previousAction = queryClient.getQueryData<Action>(actionKeys.detail(id));

      // Optimistically update
      if (previousAction) {
        queryClient.setQueryData<Action>(actionKeys.detail(id), {
          ...previousAction,
          status: data.toStatus,
        });
      }

      return { previousAction };
    },
    onError: (err, { id }, context) => {
      // Rollback on error
      if (context?.previousAction) {
        queryClient.setQueryData(actionKeys.detail(id), context.previousAction);
      }
    },
    onSuccess: (updatedAction) => {
      // Update cache
      queryClient.setQueryData(actionKeys.detail(updatedAction.id), updatedAction);
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: actionKeys.lists() });
    },
  });
}

/**
 * Hook to block action
 */
export function useBlockAction(): UseMutationResult<
  Action,
  Error,
  { id: string; data: BlockActionDto }
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => actionsApi.block(id, data),
    onSuccess: (updatedAction) => {
      queryClient.setQueryData(actionKeys.detail(updatedAction.id), updatedAction);
      queryClient.invalidateQueries({ queryKey: actionKeys.lists() });
    },
  });
}

/**
 * Hook to unblock action
 */
export function useUnblockAction(): UseMutationResult<Action, Error, string> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: actionsApi.unblock,
    onSuccess: (updatedAction) => {
      queryClient.setQueryData(actionKeys.detail(updatedAction.id), updatedAction);
      queryClient.invalidateQueries({ queryKey: actionKeys.lists() });
    },
  });
}

/**
 * Hook to add checklist item
 */
export function useAddChecklistItem(): UseMutationResult<
  ChecklistItem,
  Error,
  { actionId: string; data: AddChecklistItemDto }
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ actionId, data }) => actionsApi.addChecklistItem(actionId, data),
    onSuccess: (_, { actionId }) => {
      // Invalidate action detail to refetch with new checklist
      queryClient.invalidateQueries({ queryKey: actionKeys.detail(actionId) });
      // Also invalidate lists since useAction fetches from list
      queryClient.invalidateQueries({ queryKey: actionKeys.lists() });
    },
  });
}

/**
 * Hook to toggle checklist item
 */
export function useToggleChecklistItem(): UseMutationResult<
  ChecklistItem,
  Error,
  { actionId: string; itemId: string }
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId }) => actionsApi.toggleChecklistItem(itemId),
    onMutate: async ({ actionId, itemId }) => {
      // Cancel queries
      await queryClient.cancelQueries({ queryKey: actionKeys.detail(actionId) });

      // Snapshot
      const previousAction = queryClient.getQueryData<Action>(actionKeys.detail(actionId));

      // Optimistic update
      if (previousAction?.checklistItems) {
        const updatedChecklistItems = previousAction.checklistItems.map((item) =>
          item.id === itemId
            ? {
                ...item,
                isCompleted: !item.isCompleted,
                completedAt: !item.isCompleted ? new Date().toISOString() : null,
              }
            : item
        );

        queryClient.setQueryData<Action>(actionKeys.detail(actionId), {
          ...previousAction,
          checklistItems: updatedChecklistItems,
        });
      }

      return { previousAction };
    },
    onError: (err, { actionId }, context) => {
      // Rollback
      if (context?.previousAction) {
        queryClient.setQueryData(actionKeys.detail(actionId), context.previousAction);
      }
    },
    onSuccess: (_, { actionId }) => {
      // Refetch to get server state
      queryClient.invalidateQueries({ queryKey: actionKeys.detail(actionId) });
      // Also invalidate lists since useAction fetches from list
      queryClient.invalidateQueries({ queryKey: actionKeys.lists() });
    },
  });
}

/**
 * Hook to reorder checklist items
 */
export function useReorderChecklistItems(): UseMutationResult<
  ChecklistItem[],
  Error,
  { actionId: string; itemIds: string[] }
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ actionId, itemIds }) => actionsApi.reorderChecklistItems(actionId, itemIds),
    onSuccess: (_, { actionId }) => {
      // Invalidate action detail to refetch with new order
      queryClient.invalidateQueries({ queryKey: actionKeys.detail(actionId) });
      // Also invalidate lists since useAction fetches from list
      queryClient.invalidateQueries({ queryKey: actionKeys.lists() });
    },
  });
}

/**
 * Hook to generate action plan suggestions (IA)
 */
export function useGenerateActionPlan(): UseMutationResult<
  ActionSuggestion[],
  Error,
  GenerateActionPlanDto
> {
  return useMutation({
    mutationFn: actionsApi.generate,
  });
}
