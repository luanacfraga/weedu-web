'use client';

import { useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useActions } from '@/lib/hooks/use-actions';
import { useActionFiltersStore } from '@/lib/stores/action-filters-store';
import { useAuth } from '@/lib/hooks/use-auth';
import { ActionListEmpty } from './action-list-empty';
import { ActionListSkeleton } from './action-list-skeleton';
import { ActionStatus, type Action, type ActionFilters } from '@/lib/types/action';
import { StatusBadge } from '../shared/status-badge';
import { PriorityBadge } from '../shared/priority-badge';
import { LateIndicator } from '../shared/late-indicator';
import { BlockedBadge } from '../shared/blocked-badge';
import { format } from 'date-fns';
import Link from 'next/link';

const columns = [
  {
    id: ActionStatus.TODO,
    title: 'To Do',
    status: ActionStatus.TODO,
  },
  {
    id: ActionStatus.IN_PROGRESS,
    title: 'In Progress',
    status: ActionStatus.IN_PROGRESS,
  },
  {
    id: ActionStatus.DONE,
    title: 'Done',
    status: ActionStatus.DONE,
  },
];

export function ActionKanbanBoard() {
  const { user } = useAuth();
  const filtersState = useActionFiltersStore();

  // Build API filters from store
  const apiFilters: ActionFilters = useMemo(() => {
    const filters: ActionFilters = {};

    // For Kanban, we usually want all statuses unless specifically filtered,
    // but the column structure handles separation.
    // If a specific status is selected in filters, we might only show that column or filter items within columns.
    // Here we'll pass the status filter to the API, so if 'TODO' is selected, only TODO items return,
    // and other columns will be empty.
    if (filtersState.status !== 'all') filters.status = filtersState.status;
    if (filtersState.priority !== 'all') filters.priority = filtersState.priority;
    if (filtersState.showBlockedOnly) filters.isBlocked = true;
    if (filtersState.showLateOnly) filters.isLate = true;

    // Assignment filters
    if (filtersState.assignment === 'assigned-to-me') {
      filters.responsibleId = user?.id;
    }

    if (filtersState.companyId) filters.companyId = filtersState.companyId;
    if (filtersState.teamId) filters.teamId = filtersState.teamId;

    return filters;
  }, [filtersState, user]);

  const { data: actions = [], isLoading, error } = useActions(apiFilters);
  const visibleActions = useMemo(() => {
    let result = actions;

    // Backend doesn't support search/creatorId filter yet, so we apply client-side filtering.
    if (filtersState.assignment === 'created-by-me' && user?.id) {
      result = result.filter((a) => a.creatorId === user.id);
    }

    const q = filtersState.searchQuery?.trim().toLowerCase();
    if (q) {
      result = result.filter((a) => {
        const haystack = `${a.title} ${a.description}`.toLowerCase();
        return haystack.includes(q);
      });
    }

    return result;
  }, [actions, filtersState.assignment, filtersState.searchQuery, user?.id]);

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

  const getActionsByStatus = (status: ActionStatus) => {
    return visibleActions.filter((action) => action.status === status);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full overflow-x-auto pb-4">
      {columns.map((column) => {
        const columnActions = getActionsByStatus(column.status);
        
        return (
          <div key={column.id} className="flex flex-col gap-4 min-w-[300px]">
            <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
              <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                {column.title}
              </h3>
              <span className="text-xs font-medium bg-background px-2 py-1 rounded-md border shadow-sm">
                {columnActions.length}
              </span>
            </div>

            <div className="flex flex-col gap-3">
              {columnActions.map((action) => (
                <ActionKanbanCard key={action.id} action={action} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ActionKanbanCard({ action }: { action: Action }) {
  const checklistProgress = action.checklistItems
    ? `${action.checklistItems.filter((i) => i.isCompleted).length}/${action.checklistItems.length}`
    : '0/0';

  return (
    <Link href={`/actions/${action.id}/edit`} className="block">
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-medium text-sm line-clamp-2 leading-tight">
              {action.title}
            </h4>
            <PriorityBadge priority={action.priority} className="shrink-0 text-[10px] px-1.5 py-0 h-5" />
          </div>

          <div className="flex flex-wrap gap-2">
            <StatusBadge status={action.status} className="text-[10px] px-1.5 py-0 h-5" />
            <LateIndicator isLate={action.isLate} className="text-[10px]" />
            <BlockedBadge 
              isBlocked={action.isBlocked} 
              reason={action.blockedReason} 
              className="text-[10px] px-1.5 py-0 h-5" 
            />
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
            <div className="flex items-center gap-2">
              <span title="Responsible">
                {action.responsibleId ? `#${action.responsibleId.slice(0, 8)}` : '—'}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span title="Due Date">
                {format(new Date(action.estimatedEndDate), 'MMM d')}
              </span>
              <span title="Checklist" className="flex items-center gap-1">
                 ☑ {checklistProgress}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

