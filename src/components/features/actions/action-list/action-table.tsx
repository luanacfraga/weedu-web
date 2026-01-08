'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ResponsiveDataTable } from '@/components/shared/data/responsive-data-table';
import { ActionCard } from './action-card';

import { Pagination } from '@/components/shared/data/pagination';
import { useActions, useDeleteAction } from '@/lib/hooks/use-actions';
import { useActionFiltersStore } from '@/lib/stores/action-filters-store';
import { useAuth } from '@/lib/hooks/use-auth';
import { useCompany } from '@/lib/hooks/use-company';
import { ActionTableRow } from './action-table-row';
import { ActionListEmpty } from './action-list-empty';
import { ActionListSkeleton } from './action-list-skeleton';
import { toast } from 'sonner';
import type { Action, ActionFilters } from '@/lib/types/action';
import { buildActionsApiFilters } from '@/lib/utils/build-actions-api-filters';

const EMPTY_ACTIONS: Action[] = [];

export function ActionTable() {
  const { user } = useAuth();
  const { selectedCompany } = useCompany();
  const filtersState = useActionFiltersStore();
  const deleteActionMutation = useDeleteAction();
  const router = useRouter();

  // Build API filters from store
  const apiFilters: ActionFilters = useMemo(() => {
    return buildActionsApiFilters({
      state: {
        statuses: filtersState.statuses,
        priority: filtersState.priority,
        assignment: filtersState.assignment,
        dateFrom: filtersState.dateFrom,
        dateTo: filtersState.dateTo,
        dateFilterType: filtersState.dateFilterType,
        datePreset: filtersState.datePreset,
        companyId: filtersState.companyId,
        teamId: filtersState.teamId,
        showBlockedOnly: filtersState.showBlockedOnly,
        showLateOnly: filtersState.showLateOnly,
        searchQuery: filtersState.searchQuery,
        objective: filtersState.objective,
      },
      userId: user?.id,
      forceResponsibleId: user?.role === 'executor' ? user.id : undefined,
      selectedCompanyId: selectedCompany?.id,
      page: filtersState.page,
      limit: filtersState.pageSize,
    });
  }, [filtersState, user, selectedCompany]);

  const hasScope = !!(apiFilters.companyId || apiFilters.teamId || apiFilters.responsibleId);
  const { data, isLoading, isFetching, error } = useActions(apiFilters);
  const actions = data?.data ?? EMPTY_ACTIONS;
  const meta = data?.meta;

  useEffect(() => {
    if (!meta || meta.totalPages <= 0) return;
    if (filtersState.page > meta.totalPages) {
      filtersState.setFilter('page', meta.totalPages);
    }
  }, [filtersState, meta]);

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

  if (!hasScope) return <ActionListSkeleton />;

  // Show skeleton during initial load OR when fetching with no previous data
  // This handles view transitions (kanban → table) properly with keepPreviousData
  if (isLoading || (isFetching && actions.length === 0)) {
    return <ActionListSkeleton />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Erro ao carregar ações. Tente novamente.</p>
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
    <>
      <div className="rounded-lg">
        <ResponsiveDataTable
            data={actions}
            headers={[
                { label: 'Título' },
                { label: 'Status', className: 'w-[150px]' },
                { label: 'Prioridade', className: 'w-[100px]' },
                { label: 'Responsável' },
                { label: 'Prazo', className: 'w-[100px]' },
                { label: 'Checklist', className: 'w-[80px]' },
                { label: '', className: 'w-[50px]' },
            ]}
            CardComponent={(props) => (
                <ActionCard
                    data={props.data}
                    onView={() => {
                        router.push(`/actions/${props.data.id}/edit`);
                    }}
                />
            )}
            emptyMessage="Nenhuma ação encontrada com os filtros atuais."
            isLoading={isFetching && actions.length > 0}
        >
            {(action) => {
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
                  router.push(`/actions/${action.id}/edit`);
                }}
              />
            );
            }}
        </ResponsiveDataTable>
      </div>

      {meta && meta.totalPages > 0 && (
        <div className="mt-4">
          <Pagination
            page={meta.page}
            limit={meta.limit}
            total={meta.total}
            totalPages={meta.totalPages}
            onPageChange={(page) => filtersState.setFilter('page', page)}
            onLimitChange={(limit) => {
              filtersState.setFilter('pageSize', limit);
              filtersState.setFilter('page', 1);
            }}
            pageSizeOptions={[20]}
          />
        </div>
      )}
    </>
  );
}
