import { FormLabel } from '@/components/ui/form'
import { Company } from '@/lib/api/endpoints/companies'
import { Building2 } from 'lucide-react'

interface CompanyDisplayProps {
  companyId: string
  companies: Company[]
}

export function CompanyDisplay({ companyId, companies }: CompanyDisplayProps) {
  const company = companies.find((c) => c.id === companyId)

  return (
    <div className="space-y-1">
      <FormLabel className="text-sm">Empresa</FormLabel>
      <div className="flex h-9 items-center gap-2 rounded-md border border-border/60 bg-muted/40 px-3 text-xs text-muted-foreground">
        <Building2 className="h-3.5 w-3.5 text-primary" />
        <span>{company?.name || 'Empresa selecionada'}</span>
      </div>
    </div>
  )
}
