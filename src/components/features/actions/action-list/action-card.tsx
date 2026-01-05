import { Action } from '@/lib/types/action';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import { PriorityBadge } from '@/components/ui/priority-badge';
import { StatusBadge } from '@/components/ui/status-badge';
import { LateIndicator } from '../shared/late-indicator';
import { BlockedBadge } from '../shared/blocked-badge';
import { ActionButton } from '@/components/ui/action-button';
import { Calendar, UserCircle2 } from 'lucide-react';

interface ActionCardProps {
  data: Action;
  onView?: () => void;
  onEdit?: () => void; // Optional if we want direct edit from card
  onDelete?: () => void; // Optional if we want direct delete from card
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
      className="overflow-hidden hover:border-primary/50 transition-colors cursor-pointer active:scale-[0.98] duration-200"
      onClick={onView}
    >
      <CardContent className="p-4 space-y-3">
        {/* Header: Title + Priority */}
        <div className="flex justify-between items-start gap-3">
            <h3 className="font-semibold text-sm line-clamp-2 leading-tight flex-1">
              {data.title}
            </h3>
            <PriorityBadge priority={data.priority} showLabel={false} />
        </div>

        {/* Status + Indicators row */}
        <div className="flex items-center gap-2 flex-wrap">
          <StatusBadge status={data.status} />
          <LateIndicator isLate={data.isLate} />
          <BlockedBadge isBlocked={data.isBlocked} reason={data.blockedReason} />
        </div>

        {/* Footer info: Responsible + Date */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/50 mt-2">
            <div className="flex items-center gap-1.5">
                <UserCircle2 className="h-3.5 w-3.5" />
                <span className="truncate max-w-[120px]">
                    {data.responsible?.firstName ? `${data.responsible.firstName} ${data.responsible.lastName?.[0] || ''}.` : '—'}
                </span>
            </div>
            <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                <span>{format(new Date(data.estimatedEndDate), 'dd/MM')}</span>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}

