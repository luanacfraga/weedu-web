import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Team } from '@/lib/api/endpoints/teams'
import type { ActionFormData } from '@/lib/validators/action'
import { Building2, Users } from 'lucide-react'
import { type Control } from 'react-hook-form'
import { SELECT_VALUES } from '../action-form.constants'

interface TeamSelectorProps {
  control: Control<ActionFormData>
  teams: Team[]
  selectedCompanyId: string | null
  onTeamChange: (teamId: string | undefined) => void
}

export function TeamSelector({
  control,
  teams,
  selectedCompanyId,
  onTeamChange,
}: TeamSelectorProps) {
  return (
    <FormField
      control={control}
      name="teamId"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-sm">Equipe (Opcional)</FormLabel>
          <Select
            onValueChange={(value) => {
              const teamId = value === SELECT_VALUES.NO_TEAM ? undefined : value
              field.onChange(teamId)
              onTeamChange(teamId)
            }}
            value={field.value || SELECT_VALUES.NO_TEAM}
            disabled={!selectedCompanyId || teams.length === 0}
          >
            <FormControl>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="Selecione uma equipe" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value={SELECT_VALUES.NO_TEAM} className="text-sm">
                <div className="flex items-center gap-2">
                  <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground">Sem equipe (ação da empresa)</span>
                </div>
              </SelectItem>
              {teams.map((team) => (
                <SelectItem key={team.id} value={team.id} className="text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="h-3.5 w-3.5 text-secondary" />
                    <span>{team.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage className="text-xs" />
        </FormItem>
      )}
    />
  )
}
