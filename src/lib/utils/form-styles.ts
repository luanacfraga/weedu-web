import { cn } from '@/lib/utils'

export function getInputClassName(hasError: boolean): string {
  return cn(
    'h-12 text-base transition-all',
    hasError
      ? 'border-destructive focus-visible:ring-destructive'
      : 'border-input focus-visible:border-primary focus-visible:ring-primary/20'
  )
}
