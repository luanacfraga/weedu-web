'use client'

import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { ApiError } from '@/lib/api/api-client'
import type { Team } from '@/lib/api/endpoints/teams'
import { useExecutorsByCompany } from '@/lib/services/queries/use-employees'
import {
  useAddTeamMember,
  useAvailableExecutorsByTeam,
  useRemoveTeamMember,
  useTeamMembers,
} from '@/lib/services/queries/use-teams'
import { Loader2, Trash2, UserPlus, Users } from 'lucide-react'
import { useMemo, useState } from 'react'

interface ApiErrorData {
  message?: string
}

function isApiErrorData(data: unknown): data is ApiErrorData {
  return (
    typeof data === 'object' &&
    data !== null &&
    ('message' in data
      ? typeof (data as ApiErrorData).message === 'string' ||
        (data as ApiErrorData).message === undefined
      : true)
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

export function TeamMembersDialog({ open, onOpenChange, team, companyId }: TeamMembersDialogProps) {
  const [selectedExecutorId, setSelectedExecutorId] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const { data: members = [], isLoading: loadingMembers } = useTeamMembers(team.id)
  const { data: availableExecutorsResponse = [], isLoading: loadingAvailableExecutors } =
    useAvailableExecutorsByTeam(team.id)
  const { data: allExecutors = [] } = useExecutorsByCompany(companyId)
  const { mutateAsync: addMember, isPending: isAdding } = useAddTeamMember()
  const { mutateAsync: removeMember, isPending: isRemoving } = useRemoveTeamMember()

  // Se a API de available executors não retornar dados, use allExecutors filtrados
  const availableExecutors = useMemo(() => {
    if (availableExecutorsResponse.length > 0) {
      return availableExecutorsResponse
    }
    // Fallback: usa todos executores da empresa, filtrando quem já é membro
    const memberUserIds = new Set(members.map((m) => m.userId))
    return allExecutors.filter((executor) => !memberUserIds.has(executor.userId))
  }, [availableExecutorsResponse, allExecutors, members])

  const membersWithInfo = useMemo(() => {
    return members.map((member) => {
      const executor =
        availableExecutorsResponse.find((e) => e.userId === member.userId) ||
        allExecutors.find((e) => e.userId === member.userId)
      return {
        ...member,
        executor,
        displayName: executor?.user
          ? `${executor.user.firstName} ${executor.user.lastName}`
          : `Usuário ${member.userId.slice(0, 8)}...`,
        email: executor?.user?.email || 'Email não disponível',
      }
    })
  }, [members, availableExecutorsResponse, allExecutors])

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
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(getErrorMessage(err, 'Erro ao remover membro. Tente novamente.'))
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange} modal={false}>
      <SheetContent className="z-drawer flex w-full max-w-xl flex-col p-0 sm:max-w-xl">
        <div className="flex flex-col gap-4 border-b px-6 py-5">
          <SheetHeader className="gap-1.5">
            <SheetTitle className="text-base font-semibold">
              Gerenciar Membros - {team.name}
            </SheetTitle>
            <SheetDescription className="text-sm text-muted-foreground">
              Adicione ou remova executores desta equipe. Cada executor pode fazer parte de apenas
              uma equipe.
            </SheetDescription>
          </SheetHeader>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <label className="mb-2 block text-sm font-medium">Adicionar Executor</label>
                  <select
                    value={selectedExecutorId}
                    onChange={(e) => setSelectedExecutorId(e.target.value)}
                    disabled={isAdding || loadingAvailableExecutors}
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input/60 bg-background px-3.5 py-2.5 text-sm ring-offset-background transition-all duration-200 placeholder:text-muted-foreground/60 hover:border-primary/40 hover:bg-accent/20 focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:bg-muted/30 disabled:opacity-50"
                  >
                    <option value="">Selecione um executor</option>
                    {loadingAvailableExecutors ? (
                      <option disabled>Carregando executores...</option>
                    ) : availableExecutors.length === 0 ? (
                      <option disabled>
                        Nenhum executor disponível para adicionar a esta equipe
                      </option>
                    ) : (
                      availableExecutors.map((executor) => (
                        <option key={executor.id} value={executor.userId}>
                          {executor.user
                            ? `${executor.user.firstName} ${executor.user.lastName}${
                                executor.position ? ` - ${executor.position}` : ''
                              }`
                            : executor.userId}
                        </option>
                      ))
                    )}
                  </select>
                </div>
                <Button
                  onClick={handleAddMember}
                  disabled={!selectedExecutorId || isAdding || loadingAvailableExecutors}
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
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <Users className="h-4 w-4" />
                Membros da Equipe ({membersWithInfo.length})
              </h3>

              {loadingMembers ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : membersWithInfo.length === 0 ? (
                <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
                  Nenhum membro adicionado. Use o seletor acima para adicionar executores.
                </div>
              ) : (
                <div className="space-y-2">
                  {membersWithInfo.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
                    >
                      <div className="flex-1">
                        <div>
                          <p className="font-medium">{member.displayName}</p>
                          <p className="text-sm text-muted-foreground">{member.email}</p>
                          {member.executor?.position && (
                            <p className="mt-1 text-xs text-muted-foreground">
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
                        className="text-danger-base hover:bg-danger-lightest hover:text-danger-dark"
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
        </div>
      </SheetContent>
    </Sheet>
  )
}
