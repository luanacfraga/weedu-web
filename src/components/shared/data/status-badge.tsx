import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  status: string
  label?: string
  className?: string
}

const statusConfig: Record<string, { label: string; color: string }> = {
  ACTIVE: {
    label: 'Ativo',
    color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
  },
  INACTIVE: {
    label: 'Inativo',
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
  },
  SUSPENDED: {
    label: 'Suspenso',
    color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
  },
  PENDING: {
    label: 'Pendente',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
  },
  INVITED: {
    label: 'Convidado',
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
  },
  REJECTED: {
    label: 'Rejeitado',
    color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
  },
  REMOVED: {
    label: 'Removido',
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
  },
}

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  const config = statusConfig[status] || {
    label: label || status,
    color: 'bg-muted text-muted-foreground',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium shadow-sm backdrop-blur-sm transition-all duration-200',
        config.color,
        className
      )}
    >
      <div className={cn('h-1.5 w-1.5 rounded-full', status === 'ACTIVE' ? 'bg-green-500' : status === 'INVITED' ? 'bg-yellow-500' : status === 'SUSPENDED' ? 'bg-orange-500' : status === 'REJECTED' ? 'bg-red-500' : 'bg-gray-500')} />
      {config.label}
    </span>
  )
}

