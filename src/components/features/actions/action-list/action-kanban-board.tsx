'use client'

import {
  DndContext,
  DragOverlay,
  closestCenter,
  useDroppable,
  type DragEndEvent,
  type DragStartEvent,
  type DraggableAttributes,
  type DraggableSyntheticListeners,
} from '@dnd-kit/core'
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { Calendar, UserCheck } from 'lucide-react'
import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { PriorityBadge } from '@/components/ui/priority-badge'
import { UserAvatar } from '@/components/ui/user-avatar'

import { employeesApi } from '@/lib/api/endpoints/employees'
import { useActions, useUpdateAction } from '@/lib/hooks/use-actions'
import { useAuth } from '@/lib/hooks/use-auth'
import { useCompany } from '@/lib/hooks/use-company'
import { useKanbanActions } from '@/lib/hooks/use-kanban-actions'
import { useActionDialogStore } from '@/lib/stores/action-dialog-store'
import { useActionFiltersStore } from '@/lib/stores/action-filters-store'
import { ActionStatus, type Action, type ActionFilters } from '@/lib/types/action'
import { cn } from '@/lib/utils'
import { buildActionsApiFilters } from '@/lib/utils/build-actions-api-filters'

import { actionStatusUI } from '../shared/action-status-ui'
import { ActionLateStatusBadge } from '../shared/action-late-status-badge'
import { BlockedBadge } from '../shared/blocked-badge'
import { LateIndicator } from '../shared/late-indicator'
import { ActionListEmpty } from './action-list-empty'
import { ActionListSkeleton } from './action-list-skeleton'

const columns = [
  {
    id: ActionStatus.TODO,
    title: 'Pendentes',
    status: ActionStatus.TODO,
  },
  {
    id: ActionStatus.IN_PROGRESS,
    title: 'Em Andamento',
    status: ActionStatus.IN_PROGRESS,
  },
  {
    id: ActionStatus.DONE,
    title: 'Concluídas',
    status: ActionStatus.DONE,
  },
]

const columnStyles = {
  [ActionStatus.TODO]: actionStatusUI[ActionStatus.TODO].kanban,
  [ActionStatus.IN_PROGRESS]: actionStatusUI[ActionStatus.IN_PROGRESS].kanban,
  [ActionStatus.DONE]: actionStatusUI[ActionStatus.DONE].kanban,
}

const kanbanStyles = `
  .kanban-column-drag-over {
    background-color: hsl(var(--muted));
    opacity: 0.8;
    border-style: dashed;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .kanban-board-container {
    scroll-snap-type: x mandatory;
    scroll-padding: 0 1rem;
    -webkit-overflow-scrolling: touch;
    scroll-behavior: smooth;
  }

  .kanban-column {
    scroll-snap-align: center;
    scroll-snap-stop: always;
  }

  @media (min-width: 768px) {
    .kanban-board-container {
      scroll-snap-type: none;
    }
  }

  .kanban-card-hover {
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .kanban-card-hover:hover {
    transform: translateY(-2px);
  }

  .kanban-card-dragging {
    transition: none;
  }
`

const EXECUTORS_STALE_TIME_MS = 1000 * 60 * 5

const columnNames: Record<ActionStatus, string> = {
  [ActionStatus.TODO]: 'Pendentes',
  [ActionStatus.IN_PROGRESS]: 'Em Andamento',
  [ActionStatus.DONE]: 'Concluídas',
}

function parseActionStatus(value: unknown): ActionStatus | null {
  if (value === ActionStatus.TODO) return ActionStatus.TODO
  if (value === ActionStatus.IN_PROGRESS) return ActionStatus.IN_PROGRESS
  if (value === ActionStatus.DONE) return ActionStatus.DONE
  return null
}

function getDraggedActionTitle(active: DragStartEvent['active']): string | null {
  const current = active.data.current
  if (!current || typeof current !== 'object') return null
  if (!('action' in current)) return null
  const action = (current as { action?: unknown }).action
  if (!action || typeof action !== 'object') return null
  const title = (action as { title?: unknown }).title
  return typeof title === 'string' ? title : null
}

export function ActionKanbanBoard() {
  const { user } = useAuth()
  const { selectedCompany } = useCompany()
  const filtersState = useActionFiltersStore()
  const { openEdit } = useActionDialogStore()
  const [announcement, setAnnouncement] = useState('')

  // Gestores devem iniciar o Kanban com atribuição "todas"
  useEffect(() => {
    if (user?.role !== 'manager') return
    if (filtersState.viewMode !== 'kanban') return
    if (filtersState.assignment === 'all') return

    filtersState.setFilter('assignment', 'all')
  }, [user?.role, filtersState])

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
        responsibleId: filtersState.responsibleId,
        showBlockedOnly: filtersState.showBlockedOnly,
        showLateOnly: filtersState.showLateOnly,
        lateStatusFilter: filtersState.lateStatusFilter,
        searchQuery: filtersState.searchQuery,
      },
      userId: user?.id,
      forceResponsibleId: user?.role === 'executor' ? user.id : undefined,
      selectedCompanyId: selectedCompany?.id,
      page: 1,
      limit: 1000,
    })
  }, [filtersState, user, selectedCompany])

  const hasScope = !!(apiFilters.companyId || apiFilters.teamId || apiFilters.responsibleId)
  const { data, isLoading, isFetching, error } = useActions(apiFilters)

  const actions = data?.data ?? []

  const {
    getColumnActions,
    sensors,
    handleDragStart: originalHandleDragStart,
    handleDragEnd: originalHandleDragEnd,
    activeAction,
  } = useKanbanActions(actions)

  const handleDragStart = (event: DragStartEvent) => {
    originalHandleDragStart(event)
    const title = getDraggedActionTitle(event.active)
    if (title) setAnnouncement(`Movendo ação: ${title}`)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    originalHandleDragEnd(event)
    const title = getDraggedActionTitle(event.active)
    const nextStatus = parseActionStatus(event.over?.id)
    if (title && nextStatus) {
      setAnnouncement(`Ação ${title} movida para ${columnNames[nextStatus]}`)
      return
    }
    setAnnouncement('')
  }

  const canCreate = user?.role === 'admin' || user?.role === 'manager'
  const hasFilters =
    filtersState.statuses.length > 0 ||
    filtersState.priority !== 'all' ||
    filtersState.assignment !== 'all' ||
    filtersState.showBlockedOnly ||
    filtersState.showLateOnly ||
    !!filtersState.searchQuery

  const handleActionClick = useCallback(
    (actionId: string) => {
      openEdit(actionId)
    },
    [openEdit]
  )

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
      <style jsx global>
        {kanbanStyles}
      </style>
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement}
      </div>

      {isFetching && actions.length > 0 && (
        <div className="sticky left-0 right-0 top-0 z-50 mb-4 h-1 bg-primary/20">
          <div className="h-full animate-pulse bg-primary" />
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div
          className={cn(
            'kanban-board-container scrollbar-thin flex gap-4 overflow-x-auto px-4 pb-4 md:grid md:grid-cols-3 md:gap-6 md:overflow-x-visible md:px-0',
            isFetching && actions.length > 0 && 'opacity-70 transition-opacity'
          )}
          role="region"
          aria-label="Quadro Kanban de ações"
        >
          {columns.map((column) => {
            const columnActions = getColumnActions(column.status)

            return (
              <KanbanColumn
                key={column.id}
                column={column}
                actions={columnActions}
                onActionClick={handleActionClick}
              />
            )
          })}
        </div>

        <DragOverlay>
          {activeAction && <ActionKanbanCard action={activeAction} isDragging />}
        </DragOverlay>
      </DndContext>
    </>
  )
}

interface KanbanColumnProps {
  column: { id: ActionStatus; title: string; status: ActionStatus }
  actions: Action[]
  onActionClick: (actionId: string) => void
}

function KanbanColumn({ column, actions, onActionClick }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  })

  const { containerClass, barClass, titleClass, countClass } = columnStyles[column.status]

  return (
    <SortableContext
      id={column.id}
      items={actions.map((a) => a.id)}
      strategy={verticalListSortingStrategy}
    >
      <div
        ref={setNodeRef}
        data-id={column.id}
        className={`kanban-column flex w-[85vw] flex-shrink-0 flex-col rounded-xl border bg-card/50 shadow-sm backdrop-blur-sm transition-all duration-300 sm:w-[50vw] md:w-full md:flex-shrink ${containerClass} ${isOver ? 'kanban-column-drag-over' : ''}`}
        style={{ minHeight: '500px', maxHeight: 'calc(100vh - 220px)' }}
      >
        <div className="flex items-center gap-3 border-b border-border/40 px-4 py-3">
          <span className={`h-2.5 w-2.5 rounded-full ${barClass}`} />
          <h3 className={`text-sm font-semibold tracking-tight ${titleClass}`}>{column.title}</h3>
          <span
            className={`ml-auto rounded-full px-2.5 py-1 text-[11px] font-semibold ${countClass}`}
          >
            {actions.length}
          </span>
        </div>

        <div
          className="scrollbar-thin flex flex-1 flex-col gap-3 overflow-y-auto p-3"
          role="list"
          aria-label={`Ações ${column.title.toLowerCase()}`}
        >
          {actions.map((action) => (
            <SortableActionCard
              key={action.id}
              action={action}
              onClick={() => onActionClick(action.id)}
            />
          ))}
          {isOver && <div className="mx-2 h-1 animate-pulse rounded bg-primary/20" />}
        </div>
      </div>
    </SortableContext>
  )
}

interface SortableActionCardProps {
  action: Action
  onClick: () => void
}

const SortableActionCard = memo(function SortableActionCard({
  action,
  onClick,
}: SortableActionCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: action.id,
    data: { action },
    disabled: action.isBlocked,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : 'auto',
  }

  return (
    <div ref={setNodeRef} style={style} role="listitem">
      <ActionKanbanCard
        action={action}
        onClick={onClick}
        isDragging={isDragging}
        dragListeners={action.isBlocked ? undefined : listeners}
        dragAttributes={action.isBlocked ? undefined : attributes}
      />
    </div>
  )
})

interface ResponsibleSelectorProps {
  action: Action
  canEdit: boolean
}

function ResponsibleSelector({ action, canEdit }: ResponsibleSelectorProps) {
  const { user: authUser } = useAuth()
  const { selectedCompany } = useCompany()
  const updateAction = useUpdateAction()
  const [open, setOpen] = useState(false)

  const { data: executors, isLoading } = useQuery({
    queryKey: ['executors', selectedCompany?.id],
    queryFn: () =>
      selectedCompany?.id
        ? employeesApi.listExecutorsByCompany(selectedCompany.id)
        : Promise.resolve([]),
    enabled: !!selectedCompany?.id,
    staleTime: EXECUTORS_STALE_TIME_MS,
  })

  const handleChangeResponsible = async (newResponsibleId: string) => {
    try {
      await updateAction.mutateAsync({
        id: action.id,
        data: { responsibleId: newResponsibleId },
      })
      toast.success('Responsável alterado com sucesso')
      setOpen(false)
    } catch (error) {
      toast.error('Erro ao alterar responsável')
    }
  }

  const currentResponsible = executors?.find((e) => e.userId === action.responsibleId)
  const responsibleFromAction =
    action.responsible && action.responsible.id === action.responsibleId
      ? action.responsible
      : undefined
  const responsibleUser = responsibleFromAction ?? currentResponsible?.user
  const responsibleName = responsibleUser
    ? `${responsibleUser.firstName} ${responsibleUser.lastName}`
    : '—'
  const responsibleInitials =
    authUser && action.responsibleId === authUser.id
      ? (authUser.initials ?? null)
      : (currentResponsible?.user?.initials ?? null)
  const responsibleAvatarColor =
    authUser && action.responsibleId === authUser.id
      ? (authUser.avatarColor ?? null)
      : (currentResponsible?.user?.avatarColor ?? null)

  if (!canEdit) {
    return (
      <div className="flex items-center">
        <span className="sr-only">{responsibleName}</span>
        <UserAvatar
          id={action.responsibleId}
          firstName={responsibleUser?.firstName}
          lastName={responsibleUser?.lastName}
          initials={responsibleInitials}
          avatarColor={responsibleAvatarColor}
          size="sm"
          className="h-5 w-5 text-[9px]"
        />
      </div>
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="-ml-1 flex items-center rounded px-1 transition-colors hover:bg-gray-50"
          onClick={(e) => {
            e.stopPropagation()
          }}
        >
          <span className="sr-only">{responsibleName}</span>
          <UserAvatar
            id={action.responsibleId}
            firstName={responsibleUser?.firstName}
            lastName={responsibleUser?.lastName}
            initials={responsibleInitials}
            avatarColor={responsibleAvatarColor}
            size="sm"
            className="h-5 w-5 text-[9px]"
          />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[240px] p-0" align="start" side="top">
        <div className="p-2">
          <div className="mb-2 px-2 py-1.5">
            <p className="text-xs font-semibold text-muted-foreground">Alterar Responsável</p>
          </div>
          <div className="max-h-[200px] space-y-1 overflow-y-auto">
            {isLoading ? (
              <div className="px-2 py-4 text-center text-xs text-muted-foreground">
                Carregando...
              </div>
            ) : executors && executors.length > 0 ? (
              executors.map((executor) => {
                const execUser = executor.user

                const execInitials =
                  authUser && executor.userId === authUser.id
                    ? (authUser.initials ?? null)
                    : (execUser?.initials ?? null)
                const execAvatarColor =
                  authUser && executor.userId === authUser.id
                    ? (authUser.avatarColor ?? null)
                    : (execUser?.avatarColor ?? null)

                return (
                  <Button
                    key={executor.id}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start gap-2 text-xs font-normal"
                    onClick={() => handleChangeResponsible(executor.userId)}
                    disabled={updateAction.isPending}
                  >
                    <UserAvatar
                      id={executor.userId}
                      firstName={execUser?.firstName}
                      lastName={execUser?.lastName}
                      initials={execInitials}
                      avatarColor={execAvatarColor}
                      size="sm"
                      className="h-5 w-5 text-[9px]"
                    />
                    <span className="flex-1 truncate text-left">
                      {executor.user
                        ? `${executor.user.firstName} ${executor.user.lastName}`
                        : executor.userId}
                    </span>
                    {executor.userId === action.responsibleId && (
                      <UserCheck className="h-3.5 w-3.5 text-primary" />
                    )}
                  </Button>
                )
              })
            ) : (
              <div className="px-2 py-4 text-center text-xs text-muted-foreground">
                Nenhum executor disponível
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

const ActionKanbanCard = memo(function ActionKanbanCard({
  action,
  onClick,
  isDragging = false,
  dragListeners,
  dragAttributes,
}: {
  action: Action
  onClick?: () => void
  isDragging?: boolean
  dragListeners?: DraggableSyntheticListeners | undefined
  dragAttributes?: DraggableAttributes | undefined
}) {
  const { user } = useAuth()
  const canEdit = user?.role === 'admin' || user?.role === 'manager'

  const checklistProgress = useMemo(() => {
    if (!action.checklistItems) return '0/0'
    const completed = action.checklistItems.filter((i) => i.isCompleted).length
    return `${completed}/${action.checklistItems.length}`
  }, [action.checklistItems])

  const handleClick = (e: React.MouseEvent) => {
    if (!isDragging && onClick) {
      e.preventDefault()
      e.stopPropagation()
      onClick()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isDragging && onClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault()
      e.stopPropagation()
      onClick()
    }
  }

  return (
    <div
      className={cn(
        'kanban-card relative flex w-full cursor-grab flex-col gap-2 rounded-xl border bg-card p-3 shadow-sm transition-all duration-200 hover:shadow-md active:scale-[0.98] active:cursor-grabbing',
        isDragging && 'kanban-card-dragging z-50 scale-105 shadow-xl',
        action.isBlocked && 'border-muted-foreground/20 bg-muted/40'
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      {...dragAttributes}
      {...dragListeners}
    >
      <div className="flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <h4 className="line-clamp-2 flex-1 text-sm font-semibold text-foreground">
            {action.title}
          </h4>
          <PriorityBadge priority={action.priority} showLabel={false} />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {action.isBlocked && (
            <BlockedBadge isBlocked={action.isBlocked} reason={action.blockedReason} />
          )}
          <LateIndicator isLate={action.isLate} />
          <ActionLateStatusBadge lateStatus={action.lateStatus} size="sm" />
        </div>
      </div>

      <div>
        {action.description && (
          <p className="mb-2 line-clamp-2 text-xs text-muted-foreground">{action.description}</p>
        )}

        <div className="mt-2 flex items-center justify-between border-t border-border/50 pt-2">
          <ResponsibleSelector action={action} canEdit={canEdit} />

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {action.actualEndDate ? (
              <div className="flex items-center gap-1" title="Fim Real">
                <Calendar className="h-3 w-3" />
                <span>{format(new Date(action.actualEndDate), 'dd/MM')}</span>
              </div>
            ) : (
              <div className="flex items-center gap-1" title="Fim Previsto">
                <Calendar className="h-3 w-3" />
                <span>{format(new Date(action.estimatedEndDate), 'dd/MM')}</span>
              </div>
            )}
            <div className="flex items-center gap-1" title="Checklist">
              <span className="font-medium">{checklistProgress}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})
