import { LoadingSpinner } from './loading-spinner'

interface LoadingScreenProps {
  message?: string
}

/**
 * Tela de loading de página completa
 * Responsabilidade única: Exibir uma tela de carregamento centralizada
 */
export function LoadingScreen({ message = 'Carregando...' }: LoadingScreenProps) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  )
}
