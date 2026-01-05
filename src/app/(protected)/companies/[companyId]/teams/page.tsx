'use client'

import { TeamForm } from '@/components/features/team/team-form'
import { TeamMembersDialog } from '@/components/features/team/team-members-dialog'
import { EmptyState } from '@/components/shared/feedback/empty-state'
import { ErrorState } from '@/components/shared/feedback/error-state'
import { LoadingScreen } from '@/components/shared/feedback/loading-screen'
import { PageContainer } from '@/components/shared/layout/page-container'
import { PageHeader } from '@/components/shared/layout/page-header'
import { ResponsiveDataTable } from '@/components/shared/table'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ApiError } from '@/lib/api/api-client'
import type { Team } from '@/lib/api/endpoints/teams'
import { useUserContext } from '@/lib/contexts/user-context'
import { formatDate } from '@/lib/formatters'
import { useManagersByCompany } from '@/lib/services/queries/use-employees'
import { useCreateTeam, useTeamsByCompany, useUpdateTeam } from '@/lib/services/queries/use-teams'
import { type TeamFormData } from '@/lib/validators/team'
import type { ColumnDef } from '@tanstack/react-table'
import { AlertCircle, Building2, CheckCircle2, Edit, Plus, UserCog, Users } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { TeamCard } from './team-card'

export default function TeamsPage() {
  const params = useParams()
  const router = useRouter()
  const companyId = params.companyId as string
  const { user } = useUserContext()
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingTeam, setEditingTeam] = useState<Team | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
  const [showMembersDialog, setShowMembersDialog] = useState(false)

  const isManager = user?.globalRole === 'manager'
  const isAdmin = user?.globalRole === 'admin'

  const {
    data: teamsResponse,
    isLoading: loadingTeams,
    error: teamsError,
    refetch,
  } = useTeamsByCompany(companyId)

  const { data: managers = [], isLoading: loadingManagers } = useManagersByCompany(companyId)

  const { mutateAsync: createTeam, isPending: isCreating } = useCreateTeam()
  const { mutateAsync: updateTeam, isPending: isUpdating } = useUpdateTeam()

  const allTeams = useMemo(() => teamsResponse?.data || [], [teamsResponse?.data])
  const company = user?.companies.find((c) => c.id === companyId)

  // Filtrar equipes: gerente vê apenas sua equipe
  const teams = useMemo(() => {
    if (isManager) {
      return allTeams.filter((team) => team.managerId === user?.id)
    }
    return allTeams
  }, [allTeams, isManager, user?.id])

  const hasSingleTeam = teams.length === 1
  const myTeam = isManager && hasSingleTeam ? teams[0] : null

  const columns = useMemo<ColumnDef<Team>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Nome',
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
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedTeam(team)
                  setShowMembersDialog(true)
                }}
                className="h-8 gap-1 px-2"
              >
                <UserCog className="h-4 w-4" />
                <span className="hidden sm:inline">Membros</span>
              </Button>
              {(isAdmin || (isManager && team.managerId === user?.id)) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEditingTeam(team)
                    setError(null)
                  }}
                  className="h-8 gap-1 px-2"
                >
                  <Edit className="h-4 w-4" />
                  <span className="hidden sm:inline">Editar</span>
                </Button>
              )}
            </div>
          )
        },
      },
    ],
    [isAdmin, isManager, user?.id]
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
      .filter((team) => !editingTeam || team.id !== editingTeam.id)
      .map((team) => team.managerId)

    return managers.filter(
      (manager) =>
        !managerIdsInTeams.includes(manager.userId) ||
        (editingTeam && manager.userId === editingTeam.managerId)
    )
  }, [managers, allTeams, editingTeam])

  const handleCreateTeam = async (data: TeamFormData) => {
    try {
      setError(null)

      await createTeam({
        name: data.name,
        companyId: data.companyId,
        managerId: data.managerId,
        description: data.description?.trim() || undefined,
        iaContext: data.iaContext?.trim() || undefined,
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

      await updateTeam({
        id: editingTeam.id,
        data: {
          name: data.name,
          managerId: data.managerId,
          description: data.description?.trim() || undefined,
          iaContext: data.iaContext?.trim() || undefined,
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
              ? hasSingleTeam
                ? 'Minha Equipe'
                : 'Minhas Equipes'
              : 'Equipes'
        }
        description={
          isEditingFlow
            ? editingTeam
              ? `Atualize as informações da equipe${company ? ` em ${company.name}` : ''}`
              : `Crie uma nova equipe${company ? ` em ${company.name}` : ''}`
            : isManager
              ? hasSingleTeam
                ? `Gerencie sua equipe${company ? ` em ${company.name}` : ''}`
                : `Gerencie suas equipes${company ? ` em ${company.name}` : ''}`
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
                        description: editingTeam.description || '',
                        iaContext: editingTeam.iaContext || '',
                      }
                    : undefined
                }
              />
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
            <>
              {isManager && hasSingleTeam && myTeam ? (
                // Layout destacado para gerente com uma única equipe
                <Card className="border-2 border-primary/20 shadow-lg">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="mb-3 flex items-center gap-3">
                          <div className="rounded-lg bg-primary/10 p-2">
                            <Users className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <CardTitle className="text-2xl">{myTeam.name}</CardTitle>
                              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                                Sua equipe
                              </span>
                            </div>
                            {myTeam.description && (
                              <CardDescription className="mt-2 text-base">
                                {myTeam.description}
                              </CardDescription>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {myTeam.iaContext && (
                      <div className="rounded-lg border border-border/40 bg-muted/30 p-4">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 rounded bg-primary/10 p-1.5">
                            <Building2 className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1">
                            <p className="mb-1.5 text-sm font-semibold">Contexto de IA</p>
                            <p className="text-sm leading-relaxed text-muted-foreground">
                              {myTeam.iaContext}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center justify-between border-t pt-4">
                      <div className="text-sm text-muted-foreground">
                        Criada em {formatDate(myTeam.createdAt)}
                      </div>
                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          className="gap-2"
                          onClick={() => {
                            setSelectedTeam(myTeam)
                            setShowMembersDialog(true)
                          }}
                        >
                          <UserCog className="h-4 w-4" />
                          Gerenciar Membros
                        </Button>
                        <Button
                          variant="outline"
                          className="gap-2"
                          onClick={() => {
                            setEditingTeam(myTeam)
                            setError(null)
                          }}
                        >
                          <Edit className="h-4 w-4" />
                          Editar Equipe
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                // Layout em grid para múltiplas equipes
                <ResponsiveDataTable
                  data={teams}
                  columns={columns}
                  CardComponent={(props) => (
                    <TeamCard
                      {...props}
                      onEdit={(team) => {
                        setEditingTeam(team)
                        setError(null)
                      }}
                      onManageMembers={(team) => {
                        setSelectedTeam(team)
                        setShowMembersDialog(true)
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

          {selectedTeam && (
            <TeamMembersDialog
              open={showMembersDialog}
              onOpenChange={setShowMembersDialog}
              team={selectedTeam}
              companyId={companyId}
            />
          )}
        </>
      )}
    </PageContainer>
  )
}
