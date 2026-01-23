'use client'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { UserAvatar } from '@/components/ui/user-avatar'
import { useRemoveEmployeeWithTransfer } from '@/lib/services/queries/use-employees'
import type { Employee } from '@/lib/types/api'
import { getApiErrorMessage } from '@/lib/utils/error-handling'
import { AlertCircle, ArrowRight, Loader2, UserMinus } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

interface RemoveEmployeeWithTransferModalProps {
  employee: Employee
  availableEmployees: Employee[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function RemoveEmployeeWithTransferModal({
  employee,
  availableEmployees,
  open,
  onOpenChange,
  onSuccess,
}: RemoveEmployeeWithTransferModalProps) {
  const [newResponsibleId, setNewResponsibleId] = useState<string>('')
  const [showConfirmation, setShowConfirmation] = useState(false)

  const removeWithTransfer = useRemoveEmployeeWithTransfer()

  const handleRemove = async () => {
    if (!newResponsibleId) {
      toast.error('Selecione o novo responsável pelas ações')
      return
    }

    try {
      const result = await removeWithTransfer.mutateAsync({
        employeeId: employee.id,
        newResponsibleId,
      })

      toast.success(result.message, {
        description: `${result.summary.actionsTransferred} ação(ões) transferida(s) para ${result.summary.newResponsible.name}`,
      })

      onSuccess?.()
      onOpenChange(false)
      setNewResponsibleId('')
      setShowConfirmation(false)
    } catch (error) {
      toast.error('Erro ao remover colaborador', {
        description: getApiErrorMessage(error, 'Não foi possível remover o colaborador'),
      })
    }
  }

  const selectedEmployee = availableEmployees.find((e) => e.userId === newResponsibleId)

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setNewResponsibleId('')
      setShowConfirmation(false)
    }
    onOpenChange(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[540px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserMinus className="h-5 w-5 text-destructive" />
            Remover Funcionário
          </DialogTitle>
          <DialogDescription>
            Ao remover <strong>{employee.user?.firstName} {employee.user?.lastName}</strong>, todas as ações pendentes e em andamento serão transferidas para outro membro da equipe.
          </DialogDescription>
        </DialogHeader>

        {!showConfirmation ? (
          <div className="space-y-4 py-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Ações concluídas permanecerão vinculadas a{' '}
                <strong>
                  {employee.user?.firstName} {employee.user?.lastName}
                </strong>{' '}
                para manter o histórico.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <label htmlFor="new-responsible" className="text-sm font-medium leading-none">
                Novo responsável pelas ações
              </label>
              <Select value={newResponsibleId} onValueChange={setNewResponsibleId}>
                <SelectTrigger id="new-responsible">
                  <SelectValue placeholder="Selecione um colaborador" />
                </SelectTrigger>
                <SelectContent>
                  {availableEmployees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.userId}>
                      {emp.user?.firstName} {emp.user?.lastName} ({emp.position || emp.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {newResponsibleId && selectedEmployee && (
              <div className="rounded-lg border bg-muted/50 p-4">
                <p className="mb-3 text-xs font-medium text-muted-foreground">
                  Prévia da transferência
                </p>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <UserAvatar
                      id={employee.user?.id}
                      firstName={employee.user?.firstName}
                      lastName={employee.user?.lastName}
                      initials={employee.user?.initials}
                      size="md"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {employee.user?.firstName} {employee.user?.lastName}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">{employee.position || employee.role}</p>
                    </div>
                  </div>

                  <ArrowRight className="h-5 w-5 flex-shrink-0 text-muted-foreground" />

                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <UserAvatar
                      id={selectedEmployee.user?.id}
                      firstName={selectedEmployee.user?.firstName}
                      lastName={selectedEmployee.user?.lastName}
                      initials={selectedEmployee.user?.initials}
                      size="md"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {selectedEmployee.user?.firstName} {selectedEmployee.user?.lastName}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {selectedEmployee.position || selectedEmployee.role}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="py-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <p className="mb-3 font-semibold">Confirme a remoção:</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 flex h-1.5 w-1.5 flex-shrink-0 rounded-full bg-current" />
                    <span>
                      Colaborador será removido: <strong>{employee.user?.firstName} {employee.user?.lastName}</strong>
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 flex h-1.5 w-1.5 flex-shrink-0 rounded-full bg-current" />
                    <span>
                      Ações pendentes transferidas para: <strong>{selectedEmployee?.user?.firstName} {selectedEmployee?.user?.lastName}</strong>
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 flex h-1.5 w-1.5 flex-shrink-0 rounded-full bg-current" />
                    <span>Colaborador será removido de todos os times</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 flex h-1.5 w-1.5 flex-shrink-0 rounded-full bg-current" />
                    <span className="font-semibold">Esta ação não pode ser desfeita</span>
                  </li>
                </ul>
              </AlertDescription>
            </Alert>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={removeWithTransfer.isPending}
          >
            Cancelar
          </Button>
          {!showConfirmation ? (
            <Button
              type="button"
              variant="destructive"
              onClick={() => setShowConfirmation(true)}
              disabled={!newResponsibleId}
            >
              Continuar
            </Button>
          ) : (
            <Button
              type="button"
              variant="destructive"
              onClick={handleRemove}
              disabled={removeWithTransfer.isPending}
            >
              {removeWithTransfer.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirmar Remoção
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
