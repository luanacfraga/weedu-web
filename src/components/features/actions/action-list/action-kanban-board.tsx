'use client'

import { Card, CardContent } from '@/components/ui/card'
import { useAuth } from '@/lib/hooks/use-auth'
import { useCompany } from '@/lib/hooks/use-company'
import { useKanbanActions } from '@/lib/hooks/use-kanban-actions'
import { useActionFiltersStore } from '@/lib/stores/action-filters-store'
import { ActionStatus, type Action, type ActionFilters } from '@/lib/types/action'
import { DndContext, DragOverlay, closestCenter, useDroppable } from '@dnd-kit/core'
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { format } from 'date-fns'
import { useMemo, useState } from 'react'
import { ActionDetailSheet } from '../action-detail-sheet'
import { BlockedBadge } from '../shared/blocked-badge'
import { LateIndicator } from '../shared/late-indicator'
import { PriorityBadge } from '../shared/priority-badge'
import { StatusBadge } from '../shared/status-badge'
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

export function ActionKanbanBoard() {
  const { user } = useAuth()
  const { selectedCompany } = useCompany()
  const filtersState = useActionFiltersStore()
  const [selectedActionId, setSelectedActionId] = useState<string | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)

  // Build API filters from store
  const apiFilters: ActionFilters = useMemo(() => {
    const filters: ActionFilters = {}

    // For Kanban, we usually want all statuses unless specifically filtered,
    // but the column structure handles separation.
    // If a specific status is selected in filters, we might only show that column or filter items within columns.
    // Here we'll pass the status filter to the API, so if 'TODO' is selected, only TODO items return,
    // and other columns will be empty.
    if (filtersState.status !== 'all') filters.status = filtersState.status
    if (filtersState.priority !== 'all') filters.priority = filtersState.priority
    if (filtersState.showBlockedOnly) filters.isBlocked = true
    if (filtersState.showLateOnly) filters.isLate = true

    // Assignment filters
    if (filtersState.assignment === 'assigned-to-me') {
      filters.responsibleId = user?.id
    }

    // Company/Team filters - use selectedCompany as default if no filter is set
    if (filtersState.companyId) {
      filters.companyId = filtersState.companyId
    } else if (selectedCompany?.id) {
      filters.companyId = selectedCompany.id
    }

    if (filtersState.teamId) filters.teamId = filtersState.teamId

    return filters
  }, [filtersState, user, selectedCompany])

  // Use the consolidated Kanban actions hook
  const {
    actions,
    isLoading,
    error,
    getColumnActions,
    sensors,
    handleDragStart,
    handleDragEnd,
    activeAction,
  } = useKanbanActions(apiFilters)

  // Apply client-side filters that aren't supported by the API yet
  const getFilteredColumnActions = useMemo(() => {
    return (status: ActionStatus) => {
      let result = getColumnActions(status)

      // Backend doesn't support search/creatorId filter yet, so we apply client-side filtering.
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
  }, [getColumnActions, filtersState.assignment, filtersState.searchQuery, user?.id])

  const canCreate = user?.role === 'admin' || user?.role === 'manager'
  const hasFilters =
    filtersState.status !== 'all' ||
    filtersState.priority !== 'all' ||
    filtersState.assignment !== 'all' ||
    filtersState.showBlockedOnly ||
    filtersState.showLateOnly ||
    !!filtersState.searchQuery

  if (isLoading) return <ActionListSkeleton />

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

  const handleActionClick = (actionId: string) => {
    setSelectedActionId(actionId)
    setSheetOpen(true)
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid h-full grid-cols-1 gap-3 overflow-x-auto pb-2 md:grid-cols-3">
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

  return (
    <SortableContext
      id={column.id}
      items={actions.map((a) => a.id)}
      strategy={verticalListSortingStrategy}
    >
      <div
        ref={setNodeRef}
        data-id={column.id}
        className={`flex min-w-[280px] flex-col gap-2 ${isOver ? 'bg-muted/30' : ''}`}
        style={{ minHeight: '200px' }}
      >
        <div className="flex items-center justify-between rounded-lg bg-muted/50 p-1.5">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {column.title}
          </h3>
          <span className="rounded-md border bg-background px-1.5 py-0.5 text-xs font-medium shadow-sm">
            {actions.length}
          </span>
        </div>

        <div className="flex flex-1 flex-col gap-2">
          {actions.map((action) => (
            <SortableActionCard
              key={action.id}
              action={action}
              onClick={() => onActionClick(action.id)}
            />
          ))}
        </div>
      </div>
    </SortableContext>
  )
}

interface SortableActionCardProps {
  action: Action
  onClick: () => void
}

function SortableActionCard({ action, onClick }: SortableActionCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: action.id,
    data: { action },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <ActionKanbanCard
        action={action}
        onClick={onClick}
        isDragging={isDragging}
        dragListeners={listeners}
      />
    </div>
  )
}

function ActionKanbanCard({
  action,
  onClick,
  isDragging = false,
  dragListeners,
}: {
  action: Action
  onClick?: () => void
  isDragging?: boolean
  dragListeners?: any
}) {
  const checklistProgress = action.checklistItems
    ? `${action.checklistItems.filter((i) => i.isCompleted).length}/${action.checklistItems.length}`
    : '0/0'

  const handleClick = (e: React.MouseEvent) => {
    if (!isDragging && onClick) {
      e.preventDefault()
      e.stopPropagation()
      onClick()
    }
  }

  return (
    <Card className={`transition-shadow hover:shadow-md ${isDragging ? 'opacity-50' : ''}`}>
      <CardContent className="space-y-2 p-2.5">
        {/* Clickable area - top section with title and priority */}
        <div
          className="flex items-start justify-between gap-1.5 cursor-pointer"
          onClick={handleClick}
          onMouseDown={(e) => {
            e.stopPropagation()
          }}
        >
          <h4 className="line-clamp-2 text-xs font-medium leading-tight hover:text-primary">
            {action.title}
          </h4>
          <PriorityBadge
            priority={action.priority}
            className="h-4 shrink-0 px-1 py-0 text-[9px]"
          />
        </div>

        {/* Draggable area - bottom section with metadata */}
        <div {...dragListeners}>
          <div className="flex flex-wrap gap-1">
            <StatusBadge status={action.status} className="h-4 px-1 py-0 text-[9px]" />
            <LateIndicator isLate={action.isLate} className="text-[9px]" />
            <BlockedBadge
              isBlocked={action.isBlocked}
              reason={action.blockedReason}
              className="h-4 px-1 py-0 text-[9px]"
            />
          </div>

          <div className="flex items-center justify-between border-t pt-1.5 text-[10px] text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <span title="Responsável">
                {action.responsibleId ? `#${action.responsibleId.slice(0, 8)}` : '—'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span title="Data de Término">{format(new Date(action.estimatedEndDate), 'dd/MM')}</span>
              <span title="Checklist" className="flex items-center gap-0.5">
                ☑ {checklistProgress}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
