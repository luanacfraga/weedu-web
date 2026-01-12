'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useAuth } from '@/lib/hooks/use-auth'
import { useCompany } from '@/lib/hooks/use-company'
import { useCompanyResponsibles } from '@/lib/services/queries/use-companies'
import { useActionFiltersStore } from '@/lib/stores/action-filters-store'
import { ActionLateStatus, ActionPriority, ActionStatus } from '@/lib/types/action'
import { cn } from '@/lib/utils'
import { datePresets, getPresetById } from '@/lib/utils/date-presets'
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
  Filter,
  Flag,
  LayoutGrid,
  LayoutList,
  Search,
  UserCircle2,
  X,
} from 'lucide-react'
import { useEffect } from 'react'
import { getActionPriorityUI } from '../shared/action-priority-ui'
import { getActionStatusUI } from '../shared/action-status-ui'

export function ActionFilters() {
  const { user } = useAuth()
  const { selectedCompany } = useCompany()
  const filters = useActionFiltersStore()
  const { data: companyResponsibles = [], isLoading: isLoadingResponsibles } =
    useCompanyResponsibles(selectedCompany?.id || '')

  useEffect(() => {
    if (user?.role !== 'executor') return
    if (filters.assignment !== 'assigned-to-me') {
      filters.setFilter('assignment', 'assigned-to-me')
    }
  }, [user?.role, filters])

  const hasActiveFilters =
    filters.statuses.length > 0 ||
    filters.priority !== 'all' ||
    filters.assignment !== 'all' ||
    !!filters.responsibleId ||
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
      dot: ui.dotClass,
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

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border/40 bg-gradient-to-br from-card to-card/80 p-4 shadow-sm backdrop-blur-sm">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        {/* Search Bar */}
        <div className="relative w-full flex-1 sm:max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70" />
          <Input
            placeholder="Buscar ações..."
            value={filters.searchQuery}
            onChange={(e) => filters.setFilter('searchQuery', e.target.value)}
            className="h-10 border-border/50 bg-background/80 pl-10 pr-4 transition-all focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/20"
          />
        </div>

        {/* View Toggles */}
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-lg border border-border/50 bg-background/60 p-0.5 shadow-sm">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => filters.setFilter('viewMode', 'list')}
              className={cn(
                'h-8 w-8 p-0 transition-all',
                filters.viewMode === 'list'
                  ? 'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90'
                  : 'hover:bg-accent/50'
              )}
              title="Tabela"
              aria-label="Visualizar como tabela"
              aria-pressed={filters.viewMode === 'list'}
            >
              <LayoutList className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => filters.setFilter('viewMode', 'kanban')}
              className={cn(
                'h-8 w-8 p-0 transition-all',
                filters.viewMode === 'kanban'
                  ? 'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90'
                  : 'hover:bg-accent/50'
              )}
              title="Kanban"
              aria-label="Visualizar como kanban"
              aria-pressed={filters.viewMode === 'kanban'}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-2 border-t border-border/30 pt-1">
        <div className="flex items-center gap-1.5 pr-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground/80">
          <Filter className="h-3.5 w-3.5" />
          <span>Filtros</span>
        </div>

        {/* Status Popover */}
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
                        <span className={cn('mr-2 inline-block h-2 w-2 rounded-full', meta.dot)} />
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

        {/* Priority Popover */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={getButtonState(filters.priority !== 'all')}
            >
              <Flag className="mr-1.5 h-3.5 w-3.5" />
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
                        <Flag className={cn('mr-2 h-3.5 w-3.5', meta.flagClass)} />
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

        {/* Assignment Popover (hidden for executors; they are always "assigned-to-me") */}
        {user?.role !== 'executor' ? (
          <>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={getButtonState(filters.assignment !== 'all')}
                >
                  <UserCircle2 className="mr-1.5 h-3.5 w-3.5" />
                  <span>Atribuição</span>
                  {filters.assignment !== 'all' && (
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
                        filters.assignment === 'all' && 'bg-primary/10 text-primary'
                      )}
                      onClick={() => filters.setFilter('assignment', 'all')}
                    >
                      Todas
                      {filters.assignment === 'all' && (
                        <CheckCircle2 className="ml-auto h-3.5 w-3.5 opacity-50" />
                      )}
                    </Button>
                    <div className="my-1 h-px bg-muted" />
                    {[
                      { label: 'Atribuídas a Mim', value: 'assigned-to-me' as const },
                      { label: 'Criadas por Mim', value: 'created-by-me' as const },
                      { label: 'Minhas Equipes', value: 'my-teams' as const },
                    ].map((option) => (
                      <Button
                        key={option.value}
                        variant="ghost"
                        size="sm"
                        className={cn(
                          'w-full justify-start text-xs font-normal',
                          filters.assignment === option.value && 'bg-primary/10 text-primary'
                        )}
                        onClick={() => filters.setFilter('assignment', option.value)}
                      >
                        {option.label}
                        {filters.assignment === option.value && (
                          <CheckCircle2 className="ml-auto h-3.5 w-3.5" />
                        )}
                      </Button>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {/* Responsible selector for managers/admins: filtra por responsável específico */}
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
                  {filters.responsibleId && (
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
                        const fullName = employee.user
                          ? `${employee.user.firstName} ${employee.user.lastName}`
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
                              filters.setFilter('assignment', 'all')
                              filters.setFilter('responsibleId', employee.userId)
                            }}
                          >
                            <span className="truncate">{fullName}</span>
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

        {/* Date Range Popover */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={getButtonState(!!filters.dateFrom || !!filters.dateTo)}
            >
              <CalendarIcon className="mr-1.5 h-3.5 w-3.5" />
              <span>Data</span>
              {filters.datePreset && (
                <span className="ml-1.5 inline-flex h-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
                  {getPresetById(filters.datePreset)?.label || 'Ativo'}
                </span>
              )}
              {!filters.datePreset && (filters.dateFrom || filters.dateTo) && (
                <span className="ml-1.5 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
                  1
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[280px] p-0" align="start">
            <div className="space-y-3 p-3">
              {/* Presets Section */}
              <div>
                <label className="mb-2 block text-xs font-semibold text-muted-foreground">
                  Períodos Rápidos
                </label>
                <div className="space-y-1">
                  {datePresets.map((preset) => (
                    <Button
                      key={preset.id}
                      variant="ghost"
                      size="sm"
                      className={cn(
                        'w-full justify-start text-xs font-normal',
                        filters.datePreset === preset.id && 'bg-primary/10 text-primary'
                      )}
                      onClick={() => {
                        const range = preset.getRange()
                        filters.setFilter('dateFrom', range.dateFrom)
                        filters.setFilter('dateTo', range.dateTo)
                        filters.setFilter('datePreset', preset.id)
                      }}
                    >
                      {preset.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="h-px bg-muted" />

              {/* Filter Type Selection */}
              <div>
                <label className="mb-2 block text-xs font-semibold text-muted-foreground">
                  Filtrar por
                </label>
                <div className="grid grid-cols-2 gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      'h-8 justify-between text-xs font-normal',
                      filters.dateFilterType === 'createdAt' && 'bg-primary/10 text-primary'
                    )}
                    onClick={() => filters.setFilter('dateFilterType', 'createdAt')}
                  >
                    Criação
                    {filters.dateFilterType === 'createdAt' && (
                      <CheckCircle2 className="ml-2 h-3.5 w-3.5" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      'h-8 justify-between text-xs font-normal',
                      filters.dateFilterType === 'startDate' && 'bg-primary/10 text-primary'
                    )}
                    onClick={() => filters.setFilter('dateFilterType', 'startDate')}
                  >
                    Início
                    {filters.dateFilterType === 'startDate' && (
                      <CheckCircle2 className="ml-2 h-3.5 w-3.5" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="h-px bg-muted" />

              {/* Custom Date Range */}
              <div>
                <label className="mb-2 block text-xs font-semibold text-muted-foreground">
                  Personalizado
                </label>
                <div className="space-y-2">
                  <div>
                    <label className="mb-1 block text-[11px] text-muted-foreground">De</label>
                    <Input
                      type="date"
                      value={filters.dateFrom ? filters.dateFrom.split('T')[0] : ''}
                      onChange={(e) => {
                        const date = e.target.value
                          ? new Date(e.target.value + 'T00:00:00').toISOString()
                          : null
                        filters.setFilter('dateFrom', date)
                        filters.setFilter('datePreset', null)
                      }}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] text-muted-foreground">Até</label>
                    <Input
                      type="date"
                      value={filters.dateTo ? filters.dateTo.split('T')[0] : ''}
                      onChange={(e) => {
                        const date = e.target.value
                          ? new Date(e.target.value + 'T23:59:59').toISOString()
                          : null
                        filters.setFilter('dateTo', date)
                        filters.setFilter('datePreset', null)
                      }}
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
              </div>

              {(filters.dateFrom || filters.dateTo) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    filters.setFilter('dateFrom', null)
                    filters.setFilter('dateTo', null)
                    filters.setFilter('datePreset', null)
                  }}
                  className="h-7 w-full text-xs text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                >
                  <X className="mr-1.5 h-3 w-3" />
                  Limpar datas
                </Button>
              )}
            </div>
          </PopoverContent>
        </Popover>

        <div className="mx-0.5 h-5 w-px bg-border/40" />

        {/* Quick Toggles */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => filters.setFilter('showBlockedOnly', !filters.showBlockedOnly)}
          className={getButtonState(filters.showBlockedOnly)}
        >
          <span>Bloqueadas</span>
        </Button>
        {/* <Button
          variant="outline"
          size="sm"
          onClick={() => filters.setFilter('showLateOnly', !filters.showLateOnly)}
          className={getButtonState(filters.showLateOnly)}
        >
          <span>Atrasadas</span>
        </Button> */}

        {/* Late Status filter (granular types of delay) */}
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
                  label: 'Para iniciar',
                  value: ActionLateStatus.LATE_TO_START,
                },
                {
                  label: 'Para terminar',
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
                      'w-full justify-start text-xs font-normal',
                      isActive && 'bg-primary/10 text-primary'
                    )}
                    onClick={() => {
                      filters.setFilter('lateStatusFilter', option.value)
                      // Garantir coerência com o toggle genérico
                      if (!filters.showLateOnly) {
                        filters.setFilter('showLateOnly', true)
                      }
                    }}
                  >
                    <Clock className="mr-2 h-3.5 w-3.5" />
                    <span>{option.label}</span>
                    {isActive && <CheckCircle2 className="ml-auto h-3.5 w-3.5" />}
                  </Button>
                )
              })}
            </div>
          </PopoverContent>
        </Popover>

        {/* Clear Filters */}
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
