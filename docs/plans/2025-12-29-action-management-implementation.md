# Action Management Frontend Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a comprehensive action management interface allowing users to create, view, edit, and track action items with checklists and blocking capabilities.

**Architecture:** Frontend-only implementation using Next.js App Router, shadcn/ui components, TanStack Query for data fetching, React Hook Form + Zod for forms, and Zustand for UI state. Follows existing patterns in the codebase with role-based permissions enforced at UI and API levels.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, shadcn/ui, TanStack Query, React Hook Form, Zod, Zustand, Lucide React

**Design Document:** `docs/plans/2025-12-29-action-management-frontend-design.md`

---

## Phase 1: Foundation Setup

### Task 1: Create TypeScript Types

**Files:**
- Create: `src/lib/types/action.ts`

**Step 1: Create action types file**

Create `src/lib/types/action.ts`:

```typescript
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

// Main Action Entity
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
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;

  // Populated relations
  creator?: {
    id: string;
    name: string;
    email: string;
  };
  responsible?: {
    id: string;
    name: string;
    email: string;
  };
  company?: {
    id: string;
    name: string;
  };
  team?: {
    id: string;
    name: string;
  } | null;
  checklistItems?: ChecklistItem[];
}

// Checklist Item
export interface ChecklistItem {
  id: string;
  actionId: string;
  description: string;
  isCompleted: boolean;
  completedAt: string | null;
  order: number;
  createdAt: string;
}

// Action Movement (status change history)
export interface ActionMovement {
  id: string;
  actionId: string;
  fromStatus: ActionStatus;
  toStatus: ActionStatus;
  movedById: string;
  movedAt: string;
  notes: string | null;
  movedBy?: {
    id: string;
    name: string;
  };
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
  creatorId?: string;
  companyId?: string;
  teamId?: string;
  isLate?: boolean;
  isBlocked?: boolean;
  search?: string;
}

export interface MoveActionDto {
  status: ActionStatus;
}

export interface BlockActionDto {
  reason: string;
}

export interface AddChecklistItemDto {
  description: string;
}
```

**Step 2: Verify types compile**

Run: `npm run build`
Expected: Build succeeds with no type errors

**Step 3: Commit**

```bash
git add src/lib/types/action.ts
git commit -m "feat: add action management TypeScript types

- Add Action, ChecklistItem, ActionMovement interfaces
- Add ActionStatus and ActionPriority enums
- Add DTOs for create, update, filter operations
- Match backend API response structure

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 2: Create API Client

**Files:**
- Create: `src/lib/api/actions.ts`
- Reference: `src/lib/api/` (check existing client pattern)

**Step 1: Check existing API client pattern**

Read `src/lib/api/` directory to understand existing patterns:

```bash
ls -la src/lib/api/
```

Expected: Find existing API client files to follow the same pattern

**Step 2: Create actions API client**

Create `src/lib/api/actions.ts`:

```typescript
import {
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
import { apiClient } from './client'; // Adjust based on existing pattern

const BASE_PATH = '/api/v1/actions';

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

/**
 * Get list of actions with optional filters
 */
export async function getActions(filters: ActionFilters = {}): Promise<Action[]> {
  const queryString = buildQueryString(filters);
  const response = await apiClient.get<Action[]>(`${BASE_PATH}${queryString}`);
  return response.data;
}

/**
 * Get single action by ID
 */
export async function getActionById(id: string): Promise<Action> {
  const response = await apiClient.get<Action>(`${BASE_PATH}/${id}`);
  return response.data;
}

/**
 * Create new action
 */
export async function createAction(data: CreateActionDto): Promise<Action> {
  const response = await apiClient.post<Action>(BASE_PATH, data);
  return response.data;
}

/**
 * Update existing action
 */
export async function updateAction(id: string, data: UpdateActionDto): Promise<Action> {
  const response = await apiClient.put<Action>(`${BASE_PATH}/${id}`, data);
  return response.data;
}

/**
 * Delete action (soft delete)
 */
export async function deleteAction(id: string): Promise<void> {
  await apiClient.delete(`${BASE_PATH}/${id}`);
}

/**
 * Move action to new status
 */
export async function moveAction(id: string, data: MoveActionDto): Promise<Action> {
  const response = await apiClient.patch<Action>(`${BASE_PATH}/${id}/move`, data);
  return response.data;
}

/**
 * Block action with reason
 */
export async function blockAction(id: string, data: BlockActionDto): Promise<Action> {
  const response = await apiClient.patch<Action>(`${BASE_PATH}/${id}/block`, data);
  return response.data;
}

/**
 * Unblock action
 */
export async function unblockAction(id: string): Promise<Action> {
  const response = await apiClient.patch<Action>(`${BASE_PATH}/${id}/unblock`);
  return response.data;
}

/**
 * Add checklist item to action
 */
export async function addChecklistItem(
  actionId: string,
  data: AddChecklistItemDto
): Promise<ChecklistItem> {
  const response = await apiClient.post<ChecklistItem>(
    `${BASE_PATH}/${actionId}/checklist`,
    data
  );
  return response.data;
}

/**
 * Toggle checklist item completion
 */
export async function toggleChecklistItem(
  actionId: string,
  itemId: string
): Promise<ChecklistItem> {
  const response = await apiClient.patch<ChecklistItem>(
    `${BASE_PATH}/${actionId}/checklist/${itemId}/toggle`
  );
  return response.data;
}

/**
 * Delete checklist item
 */
export async function deleteChecklistItem(actionId: string, itemId: string): Promise<void> {
  await apiClient.delete(`${BASE_PATH}/${actionId}/checklist/${itemId}`);
}

/**
 * Get action movement history
 */
export async function getActionMovements(actionId: string): Promise<ActionMovement[]> {
  const response = await apiClient.get<ActionMovement[]>(`${BASE_PATH}/${actionId}/movements`);
  return response.data;
}
```

**Step 3: Verify imports and types**

Run: `npm run build`
Expected: Build succeeds, all types resolve correctly

**Step 4: Commit**

```bash
git add src/lib/api/actions.ts
git commit -m "feat: add actions API client

- Implement all action CRUD endpoints
- Add checklist management endpoints
- Add blocking/unblocking endpoints
- Add movement history endpoint
- Include query string builder for filters

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 3: Create TanStack Query Hooks

**Files:**
- Create: `src/lib/hooks/use-actions.ts`

**Step 1: Create TanStack Query hooks**

Create `src/lib/hooks/use-actions.ts`:

```typescript
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from '@tanstack/react-query';
import {
  addChecklistItem,
  blockAction,
  createAction,
  deleteAction,
  deleteChecklistItem,
  getActionById,
  getActionMovements,
  getActions,
  moveAction,
  toggleChecklistItem,
  unblockAction,
  updateAction,
} from '@/lib/api/actions';
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

// Query keys
export const actionKeys = {
  all: ['actions'] as const,
  lists: () => [...actionKeys.all, 'list'] as const,
  list: (filters: ActionFilters) => [...actionKeys.lists(), filters] as const,
  details: () => [...actionKeys.all, 'detail'] as const,
  detail: (id: string) => [...actionKeys.details(), id] as const,
  movements: (id: string) => [...actionKeys.detail(id), 'movements'] as const,
};

/**
 * Hook to fetch actions with filters
 */
export function useActions(filters: ActionFilters = {}): UseQueryResult<Action[], Error> {
  return useQuery({
    queryKey: actionKeys.list(filters),
    queryFn: () => getActions(filters),
    staleTime: 1000 * 60, // 1 minute
  });
}

/**
 * Hook to fetch single action by ID
 */
export function useAction(id: string): UseQueryResult<Action, Error> {
  return useQuery({
    queryKey: actionKeys.detail(id),
    queryFn: () => getActionById(id),
    enabled: !!id,
  });
}

/**
 * Hook to fetch action movement history
 */
export function useActionMovements(actionId: string): UseQueryResult<ActionMovement[], Error> {
  return useQuery({
    queryKey: actionKeys.movements(actionId),
    queryFn: () => getActionMovements(actionId),
    enabled: !!actionId,
  });
}

/**
 * Hook to create action
 */
export function useCreateAction(): UseMutationResult<Action, Error, CreateActionDto> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAction,
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
    mutationFn: ({ id, data }) => updateAction(id, data),
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
export function useDeleteAction(): UseMutationResult<void, Error, string> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAction,
    onSuccess: (_, deletedId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: actionKeys.detail(deletedId) });
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
    mutationFn: ({ id, data }) => moveAction(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: actionKeys.detail(id) });

      // Snapshot previous value
      const previousAction = queryClient.getQueryData<Action>(actionKeys.detail(id));

      // Optimistically update
      if (previousAction) {
        queryClient.setQueryData<Action>(actionKeys.detail(id), {
          ...previousAction,
          status: data.status,
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
      // Invalidate lists and movements
      queryClient.invalidateQueries({ queryKey: actionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: actionKeys.movements(updatedAction.id) });
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
    mutationFn: ({ id, data }) => blockAction(id, data),
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
    mutationFn: unblockAction,
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
    mutationFn: ({ actionId, data }) => addChecklistItem(actionId, data),
    onSuccess: (_, { actionId }) => {
      // Invalidate action detail to refetch with new checklist
      queryClient.invalidateQueries({ queryKey: actionKeys.detail(actionId) });
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
    mutationFn: ({ actionId, itemId }) => toggleChecklistItem(actionId, itemId),
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
    },
  });
}

/**
 * Hook to delete checklist item
 */
export function useDeleteChecklistItem(): UseMutationResult<
  void,
  Error,
  { actionId: string; itemId: string }
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ actionId, itemId }) => deleteChecklistItem(actionId, itemId),
    onSuccess: (_, { actionId }) => {
      queryClient.invalidateQueries({ queryKey: actionKeys.detail(actionId) });
    },
  });
}
```

**Step 2: Verify hooks compile**

Run: `npm run build`
Expected: Build succeeds with no errors

**Step 3: Commit**

```bash
git add src/lib/hooks/use-actions.ts
git commit -m "feat: add TanStack Query hooks for actions

- Implement useActions, useAction, useActionMovements
- Add mutation hooks for CRUD operations
- Add hooks for checklist and blocking operations
- Include optimistic updates for status and checklist
- Implement proper cache invalidation strategy

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 4: Create Zustand Store for Filters

**Files:**
- Create: `src/lib/stores/action-filters-store.ts`

**Step 1: Create filters store**

Create `src/lib/stores/action-filters-store.ts`:

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ActionPriority, ActionStatus } from '@/lib/types/action';

type AssignmentFilter = 'all' | 'assigned-to-me' | 'created-by-me' | 'my-teams';

interface ActionFiltersState {
  // Filter values
  status: ActionStatus | 'all';
  priority: ActionPriority | 'all';
  assignment: AssignmentFilter;
  companyId: string | null;
  teamId: string | null;
  showBlockedOnly: boolean;
  showLateOnly: boolean;
  searchQuery: string;

  // Table preferences
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  page: number;
  pageSize: number;

  // Actions
  setFilter: <K extends keyof ActionFiltersState>(key: K, value: ActionFiltersState[K]) => void;
  resetFilters: () => void;
}

const initialState = {
  status: 'all' as const,
  priority: 'all' as const,
  assignment: 'all' as AssignmentFilter,
  companyId: null,
  teamId: null,
  showBlockedOnly: false,
  showLateOnly: false,
  searchQuery: '',
  sortBy: 'estimatedEndDate',
  sortOrder: 'asc' as const,
  page: 1,
  pageSize: 20,
};

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
        }));
      },

      resetFilters: () => {
        set(initialState);
      },
    }),
    {
      name: 'action-filters-storage',
      partialPersist: (state) => ({
        sortBy: state.sortBy,
        sortOrder: state.sortOrder,
        pageSize: state.pageSize,
      }),
    }
  )
);
```

**Step 2: Verify store compiles**

Run: `npm run build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/lib/stores/action-filters-store.ts
git commit -m "feat: add Zustand store for action filters

- Create persisted store for filter preferences
- Include status, priority, assignment filters
- Add table sorting and pagination state
- Persist user preferences across sessions

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Phase 2: Shared UI Components

### Task 5: Create Badge Components

**Files:**
- Create: `src/components/ui/badge.tsx` (if not exists)
- Create: `src/components/features/actions/shared/status-badge.tsx`
- Create: `src/components/features/actions/shared/priority-badge.tsx`
- Create: `src/components/features/actions/shared/late-indicator.tsx`
- Create: `src/components/features/actions/shared/blocked-badge.tsx`

**Step 1: Create or verify base Badge component exists**

Check if `src/components/ui/badge.tsx` exists. If not, create it:

```typescript
import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive:
          'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
        outline: 'text-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
```

**Step 2: Create StatusBadge component**

Create `src/components/features/actions/shared/status-badge.tsx`:

```typescript
import { Badge } from '@/components/ui/badge';
import { ActionStatus } from '@/lib/types/action';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: ActionStatus;
  className?: string;
}

const statusConfig = {
  [ActionStatus.TODO]: {
    label: 'To Do',
    className: 'bg-gray-100 text-gray-800 border-gray-300',
  },
  [ActionStatus.IN_PROGRESS]: {
    label: 'In Progress',
    className: 'bg-blue-100 text-blue-800 border-blue-300',
  },
  [ActionStatus.DONE]: {
    label: 'Done',
    className: 'bg-green-100 text-green-800 border-green-300',
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge variant="outline" className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
}
```

**Step 3: Create PriorityBadge component**

Create `src/components/features/actions/shared/priority-badge.tsx`:

```typescript
import { Badge } from '@/components/ui/badge';
import { ActionPriority } from '@/lib/types/action';
import { cn } from '@/lib/utils';

interface PriorityBadgeProps {
  priority: ActionPriority;
  className?: string;
}

const priorityConfig = {
  [ActionPriority.LOW]: {
    label: 'Low',
    className: 'bg-gray-100 text-gray-700 border-gray-300',
  },
  [ActionPriority.MEDIUM]: {
    label: 'Medium',
    className: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  },
  [ActionPriority.HIGH]: {
    label: 'High',
    className: 'bg-orange-100 text-orange-800 border-orange-300',
  },
  [ActionPriority.URGENT]: {
    label: 'Urgent',
    className: 'bg-red-100 text-red-800 border-red-300',
  },
};

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const config = priorityConfig[priority];

  return (
    <Badge variant="outline" className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
}
```

**Step 4: Create LateIndicator component**

Create `src/components/features/actions/shared/late-indicator.tsx`:

```typescript
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LateIndicatorProps {
  isLate: boolean;
  className?: string;
}

export function LateIndicator({ isLate, className }: LateIndicatorProps) {
  if (!isLate) return null;

  return (
    <div
      className={cn('flex items-center gap-1 text-amber-600', className)}
      title="This action is late"
    >
      <AlertCircle className="h-4 w-4" />
      <span className="text-xs font-medium">Late</span>
    </div>
  );
}
```

**Step 5: Create BlockedBadge component**

Create `src/components/features/actions/shared/blocked-badge.tsx`:

```typescript
import { Badge } from '@/components/ui/badge';
import { Ban } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BlockedBadgeProps {
  isBlocked: boolean;
  reason?: string | null;
  className?: string;
}

export function BlockedBadge({ isBlocked, reason, className }: BlockedBadgeProps) {
  if (!isBlocked) return null;

  return (
    <Badge
      variant="outline"
      className={cn('bg-red-50 text-red-700 border-red-300', className)}
      title={reason || 'This action is blocked'}
    >
      <Ban className="mr-1 h-3 w-3" />
      Blocked
    </Badge>
  );
}
```

**Step 6: Verify components compile**

Run: `npm run build`
Expected: Build succeeds

**Step 7: Commit**

```bash
git add src/components/ui/badge.tsx src/components/features/actions/shared/
git commit -m "feat: add action status and indicator badges

- Create reusable Badge component
- Add StatusBadge with color coding
- Add PriorityBadge with urgency colors
- Add LateIndicator with warning icon
- Add BlockedBadge with block reason tooltip

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Phase 3: Actions List Page

### Task 6: Create Actions List Page Structure

**Files:**
- Create: `src/app/(protected)/actions/page.tsx`
- Create: `src/app/(protected)/actions/layout.tsx`

**Step 1: Create actions layout**

Create `src/app/(protected)/actions/layout.tsx`:

```typescript
import { ReactNode } from 'react';

interface ActionsLayoutProps {
  children: ReactNode;
}

export default function ActionsLayout({ children }: ActionsLayoutProps) {
  return <div className="container mx-auto py-6">{children}</div>;
}
```

**Step 2: Create actions list page**

Create `src/app/(protected)/actions/page.tsx`:

```typescript
import { Suspense } from 'react';
import { ActionListHeader } from '@/components/features/actions/action-list/action-list-header';
import { ActionFilters } from '@/components/features/actions/action-list/action-filters';
import { ActionTable } from '@/components/features/actions/action-list/action-table';
import { ActionListSkeleton } from '@/components/features/actions/action-list/action-list-skeleton';

export default function ActionsPage() {
  return (
    <div className="space-y-6">
      <ActionListHeader />
      <ActionFilters />
      <Suspense fallback={<ActionListSkeleton />}>
        <ActionTable />
      </Suspense>
    </div>
  );
}
```

**Step 3: Verify page structure**

Run: `npm run build`
Expected: Build fails with missing component errors (expected, we'll create them next)

**Step 4: Commit page structure**

```bash
git add src/app/(protected)/actions/
git commit -m "feat: create actions list page structure

- Add actions layout with container
- Add actions page with header, filters, and table sections
- Include Suspense boundary for table loading

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 7: Create Action List Header

**Files:**
- Create: `src/components/features/actions/action-list/action-list-header.tsx`
- Create: `src/components/features/actions/action-list/action-stats.tsx`

**Step 1: Create action stats component**

Create `src/components/features/actions/action-list/action-stats.tsx`:

```typescript
'use client';

import { useActions } from '@/lib/hooks/use-actions';
import { ActionStatus } from '@/lib/types/action';

export function ActionStats() {
  const { data: actions = [] } = useActions();

  const todoCount = actions.filter((a) => a.status === ActionStatus.TODO).length;
  const inProgressCount = actions.filter((a) => a.status === ActionStatus.IN_PROGRESS).length;
  const doneCount = actions.filter((a) => a.status === ActionStatus.DONE).length;

  return (
    <div className="flex gap-4 text-sm text-muted-foreground">
      <span>
        <span className="font-medium text-gray-700">{todoCount}</span> To Do
      </span>
      <span>•</span>
      <span>
        <span className="font-medium text-blue-700">{inProgressCount}</span> In Progress
      </span>
      <span>•</span>
      <span>
        <span className="font-medium text-green-700">{doneCount}</span> Done
      </span>
    </div>
  );
}
```

**Step 2: Create action list header**

Create `src/components/features/actions/action-list/action-list-header.tsx`:

```typescript
'use client';

import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ActionStats } from './action-stats';
import { useAuth } from '@/lib/hooks/use-auth'; // Adjust based on your auth pattern

export function ActionListHeader() {
  const { user } = useAuth(); // Adjust based on your auth
  const canCreate = user?.role === 'admin' || user?.role === 'manager';

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Actions</h1>
        <ActionStats />
      </div>
      {canCreate && (
        <Button asChild>
          <Link href="/actions/new">
            <Plus className="mr-2 h-4 w-4" />
            New Action
          </Link>
        </Button>
      )}
    </div>
  );
}
```

**Step 3: Verify components compile**

Run: `npm run build`
Expected: Build fails if useAuth doesn't exist (adjust import based on existing auth pattern)

**Step 4: Update imports based on existing auth**

Check `src/lib/hooks/` or `src/lib/contexts/` for auth pattern and adjust imports.

**Step 5: Commit**

```bash
git add src/components/features/actions/action-list/action-list-header.tsx src/components/features/actions/action-list/action-stats.tsx
git commit -m "feat: add action list header with stats

- Create header with title and New Action button
- Add real-time stats showing TODO, In Progress, Done counts
- Include role-based permission for create button
- Use existing auth pattern for user role check

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 8: Create Action Filters Component

**Files:**
- Create: `src/components/features/actions/action-list/action-filters.tsx`

**Step 1: Create filters component**

Create `src/components/features/actions/action-list/action-filters.tsx`:

```typescript
'use client';

import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useActionFiltersStore } from '@/lib/stores/action-filters-store';
import { ActionPriority, ActionStatus } from '@/lib/types/action';

export function ActionFilters() {
  const filters = useActionFiltersStore();

  return (
    <div className="flex flex-wrap gap-4 rounded-lg border bg-card p-4">
      {/* Search */}
      <div className="flex-1 min-w-[200px]">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search actions..."
            value={filters.searchQuery}
            onChange={(e) => filters.setFilter('searchQuery', e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Status Filter */}
      <Select
        value={filters.status}
        onChange={(value) =>
          filters.setFilter('status', value as ActionStatus | 'all')
        }
      >
        <option value="all">All Status</option>
        <option value={ActionStatus.TODO}>To Do</option>
        <option value={ActionStatus.IN_PROGRESS}>In Progress</option>
        <option value={ActionStatus.DONE}>Done</option>
      </Select>

      {/* Priority Filter */}
      <Select
        value={filters.priority}
        onChange={(value) =>
          filters.setFilter('priority', value as ActionPriority | 'all')
        }
      >
        <option value="all">All Priority</option>
        <option value={ActionPriority.LOW}>Low</option>
        <option value={ActionPriority.MEDIUM}>Medium</option>
        <option value={ActionPriority.HIGH}>High</option>
        <option value={ActionPriority.URGENT}>Urgent</option>
      </Select>

      {/* Assignment Filter */}
      <Select
        value={filters.assignment}
        onChange={(value) => filters.setFilter('assignment', value as any)}
      >
        <option value="all">All Actions</option>
        <option value="assigned-to-me">Assigned to Me</option>
        <option value="created-by-me">Created by Me</option>
        <option value="my-teams">My Teams</option>
      </Select>

      {/* Toggle Filters */}
      <div className="flex gap-2">
        <Button
          variant={filters.showBlockedOnly ? 'default' : 'outline'}
          size="sm"
          onClick={() => filters.setFilter('showBlockedOnly', !filters.showBlockedOnly)}
        >
          Blocked Only
        </Button>
        <Button
          variant={filters.showLateOnly ? 'default' : 'outline'}
          size="sm"
          onClick={() => filters.setFilter('showLateOnly', !filters.showLateOnly)}
        >
          Late Only
        </Button>
      </div>

      {/* Clear Filters */}
      {(filters.searchQuery ||
        filters.status !== 'all' ||
        filters.priority !== 'all' ||
        filters.assignment !== 'all' ||
        filters.showBlockedOnly ||
        filters.showLateOnly) && (
        <Button variant="ghost" size="sm" onClick={filters.resetFilters}>
          <X className="mr-2 h-4 w-4" />
          Clear Filters
        </Button>
      )}
    </div>
  );
}
```

**Step 2: Verify component compiles**

Run: `npm run build`
Expected: Build succeeds (or fails with Select component issues - adjust based on your Select implementation)

**Step 3: Adjust Select component usage**

Check your existing Select component API in `src/components/ui/select.tsx` and adjust usage accordingly.

**Step 4: Commit**

```bash
git add src/components/features/actions/action-list/action-filters.tsx
git commit -m "feat: add action filters component

- Create comprehensive filter bar with search
- Add status, priority, assignment filters
- Include blocked-only and late-only toggles
- Add clear filters button
- Connect to Zustand store for state management

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 9: Create Action Table Component

**Files:**
- Create: `src/components/features/actions/action-list/action-table.tsx`
- Create: `src/components/features/actions/action-list/action-table-row.tsx`
- Create: `src/components/features/actions/action-list/action-list-empty.tsx`
- Create: `src/components/features/actions/action-list/action-list-skeleton.tsx`

**Step 1: Create empty state component**

Create `src/components/features/actions/action-list/action-list-empty.tsx`:

```typescript
import { FileText } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface ActionListEmptyProps {
  hasFilters: boolean;
  canCreate: boolean;
  onClearFilters: () => void;
}

export function ActionListEmpty({ hasFilters, canCreate, onClearFilters }: ActionListEmptyProps) {
  if (hasFilters) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <FileText className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No actions match your filters</h3>
        <p className="text-muted-foreground mb-4">Try adjusting your search or filters</p>
        <Button variant="outline" onClick={onClearFilters}>
          Clear Filters
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <FileText className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold mb-2">No actions yet</h3>
      <p className="text-muted-foreground mb-4">
        {canCreate
          ? 'Get started by creating your first action'
          : 'No actions have been assigned to you yet'}
      </p>
      {canCreate && (
        <Button asChild>
          <Link href="/actions/new">Create Action</Link>
        </Button>
      )}
    </div>
  );
}
```

**Step 2: Create skeleton component**

Create `src/components/features/actions/action-list/action-list-skeleton.tsx`:

```typescript
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export function ActionListSkeleton() {
  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Assigned To</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Progress</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, i) => (
            <TableRow key={i}>
              <TableCell>
                <Skeleton className="h-4 w-[200px]" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-[80px]" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-[70px]" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-[120px]" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-[90px]" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-[60px]" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-8 w-8" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
```

**Step 3: Create table row component**

Create `src/components/features/actions/action-list/action-table-row.tsx`:

```typescript
'use client';

import { format } from 'date-fns';
import { MoreVertical } from 'lucide-react';
import Link from 'next/link';
import { TableCell, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { StatusBadge } from '../shared/status-badge';
import { PriorityBadge } from '../shared/priority-badge';
import { LateIndicator } from '../shared/late-indicator';
import { BlockedBadge } from '../shared/blocked-badge';
import type { Action } from '@/lib/types/action';

interface ActionTableRowProps {
  action: Action;
  canEdit: boolean;
  canDelete: boolean;
  onDelete: (id: string) => void;
}

export function ActionTableRow({ action, canEdit, canDelete, onDelete }: ActionTableRowProps) {
  const checklistProgress = action.checklistItems
    ? `${action.checklistItems.filter((i) => i.isCompleted).length}/${action.checklistItems.length}`
    : '—';

  return (
    <TableRow className="cursor-pointer hover:bg-muted/50">
      <TableCell>
        <Link href={`/actions/${action.id}`} className="block">
          <div className="font-medium">{action.title}</div>
          <div className="flex gap-2 mt-1">
            <LateIndicator isLate={action.isLate} />
            <BlockedBadge isBlocked={action.isBlocked} reason={action.blockedReason} />
          </div>
        </Link>
      </TableCell>
      <TableCell>
        <StatusBadge status={action.status} />
      </TableCell>
      <TableCell>
        <PriorityBadge priority={action.priority} />
      </TableCell>
      <TableCell>{action.responsible?.name || '—'}</TableCell>
      <TableCell>{format(new Date(action.estimatedEndDate), 'MMM d, yyyy')}</TableCell>
      <TableCell>{checklistProgress}</TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">Actions menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/actions/${action.id}`}>View Details</Link>
            </DropdownMenuItem>
            {canEdit && (
              <DropdownMenuItem asChild>
                <Link href={`/actions/${action.id}/edit`}>Edit</Link>
              </DropdownMenuItem>
            )}
            {canDelete && (
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => onDelete(action.id)}
              >
                Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
```

**Step 4: Create main table component**

Create `src/components/features/actions/action-list/action-table.tsx`:

```typescript
'use client';

import { useMemo } from 'react';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useActions, useDeleteAction } from '@/lib/hooks/use-actions';
import { useActionFiltersStore } from '@/lib/stores/action-filters-store';
import { useAuth } from '@/lib/hooks/use-auth';
import { ActionTableRow } from './action-table-row';
import { ActionListEmpty } from './action-list-empty';
import { ActionListSkeleton } from './action-list-skeleton';
import { toast } from 'sonner'; // Adjust based on your toast library
import type { ActionFilters } from '@/lib/types/action';

export function ActionTable() {
  const { user } = useAuth();
  const filtersState = useActionFiltersStore();
  const deleteActionMutation = useDeleteAction();

  // Build API filters from store
  const apiFilters: ActionFilters = useMemo(() => {
    const filters: ActionFilters = {};

    if (filtersState.status !== 'all') filters.status = filtersState.status;
    if (filtersState.priority !== 'all') filters.priority = filtersState.priority;
    if (filtersState.showBlockedOnly) filters.isBlocked = true;
    if (filtersState.showLateOnly) filters.isLate = true;
    if (filtersState.searchQuery) filters.search = filtersState.searchQuery;

    // Assignment filters
    if (filtersState.assignment === 'assigned-to-me') {
      filters.responsibleId = user?.id;
    } else if (filtersState.assignment === 'created-by-me') {
      filters.creatorId = user?.id;
    }

    if (filtersState.companyId) filters.companyId = filtersState.companyId;
    if (filtersState.teamId) filters.teamId = filtersState.teamId;

    return filters;
  }, [filtersState, user]);

  const { data: actions = [], isLoading, error } = useActions(apiFilters);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this action?')) return;

    try {
      await deleteActionMutation.mutateAsync(id);
      toast.success('Action deleted successfully');
    } catch (error) {
      toast.error('Failed to delete action');
    }
  };

  const canCreate = user?.role === 'admin' || user?.role === 'manager';

  const hasFilters =
    filtersState.status !== 'all' ||
    filtersState.priority !== 'all' ||
    filtersState.assignment !== 'all' ||
    filtersState.showBlockedOnly ||
    filtersState.showLateOnly ||
    !!filtersState.searchQuery;

  if (isLoading) return <ActionListSkeleton />;

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Failed to load actions. Please try again.</p>
      </div>
    );
  }

  if (actions.length === 0) {
    return (
      <ActionListEmpty
        hasFilters={hasFilters}
        canCreate={canCreate}
        onClearFilters={filtersState.resetFilters}
      />
    );
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Assigned To</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Progress</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {actions.map((action) => {
            const canEdit =
              user?.role === 'admin' ||
              action.creatorId === user?.id ||
              action.responsibleId === user?.id;
            const canDelete = user?.role === 'admin' || action.creatorId === user?.id;

            return (
              <ActionTableRow
                key={action.id}
                action={action}
                canEdit={canEdit}
                canDelete={canDelete}
                onDelete={handleDelete}
              />
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
```

**Step 5: Add date-fns if not installed**

Check `package.json`. If `date-fns` is not installed:

```bash
npm install date-fns
```

**Step 6: Verify table compiles**

Run: `npm run build`
Expected: Build succeeds (adjust toast library import based on your setup)

**Step 7: Commit**

```bash
git add src/components/features/actions/action-list/
git commit -m "feat: add action table with rows and states

- Create main action table with all columns
- Add table row with action menu dropdown
- Include empty state for no actions/filters
- Add skeleton loading state
- Implement permission-based edit/delete
- Connect to filters store and API hooks

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Phase 4: Action Detail Page

### Task 10: Create Action Detail Page

**Files:**
- Create: `src/app/(protected)/actions/[actionId]/page.tsx`
- Create: `src/components/features/actions/action-detail/action-detail-view.tsx`

**Step 1: Create detail page route**

Create `src/app/(protected)/actions/[actionId]/page.tsx`:

```typescript
import { ActionDetailView } from '@/components/features/actions/action-detail/action-detail-view';

interface ActionDetailPageProps {
  params: {
    actionId: string;
  };
}

export default function ActionDetailPage({ params }: ActionDetailPageProps) {
  return <ActionDetailView actionId={params.actionId} />;
}
```

**Step 2: Create detail view component**

Create `src/components/features/actions/action-detail/action-detail-view.tsx`:

```typescript
'use client';

import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAction, useDeleteAction } from '@/lib/hooks/use-actions';
import { useAuth } from '@/lib/hooks/use-auth';
import { ActionHeader } from './action-header';
import { ActionMetadata } from './action-metadata';
import { ActionDescription } from './action-description';
import { ChecklistSection } from '../checklist/checklist-section';
import { BlockingSection } from '../blocking/blocking-section';
import { ActionMovementHistory } from './action-movement-history';
import { toast } from 'sonner';

interface ActionDetailViewProps {
  actionId: string;
}

export function ActionDetailView({ actionId }: ActionDetailViewProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { data: action, isLoading, error } = useAction(actionId);
  const deleteActionMutation = useDeleteAction();

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this action?')) return;

    try {
      await deleteActionMutation.mutateAsync(actionId);
      toast.success('Action deleted successfully');
      router.push('/actions');
    } catch (error) {
      toast.error('Failed to delete action');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-[200px]" />
        <Skeleton className="h-[400px]" />
      </div>
    );
  }

  if (error || !action) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive mb-4">Failed to load action details.</p>
        <Button asChild variant="outline">
          <Link href="/actions">Back to Actions</Link>
        </Button>
      </div>
    );
  }

  const canEdit =
    user?.role === 'admin' ||
    action.creatorId === user?.id ||
    action.responsibleId === user?.id;
  const canDelete = user?.role === 'admin' || action.creatorId === user?.id;

  return (
    <div className="space-y-6">
      {/* Back button and actions */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" asChild>
          <Link href="/actions">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Actions
          </Link>
        </Button>
        <div className="flex gap-2">
          {canEdit && (
            <Button asChild>
              <Link href={`/actions/${actionId}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </Button>
          )}
          {canDelete && (
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          )}
        </div>
      </div>

      {/* Header */}
      <ActionHeader action={action} />

      {/* Description */}
      <ActionDescription description={action.description} />

      {/* Metadata */}
      <ActionMetadata action={action} />

      {/* Checklist */}
      <ChecklistSection action={action} canEdit={canEdit} />

      {/* Blocking */}
      <BlockingSection action={action} canBlock={action.responsibleId === user?.id || user?.role === 'admin'} />

      {/* Movement History */}
      <ActionMovementHistory actionId={actionId} />
    </div>
  );
}
```

**Step 3: Verify detail page structure**

Run: `npm run build`
Expected: Build fails with missing component errors (we'll create them next)

**Step 4: Commit detail page structure**

```bash
git add src/app/(protected)/actions/[actionId]/page.tsx src/components/features/actions/action-detail/action-detail-view.tsx
git commit -m "feat: create action detail page structure

- Add dynamic route for action detail
- Create detail view with layout and sections
- Include edit/delete buttons with permissions
- Add back navigation to list

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Remaining Tasks Summary

Due to character limits, here's a summary of remaining tasks to complete the implementation:

### Phase 4 Continued: Action Detail Components (Tasks 11-14)
- **Task 11:** Create ActionHeader component (title, status badge, status change dropdown)
- **Task 12:** Create ActionMetadata component (cards for dates, creator, responsible, company, team)
- **Task 13:** Create ActionDescription component
- **Task 14:** Create ActionMovementHistory component (timeline of status changes)

### Phase 5: Forms (Tasks 15-17)
- **Task 15:** Create action form schema (Zod validation)
- **Task 16:** Create action form component (all fields, cascading selects)
- **Task 17:** Create new and edit pages

### Phase 6: Checklists (Tasks 18-19)
- **Task 18:** Create ChecklistSection component
- **Task 19:** Create ChecklistItem component with toggle

### Phase 7: Blocking (Tasks 20-21)
- **Task 20:** Create BlockingSection component
- **Task 21:** Create BlockActionDialog component

### Phase 8: Final Polish (Tasks 22-24)
- **Task 22:** Add toast notifications throughout
- **Task 23:** Add loading states and error boundaries
- **Task 24:** Test full flow and fix issues

---

**Next Steps:**

Would you like me to:
1. Continue writing the remaining tasks in detail?
2. Save this partial plan and start implementation?
3. Create a condensed version with all tasks?

Choose your preference to proceed.
