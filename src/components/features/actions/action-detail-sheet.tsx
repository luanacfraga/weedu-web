'use client'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  useAction,
  useAddChecklistItem,
  useReorderChecklistItems,
  useToggleChecklistItem,
} from '@/lib/hooks/use-actions'
import type { ChecklistItem } from '@/lib/types/action'
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
import { useState } from 'react'
import { toast } from 'sonner'
import { ActionForm } from './action-form/action-form'

interface ActionDetailSheetProps {
  actionId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  canEdit?: boolean
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
      className="flex items-center gap-2 rounded-md bg-background p-1.5 hover:bg-muted/50"
    >
      <div {...listeners} className="cursor-grab rounded p-1 hover:bg-muted active:cursor-grabbing">
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>
      <Checkbox
        checked={item.isCompleted}
        onCheckedChange={() => onToggle(item.id)}
        disabled={isDisabled}
        className="h-4 w-4"
      />
      <span
        className={`flex-1 text-sm ${item.isCompleted ? 'text-muted-foreground line-through' : ''}`}
      >
        {item.description}
      </span>
    </div>
  )
}

export function ActionDetailSheet({
  actionId,
  open,
  onOpenChange,
  canEdit = true,
}: ActionDetailSheetProps) {
  const [newItemDescription, setNewItemDescription] = useState('')
  const { data: action, isLoading } = useAction(actionId || '')
  const readOnly = !canEdit || action?.isBlocked || false
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
    if (!actionId || !newItemDescription.trim() || !action) return

    try {
      await addChecklistItem.mutateAsync({
        actionId,
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
    if (!actionId) return

    try {
      await toggleChecklistItem.mutateAsync({ actionId, itemId })
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

    if (!over || active.id === over.id || !action?.checklistItems || !actionId) return

    const oldIndex = action.checklistItems.findIndex((item) => item.id === active.id)
    const newIndex = action.checklistItems.findIndex((item) => item.id === over.id)

    if (oldIndex === -1 || newIndex === -1) return

    // Reorder items locally
    const reorderedItems = arrayMove(action.checklistItems, oldIndex, newIndex)
    const itemIds = reorderedItems.map((item) => item.id)

    try {
      await reorderChecklistItems.mutateAsync({ actionId, itemIds })
      toast.success('Checklist reordenado')
    } catch (error) {
      console.error('Erro ao reordenar checklist:', error)
      toast.error('Erro ao reordenar checklist')
    }
  }

  if (isLoading) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="overflow-y-auto">
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </SheetContent>
      </Sheet>
    )
  }

  if (!action) {
    return null
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="z-drawer flex w-full flex-col p-0 sm:max-w-lg">
        <div className="border-b px-4 pb-3 pt-4">
          <SheetHeader>
            <SheetTitle className="text-base">
              {readOnly ? 'Detalhes da Ação' : 'Editar Ação'}
            </SheetTitle>
            <SheetDescription className="text-sm">{action.title}</SheetDescription>
          </SheetHeader>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
          {/* Form */}
          <ActionForm
            mode="edit"
            action={action}
            readOnly={readOnly}
            onCancel={() => onOpenChange(false)}
            onSuccess={() => onOpenChange(false)}
          />

          <Separator />

          {/* Checklist Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Checklist</h3>

            {/* Existing checklist items */}
            {action.checklistItems && action.checklistItems.length > 0 && (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
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

            {/* Add new item */}
            {!readOnly && (
              <div className="flex gap-2">
                <Input
                  placeholder="Adicionar novo item..."
                  value={newItemDescription}
                  onChange={(e) => setNewItemDescription(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddChecklistItem()
                    }
                  }}
                  disabled={addChecklistItem.isPending}
                  className="h-8 text-sm"
                />
                <Button
                  size="icon"
                  onClick={handleAddChecklistItem}
                  disabled={!newItemDescription.trim() || addChecklistItem.isPending}
                  className="h-8 w-8"
                >
                  {addChecklistItem.isPending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Plus className="h-3.5 w-3.5" />
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
