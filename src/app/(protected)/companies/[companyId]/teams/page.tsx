'use client'

import { AddTeamMember, AvailableExecutor } from '@/components/features/team/add-team-member'
import { EditTeamModal } from '@/components/features/team/edit-team-modal'
import { TeamForm } from '@/components/features/team/team-form'
import { TeamMember, TeamMembersList } from '@/components/features/team/team-members-list'
import { TeamMembersModal } from '@/components/features/team/team-members-modal'
import { EmptyState } from '@/components/shared/feedback/empty-state'
import { ErrorState } from '@/components/shared/feedback/error-state'
import { LoadingScreen } from '@/components/shared/feedback/loading-screen'
import { PageContainer } from '@/components/shared/layout/page-container'
import { PageHeader } from '@/components/shared/layout/page-header'
import { ResponsiveDataTable } from '@/components/shared/table/responsive-data-table'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ApiError } from '@/lib/api/api-client'
import type { Team } from '@/lib/api/endpoints/teams'
import { useUserContext } from '@/lib/contexts/user-context'
import { useExecutorsByCompany, useManagersByCompany } from '@/lib/services/queries/use-employees'
import {
  useAddTeamMember,
  useAvailableExecutorsByTeam,
  useCreateTeam,
  useRemoveTeamMember,
  useTeamMembers,
  useTeamsByCompany,
  useUpdateTeam,
} from '@/lib/services/queries/use-teams'
import { type TeamFormData } from '@/lib/validators/team'
import type { ColumnDef } from '@tanstack/react-table'
import { AlertCircle, CheckCircle2, Edit, Plus, Users } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useCallback, useMemo, useState } from 'react'
import { TeamCard } from './team-card'

export default function TeamsPage() {
  const params = useParams()
  const router = useRouter()
  const companyId = params.companyId as string
  const { user } = useUserContext()
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingTeam, setEditingTeam] = useState<Team | null>(null)
  const [teamToEdit, setTeamToEdit] = useState<Team | null>(null)
  const [teamToViewMembers, setTeamToViewMembers] = useState<Team | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const isManager = user?.globalRole === 'manager'

  const {
    data: teamsResponse,
    isLoading: loadingTeams,
    error: teamsError,
    refetch,
  } = useTeamsByCompany(companyId)

  const { data: managers = [], isLoading: loadingManagers } = useManagersByCompany(companyId)

  const { mutateAsync: createTeam, isPending: isCreating } = useCreateTeam()
  const { mutateAsync: updateTeam, isPending: isUpdating } = useUpdateTeam()

  const currentEditingTeamId = editingTeam?.id ?? ''
  const { data: editingMembers = [], isLoading: loadingEditingMembers } =
    useTeamMembers(currentEditingTeamId)
  const { data: availableExecutorsResponse = [], isLoading: loadingAvailableExecutors } =
    useAvailableExecutorsByTeam(currentEditingTeamId)
  const { data: allExecutors = [] } = useExecutorsByCompany(companyId)
  const { mutateAsync: addMember, isPending: isAddingMember } = useAddTeamMember()
  const { mutateAsync: removeMember, isPending: isRemovingMember } = useRemoveTeamMember()

  const allTeams = useMemo(() => teamsResponse?.data || [], [teamsResponse?.data])
  const company = user?.companies.find((c) => c.id === companyId)

  const managersByUserId = useMemo(() => {
    const map = new Map<string, (typeof managers)[number]>()
    managers.forEach((m) => {
      map.set(m.userId, m)
    })
    return map
  }, [managers])

  const getManagerLabel = useCallback(
    (team: Team) => {
      const manager = managersByUserId.get(team.managerId)
      if (manager?.user) {
        return `${manager.user.firstName} ${manager.user.lastName}`
      }
      return 'Gestor não encontrado'
    },
    [managersByUserId]
  )

  const teams = useMemo(() => {
    if (isManager) {
      return allTeams.filter((team) => team.managerId === user?.id)
    }
    return allTeams
  }, [allTeams, isManager, user?.id])

  const inlineAvailableExecutors = useMemo<AvailableExecutor[]>(() => {
    if (availableExecutorsResponse.length > 0) {
      return availableExecutorsResponse
    }
    const memberUserIds = new Set(editingMembers.map((m) => m.userId))
    return allExecutors
      .filter((executor) => !memberUserIds.has(executor.userId))
      .map((e) => ({
        id: e.id,
        userId: e.userId,
        user: e.user,
        position: e.position,
      }))
  }, [availableExecutorsResponse, allExecutors, editingMembers])

  const inlineMembersWithInfo = useMemo<TeamMember[]>(() => {
    return editingMembers.map((member) => {
      const executor =
        availableExecutorsResponse.find((e) => e.userId === member.userId) ||
        allExecutors.find((e) => e.userId === member.userId)
      return {
        id: member.id,
        userId: member.userId,
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
  }, [editingMembers, availableExecutorsResponse, allExecutors])

  const columns = useMemo<ColumnDef<Team>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Nome',
      },
      {
        id: 'manager',
        header: 'Gestor',
        cell: ({ row }) => {
          const team = row.original
          return <span className="text-sm text-muted-foreground">{getManagerLabel(team)}</span>
        },
      },
      {
        accessorKey: 'description',
        header: 'Descrição',
        cell: ({ row }) => {
          const description = row.getValue('description') as string | null | undefined
          return description ? (
            <span className="line-clamp-1 text-sm text-muted-foreground">{description}</span>
          ) : (
            <span className="text-sm text-muted-foreground">-</span>
          )
        },
      },
      {
        id: 'actions',
        header: () => <span className="sr-only">Ações</span>,
        cell: ({ row }) => {
          const team = row.original
          return (
            <div className="flex justify-end gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTeamToViewMembers(team)}
                className="h-8 gap-1 px-3"
              >
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Membros</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTeamToEdit(team)}
                className="h-8 gap-1 px-3"
              >
                <Edit className="h-4 w-4" />
                <span className="hidden sm:inline">Editar</span>
              </Button>
            </div>
          )
        },
      },
    ],
    [getManagerLabel]
  )

  const getErrorMessage = (err: unknown, defaultMessage: string): string => {
    if (err instanceof ApiError) {
      const errorData = err.data as { message?: string }
      return errorData?.message || defaultMessage
    }
    return defaultMessage
  }

  const availableManagers = useMemo(() => {
    if (!managers.length || !allTeams.length) return managers

    const managerIdsInTeams = allTeams
      .filter(
        (team) =>
          (!editingTeam || team.id !== editingTeam.id) && (!teamToEdit || team.id !== teamToEdit.id)
      )
      .map((team) => team.managerId)

    return managers.filter(
      (manager) =>
        !managerIdsInTeams.includes(manager.userId) ||
        (editingTeam && manager.userId === editingTeam.managerId) ||
        (teamToEdit && manager.userId === teamToEdit.managerId)
    )
  }, [managers, allTeams, editingTeam, teamToEdit])

  const handleCreateTeam = async (data: TeamFormData) => {
    try {
      setError(null)

      const unifiedContext = data.iaContext?.trim() || undefined

      await createTeam({
        name: data.name,
        companyId: data.companyId,
        managerId: data.managerId,
        description: unifiedContext,
        iaContext: unifiedContext,
      })

      setSuccess(true)
      setShowCreateForm(false)
      setTimeout(() => {
        setSuccess(false)
      }, 3000)
    } catch (err) {
      setError(getErrorMessage(err, 'Erro ao criar equipe. Tente novamente.'))
    }
  }

  const handleUpdateTeam = async (data: TeamFormData) => {
    if (!editingTeam) return

    try {
      setError(null)

      const unifiedContext = data.iaContext?.trim() || undefined

      await updateTeam({
        id: editingTeam.id,
        data: {
          name: data.name,
          managerId: data.managerId,
          description: unifiedContext,
          iaContext: unifiedContext,
        },
      })

      setSuccess(true)
      setEditingTeam(null)
      setTimeout(() => {
        setSuccess(false)
      }, 3000)
    } catch (err) {
      setError(getErrorMessage(err, 'Erro ao atualizar equipe. Tente novamente.'))
    }
  }

  if (loadingTeams || loadingManagers) {
    return (
      <PageContainer maxWidth="7xl">
        <LoadingScreen message="Carregando equipes..." />
      </PageContainer>
    )
  }

  const isEditingFlow = showCreateForm || !!editingTeam
  const handleBackFromForm = () => {
    setShowCreateForm(false)
    setEditingTeam(null)
    setError(null)
  }

  return (
    <PageContainer maxWidth="7xl">
      <PageHeader
        title={
          isEditingFlow
            ? editingTeam
              ? 'Editar Equipe'
              : 'Nova Equipe'
            : isManager
              ? 'Minhas Equipes'
              : 'Equipes'
        }
        description={
          isEditingFlow
            ? editingTeam
              ? `Atualize as informações da equipe${company ? ` em ${company.name}` : ''}`
              : `Crie uma nova equipe${company ? ` em ${company.name}` : ''}`
            : isManager
              ? `Gerencie suas equipes${company ? ` em ${company.name}` : ''}`
              : `Gerencie as equipes${company ? ` de ${company.name}` : ''}`
        }
        backOnClick={isEditingFlow ? handleBackFromForm : undefined}
        action={
          !isEditingFlow &&
          !isManager && (
            <Button
              onClick={() => setShowCreateForm(true)}
              className="gap-1.5 font-medium sm:gap-2"
            >
              <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>Nova Equipe</span>
            </Button>
          )
        }
      />

      {error && (
        <div className="mb-6 animate-fade-in rounded-lg border border-danger-light bg-danger-lightest p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-danger-base" />
            <div className="flex-1">
              <h3 className="font-semibold text-danger-dark">
                {editingTeam ? 'Erro ao atualizar equipe' : 'Erro ao criar equipe'}
              </h3>
              <p className="mt-1 text-sm text-danger-base">{error}</p>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-6 animate-fade-in rounded-lg border border-success-light bg-success-lightest p-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-success-base" />
            <div className="flex-1">
              <h3 className="font-semibold text-success-dark">
                {editingTeam ? 'Equipe atualizada com sucesso!' : 'Equipe criada com sucesso!'}
              </h3>
              <p className="mt-1 text-sm text-success-base">
                {editingTeam
                  ? 'A equipe foi atualizada com sucesso.'
                  : 'A equipe foi criada e já está disponível para gerenciamento.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {showCreateForm || editingTeam ? (
        <div className="space-y-6">
          {availableManagers.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Nenhum gestor disponível</CardTitle>
                <CardDescription>
                  {editingTeam
                    ? 'Não há gestores disponíveis para substituir o gestor atual. Todos os gestores já estão gerenciando outras equipes.'
                    : 'É necessário ter pelo menos um gestor ativo na empresa para criar uma equipe.'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => router.push(`/companies/${companyId}/members`)}
                  variant="outline"
                >
                  Gerenciar Funcionários
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <TeamForm
                companyId={companyId}
                managers={availableManagers}
                currentUserId={user?.id}
                currentUserRole={user?.globalRole}
                onSubmit={editingTeam ? handleUpdateTeam : handleCreateTeam}
                onCancel={() => {
                  setShowCreateForm(false)
                  setEditingTeam(null)
                  setError(null)
                }}
                isLoading={editingTeam ? isUpdating : isCreating}
                isEditing={!!editingTeam}
                defaultValues={
                  editingTeam
                    ? {
                        name: editingTeam.name,
                        managerId: editingTeam.managerId,
                        iaContext: editingTeam.iaContext || editingTeam.description || '',
                      }
                    : undefined
                }
              />

              {editingTeam && (
                <Card className="mt-6 border-border/50">
                  <CardHeader>
                    <CardTitle>Gerenciar Membros da Equipe</CardTitle>
                    <CardDescription>
                      Adicione ou remova executores desta equipe diretamente durante a edição.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <AddTeamMember
                      availableExecutors={inlineAvailableExecutors}
                      isLoading={loadingAvailableExecutors}
                      isAdding={isAddingMember}
                      onAdd={async (userId) => {
                        await addMember({
                          teamId: editingTeam.id,
                          data: { userId },
                        })
                      }}
                    />

                    <div className="space-y-2">
                      <h3 className="flex items-center gap-2 text-sm font-semibold">
                        <Users className="h-4 w-4" />
                        Membros da Equipe ({inlineMembersWithInfo.length})
                      </h3>

                      <TeamMembersList
                        members={inlineMembersWithInfo}
                        isLoading={loadingEditingMembers}
                        isRemoving={isRemovingMember}
                        onRemove={async (memberId) => {
                          await removeMember({
                            teamId: editingTeam.id,
                            memberId,
                          })
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      ) : (
        <>
          {teamsError && (
            <div className="mb-6">
              <ErrorState message="Erro ao carregar equipes" onRetry={() => refetch()} />
            </div>
          )}

          {!teamsError && teams.length === 0 && (
            <EmptyState
              icon={Users}
              title={isManager ? 'Nenhuma equipe criada' : 'Nenhuma equipe cadastrada'}
              description={
                isManager
                  ? 'Você ainda não criou nenhuma equipe. Crie sua primeira equipe para começar a gerenciar executores.'
                  : 'Você ainda não possui equipes cadastradas. Crie sua primeira equipe para gerenciar.'
              }
              action={{
                label: 'Criar Primeira Equipe',
                onClick: () => setShowCreateForm(true),
              }}
            />
          )}

          {!teamsError && teams.length > 0 && (
            <ResponsiveDataTable
              data={teams}
              columns={columns}
              CardComponent={(props) => (
                <TeamCard
                  {...props}
                  managerName={getManagerLabel(props.item)}
                  onViewMembers={(team) => setTeamToViewMembers(team)}
                  onEditTeam={(team) => setTeamToEdit(team)}
                  onEdit={(team) => {
                    setEditingTeam(team)
                    setError(null)
                  }}
                />
              )}
              isLoading={false}
              emptyMessage="Nenhuma equipe encontrada"
              getRowId={(team) => team.id}
            />
          )}
        </>
      )}

      {teamToViewMembers && (
        <TeamMembersModal
          team={teamToViewMembers}
          companyId={companyId}
          open={!!teamToViewMembers}
          onOpenChange={(open) => {
            if (!open) setTeamToViewMembers(null)
          }}
          onSuccess={() => {
            refetch()
          }}
        />
      )}

      {teamToEdit && (
        <EditTeamModal
          team={teamToEdit}
          companyId={companyId}
          managers={availableManagers}
          open={!!teamToEdit}
          onOpenChange={(open) => {
            if (!open) setTeamToEdit(null)
          }}
          onSuccess={() => {
            refetch()
            setTeamToEdit(null)
          }}
        />
      )}
    </PageContainer>
  )
}
