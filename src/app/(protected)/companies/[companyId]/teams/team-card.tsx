import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import type { Team } from '@/lib/api/endpoints/teams'
import { Pencil, Users } from 'lucide-react'

interface TeamCardProps {
  item: Team
  onEdit?: (team: Team) => void
  onManageMembers?: (team: Team) => void
}

export function TeamCard({ item, onEdit }: TeamCardProps) {
  return (
    <Card className="group/card relative overflow-hidden border border-border/60 bg-card/95 p-4 shadow-sm backdrop-blur-sm transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:border-border/80 hover:bg-card hover:shadow-md">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex flex-1 items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <h3 className="text-base font-semibold">{item.name}</h3>
          </div>
          <div className="flex gap-1 opacity-0 transition-opacity group-hover/card:opacity-100">
            {onEdit && (
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(item)}>
                <Pencil className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Description */}
        {item.description && (
          <p className="line-clamp-2 text-sm text-muted-foreground">{item.description}</p>
        )}

        {/* IA Context */}
        {item.iaContext && (
          <div className="border-t border-border/40 pt-2">
            <p className="mb-1 text-xs text-muted-foreground">Contexto de IA:</p>
            <p className="line-clamp-2 text-xs text-foreground">{item.iaContext}</p>
          </div>
        )}
      </div>
    </Card>
  )
}
