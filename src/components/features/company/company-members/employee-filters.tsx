'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { Building2, CheckCircle2, Filter, Search, X } from 'lucide-react'

type EmployeeStatus =
  | 'INVITED'
  | 'ACTIVE'
  | 'SUSPENDED'
  | 'REJECTED'
  | 'REMOVED'

interface EmployeeFiltersProps {
  companyName?: string
  stats?: {
    total: number
    active: number
    invited: number
    suspended: number
  }
  searchQuery: string
  onSearchQueryChange: (value: string) => void
  statuses: EmployeeStatus[]
  onStatusesChange: (value: EmployeeStatus[]) => void
  onClear: () => void
}

const statusOptions: { label: string; value: EmployeeStatus; dotClass: string }[] = [
  { label: 'Convidado', value: 'INVITED', dotClass: 'bg-warning' },
  { label: 'Ativo', value: 'ACTIVE', dotClass: 'bg-success' },
  { label: 'Suspenso', value: 'SUSPENDED', dotClass: 'bg-destructive' },
  { label: 'Rejeitado', value: 'REJECTED', dotClass: 'bg-muted-foreground' },
  { label: 'Removido', value: 'REMOVED', dotClass: 'bg-muted-foreground' },
]

export function EmployeeFilters({
  companyName,
  stats,
  searchQuery,
  onSearchQueryChange,
  statuses,
  onStatusesChange,
  onClear,
}: EmployeeFiltersProps) {
  const hasActiveFilters = statuses.length > 0 || !!searchQuery.trim()
  const selectedCount = statuses.length
  const isSelected = (value: EmployeeStatus) => statuses.includes(value)

  const toggleStatus = (value: EmployeeStatus) => {
    if (isSelected(value)) {
      onStatusesChange(statuses.filter((s) => s !== value))
    } else {
      onStatusesChange([...statuses, value])
    }
  }

  const getButtonState = (isActive: boolean) => {
    return cn(
      'h-8 text-xs font-medium border-border/60 bg-background/50 hover:bg-accent/60 hover:border-border/80',
      isActive && 'border-primary/40 bg-primary/10 text-primary hover:bg-primary/15'
    )
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border/50 bg-card/60 p-4 shadow-sm backdrop-blur-sm">
      {companyName && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2.5 rounded-lg bg-primary/10 px-3 py-2">
            <Building2 className="h-4 w-4 text-primary" />
            <span className="font-semibold text-foreground">{companyName}</span>
          </div>

          {stats && (
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 text-sm">
                <span className="font-semibold text-foreground">{stats.total}</span>
                <span className="text-muted-foreground">
                  {stats.total === 1 ? 'funcionário' : 'funcionários'}
                </span>
              </div>
              {stats.active > 0 && (
                <div className="flex items-center gap-1.5 rounded-md bg-success/10 px-2.5 py-1.5 text-xs font-medium text-success dark:bg-success/20">
                  <div className="h-2 w-2 rounded-full bg-success" />
                  <span>{stats.active} ativos</span>
                </div>
              )}
              {stats.invited > 0 && (
                <div className="flex items-center gap-1.5 rounded-md bg-warning/10 px-2.5 py-1.5 text-xs font-medium text-warning dark:bg-warning/20">
                  <div className="h-2 w-2 rounded-full bg-warning" />
                  <span>{stats.invited} convidados</span>
                </div>
              )}
              {stats.suspended > 0 && (
                <div className="flex items-center gap-1.5 rounded-md bg-destructive/10 px-2.5 py-1.5 text-xs font-medium text-destructive dark:bg-destructive/20">
                  <div className="h-2 w-2 rounded-full bg-destructive" />
                  <span>{stats.suspended} suspensos</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou email..."
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            className="h-9 bg-background/70 pl-9 border-border/60 focus-visible:border-primary/40 focus-visible:ring-primary/15"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="mr-2 flex items-center text-sm font-medium text-muted-foreground">
          <Filter className="mr-2 h-4 w-4" />
          Filtros:
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className={getButtonState(selectedCount > 0)}>
              Status
              {selectedCount > 0 && (
                <span className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary/15 px-1 text-[10px] font-semibold text-primary">
                  {selectedCount}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[220px] p-0" align="start">
            <div className="p-2">
              <div className="space-y-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-xs font-normal"
                  onClick={() => onStatusesChange([])}
                >
                  Todos
                  {selectedCount === 0 && (
                    <CheckCircle2 className="ml-auto h-3.5 w-3.5 opacity-50" />
                  )}
                </Button>
                <div className="my-1 h-px bg-muted" />
                {statusOptions.map((opt) => {
                  const active = isSelected(opt.value)
                  return (
                    <Button
                      key={opt.value}
                      variant="ghost"
                      size="sm"
                      className={cn(
                        'w-full justify-start text-xs font-normal',
                        active && 'bg-primary/10 text-primary'
                      )}
                      onClick={() => toggleStatus(opt.value)}
                    >
                      <span className={cn('mr-2 inline-block h-2 w-2 rounded-full', opt.dotClass)} />
                      <span>{opt.label}</span>
                      {active && <CheckCircle2 className="ml-auto h-3.5 w-3.5" />}
                    </Button>
                  )
                })}
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
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


