import { useCallback, useState } from 'react'

import {
  DragEndEvent,
  DragStartEvent,
  MouseSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { toast } from 'sonner'

import { ActionStatus } from '@/lib/types/action'
import type { Action } from '@/lib/types/action'

import { useMoveAction } from './use-actions'

export function useKanbanActions(actions: Action[]) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [activeAction, setActiveAction] = useState<Action | null>(null)
  const moveAction = useMoveAction()

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

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
      const activeActionId = String(active.id)
      setActiveId(activeActionId)
      const draggedAction = actions.find((action) => action.id === activeActionId)
      if (draggedAction) {
        setActiveAction(draggedAction)
      }
    },
    [actions]
  )

  const parseActionStatus = useCallback((value: unknown): ActionStatus | null => {
    if (value === ActionStatus.TODO) return ActionStatus.TODO
    if (value === ActionStatus.IN_PROGRESS) return ActionStatus.IN_PROGRESS
    if (value === ActionStatus.DONE) return ActionStatus.DONE
    return null
  }, [])

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event
      setActiveId(null)
      setActiveAction(null)

      if (!over) return

      const activeActionId = String(active.id)
      const movedAction = actions.find((action) => action.id === activeActionId)
      if (!movedAction) return

      const overActionId = String(over.id)
      const columnStatus = parseActionStatus(over.id)
      const overAction = actions.find((a) => a.id === overActionId)
      const nextStatus = columnStatus ?? overAction?.status ?? null
      if (!nextStatus) return

      try {
        await moveAction.mutateAsync({
          id: movedAction.id,
          data: { toStatus: nextStatus },
        })
      } catch {
        toast.error('Erro ao mover ação')
      }
    },
    [actions, moveAction, parseActionStatus]
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
