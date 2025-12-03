import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface ActivityItemProps {
  icon?: ReactNode
  title: string
  description?: string
  time?: string
  color?: 'green' | 'blue' | 'purple' | 'orange' | 'red'
  className?: string
}

const colorClasses = {
  green: 'bg-green-500',
  blue: 'bg-blue-500',
  purple: 'bg-purple-500',
  orange: 'bg-orange-500',
  red: 'bg-red-500',
}

export function ActivityItem({
  icon,
  title,
  description,
  time,
  color = 'green',
  className,
}: ActivityItemProps) {
  return (
    <div className={cn('flex items-center gap-4', className)}>
      {icon || <div className={cn('h-2 w-2 flex-shrink-0 rounded-full', colorClasses[color])} />}
      <div className="min-w-0 flex-1 space-y-1">
        <p className="truncate text-sm font-medium leading-none">{title}</p>
        {description && <p className="truncate text-sm text-muted-foreground">{description}</p>}
        {time && <p className="text-xs text-muted-foreground">{time}</p>}
      </div>
    </div>
  )
}
