import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CompanySelectorViewProps {
  companies: any[]
  selectedCompany: any
  onCompanyChange: (companyId: string) => void
  onManage: () => void
  showLabel: boolean
  variant: 'default' | 'compact'
  className?: string
}

/**
 * Componente de apresentação do Company Selector
 * Responsabilidade única: Renderizar UI do selector
 *
 * Aplica SRP: Componente puro de apresentação
 * Aplica ISP: Interface específica com apenas props necessárias
 */
export function CompanySelectorView({
  companies,
  selectedCompany,
  onCompanyChange,
  onManage,
  showLabel,
  variant,
  className,
}: CompanySelectorViewProps) {
  const isCompact = variant === 'compact'

  return (
    <div className={cn('space-y-2', className)}>
      {showLabel && variant === 'default' && (
        <label className="text-xs font-medium text-muted-foreground">
          Empresa Atual
        </label>
      )}
      <div className="flex gap-2">
        <Select value={selectedCompany?.id || ''} onValueChange={onCompanyChange}>
          <SelectTrigger
            className={cn(
              'h-11 w-full',
              isCompact && 'h-9 text-sm min-w-[180px]'
            )}
          >
            <SelectValue placeholder="Selecione uma empresa" />
          </SelectTrigger>
          <SelectContent
            className="min-w-[220px]"
            align={isCompact ? 'end' : 'start'}
            sideOffset={4}
            style={{ zIndex: 100 }}
          >
            {companies.length > 0 && (
              <>
                {companies.map((company) => (
                  <SelectItem key={company.id} value={company.id}>
                    {company.name}
                  </SelectItem>
                ))}
                <div className="my-1 border-t border-border" />
              </>
            )}
            <SelectItem value="new">Nova Empresa</SelectItem>
            <SelectItem value="manage">Gerenciar Empresas</SelectItem>
          </SelectContent>
        </Select>
        {variant === 'default' && (
          <Button
            variant="outline"
            size="icon"
            onClick={onManage}
            title="Gerenciar empresas"
          >
            <Settings className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
