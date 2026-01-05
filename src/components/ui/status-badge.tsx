import { Badge } from '@/components/ui/badge';
import { Circle, CircleDot, CheckCircle2 } from 'lucide-react';
import { ActionStatus } from '@/lib/types/action';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: ActionStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = {
    [ActionStatus.TODO]: {
      variant: 'muted' as const,
      icon: Circle,
      label: 'Pendente',
      dotClass: 'currentColor',
    },
    [ActionStatus.IN_PROGRESS]: {
      variant: 'info' as const,
      icon: CircleDot,
      label: 'Em Andamento',
      dotClass: 'currentColor',
    },
    [ActionStatus.DONE]: {
      variant: 'success' as const,
      icon: CheckCircle2,
      label: 'Concluído',
      dotClass: 'currentColor',
    },
  }[status];

  // Fallback for unknown status
  if (!config) {
    return (
      <Badge variant="outline" className={className}>
        {status}
      </Badge>
    );
  }

  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className={cn('gap-1.5', className)}>
      <Icon className={cn('h-3 w-3', config.dotClass)} />
      {config.label}
    </Badge>
  );
}

