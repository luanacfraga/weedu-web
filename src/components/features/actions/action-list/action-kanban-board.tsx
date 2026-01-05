'use client'

import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { UserAvatar } from '@/components/ui/user-avatar'
import { employeesApi } from '@/lib/api/endpoints/employees'
import { useActions } from '@/lib/hooks/use-actions'
import { useUpdateAction } from '@/lib/hooks/use-actions'
import { useAuth } from '@/lib/hooks/use-auth'
import { useCompany } from '@/lib/hooks/use-company'
import { useKanbanActions } from '@/lib/hooks/use-kanban-actions'
import { useActionFiltersStore } from '@/lib/stores/action-filters-store'
import { ActionStatus, type Action, type ActionFilters } from '@/lib/types/action'
import { cn } from '@/lib/utils'
import {
  DndContext,
  DragOverlay,
  closestCenter,
  useDroppable,
  type DraggableSyntheticListeners,
} from '@dnd-kit/core'
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { Calendar, Eye, Flag, Loader2, Lock, UserCheck } from 'lucide-react'
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { ActionDetailSheet } from '../action-detail-sheet'
import { getActionPriorityUI } from '../shared/action-priority-ui'
import { actionStatusUI } from '../shared/action-status-ui'
import { LateIndicator } from '../shared/late-indicator'
import { BlockedBadge } from '../shared/blocked-badge'
import { ActionListEmpty } from './action-list-empty'
import { ActionListSkeleton } from './action-list-skeleton'

// Priority UI is centralized in getActionPriorityUI()

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

  .custom-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: hsl(var(--muted-foreground) / 0.2) transparent;
  }

  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
    margin: 4px;
  }

  .custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: hsl(var(--muted-foreground) / 0.15);
    border-radius: 10px;
    transition: background-color 0.2s ease;
  }

  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background-color: hsl(var(--muted-foreground) / 0.3);
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

export function ActionKanbanBoard() {
  const { user } = useAuth()
  const { selectedCompany } = useCompany()
  const filtersState = useActionFiltersStore()
  const [selectedActionId, setSelectedActionId] = useState<string | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [announcement, setAnnouncement] = useState('')

  // Build API filters from store
  const [page, setPage] = useState(1)
  const [allActions, setAllActions] = useState<Action[]>([])
  const loadMoreRef = useRef<HTMLDivElement | null>(null)

  const apiFilters: ActionFilters = useMemo(() => {
    const filters: ActionFilters = {}

    if (filtersState.statuses.length === 1) filters.status = filtersState.statuses[0]
    if (filtersState.priority !== 'all') filters.priority = filtersState.priority
    if (filtersState.showBlockedOnly) filters.isBlocked = true
    if (filtersState.showLateOnly) filters.isLate = true

    // Assignment filters
    if (filtersState.assignment === 'assigned-to-me') {
      filters.responsibleId = user?.id
    }

    // Company/Team filters
    if (filtersState.companyId) {
      filters.companyId = filtersState.companyId
    } else if (selectedCompany?.id) {
      filters.companyId = selectedCompany.id
    }

    if (filtersState.teamId) filters.teamId = filtersState.teamId

    // Pagination (kanban infinite scroll)
    filters.page = page
    filters.limit = 30

    return filters
  }, [filtersState, page, user, selectedCompany])

  const {
    getColumnActions,
    sensors,
    handleDragStart: originalHandleDragStart,
    handleDragEnd: originalHandleDragEnd,
    activeAction,
  } = useKanbanActions(allActions)

  const { data, isLoading, isFetching, error } = useActions(apiFilters)

  useEffect(() => {
    if (!data?.data) return
    setAllActions((prev) => (page === 1 ? data.data : [...prev, ...data.data]))
  }, [data?.data, page])

  // Reset pagination when filters change
  useEffect(() => {
    setPage(1)
    setAllActions([])
  }, [
    filtersState.statuses,
    filtersState.priority,
    filtersState.assignment,
    filtersState.showBlockedOnly,
    filtersState.showLateOnly,
    filtersState.companyId,
    filtersState.teamId,
    filtersState.searchQuery,
  ])

  // Infinite scroll sentinel
  useEffect(() => {
    const el = loadMoreRef.current
    if (!el) return

    const hasNext =
      data?.meta?.hasNextPage ?? (data?.meta ? page < data.meta.totalPages : false)

    if (!hasNext) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNext && !isFetching) {
          setPage((p) => p + 1)
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [data?.meta, isFetching, page])

  const handleDragStart = (event: any) => {
    originalHandleDragStart(event)
    const action = event.active?.data?.current?.action
    if (action) {
      setAnnouncement(`Movendo ação: ${action.title}`)
    }
  }

  const handleDragEnd = (event: any) => {
    originalHandleDragEnd(event)
    const action = event.active?.data?.current?.action
    const overColumn = event.over?.id
    if (action && overColumn) {
      const columnNames = {
        [ActionStatus.TODO]: 'Pendentes',
        [ActionStatus.IN_PROGRESS]: 'Em Andamento',
        [ActionStatus.DONE]: 'Concluídas',
      }
      setAnnouncement(`Ação ${action.title} movida para ${columnNames[overColumn as ActionStatus]}`)
    } else {
      setAnnouncement('')
    }
  }

  // Apply client-side filters
  const getFilteredColumnActions = useMemo(() => {
    return (status: ActionStatus) => {
      if (filtersState.statuses.length > 0 && !filtersState.statuses.includes(status)) {
        return []
      }
      let result = getColumnActions(status)

      if (filtersState.assignment === 'created-by-me' && user?.id) {
        result = result.filter((a) => a.creatorId === user.id)
      }

      const q = filtersState.searchQuery?.trim().toLowerCase()
      if (q) {
        result = result.filter((a) => {
          const haystack = `${a.title} ${a.description}`.toLowerCase()
          return haystack.includes(q)
        })
      }

      return result
    }
  }, [
    getColumnActions,
    filtersState.assignment,
    filtersState.searchQuery,
    filtersState.statuses,
    user?.id,
  ])

  const canCreate = user?.role === 'admin' || user?.role === 'manager'
  const hasFilters =
    filtersState.statuses.length > 0 ||
    filtersState.priority !== 'all' ||
    filtersState.assignment !== 'all' ||
    filtersState.showBlockedOnly ||
    filtersState.showLateOnly ||
    !!filtersState.searchQuery

  const handleActionClick = useCallback((actionId: string) => {
    setSelectedActionId(actionId)
    setSheetOpen(true)
  }, [])

  if (isLoading && allActions.length === 0) return <ActionListSkeleton />

  if (error) {
    return (
      <div className="py-12 text-center">
        <p className="text-destructive">Erro ao carregar ações. Tente novamente.</p>
      </div>
    )
  }

  if (!isLoading && allActions.length === 0) {
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
      {/* ARIA live region for screen reader announcements */}
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement}
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div
          className="kanban-board-container custom-scrollbar flex gap-4 overflow-x-auto px-4 pb-4 md:grid md:grid-cols-3 md:gap-6 md:overflow-x-visible md:px-0"
          role="region"
          aria-label="Quadro Kanban de ações"
        >
          {columns.map((column) => {
            const columnActions = getFilteredColumnActions(column.status)

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

        {/* Infinite scroll sentinel */}
        <div ref={loadMoreRef} className="h-6" />

        {isFetching && page > 1 && (
          <div className="flex justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}

        <DragOverlay>
          {activeAction && <ActionKanbanCard action={activeAction} isDragging />}
        </DragOverlay>
      </DndContext>

      <ActionDetailSheet actionId={selectedActionId} open={sheetOpen} onOpenChange={setSheetOpen} />
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
        className={`kanban-column flex w-[calc(100vw-3rem)] flex-shrink-0 flex-col rounded-xl border shadow-sm backdrop-blur-sm transition-all duration-300 sm:w-[calc(50vw-2rem)] md:w-full md:flex-shrink ${containerClass} ${isOver ? 'kanban-column-drag-over' : ''}`}
        style={{ minHeight: '500px', maxHeight: 'calc(100vh - 220px)' }}
      >
        {/* Column Header */}
        <div className="flex items-center gap-3 border-b border-border/40 px-4 py-4">
          <span className={`h-2.5 w-2.5 rounded-full shadow-sm ${barClass}`} />
          <h3 className={`text-sm font-semibold tracking-tight ${titleClass}`}>{column.title}</h3>
          <span
            className={`ml-auto rounded-full px-2.5 py-1 text-[11px] font-semibold shadow-sm ${countClass}`}
          >
            {actions.length}
          </span>
        </div>

        {/* Column Body */}
        <div
          className="custom-scrollbar flex flex-1 flex-col gap-3 overflow-y-auto p-3"
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
    <div ref={setNodeRef} style={style} {...attributes} role="listitem">
      <ActionKanbanCard
        action={action}
        onClick={onClick}
        isDragging={isDragging}
        dragListeners={action.isBlocked ? undefined : listeners}
      />
    </div>
  )
})

interface ResponsibleSelectorProps {
  action: Action
  canEdit: boolean
}

function ResponsibleSelector({ action, canEdit }: ResponsibleSelectorProps) {
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
    staleTime: 1000 * 60 * 5, // 5 minutes
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
  const responsibleInitials = currentResponsible?.user?.initials ?? null
  const responsibleAvatarColor = currentResponsible?.user?.avatarColor ?? null

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
                      initials={execUser?.initials ?? null}
                      avatarColor={execUser?.avatarColor ?? null}
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
}: {
  action: Action
  onClick?: () => void
  isDragging?: boolean
  dragListeners?: DraggableSyntheticListeners | undefined
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

  const priorityUI = getActionPriorityUI(action.priority)

  return (
    <div
      className={cn(
        'kanban-card relative flex w-full flex-col gap-1.5 rounded-xl border border-gray-200/50 bg-white p-2.5 shadow-sm transition-all duration-200 hover:border-gray-300/50 hover:shadow-md',
        isDragging && 'kanban-card-dragging',
        action.isBlocked &&
          'border-border/60 bg-muted/50 opacity-90 shadow-none hover:border-border/60 hover:shadow-none'
      )}
    >
      {/* Área superior - Clique para abrir drawer */}
      <div
        className="flex cursor-pointer items-start justify-between gap-2"
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onMouseDown={(e) => {
          e.stopPropagation()
        }}
        tabIndex={0}
        role="button"
      >
        <div className="line-clamp-2 flex-1 select-none text-xs font-medium text-gray-900 hover:text-primary">
          {action.title}
        </div>
        <div className="flex items-center gap-1">
          {action.isBlocked && (
            <span
              className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-muted text-muted-foreground"
              aria-label="Ação bloqueada"
              title="Ação bloqueada"
            >
              <Lock className="h-4 w-4" />
            </span>
          )}
          <button
            type="button"
            className="-m-2 cursor-pointer touch-manipulation select-none rounded-full p-2 transition-colors hover:bg-gray-100"
            aria-label="Ver detalhes"
            onClick={handleClick}
          >
            <Eye className="h-4 w-4 text-gray-400 hover:text-primary" />
          </button>
        </div>
      </div>

      {/* Área inferior - Drag and drop */}
      <div {...dragListeners}>
        {action.description && (
          <div className="mb-1 line-clamp-2 select-none text-[10px] text-gray-500">
            {action.description}
          </div>
        )}

        <div className="mt-0.5 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3 text-gray-400" />
            <span className="select-none text-[10px] text-gray-500">
              {format(new Date(action.estimatedStartDate), 'dd/MM')} -{' '}
              {format(new Date(action.estimatedEndDate), 'dd/MM')}
            </span>
          </div>
          <span
            className={cn(
              'select-none rounded-full px-1.5 py-0.5 text-[10px] font-medium',
              priorityUI.pillClass
            )}
          >
            <Flag className={cn('mr-1 inline-block h-3 w-3 align-[-2px]', priorityUI.flagClass)} />
            {priorityUI.label}
          </span>
        </div>

        <div className="mt-0.5 flex items-center gap-1.5 border-t border-gray-100 pt-1.5">
          <ResponsibleSelector action={action} canEdit={canEdit} />

          <div className="ml-auto flex items-center gap-2">
            <LateIndicator
              isLate={action.isLate}
              className="rounded-none px-1.5 py-0.5 text-[10px]"
            />
            <div className="flex items-center gap-1 rounded-full bg-muted/80 px-1.5 py-0.5 text-muted-foreground shadow-sm">
              <span className="text-[10px] font-semibold">☑ {checklistProgress}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})
