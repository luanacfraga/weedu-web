import { ActionPriority } from '@/lib/types/action'

type PriorityUI = {
  label: string
  flagClass: string
  itemActiveClass: string
  pillClass: string
}

export const actionPriorityUI: Record<ActionPriority, PriorityUI> = {
  [ActionPriority.LOW]: {
    label: 'Baixa',
    flagClass: 'text-muted-foreground',
    itemActiveClass: 'bg-muted/60 text-foreground',
    pillClass: 'bg-muted/50 text-muted-foreground border-muted hover:bg-muted/80',
  },
  [ActionPriority.MEDIUM]: {
    label: 'Média',
    flagClass: 'text-warning',
    itemActiveClass: 'bg-warning/15 text-warning',
    pillClass: 'bg-warning/10 text-warning border-warning/20 hover:bg-warning/20',
  },
  [ActionPriority.HIGH]: {
    label: 'Alta',
    flagClass: 'text-primary',
    itemActiveClass: 'bg-primary/15 text-primary',
    pillClass: 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/20',
  },
  [ActionPriority.URGENT]: {
    label: 'Urgente',
    flagClass: 'text-destructive',
    itemActiveClass: 'bg-destructive/12 text-destructive',
    pillClass: 'bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20',
  },
}

export function getActionPriorityUI(priority: ActionPriority): PriorityUI {
  return actionPriorityUI[priority]
}


