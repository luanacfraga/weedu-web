import { Flag } from 'lucide-react';
import { ActionPriority } from '@/lib/types/action';
import { cn } from '@/lib/utils';

interface PriorityBadgeProps {
  priority: ActionPriority;
  showLabel?: boolean;
  className?: string;
}

export function PriorityBadge({
  priority,
  showLabel = true,
  className
}: PriorityBadgeProps) {
  const config = {
    [ActionPriority.LOW]: {
      color: 'text-muted-foreground',
      label: 'Baixa',
    },
    [ActionPriority.MEDIUM]: {
      color: 'text-info',
      label: 'Média',
    },
    [ActionPriority.HIGH]: {
      color: 'text-warning',
      label: 'Alta',
    },
    [ActionPriority.URGENT]: {
      color: 'text-destructive',
      label: 'Urgente',
    },
  }[priority];

  if (!config) return null;

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <Flag className={cn('h-3 w-3', config.color)} />
      {showLabel && (
        <span className="text-xs">{config.label}</span>
      )}
    </div>
  );
}

