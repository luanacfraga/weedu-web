import type { Action, ActionStatus } from '@/lib/types/action'
import {
  DragEndEvent,
  DragStartEvent,
  MouseSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { useCallback, useState } from 'react'
import { toast } from 'sonner'
import { useMoveAction } from './use-actions'

export function useKanbanActions(actions: Action[]) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [activeAction, setActiveAction] = useState<Action | null>(null)
  const moveAction = useMoveAction()

  // Configure sensors with proper activation constraints
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Increased distance for better scrolling vs dragging distinction
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250, // Increased delay to distinguish tap vs drag
        tolerance: 5,
      },
    }),
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  // Sort actions by position within column
  const getColumnActions = useCallback(
    (status: ActionStatus) => {
      return actions
        .filter((action) => action.status === status)
        .sort((a, b) => {
          const aPos = a.kanbanOrder?.position ?? 0
          const bPos = b.kanbanOrder?.position ?? 0
          return aPos - bPos
        })
    },
    [actions]
  )

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const { active } = event
      setActiveId(active.id as string)
      const draggedAction = actions.find((action) => action.id === active.id)
      if (draggedAction) {
        setActiveAction(draggedAction)
      }
    },
    [actions]
  )

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event
      setActiveId(null)
      setActiveAction(null)

      if (!over) return

      const activeAction = actions.find((action) => action.id === active.id)
      if (!activeAction) return

      // Determine new status
      const isColumn = ['TODO', 'IN_PROGRESS', 'DONE'].includes(over.id as string)
      let newStatus: ActionStatus | undefined

      if (isColumn) {
        newStatus = over.id as ActionStatus
      } else {
        // If dropped over another card, get that card's status
        const overAction = actions.find((a) => a.id === over.id)
        newStatus = overAction?.status
      }

      if (!newStatus) return

      // Optimistic update handled by parent component now to avoid flicker
      // We just call the mutation here
      try {
        await moveAction.mutateAsync({
          id: activeAction.id,
          data: { toStatus: newStatus }, // Let backend handle position for now to simplify
        })
        toast.success('Ação movida com sucesso')
      } catch (error) {
        toast.error('Erro ao mover ação')
      }
    },
    [actions, moveAction]
  )

  return {
    getColumnActions,
    sensors,
    handleDragStart,
    handleDragEnd,
    activeId,
    activeAction,
  }
}
