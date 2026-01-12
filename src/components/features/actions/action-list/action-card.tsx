import { Card, CardContent } from '@/components/ui/card'
import { PriorityBadge } from '@/components/ui/priority-badge'
import { StatusBadge } from '@/components/ui/status-badge'
import { Action } from '@/lib/types/action'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { Calendar, UserCircle2 } from 'lucide-react'
import { BlockedBadge } from '../shared/blocked-badge'
import { LateIndicator } from '../shared/late-indicator'

interface ActionCardProps {
  data: Action
  onView?: () => void
  onEdit?: () => void // Optional if we want direct edit from card
  onDelete?: () => void // Optional if we want direct delete from card
}

export function ActionCard({ data, onView }: ActionCardProps) {
  // If onView is not passed, maybe we can try to infer it or just make the card clickable if passed
  // However, the ResponsiveDataTable passes `data` only currently.
  // We might need to pass handlers to ResponsiveDataTable or context.
  // For now let's assume the parent container will handle navigation if we click the card?
  // Or we can use a wrapper that injects handlers.

  // Since ActionTable has the handlers (onView, onDelete), we should probably pass them down.
  // But ResponsiveDataTable interface `CardComponent` signature is `(props: { data: T }) => ReactNode`.
  // It doesn't accept extra props easily unless we wrap it.

  // We will handle the click in the container mapping or make the card clickable.

  return (
    <Card
      className={cn(
        'cursor-pointer overflow-hidden transition-colors duration-200 hover:border-primary/50 active:scale-[0.98]',
        data.isBlocked && 'border-muted-foreground/20 bg-muted/40 hover:border-muted-foreground/30'
      )}
      onClick={onView}
    >
      <CardContent className="space-y-3 p-4">
        {/* Header: Title + Priority */}
        <div className="flex items-start justify-between gap-3">
          <h3 className="line-clamp-2 flex-1 text-sm font-semibold leading-tight">{data.title}</h3>
          <PriorityBadge priority={data.priority} showLabel={false} />
        </div>

        {/* Status + Indicators row */}
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={data.status} />
          <LateIndicator isLate={data.isLate} />
          <BlockedBadge isBlocked={data.isBlocked} reason={data.blockedReason} />
        </div>

        {/* Footer info: Responsible + Date */}
        <div className="mt-2 flex items-center justify-between border-t border-border/50 pt-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <UserCircle2 className="h-3.5 w-3.5" />
            <span className="max-w-[120px] truncate">
              {data.responsible?.firstName
                ? `${data.responsible.firstName} ${data.responsible.lastName?.[0] || ''}.`
                : '—'}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            <span>{format(new Date(data.estimatedEndDate), 'dd/MM')}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
