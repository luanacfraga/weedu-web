'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useActionFiltersStore } from '@/lib/stores/action-filters-store'
import { ActionPriority, ActionStatus } from '@/lib/types/action'
import { cn } from '@/lib/utils'
import { getActionStatusUI } from '../shared/action-status-ui'
import { getActionPriorityUI } from '../shared/action-priority-ui'
import {
  CheckCircle2,
  Filter,
  Flag,
  LayoutGrid,
  LayoutList,
  Search,
  UserCircle2,
  X,
} from 'lucide-react'
import { useRouter } from 'next/navigation'

export function ActionFilters() {
  const filters = useActionFiltersStore()
  const router = useRouter()

  const hasActiveFilters =
    filters.statuses.length > 0 ||
    filters.priority !== 'all' ||
    filters.assignment !== 'all' ||
    filters.showBlockedOnly ||
    filters.showLateOnly

  const getButtonState = (isActive: boolean) => {
    return cn(
      'h-8 text-xs font-medium border-border/60 bg-background/50 hover:bg-accent/60 hover:border-border/80',
      isActive && 'border-primary/40 bg-primary/10 text-primary hover:bg-primary/15'
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
    <div className="flex flex-col gap-4 rounded-xl border border-border/50 bg-card/60 p-4 shadow-sm backdrop-blur-sm">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        {/* Search Bar */}
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por título ou descrição..."
            value={filters.searchQuery}
            onChange={(e) => filters.setFilter('searchQuery', e.target.value)}
            className="h-9 bg-background/70 pl-9 border-border/60 focus-visible:border-primary/40 focus-visible:ring-primary/15"
          />
        </div>

        {/* View Toggles & Create Button */}
        <div className="ml-auto flex w-full items-center gap-2 sm:w-auto">
          <div className="flex items-center rounded-lg border border-border/60 bg-background/40 p-1 shadow-sm">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => filters.setFilter('viewMode', 'list')}
              className={cn(
                'h-7 w-7 p-0',
                filters.viewMode === 'list' &&
                  'bg-primary/15 text-primary shadow-sm hover:bg-primary/20 hover:text-primary'
              )}
              title="Lista"
              aria-label="Visualizar como lista"
              aria-pressed={filters.viewMode === 'list'}
            >
              <LayoutList className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => filters.setFilter('viewMode', 'kanban')}
              className={cn(
                'h-7 w-7 p-0',
                filters.viewMode === 'kanban' &&
                  'bg-primary/15 text-primary shadow-sm hover:bg-primary/20 hover:text-primary'
              )}
              title="Kanban"
              aria-label="Visualizar como kanban"
              aria-pressed={filters.viewMode === 'kanban'}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>

          <div className="mx-1 hidden h-4 w-px bg-border/60 sm:block" />
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="mr-2 flex items-center text-sm font-medium text-muted-foreground">
          <Filter className="mr-2 h-4 w-4" />
          Filtros:
        </div>

        {/* Status Popover */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={getButtonState(filters.statuses.length > 0)}
            >
              <CheckCircle2 className="mr-2 h-3.5 w-3.5" />
              Status
              {filters.statuses.length > 0 && (
                <span className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary/15 px-1 text-[10px] font-semibold text-primary">
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
                  className="w-full justify-start text-xs font-normal"
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
                ].map((option) => (
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
                    {isActive && (
                      <CheckCircle2 className="ml-auto h-3.5 w-3.5" />
                    )}
                  </Button>
                    )
                  })()
                ))}
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
              <Flag className="mr-2 h-3.5 w-3.5" />
              Prioridade
              {filters.priority !== 'all' && (
                <span className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary/15 px-1 text-[10px] font-semibold text-primary">
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
                  className="w-full justify-start text-xs font-normal"
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
                ].map((option) => (
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
                    onClick={() => filters.setFilter('priority', option.value as ActionPriority)}
                  >
                    <Flag className={cn('mr-2 h-3.5 w-3.5', meta.flagClass)} />
                    <span>{option.label}</span>
                    {isActive && (
                      <CheckCircle2 className="ml-auto h-3.5 w-3.5" />
                    )}
                  </Button>
                    )
                  })()
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Assignment Popover */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={getButtonState(filters.assignment !== 'all')}
            >
              <UserCircle2 className="mr-2 h-3.5 w-3.5" />
              Atribuição
              {filters.assignment !== 'all' && (
                <span className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary/15 px-1 text-[10px] font-semibold text-primary">
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
                  className="w-full justify-start text-xs font-normal"
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

        <div className="mx-1 h-6 w-px bg-border/60" />

        {/* Quick Toggles */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => filters.setFilter('showBlockedOnly', !filters.showBlockedOnly)}
          className={getButtonState(filters.showBlockedOnly)}
        >
          Bloqueadas
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => filters.setFilter('showLateOnly', !filters.showLateOnly)}
          className={getButtonState(filters.showLateOnly)}
        >
          Atrasadas
        </Button>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={filters.resetFilters}
            className="ml-auto h-8 px-2 text-xs text-muted-foreground hover:text-foreground sm:ml-0"
          >
            Limpar filtros
            <X className="ml-2 h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </div>
  )
}
