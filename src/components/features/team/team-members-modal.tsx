'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import type { Team } from '@/lib/api/endpoints/teams'
import { useExecutorsByCompany } from '@/lib/services/queries/use-employees'
import {
  useAddTeamMember,
  useAvailableExecutorsByTeam,
  useRemoveTeamMember,
  useTeamMembers,
} from '@/lib/services/queries/use-teams'
import { getApiErrorMessage } from '@/lib/utils/error-handling'
import { AlertCircle, Loader2, Trash2, UserPlus, Users } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { UserAvatar } from '@/components/ui/user-avatar'

interface TeamMembersModalProps {
  team: Team
  companyId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function TeamMembersModal({
  team,
  companyId,
  open,
  onOpenChange,
  onSuccess,
}: TeamMembersModalProps) {
  const [selectedExecutorId, setSelectedExecutorId] = useState<string>('')
  const [error, setError] = useState<string | null>(null)

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
      await addMember({
        teamId: team.id,
        data: { userId: selectedExecutorId },
      })
      toast.success('Membro adicionado com sucesso')
      setSelectedExecutorId('')
      onSuccess?.()
    } catch (err) {
      const message = getApiErrorMessage(err, 'Erro ao adicionar membro')
      setError(message)
      toast.error(message)
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    try {
      setError(null)
      await removeMember({
        teamId: team.id,
        memberId,
      })
      toast.success('Membro removido com sucesso')
      onSuccess?.()
    } catch (err) {
      const message = getApiErrorMessage(err, 'Erro ao remover membro')
      setError(message)
      toast.error(message)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] flex-col gap-0 p-0 sm:max-w-[600px]">
        <DialogHeader className="border-b px-6 pb-4 pt-6">
          <DialogTitle>Membros da Equipe</DialogTitle>
          <DialogDescription>
            Gerencie os membros de <span className="font-medium text-foreground">{team.name}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {error && (
            <div className="mb-4 animate-fade-in rounded-lg border border-danger-light bg-danger-lightest p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 flex-shrink-0 text-danger-base" />
                <div className="flex-1">
                  <h3 className="font-semibold text-danger-dark">Erro</h3>
                  <p className="mt-1 text-sm text-danger-base">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Adicionar Executor</label>
              <div className="flex gap-2">
                <Select
                  value={selectedExecutorId}
                  onValueChange={setSelectedExecutorId}
                  disabled={isAdding || loadingAvailableExecutors}
                >
                  <SelectTrigger className="h-9 flex-1 text-sm">
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
                        Nenhum executor disponível
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
                <Button
                  onClick={handleAddMember}
                  disabled={!selectedExecutorId || isAdding || loadingAvailableExecutors}
                  size="sm"
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

            <div className="space-y-2">
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <Users className="h-4 w-4" />
                Membros ({membersWithInfo.length})
              </h3>

              {loadingMembers ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : membersWithInfo.length === 0 ? (
                <div className="flex items-center justify-center rounded-lg border border-dashed p-8 text-sm text-muted-foreground">
                  Nenhum membro adicionado
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
                          <p className="font-medium text-sm">{member.displayName}</p>
                          <p className="text-xs text-muted-foreground">{member.email}</p>
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
                        className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
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

        <div className="flex justify-end gap-2 border-t bg-background px-6 py-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isAdding || isRemoving}
            size="sm"
          >
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

