'use client'

import { useRouter } from 'next/navigation'
import { Building2, Settings } from 'lucide-react'

import { LoadingSpinner } from '@/components/shared/feedback/loading-spinner'
import { ErrorState } from '@/components/shared/feedback/error-state'
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select'
import { usePermissions } from '@/lib/hooks/use-permissions'
import { useCompanyData } from '@/lib/hooks/data/use-company-data'
import { CompanySelectorView } from './company-selector-view'
import { EmptyCompanyState } from './empty-company-state'
import { cn } from '@/lib/utils'

interface CompanySelectorProps {
  className?: string
  showLabel?: boolean
  variant?: 'default' | 'compact'
  isCollapsed?: boolean
}

export function CompanySelector({
  className,
  showLabel = true,
  variant = 'default',
  isCollapsed = false,
}: CompanySelectorProps) {
  const router = useRouter()
  const { isAdmin } = usePermissions()
  const { companies, selectedCompany, isLoading, error, selectCompany } = useCompanyData()

  if (!isAdmin) {
    return null
  }

  const handleCompanyChange = (companyId: string) => {
    if (companyId === 'new') {
      router.push('/companies/new')
      return
    }

    if (companyId === 'manage') {
      router.push('/companies')
      return
    }

    const company = companies.find((c) => c.id === companyId)
    if (company) {
      selectCompany(company)
    }
  }

  if (isLoading) {
    return (
      <div className={cn('flex items-center justify-center gap-2', isCollapsed ? 'px-0' : 'px-1', className)}>
        <LoadingSpinner size="sm" />
        {!isCollapsed && showLabel && variant === 'default' && (
          <span className="text-xs text-muted-foreground truncate">Carregando...</span>
        )}
      </div>
    )
  }

  if (error) {
    return (
      <div className={cn('px-1', className)}>
        <ErrorState
          message="Erro"
          onRetry={() => router.push('/companies')}
          retryLabel="Tentar"
          className="flex-col items-start gap-1"
        />
      </div>
    )
  }

  if (companies.length === 0) {
    if (isCollapsed) {
      return (
        <div className={cn('flex items-center justify-center', className)}>
          <Building2 className="h-5 w-5 text-muted-foreground" />
        </div>
      )
    }
    return (
      <EmptyCompanyState
        onCreateCompany={() => router.push('/companies/new')}
        showLabel={showLabel}
        variant={variant}
        className={className}
      />
    )
  }

  if (isCollapsed) {
    return (
      <div className={cn('flex items-center justify-center w-full', className)}>
        <Select value={selectedCompany?.id || ''} onValueChange={handleCompanyChange}>
          <SelectTrigger className="h-10 w-10 rounded-lg border-0 bg-transparent p-0 hover:bg-muted/50 hover:border-0 hover:ring-0 focus:ring-0 focus:ring-offset-0 transition-all duration-200 [&>span]:!hidden [&_svg:last-child]:!hidden flex items-center justify-center [&>svg:first-child]:mx-auto">
            <Building2 className={cn('h-5 w-5 transition-colors', selectedCompany ? 'text-primary' : 'text-muted-foreground')} />
          </SelectTrigger>
          <SelectContent className="min-w-[220px] z-[100]">
            {companies.map((company) => {
              const isSelected = selectedCompany?.id === company.id
              return (
                <SelectItem key={company.id} value={company.id}>
                  <div className="flex items-center gap-2 min-w-0">
                    <Building2
                      className={cn(
                        'h-4 w-4 flex-shrink-0',
                        isSelected ? 'text-primary' : 'text-muted-foreground'
                      )}
                    />
                    <span className={cn('truncate', isSelected && 'font-medium')}>
                      {company.name}
                    </span>
                    {isSelected && (
                      <span className="ml-auto h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                    )}
                  </div>
                </SelectItem>
              )
            })}
            <div className="my-1 border-t border-border" />
            <SelectItem value="new">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                <span>Nova Empresa</span>
              </div>
            </SelectItem>
            <SelectItem value="manage">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                <span>Gerenciar Empresas</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    )
  }

  return (
    <CompanySelectorView
      companies={companies}
      selectedCompany={selectedCompany}
      onCompanyChange={handleCompanyChange}
      onManage={() => router.push('/companies')}
      showLabel={showLabel}
      variant={variant}
      className={className}
    />
  )
}
