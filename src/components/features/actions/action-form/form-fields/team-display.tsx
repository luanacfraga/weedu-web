import { FormLabel } from '@/components/ui/form'
import { Team } from '@/lib/api/endpoints/teams'
import { Users } from 'lucide-react'

interface TeamDisplayProps {
  teamId: string
  teams: Team[]
}

export function TeamDisplay({ teamId, teams }: TeamDisplayProps) {
  const team = teams.find((t) => t.id === teamId)

  return (
    <div className="space-y-1">
      <FormLabel className="text-sm">Equipe</FormLabel>
      <div className="flex h-9 items-center gap-2 rounded-md border border-border/60 bg-muted/40 px-3 text-xs text-muted-foreground">
        <Users className="h-3.5 w-3.5 text-secondary" />
        <span>{team?.name || 'Equipe vinculada à ação'}</span>
      </div>
    </div>
  )
}
