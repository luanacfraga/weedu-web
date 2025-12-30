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
import { toast } from 'sonner';
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

  if (visibleActions.length === 0) {
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
          {visibleActions.map((action) => {
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
