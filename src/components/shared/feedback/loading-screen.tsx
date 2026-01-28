import { LoadingSpinner } from './loading-spinner'

interface LoadingScreenProps {
  message?: string
  icon?: 'loader' | 'logo'
  variant?: 'default' | 'muted'
  label?: string
}

export function LoadingScreen({
  message = 'Carregando...',
  icon = 'loader',
  variant = 'default',
  label,
}: LoadingScreenProps) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-b from-background via-background to-muted/30 px-4">
      <div className="absolute -right-40 -top-40 h-80 w-80 animate-blob rounded-full bg-primary/15 opacity-40 blur-[100px]" />
      <div className="animation-delay-2000 absolute -bottom-32 -left-32 h-96 w-96 animate-blob rounded-full bg-secondary/15 opacity-40 blur-[120px]" />
      <div className="animation-delay-4000 absolute right-1/3 top-1/3 h-64 w-64 animate-blob rounded-full bg-primary/10 opacity-30 blur-[80px]" />

      <div className="relative w-full max-w-sm rounded-2xl border border-border/50 bg-card/80 p-8 text-center shadow-lg backdrop-blur-md">
        <div className="mx-auto flex items-center justify-center">
          <LoadingSpinner size="lg" icon={icon} variant={variant} label={label ?? message} />
        </div>
        <p className="mt-5 text-sm font-medium text-foreground">{message}</p>
        <p className="mt-1 text-xs text-muted-foreground">Isso pode levar alguns segundos.</p>
      </div>
    </div>
  )
}
