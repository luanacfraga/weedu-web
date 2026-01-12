import { cn } from '@/lib/utils'
import { AlertCircle } from 'lucide-react'

interface LateIndicatorProps {
  isLate: boolean
  className?: string
}

export function LateIndicator({ isLate, className }: LateIndicatorProps) {
  if (!isLate) return null

  return (
    <div
      className={cn(
        'flex items-center gap-1 rounded-md bg-destructive/10 px-2 py-1 text-xs font-medium text-destructive',
        className
      )}
      title="Em atraso"
    >
      <AlertCircle className="h-3.5 w-3.5" />
      <span>Em atraso</span>
    </div>
  )
}
