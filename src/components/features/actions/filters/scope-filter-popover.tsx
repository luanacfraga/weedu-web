'use client'

import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useAuth } from '@/lib/hooks/use-auth'
import { useCompany } from '@/lib/hooks/use-company'
import { usePermissions } from '@/lib/hooks/use-permissions'
import { useTeamsByCompany } from '@/lib/services/queries/use-teams'
import { useActionFiltersStore } from '@/lib/stores/action-filters-store'
import { ActionScopeFilter, TEAM_FILTER_NONE } from '@/lib/types/action'
import { cn } from '@/lib/utils'
import { CheckCircle2, Users } from 'lucide-react'
import { useMemo, useState } from 'react'

export function ScopeFilterPopover() {
  const { user } = useAuth()
  const { selectedCompany } = useCompany()
  const { isAdmin, isManager } = usePermissions()
  const filters = useActionFiltersStore()
  const [open, setOpen] = useState(false)

  const { data: teamsData } = useTeamsByCompany(selectedCompany?.id || '')
  const allTeams = teamsData?.data || []

  const availableTeams = useMemo(() => {
    if (!selectedCompany?.id) return []
    if (isManager) {
      return allTeams.filter((team) => team.managerId === user?.id)
    }
    return allTeams
  }, [allTeams, isManager, user?.id, selectedCompany?.id])

  const hasSingleTeam = isManager && availableTeams.length === 1

  if (hasSingleTeam || (!isAdmin && !isManager)) {
    return null
  }

  const getScopeLabel = () => {
    if (filters.scopeType === ActionScopeFilter.ENTIRE_COMPANY) {
      return 'Toda a empresa'
    }
    if (filters.scopeType === ActionScopeFilter.ALL_MY_TEAMS) {
      return 'Todas as minhas equipes'
    }
    if (filters.scopeType === ActionScopeFilter.SPECIFIC_TEAM && filters.selectedTeamId) {
      const team = availableTeams.find((t) => t.id === filters.selectedTeamId)
      return team?.name || 'Equipe'
    }
    return 'Escopo'
  }

  const isActive = filters.scopeType !== null

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            'h-9 text-xs font-medium transition-all',
            'border-border/50 bg-background/80 hover:bg-accent/70 hover:border-border',
            'shadow-sm',
            isActive &&
              'border-primary/60 bg-primary/10 text-primary hover:bg-primary/15 shadow-primary/10'
          )}
        >
          <Users className="mr-1.5 h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{getScopeLabel()}</span>
          {isActive && (
            <span className="ml-1.5 inline-flex h-5 min-w-[20px] shrink-0 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
              1
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[240px] p-0" align="start">
        <div className="p-2">
          <div className="space-y-1">
            {isAdmin && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'w-full justify-start text-xs font-normal',
                    filters.scopeType === ActionScopeFilter.ENTIRE_COMPANY &&
                      'bg-primary/10 text-primary'
                  )}
                  onClick={() => {
                    filters.setFilter('scopeType', ActionScopeFilter.ENTIRE_COMPANY)
                    filters.setFilter('selectedTeamId', null)
                    setOpen(false)
                  }}
                >
                  Toda a empresa
                  {filters.scopeType === ActionScopeFilter.ENTIRE_COMPANY && (
                    <CheckCircle2 className="ml-auto h-3.5 w-3.5 opacity-50" />
                  )}
                </Button>
              </>
            )}

            {isManager && availableTeams.length > 1 && (
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  'w-full justify-start text-xs font-normal',
                  filters.scopeType === ActionScopeFilter.ALL_MY_TEAMS &&
                    'bg-primary/10 text-primary'
                )}
                onClick={() => {
                  filters.setFilter('scopeType', ActionScopeFilter.ALL_MY_TEAMS)
                  filters.setFilter('selectedTeamId', null)
                  setOpen(false)
                }}
              >
                Todas as minhas equipes
                {filters.scopeType === ActionScopeFilter.ALL_MY_TEAMS && (
                  <CheckCircle2 className="ml-auto h-3.5 w-3.5 opacity-50" />
                )}
              </Button>
            )}

            {availableTeams.length > 0 && (
              <div className="my-1 h-px bg-muted" />
            )}

            {availableTeams.map((team) => {
              const isActive =
                filters.scopeType === ActionScopeFilter.SPECIFIC_TEAM &&
                filters.selectedTeamId === team.id
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
                    filters.setFilter('scopeType', ActionScopeFilter.SPECIFIC_TEAM)
                    filters.setFilter('selectedTeamId', team.id)
                    setOpen(false)
                  }}
                >
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 shrink-0 text-muted-foreground" />
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
  )
}
