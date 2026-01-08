'use client'

import { useState } from 'react'

import {
  closestCenter,
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Loader2, Plus } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import {
  useAddChecklistItem,
  useReorderChecklistItems,
  useToggleChecklistItem,
} from '@/lib/hooks/use-actions'
import type { Action, ChecklistItem } from '@/lib/types/action'

interface ActionChecklistProps {
  action: Action
  readOnly: boolean
}

interface SortableChecklistItemProps {
  item: ChecklistItem
  onToggle: (itemId: string) => void
  isDisabled: boolean
}

function SortableChecklistItem({ item, onToggle, isDisabled }: SortableChecklistItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="group flex items-center gap-3 rounded-lg border border-transparent bg-muted/30 p-3 transition-colors hover:border-border/50 hover:bg-muted/50"
    >
      <div
        {...listeners}
        className="cursor-grab rounded text-muted-foreground opacity-0 transition-opacity hover:bg-background hover:text-foreground active:cursor-grabbing group-hover:opacity-100"
      >
        <GripVertical className="h-4 w-4" />
      </div>
      <Checkbox
        checked={item.isCompleted}
        onCheckedChange={() => onToggle(item.id)}
        disabled={isDisabled}
      />
      <span
        className={`flex-1 text-sm font-medium leading-none transition-all ${
          item.isCompleted
            ? 'text-muted-foreground line-through decoration-muted-foreground/50'
            : 'text-foreground'
        }`}
      >
        {item.description}
      </span>
    </div>
  )
}

export function ActionChecklist({ action, readOnly }: ActionChecklistProps) {
  const [newItemDescription, setNewItemDescription] = useState('')
  const addChecklistItem = useAddChecklistItem()
  const toggleChecklistItem = useToggleChecklistItem()
  const reorderChecklistItems = useReorderChecklistItems()

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const handleAddChecklistItem = async () => {
    if (readOnly) return
    if (!newItemDescription.trim()) return

    try {
      await addChecklistItem.mutateAsync({
        actionId: action.id,
        data: {
          description: newItemDescription,
          order: action.checklistItems?.length ?? 0,
        },
      })
      setNewItemDescription('')
      toast.success('Item adicionado ao checklist')
    } catch (error) {
      toast.error('Erro ao adicionar item')
    }
  }

  const handleToggleChecklistItem = async (itemId: string) => {
    if (readOnly) return

    try {
      await toggleChecklistItem.mutateAsync({ actionId: action.id, itemId })
      toast.success('Item atualizado')
    } catch (error) {
      console.error('Erro ao atualizar checklist item:', error)
      toast.error(
        `Erro ao atualizar item: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      )
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    if (readOnly) return
    const { active, over } = event

    if (
      !over ||
      active.id === over.id ||
      !action.checklistItems ||
      action.checklistItems.length === 0
    )
      return

    const oldIndex = action.checklistItems.findIndex((item) => item.id === active.id)
    const newIndex = action.checklistItems.findIndex((item) => item.id === over.id)

    if (oldIndex === -1 || newIndex === -1) return

    const reorderedItems = arrayMove(action.checklistItems, oldIndex, newIndex)
    const itemIds = reorderedItems.map((item) => item.id)

    try {
      await reorderChecklistItems.mutateAsync({ actionId: action.id, itemIds })
      toast.success('Checklist reordenado')
    } catch (error) {
      console.error('Erro ao reordenar checklist:', error)
      toast.error('Erro ao reordenar checklist')
    }
  }

  const completedCount = action.checklistItems?.filter((i) => i.isCompleted).length || 0
  const totalCount = action.checklistItems?.length || 0

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium leading-none text-foreground">Checklist</h3>
        <span className="text-xs text-muted-foreground">
          {completedCount} / {totalCount}
        </span>
      </div>

      {action.checklistItems && action.checklistItems.length > 0 && (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext
            items={action.checklistItems.map((item) => item.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-1.5">
              {action.checklistItems.map((item) => (
                <SortableChecklistItem
                  key={item.id}
                  item={item}
                  onToggle={handleToggleChecklistItem}
                  isDisabled={toggleChecklistItem.isPending || readOnly}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {!action.checklistItems?.length && (
        <div className="rounded-lg border border-dashed border-border/50 bg-muted/20 p-3 text-xs text-muted-foreground">
          Nenhum item no checklist ainda. Adicione itens para acompanhar melhor o progresso desta
          ação.
        </div>
      )}

      {!readOnly && (
        <>
          <Separator />
          <div className="flex gap-3 pt-1">
            <Input
              placeholder="Adicionar novo item ao checklist..."
              value={newItemDescription}
              onChange={(e) => setNewItemDescription(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAddChecklistItem()
                }
              }}
              disabled={addChecklistItem.isPending}
              className="h-10 text-sm"
            />
            <Button
              size="icon"
              onClick={handleAddChecklistItem}
              disabled={!newItemDescription.trim() || addChecklistItem.isPending}
              className="h-10 w-10 shrink-0"
            >
              {addChecklistItem.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
            </Button>
          </div>
        </>
      )}
    </section>
  )
}
