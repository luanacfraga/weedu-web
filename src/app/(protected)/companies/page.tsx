'use client'

import { AdminOnly } from '@/components/features/auth/guards/admin-only'
import { EmptyState } from '@/components/shared/feedback/empty-state'
import { ErrorState } from '@/components/shared/feedback/error-state'
import { LoadingScreen } from '@/components/shared/feedback/loading-screen'
import { PageContainer } from '@/components/shared/layout/page-container'
import { PageHeader } from '@/components/shared/layout/page-header'
import { ResponsiveDataTable } from '@/components/shared/table'
import { StandardFilters } from '@/components/shared/filters/standard-filters'
import { Button } from '@/components/ui/button'
import { useCompanies } from '@/lib/services/queries/use-companies'
import { useCompanyFiltersStore } from '@/lib/stores/company-filters-store'
import type { ColumnDef } from '@tanstack/react-table'
import type { Company } from '@/lib/api/endpoints/companies'
import { Building2, Plus, Edit, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useMemo } from 'react'
import { CompanyCard } from './company-card'

export default function CompaniesPage() {
  const router = useRouter()
  const { data: companies = [], isLoading, error, refetch } = useCompanies()
  const { query, setFilter, resetFilters } = useCompanyFiltersStore()

  // Filter companies based on current filters
  const filteredCompanies = useMemo(() => {
    let filtered = companies

    // Apply search query
    if (query) {
      filtered = filtered.filter((company) =>
        company.name.toLowerCase().includes(query.toLowerCase()) ||
        (company.description && company.description.toLowerCase().includes(query.toLowerCase()))
      )
    }

    return filtered
  }, [companies, query])

  const columns = useMemo<ColumnDef<Company>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Nome',
      },
      {
        accessorKey: 'description',
        header: 'Descrição',
        cell: ({ row }) => {
          const description = row.getValue('description') as string | undefined
          return description ? (
            <span className="text-sm text-muted-foreground line-clamp-1">{description}</span>
          ) : (
            <span className="text-sm text-muted-foreground">-</span>
          )
        },
      },
      {
        id: 'actions',
        header: () => <span className="sr-only">Ações</span>,
        cell: ({ row }) => {
          const company = row.original
          return (
            <div className="flex justify-end gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(`/companies/${company.id}/dashboard`)}
                className="h-8 w-8 p-0"
              >
                <Edit className="h-4 w-4" />
                <span className="sr-only">Ver empresa</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-destructive"
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Excluir empresa</span>
              </Button>
            </div>
          )
        },
      },
    ],
    [router]
  )

  const filterConfig = useMemo(() => [
    {
      type: 'search' as const,
      key: 'query',
      label: 'Buscar',
      placeholder: 'Buscar empresas...',
    },
  ], [])

  const filterValues = useMemo(() => ({
    query,
  }), [query])

  if (isLoading) {
    return (
      <AdminOnly>
        <LoadingScreen message="Carregando empresas..." />
      </AdminOnly>
    )
  }

  return (
    <AdminOnly>
      <PageContainer maxWidth="7xl">
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
          <>
            <div className="mb-4">
              <StandardFilters
                config={filterConfig}
                values={filterValues}
                onChange={(newValues) => {
                  if (newValues.query !== undefined) setFilter('query', newValues.query)
                }}
                onClear={resetFilters}
              />
            </div>

            <ResponsiveDataTable
              data={filteredCompanies}
              columns={columns}
              CardComponent={CompanyCard}
              isLoading={false}
              emptyMessage="Nenhuma empresa encontrada"
              getRowId={(company) => company.id}
            />
          </>
        )}
      </PageContainer>
    </AdminOnly>
  )
}
