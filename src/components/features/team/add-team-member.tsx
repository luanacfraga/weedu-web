'use client'

import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, UserPlus } from 'lucide-react'
import { useState } from 'react'
import { ApiError } from '@/lib/api/api-client'
import { toast } from 'sonner'

export interface AvailableExecutor {
  id: string
  userId: string
  user?: {
    firstName: string
    lastName: string
  }
  position?: string | null
}

interface AddTeamMemberProps {
  availableExecutors: AvailableExecutor[]
  isLoading: boolean
  isAdding: boolean
  onAdd: (userId: string) => Promise<void>
}

export function AddTeamMember({
  availableExecutors,
  isLoading,
  isAdding,
  onAdd,
}: AddTeamMemberProps) {
  const [selectedExecutorId, setSelectedExecutorId] = useState<string>('')

  const handleAdd = async () => {
    if (!selectedExecutorId) return

    try {
      await onAdd(selectedExecutorId)
      setSelectedExecutorId('')
      toast.success('Membro adicionado com sucesso!')
    } catch (err) {
      const message =
        err instanceof ApiError && (err.data as any)?.message
          ? (err.data as any).message
          : 'Erro ao adicionar membro. Tente novamente.'
      toast.error(message)
    }
  }

  return (
    <div className="flex items-end gap-3 rounded-lg border bg-muted/20 p-4">
      <div className="flex-1 space-y-2">
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Adicionar Executor
        </label>
        <Select
          value={selectedExecutorId}
          onValueChange={setSelectedExecutorId}
          disabled={isAdding || isLoading}
        >
          <SelectTrigger className="h-10 bg-background">
            <SelectValue placeholder="Selecione um executor para adicionar" />
          </SelectTrigger>
          <SelectContent>
            {isLoading ? (
              <div className="px-2 py-1.5 text-sm text-muted-foreground">
                Carregando executores...
              </div>
            ) : availableExecutors.length === 0 ? (
              <div className="px-2 py-1.5 text-sm text-muted-foreground">
                Nenhum executor disponível
              </div>
            ) : (
              availableExecutors.map((executor) => (
                <SelectItem key={executor.id} value={executor.userId}>
                  {executor.user
                    ? `${executor.user.firstName} ${executor.user.lastName}${
                        executor.position ? ` - ${executor.position}` : ''
                      }`
                    : executor.userId}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>
      <Button
        onClick={handleAdd}
        disabled={!selectedExecutorId || isAdding || isLoading}
        className="h-10 px-4"
      >
        {isAdding ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Adicionando...
          </>
        ) : (
          <>
            <UserPlus className="mr-2 h-4 w-4" />
            Adicionar
          </>
        )}
      </Button>
    </div>
  )
}

