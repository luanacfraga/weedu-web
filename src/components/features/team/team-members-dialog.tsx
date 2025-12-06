'use client'

import { useMemo, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, Trash2, UserPlus, Users } from 'lucide-react'
import { useTeamMembers, useAddTeamMember, useRemoveTeamMember } from '@/lib/services/queries/use-teams'
import { useExecutorsByCompany } from '@/lib/services/queries/use-employees'
import { ApiError } from '@/lib/api/api-client'
import { EmptyState } from '@/components/shared/feedback/empty-state'
import type { Team } from '@/lib/api/endpoints/teams'

interface ApiErrorData {
  message?: string
}

function isApiErrorData(data: unknown): data is ApiErrorData {
  return (
    typeof data === 'object' &&
    data !== null &&
    ('message' in data ? typeof (data as ApiErrorData).message === 'string' || (data as ApiErrorData).message === undefined : true)
  )
}

function getErrorMessage(error: unknown, defaultMessage: string): string {
  if (error instanceof ApiError && isApiErrorData(error.data)) {
    return error.data.message || defaultMessage
  }
  return defaultMessage
}

interface TeamMembersDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  team: Team
  companyId: string
}

export function TeamMembersDialog({
  open,
  onOpenChange,
  team,
  companyId,
}: TeamMembersDialogProps) {
  const [selectedExecutorId, setSelectedExecutorId] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const { data: members = [], isLoading: loadingMembers, refetch } = useTeamMembers(team.id)
  const { data: executors = [], isLoading: loadingExecutors } = useExecutorsByCompany(companyId)
  const { mutateAsync: addMember, isPending: isAdding } = useAddTeamMember()
  const { mutateAsync: removeMember, isPending: isRemoving } = useRemoveTeamMember()

  const membersWithInfo = useMemo(() => {
    return members.map((member) => {
      const executor = executors.find((e) => e.userId === member.userId)
      return {
        ...member,
        executor,
        displayName: executor?.user
          ? `${executor.user.firstName} ${executor.user.lastName}`
          : `Usuário ${member.userId.slice(0, 8)}...`,
        email: executor?.user?.email || 'Email não disponível',
      }
    })
  }, [members, executors])

  const availableExecutors = useMemo(() => {
    return executors.filter(
      (executor) =>
        executor.status === 'ACTIVE' &&
        !members.some((member) => member.userId === executor.userId)
    )
  }, [executors, members])

  const handleAddMember = async () => {
    if (!selectedExecutorId) return

    try {
      setError(null)
      setSuccess(null)
      await addMember({
        teamId: team.id,
        data: { userId: selectedExecutorId },
      })
      setSuccess('Membro adicionado com sucesso!')
      setSelectedExecutorId('')
      await refetch()
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(getErrorMessage(err, 'Erro ao adicionar membro. Tente novamente.'))
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    try {
      setError(null)
      setSuccess(null)
      await removeMember({
        teamId: team.id,
        memberId,
      })
      setSuccess('Membro removido com sucesso!')
      await refetch()
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(getErrorMessage(err, 'Erro ao remover membro. Tente novamente.'))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gerenciar Membros - {team.name}</DialogTitle>
          <DialogDescription>
            Adicione ou remova executores desta equipe. Cada executor pode fazer parte de apenas uma equipe.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">
                  Adicionar Executor
                </label>
                <Select
                  value={selectedExecutorId || undefined}
                  onValueChange={setSelectedExecutorId}
                  disabled={isAdding || loadingExecutors}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um executor" />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingExecutors ? (
                      <div className="px-2 py-1.5 text-sm text-muted-foreground">
                        Carregando executores...
                      </div>
                    ) : availableExecutors.length === 0 ? (
                      <div className="px-2 py-1.5 text-sm text-muted-foreground">
                        {executors.length === 0
                          ? 'Nenhum executor cadastrado na empresa'
                          : members.length === 0
                            ? 'Todos os executores já estão em outras equipes'
                            : 'Todos os executores disponíveis já estão na equipe'}
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
                onClick={handleAddMember}
                disabled={!selectedExecutorId || isAdding || loadingExecutors}
                className="gap-2"
              >
                {isAdding ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Adicionando...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" />
                    Adicionar
                  </>
                )}
              </Button>
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-danger-light bg-danger-lightest p-4">
              <p className="text-sm text-danger-base">{error}</p>
            </div>
          )}

          {success && (
            <div className="rounded-lg border border-success-light bg-success-lightest p-4">
              <p className="text-sm text-success-base">{success}</p>
            </div>
          )}

          <div className="space-y-2">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Users className="h-4 w-4" />
              Membros da Equipe ({membersWithInfo.length})
            </h3>

            {loadingMembers ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : membersWithInfo.length === 0 ? (
              <EmptyState
                icon={Users}
                title="Nenhum membro adicionado"
                description="Adicione executores para começar a trabalhar com esta equipe."
              />
            ) : (
              <div className="space-y-2">
                {membersWithInfo.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div>
                        <p className="font-medium">{member.displayName}</p>
                        <p className="text-sm text-muted-foreground">
                          {member.email}
                        </p>
                        {member.executor?.position && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {member.executor.position}
                          </p>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveMember(member.id)}
                      disabled={isRemoving}
                      className="text-danger-base hover:text-danger-dark hover:bg-danger-lightest"
                      title="Remover membro"
                    >
                      {isRemoving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

