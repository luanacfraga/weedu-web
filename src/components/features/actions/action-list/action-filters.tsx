'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { StatusBadge } from '@/components/ui/status-badge'
import { UserAvatar } from '@/components/ui/user-avatar'
import { useAuth } from '@/lib/hooks/use-auth'
import { useCompany } from '@/lib/hooks/use-company'
import { usePermissions } from '@/lib/hooks/use-permissions'
import { useCompanyResponsibles } from '@/lib/services/queries/use-companies'
import { useTeamsByCompany } from '@/lib/services/queries/use-teams'
import { useActionFiltersStore } from '@/lib/stores/action-filters-store'
import { ActionLateStatus, ActionPriority, ActionStatus, AssignmentFilter, DateFilterType, ViewMode } from '@/lib/types/action'
import { cn, getPriorityExclamation } from '@/lib/utils'
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
  Filter,
  LayoutGrid,
  LayoutList,
  Lock,
  Search,
  UserCircle2,
  Users,
  X,
} from 'lucide-react'
import { useEffect, useMemo } from 'react'
import { ActionLateStatusBadge } from '../shared/action-late-status-badge'
import { getActionPriorityUI } from '../shared/action-priority-ui'
import { getActionStatusUI } from '../shared/action-status-ui'

export function ActionFilters() {
  const { user } = useAuth()
  const { selectedCompany } = useCompany()
  const { isManager } = usePermissions()
  const filters = useActionFiltersStore()
  const { data: companyResponsibles = [], isLoading: isLoadingResponsibles } =
    useCompanyResponsibles(selectedCompany?.id || '')
  
  const { data: teamsData } = useTeamsByCompany(selectedCompany?.id || '')
  const allTeams = teamsData?.data || []

  const availableTeams = useMemo(() => {
    if (!selectedCompany?.id) return []
    if (isManager) {
      return allTeams.filter((team) => team.managerId === user?.id)
    }
    return allTeams
  }, [allTeams, isManager, user?.id, selectedCompany?.id])

  const hasSingleTeam = availableTeams.length === 1
  const managerTeam = isManager && hasSingleTeam ? availableTeams[0] : null

  useEffect(() => {
    if (user?.role !== 'executor') return
    if (filters.assignment !== AssignmentFilter.ASSIGNED_TO_ME) {
      filters.setFilter('assignment', AssignmentFilter.ASSIGNED_TO_ME)
    }
  }, [user?.role, filters])

  useEffect(() => {
    if (isManager && hasSingleTeam && managerTeam && filters.teamId !== managerTeam.id) {
      filters.setFilter('teamId', managerTeam.id)
    }
  }, [isManager, hasSingleTeam, managerTeam, filters])

  const hasActiveFilters =
    filters.statuses.length > 0 ||
    filters.priority !== 'all' ||
    filters.assignment !== 'all' ||
    !!filters.responsibleId ||
    !!filters.teamId ||
    !!filters.dateFrom ||
    !!filters.dateTo ||
    filters.showBlockedOnly ||
    filters.showLateOnly ||
    (filters.lateStatusFilter && filters.lateStatusFilter !== 'all')

  const getButtonState = (isActive: boolean) => {
    return cn(
      'h-9 text-xs font-medium transition-all',
      'border-border/50 bg-background/80 hover:bg-accent/70 hover:border-border',
      'shadow-sm',
      isActive &&
        'border-primary/60 bg-primary/10 text-primary hover:bg-primary/15 shadow-primary/10'
    )
  }

  const getStatusPill = (status: ActionStatus) => {
    const ui = getActionStatusUI(status)
    return {
      itemActive: ui.badgeClass,
    }
  }

  const getPriorityPill = (priority: ActionPriority) => {
    switch (priority) {
      case ActionPriority.LOW:
        return {
          flagClass: getActionPriorityUI(ActionPriority.LOW).flagClass,
          itemActive: getActionPriorityUI(ActionPriority.LOW).itemActiveClass,
        }
      case ActionPriority.MEDIUM:
        return {
          flagClass: getActionPriorityUI(ActionPriority.MEDIUM).flagClass,
          itemActive: getActionPriorityUI(ActionPriority.MEDIUM).itemActiveClass,
        }
      case ActionPriority.HIGH:
        return {
          flagClass: getActionPriorityUI(ActionPriority.HIGH).flagClass,
          itemActive: getActionPriorityUI(ActionPriority.HIGH).itemActiveClass,
        }
      case ActionPriority.URGENT:
        return {
          flagClass: getActionPriorityUI(ActionPriority.URGENT).flagClass,
          itemActive: getActionPriorityUI(ActionPriority.URGENT).itemActiveClass,
        }
      default:
        return {
          flagClass: 'text-muted-foreground',
          itemActive: 'bg-primary/10 text-primary' as const,
        }
    }
  }

  const priorityExclamations: Record<ActionPriority, string> = {
    [ActionPriority.LOW]: getPriorityExclamation(0),
    [ActionPriority.MEDIUM]: getPriorityExclamation(1),
    [ActionPriority.HIGH]: getPriorityExclamation(2),
    [ActionPriority.URGENT]: getPriorityExclamation(3),
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border/40 bg-gradient-to-br from-card to-card/80 p-4 shadow-sm backdrop-blur-sm">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div className="relative w-full flex-1 sm:max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70" />
          <Input
            placeholder="Buscar ações..."
            value={filters.searchQuery}
            onChange={(e) => filters.setFilter('searchQuery', e.target.value)}
            className="h-10 border-border/50 bg-background/80 pl-10 pr-4 transition-all focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/20"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-lg border border-border/50 bg-background/60 p-0.5 shadow-sm">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => filters.setFilter('viewMode', ViewMode.LIST)}
              className={cn(
                'h-8 w-8 p-0 transition-all',
                filters.viewMode === ViewMode.LIST
                  ? 'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90'
                  : 'hover:bg-accent/50'
              )}
              title="Tabela"
              aria-label="Visualizar como tabela"
              aria-pressed={filters.viewMode === ViewMode.LIST}
            >
              <LayoutList className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => filters.setFilter('viewMode', ViewMode.KANBAN)}
              className={cn(
                'h-8 w-8 p-0 transition-all',
                filters.viewMode === ViewMode.KANBAN
                  ? 'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90'
                  : 'hover:bg-accent/50'
              )}
              title="Kanban"
              aria-label="Visualizar como kanban"
              aria-pressed={filters.viewMode === ViewMode.KANBAN}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-border/30 pt-1">
        <div className="flex items-center gap-1.5 pr-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground/80">
          <Filter className="h-3.5 w-3.5" />
          <span>Filtros</span>
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={getButtonState(filters.statuses.length > 0)}
            >
              <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
              <span>Status</span>
              {filters.statuses.length > 0 && (
                <span className="ml-1.5 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
                  {filters.statuses.length}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0" align="start">
            <div className="p-2">
              <div className="space-y-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'w-full justify-start text-xs font-normal',
                    filters.statuses.length === 0 && 'bg-primary/10 text-primary'
                  )}
                  onClick={() => filters.setFilter('statuses', [])}
                >
                  Todos
                  {filters.statuses.length === 0 && (
                    <CheckCircle2 className="ml-auto h-3.5 w-3.5 opacity-50" />
                  )}
                </Button>
                <div className="my-1 h-px bg-muted" />
                {[
                  { label: 'Pendente', value: ActionStatus.TODO },
                  { label: 'Em Andamento', value: ActionStatus.IN_PROGRESS },
                  { label: 'Concluído', value: ActionStatus.DONE },
                ].map((option) =>
                  (() => {
                    const meta = getStatusPill(option.value)
                    const isActive = filters.statuses.includes(option.value)
                    return (
                      <Button
                        key={option.value}
                        variant="ghost"
                        size="sm"
                        className={cn(
                          'w-full justify-start text-xs font-normal',
                          isActive && meta.itemActive
                        )}
                        onClick={() => {
                          const next = isActive
                            ? filters.statuses.filter((s) => s !== option.value)
                            : [...filters.statuses, option.value]
                          filters.setFilter('statuses', next)
                        }}
                      >
                        <StatusBadge
                          status={option.value}
                          variant="minimal"
                          className="text-[11px]"
                        />
                        {isActive && <CheckCircle2 className="ml-auto h-3.5 w-3.5" />}
                      </Button>
                    )
                  })()
                )}
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={getButtonState(filters.priority !== 'all')}
            >
              <span className="mr-1.5 text-xs font-black text-muted-foreground">!</span>
              <span>Prioridade</span>
              {filters.priority !== 'all' && (
                <span className="ml-1.5 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
                  1
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0" align="start">
            <div className="p-2">
              <div className="space-y-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'w-full justify-start text-xs font-normal',
                    filters.priority === 'all' && 'bg-primary/10 text-primary'
                  )}
                  onClick={() => filters.setFilter('priority', 'all')}
                >
                  Todas
                  {filters.priority === 'all' && (
                    <CheckCircle2 className="ml-auto h-3.5 w-3.5 opacity-50" />
                  )}
                </Button>
                <div className="my-1 h-px bg-muted" />
                {[
                  { label: 'Baixa', value: ActionPriority.LOW },
                  { label: 'Média', value: ActionPriority.MEDIUM },
                  { label: 'Alta', value: ActionPriority.HIGH },
                  { label: 'Urgente', value: ActionPriority.URGENT },
                ].map((option) =>
                  (() => {
                    const meta = getPriorityPill(option.value)
                    const isActive = filters.priority === option.value
                    return (
                      <Button
                        key={option.value}
                        variant="ghost"
                        size="sm"
                        className={cn(
                          'w-full justify-start text-xs font-normal',
                          isActive && meta.itemActive
                        )}
                        onClick={() =>
                          filters.setFilter('priority', option.value as ActionPriority)
                        }
                      >
                        <span
                          className={cn(
                            'mr-2 inline-flex h-4 w-4 items-center justify-center rounded-full border border-current text-[9px] font-bold leading-none',
                            meta.flagClass
                          )}
                        >
                          {priorityExclamations[option.value]}
                        </span>
                        <span>{option.label}</span>
                        {isActive && <CheckCircle2 className="ml-auto h-3.5 w-3.5" />}
                      </Button>
                    )
                  })()
                )}
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {selectedCompany && availableTeams.length > 0 && (
          <>
            {isManager && hasSingleTeam && managerTeam ? (
              <div className="flex h-9 items-center gap-2 rounded-md border border-border/60 bg-muted/40 px-3 text-xs text-muted-foreground">
                <Users className="h-3.5 w-3.5" />
                <span className="truncate">{managerTeam.name}</span>
              </div>
            ) : (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={getButtonState(!!filters.teamId)}
                  >
                    <Users className="mr-1.5 h-3.5 w-3.5" />
                    <span>Equipe</span>
                    {filters.teamId && (
                      <span className="ml-1.5 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
                        1
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[240px] p-0" align="start">
                  <div className="p-2">
                    <div className="space-y-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                          'w-full justify-start text-xs font-normal',
                          !filters.teamId && 'bg-primary/10 text-primary'
                        )}
                        onClick={() => filters.setFilter('teamId', null)}
                      >
                        Todas as equipes
                        {!filters.teamId && (
                          <CheckCircle2 className="ml-auto h-3.5 w-3.5 opacity-50" />
                        )}
                      </Button>
                      <div className="my-1 h-px bg-muted" />
                      {availableTeams.map((team) => {
                        const isActive = filters.teamId === team.id
                        return (
                          <Button
                            key={team.id}
                            variant="ghost"
                            size="sm"
                            className={cn(
                              'w-full justify-start text-xs font-normal',
                              isActive && 'bg-primary/10 text-primary'
                            )}
                            onClick={() => {
                              filters.setFilter('teamId', team.id)
                            }}
                          >
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              <span className="truncate">{team.name}</span>
                            </div>
                            {isActive && <CheckCircle2 className="ml-auto h-3.5 w-3.5" />}
                          </Button>
                        )
                      })}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </>
        )}

        {user?.role !== 'executor' ? (
          <>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={getButtonState(!!filters.responsibleId)}
                  disabled={!selectedCompany || isLoadingResponsibles}
                >
                  <UserCircle2 className="mr-1.5 h-3.5 w-3.5" />
                  <span>Responsável</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[240px] p-0" align="start">
                <div className="p-2">
                  <div className="space-y-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        'w-full justify-start text-xs font-normal',
                        !filters.responsibleId && 'bg-primary/10 text-primary'
                      )}
                      onClick={() => filters.setFilter('responsibleId', null)}
                    >
                      Todos os responsáveis
                      {!filters.responsibleId && (
                        <CheckCircle2 className="ml-auto h-3.5 w-3.5 opacity-50" />
                      )}
                    </Button>
                    <div className="my-1 h-px bg-muted" />
                    {isLoadingResponsibles ? (
                      <div className="px-2 py-3 text-xs text-muted-foreground">
                        Carregando responsáveis...
                      </div>
                    ) : companyResponsibles && companyResponsibles.length > 0 ? (
                      companyResponsibles.map((employee) => {
                        const isActive = filters.responsibleId === employee.userId
                        const execUser = employee.user

                        const execInitials =
                          user && employee.userId === user.id
                            ? (user.initials ?? null)
                            : (execUser?.initials ?? null)

                        const execAvatarColor =
                          user && employee.userId === user.id
                            ? (user.avatarColor ?? null)
                            : (execUser?.avatarColor ?? null)

                        const fullName = execUser
                          ? `${execUser.firstName} ${execUser.lastName}`
                          : employee.userId

                        return (
                          <Button
                            key={employee.id}
                            variant="ghost"
                            size="sm"
                            className={cn(
                              'w-full justify-start text-xs font-normal',
                              isActive && 'bg-primary/10 text-primary'
                            )}
                            onClick={() => {
                              filters.setFilter('assignment', AssignmentFilter.ALL)
                              filters.setFilter('responsibleId', employee.userId)
                            }}
                          >
                            <div className="flex items-center gap-2">
                              <UserAvatar
                                firstName={execUser?.firstName}
                                lastName={execUser?.lastName}
                                initials={execInitials}
                                avatarColor={execAvatarColor}
                                size="sm"
                                className="h-5 w-5 text-[9px]"
                              />
                              <span className="truncate">{fullName}</span>
                            </div>
                            {isActive && <CheckCircle2 className="ml-auto h-3.5 w-3.5" />}
                          </Button>
                        )
                      })
                    ) : (
                      <div className="px-2 py-3 text-xs text-muted-foreground">
                        Nenhum responsável disponível nesta empresa.
                      </div>
                    )}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </>
        ) : null}

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={getButtonState(!!filters.dateFrom || !!filters.dateTo)}
            >
              <CalendarIcon className="mr-1.5 h-3.5 w-3.5" />
              <span>Data</span>
              {(filters.dateFrom || filters.dateTo) && (
                <span className="ml-1.5 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
                  1
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[280px] rounded-2xl p-0" align="start">
            <div className="space-y-4 p-4">
              <div>
                <label className="mb-2 block text-xs font-semibold text-muted-foreground">
                  Tipo de Data
                </label>
                <div className="space-y-1.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      'h-9 w-full justify-between rounded-xl text-xs font-normal transition-all',
                      filters.dateFilterType === DateFilterType.ESTIMATED_START_DATE &&
                        'bg-primary/10 text-primary shadow-sm'
                    )}
                    onClick={() => filters.setFilter('dateFilterType', DateFilterType.ESTIMATED_START_DATE)}
                  >
                    <span>Início Previsto</span>
                    {filters.dateFilterType === DateFilterType.ESTIMATED_START_DATE && (
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      'h-9 w-full justify-between rounded-xl text-xs font-normal transition-all',
                      filters.dateFilterType === DateFilterType.ACTUAL_START_DATE &&
                        'bg-primary/10 text-primary shadow-sm'
                    )}
                    onClick={() => filters.setFilter('dateFilterType', DateFilterType.ACTUAL_START_DATE)}
                  >
                    <span>Início Real</span>
                    {filters.dateFilterType === DateFilterType.ACTUAL_START_DATE && (
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      'h-9 w-full justify-between rounded-xl text-xs font-normal transition-all',
                      filters.dateFilterType === DateFilterType.ESTIMATED_END_DATE &&
                        'bg-primary/10 text-primary shadow-sm'
                    )}
                    onClick={() => filters.setFilter('dateFilterType', DateFilterType.ESTIMATED_END_DATE)}
                  >
                    <span>Término Previsto</span>
                    {filters.dateFilterType === DateFilterType.ESTIMATED_END_DATE && (
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      'h-9 w-full justify-between rounded-xl text-xs font-normal transition-all',
                      filters.dateFilterType === DateFilterType.ACTUAL_END_DATE &&
                        'bg-primary/10 text-primary shadow-sm'
                    )}
                    onClick={() => filters.setFilter('dateFilterType', DateFilterType.ACTUAL_END_DATE)}
                  >
                    <span>Término Real</span>
                    {filters.dateFilterType === DateFilterType.ACTUAL_END_DATE && (
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="h-px bg-border/50" />

              <div>
                <label className="mb-2 block text-xs font-semibold text-muted-foreground">
                  Período
                </label>
                <div className="space-y-2.5">
                  <div>
                    <label className="mb-1.5 block text-[11px] font-medium text-muted-foreground">
                      De
                    </label>
                    <Input
                      type="date"
                      value={filters.dateFrom ? filters.dateFrom.split('T')[0] : ''}
                      onChange={(e) => {
                        if (!e.target.value) {
                          filters.setFilter('dateFrom', null)
                          return
                        }
                        const [year, month, day] = e.target.value.split('-').map(Number)
                        const date = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0))
                        filters.setFilter('dateFrom', date.toISOString())
                      }}
                      className="h-9 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[11px] font-medium text-muted-foreground">
                      Até
                    </label>
                    <Input
                      type="date"
                      value={filters.dateTo ? filters.dateTo.split('T')[0] : ''}
                      onChange={(e) => {
                        if (!e.target.value) {
                          filters.setFilter('dateTo', null)
                          return
                        }
                        const [year, month, day] = e.target.value.split('-').map(Number)
                        const date = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999))
                        filters.setFilter('dateTo', date.toISOString())
                      }}
                      className="h-9 rounded-xl text-xs"
                    />
                  </div>
                </div>
              </div>

              {(filters.dateFrom || filters.dateTo) && (
                <>
                  <div className="h-px bg-border/50" />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      filters.setFilter('dateFrom', null)
                      filters.setFilter('dateTo', null)
                    }}
                    className="h-8 w-full rounded-xl text-xs text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  >
                    <X className="mr-1.5 h-3.5 w-3.5" />
                    Limpar filtro
                  </Button>
                </>
              )}
            </div>
          </PopoverContent>
        </Popover>

        <div className="mx-0.5 h-5 w-px bg-border/40" />

        <Button
          variant="outline"
          size="sm"
          onClick={() => filters.setFilter('showBlockedOnly', !filters.showBlockedOnly)}
          className={getButtonState(filters.showBlockedOnly)}
        >
          <Lock className="mr-1.5 h-3.5 w-3.5" />
          <span>Bloqueadas</span>
        </Button>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={getButtonState(
                !!filters.lateStatusFilter && filters.lateStatusFilter !== 'all'
              )}
            >
              <Clock className="mr-1.5 h-3.5 w-3.5" />
              <span>Status de atraso</span>
              {filters.lateStatusFilter && filters.lateStatusFilter !== 'all' && (
                <span className="ml-1.5 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
                  1
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[220px] p-0" align="start">
            <div className="space-y-1 p-2">
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  'w-full justify-start text-xs font-normal',
                  (!filters.lateStatusFilter || filters.lateStatusFilter === 'all') &&
                    'bg-primary/10 text-primary'
                )}
                onClick={() => filters.setFilter('lateStatusFilter', 'all')}
              >
                Todos
                {(!filters.lateStatusFilter || filters.lateStatusFilter === 'all') && (
                  <CheckCircle2 className="ml-auto h-3.5 w-3.5 opacity-50" />
                )}
              </Button>
              <div className="my-1 h-px bg-muted" />
              {[
                {
                  label: 'Atrasada á inciar',
                  value: ActionLateStatus.LATE_TO_START,
                },
                {
                  label: 'Atrasada á terminar',
                  value: ActionLateStatus.LATE_TO_FINISH,
                },
                {
                  label: 'Concluída com atraso',
                  value: ActionLateStatus.COMPLETED_LATE,
                },
              ].map((option) => {
                const isActive = filters.lateStatusFilter === option.value

                return (
                  <Button
                    key={option.value}
                    variant="ghost"
                    size="sm"
                    className={cn(
                      'w-full justify-between text-xs font-normal',
                      isActive && 'bg-primary/5'
                    )}
                    onClick={() => {
                      filters.setFilter('lateStatusFilter', option.value)
                      if (!filters.showLateOnly) {
                        filters.setFilter('showLateOnly', true)
                      }
                    }}
                  >
                    <ActionLateStatusBadge lateStatus={option.value} size="sm" />
                    {isActive && <CheckCircle2 className="ml-2 h-3.5 w-3.5" />}
                  </Button>
                )
              })}
            </div>
          </PopoverContent>
        </Popover>

        {hasActiveFilters && (
          <>
            <div className="mx-0.5 h-5 w-px bg-border/40" />
            <Button
              variant="ghost"
              size="sm"
              onClick={filters.resetFilters}
              className="h-9 px-3 text-xs font-medium text-muted-foreground transition-all hover:bg-destructive/10 hover:text-destructive"
            >
              <span>Limpar</span>
              <X className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
