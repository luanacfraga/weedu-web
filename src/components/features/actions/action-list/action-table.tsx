'use client'

import { ResponsiveDataTable } from '@/components/shared/data/responsive-data-table'
import { useEffect, useMemo } from 'react'
import { ActionCard } from './action-card'

import { Pagination } from '@/components/shared/data/pagination'
import { useActions, useDeleteAction } from '@/lib/hooks/use-actions'
import { useAuth } from '@/lib/hooks/use-auth'
import { useCompany } from '@/lib/hooks/use-company'
import { usePermissions } from '@/lib/hooks/use-permissions'
import { useActionDialogStore } from '@/lib/stores/action-dialog-store'
import { useActionFiltersStore } from '@/lib/stores/action-filters-store'
import type { Action, ActionFilters } from '@/lib/types/action'
import { buildActionsApiFilters } from '@/lib/utils/build-actions-api-filters'
import { toast } from 'sonner'
import { ActionListEmpty } from './action-list-empty'
import { ActionListSkeleton } from './action-list-skeleton'
import { ActionTableRow } from './action-table-row'

const EMPTY_ACTIONS: Action[] = []

export function ActionTable() {
  const { user } = useAuth()
  const { selectedCompany } = useCompany()
  const filtersState = useActionFiltersStore()
  const { openEdit } = useActionDialogStore()
  const deleteActionMutation = useDeleteAction()
  const { isAdmin, isManager, isExecutor } = usePermissions()

  const apiFilters: ActionFilters = useMemo(() => {
    return buildActionsApiFilters({
      state: {
        statuses: filtersState.statuses,
        priority: filtersState.priority,
        assignment: filtersState.assignment,
        dateFrom: filtersState.dateFrom,
        dateTo: filtersState.dateTo,
        dateFilterType: filtersState.dateFilterType,
        companyId: filtersState.companyId,
        teamId: filtersState.teamId,
        responsibleId: filtersState.responsibleId,
        showBlockedOnly: filtersState.showBlockedOnly,
        showLateOnly: filtersState.showLateOnly,
        lateStatusFilter: filtersState.lateStatusFilter,
        searchQuery: filtersState.searchQuery,
        scopeType: filtersState.scopeType,
        selectedTeamId: filtersState.selectedTeamId,
      },
      userId: user?.id,
      forceResponsibleId: isExecutor && user ? user.id : undefined,
      selectedCompanyId: selectedCompany?.id,
      page: filtersState.page,
      limit: filtersState.pageSize,
    })
  }, [filtersState, user, selectedCompany])

  const hasScope = !!(apiFilters.companyId || apiFilters.teamId || apiFilters.noTeam || apiFilters.responsibleId)
  const { data, isLoading, isFetching, error } = useActions(apiFilters)
  const actions = data?.data ?? EMPTY_ACTIONS
  const meta = data?.meta

  useEffect(() => {
    if (!meta || meta.totalPages <= 0) return
    if (filtersState.page > meta.totalPages) {
      filtersState.setFilter('page', meta.totalPages)
    }
  }, [filtersState, meta])

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta ação?')) return

    try {
      await deleteActionMutation.mutateAsync(id)
      toast.success('Ação excluída com sucesso')
    } catch (error) {
      toast.error('Erro ao excluir ação')
    }
  }

  const canCreate = isAdmin || isManager

  const hasFilters =
    filtersState.statuses.length > 0 ||
    filtersState.priority !== 'all' ||
    filtersState.assignment !== 'all' ||
    filtersState.showBlockedOnly ||
    filtersState.showLateOnly ||
    !!filtersState.searchQuery

  if (!hasScope) return <ActionListSkeleton />

  if (isLoading || (isFetching && actions.length === 0)) {
    return <ActionListSkeleton />
  }

  if (error) {
    return (
      <div className="py-12 text-center">
        <p className="text-destructive">Erro ao carregar ações. Tente novamente.</p>
      </div>
    )
  }

  if (actions.length === 0) {
    return (
      <ActionListEmpty
        hasFilters={hasFilters}
        canCreate={canCreate}
        onClearFilters={filtersState.resetFilters}
      />
    )
  }

  return (
    <>
      <div className="rounded-lg">
        <ResponsiveDataTable
          data={actions}
          headers={[
            { label: 'O que será feito?' },
            { label: 'Status', className: 'w-[150px]' },
            { label: 'Prioridade', className: 'w-[100px]' },
            { label: 'Responsável' },
            { label: 'Prazo', className: 'w-[100px]' },
            { label: 'Como/Etapas', className: 'w-[80px]' },
            { label: '', className: 'w-[50px]' },
          ]}
          CardComponent={(props) => (
            <ActionCard
              data={props.data}
              onView={() => {
                openEdit(props.data.id)
              }}
            />
          )}
          emptyMessage="Nenhuma ação encontrada com os filtros atuais."
          isLoading={isFetching && actions.length > 0}
        >
          {(action) => {
            const canEdit =
              isAdmin || action.creatorId === user?.id || action.responsibleId === user?.id
            const canDelete = isAdmin || action.creatorId === user?.id

            return (
              <ActionTableRow
                key={action.id}
                action={action}
                canEdit={canEdit}
                canDelete={canDelete}
                onDelete={handleDelete}
                onView={() => {
                  openEdit(action.id)
                }}
              />
            )
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
              filtersState.setFilter('pageSize', limit)
              filtersState.setFilter('page', 1)
            }}
            pageSizeOptions={[20]}
          />
        </div>
      )}
    </>
  )
}
