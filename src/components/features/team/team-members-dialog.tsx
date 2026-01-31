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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { UserAvatar } from '@/components/ui/user-avatar'
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

  const availableExecutors = useMemo(() => {
    if (availableExecutorsResponse.length > 0) {
      return availableExecutorsResponse
    }
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
        position: executor?.position,
        initials: executor?.user?.initials ?? null,
        avatarColor: executor?.user?.avatarColor ?? null,
        firstName: executor?.user?.firstName,
        lastName: executor?.user?.lastName,
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
                <div className="flex-1 space-y-2">
                  <label className="block text-sm font-medium">Adicionar Executor</label>
                  <Select
                    value={selectedExecutorId}
                    onValueChange={setSelectedExecutorId}
                    disabled={isAdding || loadingAvailableExecutors}
                  >
                    <SelectTrigger className="h-10 text-sm">
                      {selectedExecutorId ? (
                        (() => {
                          const selected = availableExecutors.find(
                            (e) => e.userId === selectedExecutorId
                          )
                          return selected?.user ? (
                            <div className="flex items-center gap-2">
                              <UserAvatar
                                firstName={selected.user.firstName}
                                lastName={selected.user.lastName}
                                initials={selected.user.initials ?? null}
                                avatarColor={selected.user.avatarColor ?? null}
                                size="sm"
                                className="h-5 w-5 text-[9px]"
                              />
                              <span>
                                {selected.user.firstName} {selected.user.lastName}
                                {selected.position ? ` - ${selected.position}` : ''}
                              </span>
                            </div>
                          ) : (
                            <SelectValue placeholder="Selecione um executor" />
                          )
                        })()
                      ) : (
                        <SelectValue placeholder="Selecione um executor" />
                      )}
                    </SelectTrigger>
                    <SelectContent>
                      {loadingAvailableExecutors ? (
                        <div className="px-2 py-1.5 text-sm text-muted-foreground">
                          Carregando executores...
                        </div>
                      ) : availableExecutors.length === 0 ? (
                        <div className="px-2 py-1.5 text-sm text-muted-foreground">
                          Nenhum executor disponível para adicionar a esta equipe
                        </div>
                      ) : (
                        availableExecutors.map((executor) => (
                          <SelectItem key={executor.id} value={executor.userId} className="text-sm">
                            <div className="flex items-center gap-2">
                              <UserAvatar
                                firstName={executor.user?.firstName}
                                lastName={executor.user?.lastName}
                                initials={executor.user?.initials ?? null}
                                avatarColor={executor.user?.avatarColor ?? null}
                                size="sm"
                                className="h-5 w-5 text-[9px]"
                              />
                              <span>
                                {executor.user
                                  ? `${executor.user.firstName} ${executor.user.lastName}${
                                      executor.position ? ` - ${executor.position}` : ''
                                    }`
                                  : executor.userId}
                              </span>
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
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
                      className="flex items-center justify-between gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
                    >
                      <div className="flex min-w-0 flex-1 items-center gap-3">
                        <UserAvatar
                          firstName={member.firstName}
                          lastName={member.lastName}
                          initials={member.initials ?? null}
                          avatarColor={member.avatarColor ?? null}
                          size="sm"
                          className="h-8 w-8 text-xs"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium">{member.displayName}</p>
                          <p className="text-sm text-muted-foreground">{member.email}</p>
                          {member.position && (
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {member.position}
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
