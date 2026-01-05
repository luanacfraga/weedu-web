import { Badge } from '@/components/ui/badge';
import { ActionStatus } from '@/lib/types/action';
import { cn } from '@/lib/utils';
import { getActionStatusUI } from './action-status-ui';

interface StatusBadgeProps {
  status: ActionStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = getActionStatusUI(status);

  return (
    <Badge
      variant="outline"
      className={cn('whitespace-nowrap font-medium inline-flex items-center gap-1.5', config.badgeClass, className)}
    >
      <span className={cn('h-2 w-2 rounded-full', config.dotClass)} />
      {config.label}
    </Badge>
  );
}
