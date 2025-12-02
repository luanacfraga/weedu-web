'use client'

import { useRouter } from 'next/navigation'
import { usePermissions } from '@/lib/hooks/use-permissions'
import { useCompanyData } from '@/lib/hooks/data/use-company-data'
import { LoadingSpinner } from '@/components/shared/feedback/loading-spinner'
import { ErrorState } from '@/components/shared/feedback/error-state'
import { CompanySelectorView } from './company-selector-view'
import { EmptyCompanyState } from './empty-company-state'
import { cn } from '@/lib/utils'

interface CompanySelectorProps {
  className?: string
  showLabel?: boolean
  variant?: 'default' | 'compact'
}

/**
 * Container do Company Selector
 * Responsabilidade única: Orquestrar lógica e renderizar estado apropriado
 *
 * Aplica SRP: Separa lógica de negócio (hook) de apresentação (componentes)
 * Aplica OCP: Extensível através de variantes sem modificar código
 * Aplica DIP: Depende de abstrações (hooks e componentes de apresentação)
 */
export function CompanySelector({
  className,
  showLabel = true,
  variant = 'default',
}: CompanySelectorProps) {
  const router = useRouter()
  const { isAdmin } = usePermissions()
  const { companies, selectedCompany, isLoading, error, selectCompany } = useCompanyData()

  // Não renderizar se não for admin
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

  // Estado de loading
  if (isLoading) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <LoadingSpinner size="sm" />
        {showLabel && variant === 'default' && (
          <span className="text-sm text-muted-foreground">Carregando...</span>
        )}
      </div>
    )
  }

  // Estado de erro
  if (error) {
    return (
      <ErrorState
        message="Erro ao carregar empresas"
        onRetry={() => router.push('/companies')}
        retryLabel="Gerenciar"
        className={className}
      />
    )
  }

  // Sem empresas
  if (companies.length === 0) {
    return (
      <EmptyCompanyState
        onCreateCompany={() => router.push('/companies/new')}
        showLabel={showLabel}
        variant={variant}
        className={className}
      />
    )
  }

  // Renderizar selector com empresas
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
