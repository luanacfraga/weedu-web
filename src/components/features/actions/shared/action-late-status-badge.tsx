import { Badge } from '@/components/ui/badge'
import { ActionLateStatus } from '@/lib/types/action'
import { AlertCircle, CheckCircle2, Clock } from 'lucide-react'

interface ActionLateStatusBadgeProps {
  lateStatus: ActionLateStatus | null
  size?: 'sm' | 'md'
}

const lateStatusConfig: Record<
  ActionLateStatus,
  {
    label: string
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
    className: string
  }
> = {
  [ActionLateStatus.LATE_TO_START]: {
    label: 'Para iniciar',
    icon: Clock,
    className: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/40 dark:text-red-50',
  },
  [ActionLateStatus.LATE_TO_FINISH]: {
    label: 'Para terminar',
    icon: AlertCircle,
    className:
      'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/40 dark:text-orange-50',
  },
  [ActionLateStatus.COMPLETED_LATE]: {
    label: 'Concluída com atraso',
    icon: CheckCircle2,
    className:
      'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/40 dark:text-yellow-50',
  },
}

export function ActionLateStatusBadge({ lateStatus, size = 'md' }: ActionLateStatusBadgeProps) {
  if (!lateStatus) return null

  const config = lateStatusConfig[lateStatus]
  const Icon = config.icon
  const iconSize = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'
  const textSize = size === 'sm' ? 'text-[10px]' : 'text-xs'
  const padding = size === 'sm' ? 'px-1.5 py-0.5' : 'px-2 py-0.5'

  return (
    <Badge
      variant="outline"
      className={`${config.className} ${textSize} ${padding} inline-flex items-center gap-1 border`}
    >
      <Icon className={iconSize} />
      <span>{config.label}</span>
    </Badge>
  )
}


