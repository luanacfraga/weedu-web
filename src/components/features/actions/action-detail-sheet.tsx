'use client';

import { useState } from 'react';
import { Loader2, Plus, GripVertical } from 'lucide-react';
import { toast } from 'sonner';
import { DndContext, closestCenter, DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { ActionForm } from './action-form/action-form';
import {
  useAction,
  useAddChecklistItem,
  useToggleChecklistItem,
  useReorderChecklistItems,
} from '@/lib/hooks/use-actions';
import type { ChecklistItem } from '@/lib/types/action';

interface ActionDetailSheetProps {
  actionId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface SortableChecklistItemProps {
  item: ChecklistItem;
  onToggle: (itemId: string) => void;
  isDisabled: boolean;
}

function SortableChecklistItem({ item, onToggle, isDisabled }: SortableChecklistItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="flex items-center gap-2 p-1.5 rounded-md hover:bg-muted/50 bg-background"
    >
      <div
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded"
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>
      <Checkbox
        checked={item.isCompleted}
        onCheckedChange={() => onToggle(item.id)}
        disabled={isDisabled}
        className="h-4 w-4"
      />
      <span
        className={`flex-1 text-sm ${
          item.isCompleted
            ? 'line-through text-muted-foreground'
            : ''
        }`}
      >
        {item.description}
      </span>
    </div>
  );
}

export function ActionDetailSheet({
  actionId,
  open,
  onOpenChange,
}: ActionDetailSheetProps) {
  const [newItemDescription, setNewItemDescription] = useState('');
  const { data: action, isLoading } = useAction(actionId || '');
  const addChecklistItem = useAddChecklistItem();
  const toggleChecklistItem = useToggleChecklistItem();
  const reorderChecklistItems = useReorderChecklistItems();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleAddChecklistItem = async () => {
    if (!actionId || !newItemDescription.trim() || !action) return;

    try {
      await addChecklistItem.mutateAsync({
        actionId,
        data: {
          description: newItemDescription,
          order: action.checklistItems?.length ?? 0,
        },
      });
      setNewItemDescription('');
      toast.success('Item adicionado ao checklist');
    } catch (error) {
      toast.error('Erro ao adicionar item');
    }
  };

  const handleToggleChecklistItem = async (itemId: string) => {
    if (!actionId) return;

    try {
      await toggleChecklistItem.mutateAsync({ actionId, itemId });
      toast.success('Item atualizado');
    } catch (error) {
      console.error('Erro ao atualizar checklist item:', error);
      toast.error(`Erro ao atualizar item: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id || !action?.checklistItems || !actionId) return;

    const oldIndex = action.checklistItems.findIndex((item) => item.id === active.id);
    const newIndex = action.checklistItems.findIndex((item) => item.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    // Reorder items locally
    const reorderedItems = arrayMove(action.checklistItems, oldIndex, newIndex);
    const itemIds = reorderedItems.map((item) => item.id);

    try {
      await reorderChecklistItems.mutateAsync({ actionId, itemIds });
      toast.success('Checklist reordenado');
    } catch (error) {
      console.error('Erro ao reordenar checklist:', error);
      toast.error('Erro ao reordenar checklist');
    }
  };

  if (isLoading) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="overflow-y-auto">
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  if (!action) {
    return null;
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col p-0 w-full sm:max-w-lg z-drawer">
        <div className="px-4 pt-4 pb-3 border-b">
          <SheetHeader>
            <SheetTitle className="text-base">Editar Ação</SheetTitle>
            <SheetDescription className="text-sm">{action.title}</SheetDescription>
          </SheetHeader>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {/* Form */}
          <ActionForm mode="edit" action={action} onSuccess={() => onOpenChange(false)} />

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
                        isDisabled={toggleChecklistItem.isPending}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}

            {/* Add new item */}
            <div className="flex gap-2">
              <Input
                placeholder="Adicionar novo item..."
                value={newItemDescription}
                onChange={(e) => setNewItemDescription(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddChecklistItem();
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
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
