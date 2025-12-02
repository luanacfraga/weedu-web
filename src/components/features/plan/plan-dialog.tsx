'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { Plan } from '@/lib/api/endpoints/plans'
import type { PlanFormData } from '@/lib/validators/plan'
import { PlanForm } from './plan-form'

interface PlanDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  plan?: Plan
  onSubmit: (data: PlanFormData) => Promise<void>
  isLoading?: boolean
}

export function PlanDialog({
  open,
  onOpenChange,
  plan,
  onSubmit,
  isLoading = false,
}: PlanDialogProps) {
  const handleSubmit = async (data: PlanFormData) => {
    await onSubmit(data)
    onOpenChange(false)
  }

  const handleCancel = () => {
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{plan ? 'Editar Plano' : 'Criar Novo Plano'}</DialogTitle>
          <DialogDescription>
            {plan
              ? 'Atualize as informações do plano abaixo.'
              : 'Preencha os dados abaixo para criar um novo plano.'}
          </DialogDescription>
        </DialogHeader>
        <PlanForm
          plan={plan}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  )
}
