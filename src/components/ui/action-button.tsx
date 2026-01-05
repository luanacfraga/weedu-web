import { Button, type ButtonProps } from '@/components/ui/button';
import {
  Edit,
  Trash2,
  Eye,
  Plus,
  type LucideIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';

type ActionType = 'edit' | 'delete' | 'view' | 'create';

interface ActionButtonProps extends Omit<ButtonProps, 'children'> {
  action: ActionType;
  label?: string;
  showLabel?: boolean;
}

const actionConfig: Record<ActionType, {
  icon: LucideIcon;
  defaultLabel: string;
  variant: ButtonProps['variant'];
}> = {
  edit: {
    icon: Edit,
    defaultLabel: 'Editar',
    variant: 'ghost',
  },
  delete: {
    icon: Trash2,
    defaultLabel: 'Deletar',
    variant: 'ghost',
  },
  view: {
    icon: Eye,
    defaultLabel: 'Ver',
    variant: 'ghost',
  },
  create: {
    icon: Plus,
    defaultLabel: 'Criar',
    variant: 'default',
  },
};

export function ActionButton({
  action,
  label,
  showLabel = true,
  variant,
  className,
  ...props
}: ActionButtonProps) {
  const config = actionConfig[action];
  const Icon = config.icon;
  const finalVariant = variant || (action === 'delete' ? 'destructive' : config.variant);
  const finalLabel = label || config.defaultLabel;

  return (
    <Button
      variant={finalVariant}
      className={cn(
        'gap-2',
        !showLabel && 'h-8 w-8 p-0',
        className
      )}
      {...props}
    >
      <Icon className="h-4 w-4" />
      {showLabel && <span>{finalLabel}</span>}
      {!showLabel && <span className="sr-only">{finalLabel}</span>}
    </Button>
  );
}

