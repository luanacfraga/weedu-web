'use client';

import { useMemo, useState } from 'react';
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
import { useCompany } from '@/lib/hooks/use-company';
import { ActionTableRow } from './action-table-row';
import { ActionListEmpty } from './action-list-empty';
import { ActionListSkeleton } from './action-list-skeleton';
import { toast } from 'sonner';
import type { ActionFilters } from '@/lib/types/action';
import { ActionDetailSheet } from '../action-detail-sheet';

export function ActionTable() {
  const { user } = useAuth();
  const { selectedCompany } = useCompany();
  const filtersState = useActionFiltersStore();
  const deleteActionMutation = useDeleteAction();
  const [selectedActionId, setSelectedActionId] = useState<string | null>(null);
  const [selectedCanEdit, setSelectedCanEdit] = useState<boolean>(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  // Build API filters from store
  const apiFilters: ActionFilters = useMemo(() => {
    const filters: ActionFilters = {};

    if (filtersState.statuses.length === 1) filters.status = filtersState.statuses[0];
    if (filtersState.priority !== 'all') filters.priority = filtersState.priority;
    if (filtersState.showBlockedOnly) filters.isBlocked = true;
    if (filtersState.showLateOnly) filters.isLate = true;

    // Assignment filters
    if (filtersState.assignment === 'assigned-to-me') {
      filters.responsibleId = user?.id;
    }

    // Company/Team filters - use selectedCompany as default if no filter is set
    if (filtersState.companyId) {
      filters.companyId = filtersState.companyId;
    } else if (selectedCompany?.id) {
      filters.companyId = selectedCompany.id;
    }

    if (filtersState.teamId) filters.teamId = filtersState.teamId;

    return filters;
  }, [filtersState, user, selectedCompany]);

  const { data: actions = [], isLoading, error } = useActions(apiFilters);
  const visibleActions = useMemo(() => {
    let result = actions;

    if (filtersState.statuses.length > 0) {
      const set = new Set(filtersState.statuses);
      result = result.filter((a) => set.has(a.status));
    }

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
  }, [actions, filtersState.assignment, filtersState.searchQuery, filtersState.statuses, user?.id]);

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta ação?')) return;

    try {
      await deleteActionMutation.mutateAsync(id);
      toast.success('Ação excluída com sucesso');
    } catch (error) {
      toast.error('Erro ao excluir ação');
    }
  };

  const canCreate = user?.role === 'admin' || user?.role === 'manager';

  const hasFilters =
    filtersState.statuses.length > 0 ||
    filtersState.priority !== 'all' ||
    filtersState.assignment !== 'all' ||
    filtersState.showBlockedOnly ||
    filtersState.showLateOnly ||
    !!filtersState.searchQuery;

  if (isLoading) return <ActionListSkeleton />;

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Erro ao carregar ações. Tente novamente.</p>
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
    <>
      <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Título</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Prioridade</TableHead>
            <TableHead>Responsável</TableHead>
            <TableHead>Prazo</TableHead>
            <TableHead>Checklist</TableHead>
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
                onView={() => {
                  setSelectedActionId(action.id);
                  setSelectedCanEdit(!!canEdit);
                  setSheetOpen(true);
                }}
              />
            );
          })}
        </TableBody>
      </Table>
      </div>

      <ActionDetailSheet
        actionId={selectedActionId}
        open={sheetOpen}
        onOpenChange={(open) => {
          setSheetOpen(open);
          if (!open) setSelectedActionId(null);
        }}
        canEdit={selectedCanEdit}
      />
    </>
  );
}
