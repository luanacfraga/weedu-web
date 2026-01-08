'use client'

import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { PriorityBadge } from '@/components/ui/priority-badge'
import { StatusBadge } from '@/components/ui/status-badge'
import { useAction } from '@/lib/hooks/use-actions'
import { Loader2 } from 'lucide-react'

import { ActionChecklist } from './action-form/action-checklist'
import { ActionForm } from './action-form/action-form'

interface ActionDetailSheetProps {
  actionId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  canEdit?: boolean
}

export function ActionDetailSheet({
  actionId,
  open,
  onOpenChange,
  canEdit = true,
}: ActionDetailSheetProps) {
  const { data: action, isLoading } = useAction(actionId || '')
  const readOnly = !canEdit || action?.isBlocked || false

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
      <SheetContent className="z-drawer flex w-full flex-col p-0 sm:max-w-xl">
        <div className="flex flex-col gap-4 border-b px-6 py-6">
          <SheetHeader className="gap-2">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-lg font-semibold leading-none tracking-tight">
              {readOnly ? 'Detalhes da Ação' : 'Editar Ação'}
            </SheetTitle>
              <div className="flex items-center gap-2">
                <StatusBadge status={action.status} />
                <PriorityBadge priority={action.priority} showLabel={false} />
              </div>
            </div>
            <SheetDescription className="line-clamp-2 text-sm text-muted-foreground">
              {action.title}
            </SheetDescription>
          </SheetHeader>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="space-y-8">
            {/* Form */}
            <section>
              <h3 className="mb-4 text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Informações Gerais
              </h3>
              <ActionForm
                mode="edit"
                action={action}
                readOnly={readOnly}
                onCancel={() => onOpenChange(false)}
                onSuccess={() => onOpenChange(false)}
              />
            </section>

            <Separator />

            {/* Checklist Section */}
            <ActionChecklist action={action} readOnly={readOnly} />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
