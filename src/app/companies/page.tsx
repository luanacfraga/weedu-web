'use client'

import { AdminOnly } from '@/components/features/auth/guards/admin-only'
import { BaseLayout } from '@/components/layout/base-layout'
import { DashboardSidebar } from '@/components/layout/dashboard-sidebar'
import { CompanyCard } from '@/components/shared/data/company-card'
import { EmptyState } from '@/components/shared/feedback/empty-state'
import { ErrorState } from '@/components/shared/feedback/error-state'
import { LoadingScreen } from '@/components/shared/feedback/loading-screen'
import { PageContainer } from '@/components/shared/layout/page-container'
import { PageHeader } from '@/components/shared/layout/page-header'
import { Button } from '@/components/ui/button'
import { useCompanies } from '@/lib/services/queries/use-companies'
import { useCompanyStore } from '@/lib/stores/company-store'
import { Building2, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function CompaniesPage() {
  const router = useRouter()
  const { data: companies = [], isLoading, error, refetch } = useCompanies()
  const { selectedCompany } = useCompanyStore()

  if (isLoading) {
    return (
      <AdminOnly>
        <BaseLayout sidebar={<DashboardSidebar />}>
          <LoadingScreen message="Carregando empresas..." />
        </BaseLayout>
      </AdminOnly>
    )
  }

  return (
    <AdminOnly>
      <BaseLayout sidebar={<DashboardSidebar />}>
        <PageContainer maxWidth="5xl">
          <PageHeader
            title="Minhas Empresas"
            description="Gerencie suas empresas"
            action={
              <Button
                onClick={() => router.push('/companies/new')}
                className="gap-1.5 font-medium sm:gap-2"
              >
                <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span>Nova Empresa</span>
              </Button>
            }
          />

          {error && (
            <div className="mb-6">
              <ErrorState message="Erro ao carregar empresas" onRetry={() => refetch()} />
            </div>
          )}

          {!error && companies.length === 0 && (
            <EmptyState
              icon={Building2}
              title="Nenhuma empresa cadastrada"
              description="Você ainda não possui empresas cadastradas. Crie sua primeira empresa para gerenciar."
              action={{
                label: 'Criar Primeira Empresa',
                onClick: () => router.push('/companies/new'),
              }}
            />
          )}

          {!error && companies.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {companies.map((company) => (
                <CompanyCard
                  key={company.id}
                  id={company.id}
                  name={company.name}
                  description={company.description}
                  isSelected={selectedCompany?.id === company.id}
                  onSelect={() => {
                    if (selectedCompany?.id !== company.id) {
                    }
                  }}
                />
              ))}
            </div>
          )}
        </PageContainer>
      </BaseLayout>
    </AdminOnly>
  )
}
