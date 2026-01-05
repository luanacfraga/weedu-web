import { Badge } from '@/components/ui/badge';
import { ActionPriority } from '@/lib/types/action';
import { cn } from '@/lib/utils';
import { Flag } from 'lucide-react';
import { getActionPriorityUI } from './action-priority-ui';

interface PriorityBadgeProps {
  priority: ActionPriority;
  className?: string;
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const config = getActionPriorityUI(priority);

  return (
    <Badge
      variant="outline"
      className={cn(
        'whitespace-nowrap font-medium inline-flex items-center gap-1.5',
        config.pillClass,
        className
      )}
    >
      <Flag className={cn('h-3.5 w-3.5', config.flagClass)} />
      {config.label}
    </Badge>
  );
}
