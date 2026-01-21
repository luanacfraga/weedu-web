'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { UpsertChecklistItemInput } from '@/lib/types/action'
import { cn } from '@/lib/utils'
import { useState } from 'react'

interface ActionFormChecklistProps {
  items: UpsertChecklistItemInput[]
  onItemsChange: (items: UpsertChecklistItemInput[]) => void
  readOnly: boolean
}

export function ActionFormChecklist({ items, onItemsChange, readOnly }: ActionFormChecklistProps) {
  const [newDescription, setNewDescription] = useState('')

  const handleAdd = () => {
    if (readOnly || !newDescription.trim()) return
    const next: UpsertChecklistItemInput = {
      description: newDescription.trim(),
      isCompleted: false,
      order: items.length,
    }
    onItemsChange([...items, next])
    setNewDescription('')
  }

  const handleToggle = (index: number) => {
    if (readOnly) return
    const next = items.map((item, i) =>
      i === index
        ? {
            ...item,
            isCompleted: !item.isCompleted,
          }
        : item
    )
    onItemsChange(next)
  }

  const handleRemove = (index: number) => {
    if (readOnly) return
    const next = items.filter((_, i) => i !== index)
    onItemsChange(next)
  }

  const completed = items.filter((i) => i.isCompleted).length

  return (
    <div className="mt-6 space-y-3 rounded-lg border border-dashed border-border/60 bg-muted/20 p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium">Como/Etapas</span>
        <span className="text-xs text-muted-foreground">
          {completed} / {items.length}
        </span>
      </div>

      {items.length > 0 ? (
        <div className="space-y-2">
          {items.map((item, index) => (
            <div
              key={`${index}-${item.description}`}
              className="flex items-center gap-2 rounded-md bg-background/60 px-3 py-2 text-xs"
            >
              <input
                type="checkbox"
                className="h-3 w-3 accent-primary"
                checked={!!item.isCompleted}
                onChange={() => handleToggle(index)}
                disabled={readOnly}
              />
              <span
                className={cn(
                  'flex-1 truncate',
                  item.isCompleted && 'text-muted-foreground line-through'
                )}
              >
                {item.description}
              </span>
              {!readOnly && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-muted-foreground hover:text-destructive"
                  onClick={() => handleRemove(index)}
                >
                  ✕
                </Button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="rounded-md bg-background/40 px-3 py-2 text-xs text-muted-foreground">
          Nenhum item no checklist ainda. Você pode adicionar itens abaixo para acompanhar o
          progresso da ação.
        </p>
      )}

      {!readOnly && (
        <div className="flex gap-2 pt-1">
          <Input
            placeholder="Adicionar item ao checklist..."
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleAdd()
              }
            }}
            className="h-8 text-xs"
          />
          <Button
            type="button"
            size="sm"
            className="h-8 px-3 text-xs"
            disabled={!newDescription.trim()}
            onClick={handleAdd}
          >
            Adicionar
          </Button>
        </div>
      )}
    </div>
  )
}
