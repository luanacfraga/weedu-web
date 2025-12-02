import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Building2, Plus, Settings } from 'lucide-react'
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
            className={cn('flex-1', variant === 'compact' && 'h-9 text-sm')}
          >
            <div className="flex items-center gap-2 overflow-hidden">
              <Building2 className="h-4 w-4 flex-shrink-0 text-primary-base" />
              <SelectValue placeholder="Selecione uma empresa">
                {selectedCompany ? (
                  <span className="truncate">{selectedCompany.name}</span>
                ) : (
                  'Selecione uma empresa'
                )}
              </SelectValue>
            </div>
          </SelectTrigger>
          <SelectContent>
            {companies.map((company) => (
              <SelectItem key={company.id} value={company.id}>
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span>{company.name}</span>
                </div>
              </SelectItem>
            ))}
            <div className="my-1 border-t" />
            <SelectItem value="new" className="text-primary-base">
              <div className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                <span className="font-medium">Nova Empresa</span>
              </div>
            </SelectItem>
            <SelectItem value="manage">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span>Gerenciar Empresas</span>
              </div>
            </SelectItem>
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
