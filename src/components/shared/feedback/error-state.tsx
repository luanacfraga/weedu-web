import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ErrorStateProps {
  title?: string
  message: string
  onRetry?: () => void
  retryLabel?: string
  className?: string
}

export function ErrorState({
  title = 'Erro',
  message,
  onRetry,
  retryLabel = 'Tentar novamente',
  className,
}: ErrorStateProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <AlertCircle className="h-4 w-4 text-danger-base" />
      <div className="flex-1">
        {title && <p className="text-sm font-medium text-danger-base">{title}</p>}
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          {retryLabel}
        </Button>
      )}
    </div>
  )
}
