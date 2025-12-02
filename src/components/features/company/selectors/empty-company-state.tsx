import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EmptyCompanyStateProps {
  onCreateCompany: () => void
  showLabel: boolean
  variant: 'default' | 'compact'
  className?: string
}

/**
 * Componente de estado vazio (sem empresas)
 * Responsabilidade única: Renderizar UI quando não há empresas
 *
 * Aplica SRP: Componente focado em um único estado
 */
export function EmptyCompanyState({
  onCreateCompany,
  showLabel,
  variant,
  className,
}: EmptyCompanyStateProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {showLabel && variant === 'default' && (
        <label className="text-xs font-medium text-muted-foreground">Empresa</label>
      )}
      <Button
        variant="outline"
        size={variant === 'compact' ? 'sm' : 'default'}
        onClick={onCreateCompany}
        className="w-full justify-start"
      >
        <Plus className="mr-2 h-4 w-4" />
        Criar Primeira Empresa
      </Button>
    </div>
  )
}
