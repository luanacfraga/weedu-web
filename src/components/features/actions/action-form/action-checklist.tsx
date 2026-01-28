'use client'

import type { Action } from '@/lib/types/action'

interface ActionChecklistProps {
  action: Action
  readOnly: boolean
}

export function ActionChecklist({ action }: ActionChecklistProps) {
  const completedCount = action.checklistItems?.filter((i) => i.isCompleted).length || 0
  const totalCount = action.checklistItems?.length || 0

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium leading-none text-foreground">Como/Etapas</h3>
        <span className="text-xs text-muted-foreground">
          {completedCount} / {totalCount}
        </span>
      </div>

      {action.checklistItems && action.checklistItems.length > 0 ? (
        <ul className="space-y-1.5">
          {action.checklistItems.map((item) => (
            <li
              key={item.id}
              className="flex items-center gap-2 rounded-md bg-muted/40 px-3 py-1.5 text-xs"
            >
              <span
                className={
                  item.isCompleted
                    ? 'text-muted-foreground line-through decoration-muted-foreground/60'
                    : 'text-foreground'
                }
              >
                {item.description}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-md bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
          Nenhum item no checklist cadastrado para esta ação.
        </p>
      )}
    </section>
  )
}
