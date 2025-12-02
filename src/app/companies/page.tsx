'use client'

import { AdminOnly } from '@/components/auth/admin-only'
import { BaseLayout } from '@/components/layout/base-layout'
import { DashboardSidebar } from '@/components/layout/dashboard-sidebar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { companiesApi } from '@/lib/api/endpoints/companies'
import { useAuthStore } from '@/lib/stores/auth-store'
import { useCompanyStore } from '@/lib/stores/company-store'
import { AlertCircle, Building2, CheckCircle, Loader2, Plus, Settings } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function CompaniesPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const user = useAuthStore((state) => state.user)
  const { companies, selectedCompany, setCompanies } = useCompanyStore()

  useEffect(() => {
    const loadCompanies = async () => {
      try {
        setLoading(true)
        setError(null)

        const data = await companiesApi.getMyCompanies()
        setCompanies(data || [])
      } catch (err) {
        console.error('Error loading companies:', err)
        setError('Erro ao carregar empresas. Tente novamente.')
      } finally {
        setLoading(false)
      }
    }

    loadCompanies()
  }, [user?.id, setCompanies])

  return (
    <AdminOnly>
      <BaseLayout sidebar={<DashboardSidebar />}>
        <div className="container mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Minhas Empresas</h1>
                <p className="mt-1.5 text-sm text-muted-foreground sm:mt-2">
                  Gerencie suas empresas
                </p>
              </div>
              <Button
                onClick={() => router.push('/companies/new')}
                className="w-full sm:w-auto"
                size="lg"
              >
                <Plus className="mr-2 h-4 w-4" />
                Nova Empresa
              </Button>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 animate-fade-in rounded-lg border border-danger-light bg-danger-lightest p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 flex-shrink-0 text-danger-base" />
                <div className="flex-1">
                  <h3 className="font-semibold text-danger-dark">Erro</h3>
                  <p className="mt-1 text-sm text-danger-base">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary-base" />
                <p className="mt-4 text-sm text-muted-foreground">Carregando empresas...</p>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && companies.length === 0 && (
            <Card className="animate-fade-in">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="rounded-full bg-muted p-6">
                  <Building2 className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="mt-6 text-lg font-semibold">Nenhuma empresa cadastrada</h3>
                <p className="mt-2 text-center text-sm text-muted-foreground">
                  Você ainda não possui empresas cadastradas.
                  <br />
                  Crie sua primeira empresa para gerenciar.
                </p>
                <Button onClick={() => router.push('/companies/new')} className="mt-6" size="lg">
                  <Plus className="mr-2 h-4 w-4" />
                  Criar Primeira Empresa
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Companies Grid */}
          {!loading && !error && companies.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {companies.map((company) => {
                const isSelected = selectedCompany?.id === company.id

                return (
                  <Card key={company.id} className="group relative transition-all hover:shadow-lg">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div className="rounded-lg bg-primary-lightest p-2.5">
                            <Building2 className="h-5 w-5 text-primary-base" />
                          </div>
                          <div>
                            <CardTitle className="text-base">{company.name}</CardTitle>
                            {isSelected && (
                              <div className="mt-1 flex items-center gap-1 text-xs text-primary-base">
                                <CheckCircle className="h-3 w-3" />
                                <span className="font-medium">Ativa</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
                          onClick={() => router.push(`/companies/${company.id}/edit`)}
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-xs">
                        ID: {company.id.slice(0, 8)}...
                      </CardDescription>
                      {company.description && (
                        <p className="mt-3 line-clamp-2 text-xs text-muted-foreground">
                          {company.description}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </BaseLayout>
    </AdminOnly>
  )
}
