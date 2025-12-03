'use client'

import { AdminOnly } from '@/components/features/auth/guards/admin-only'
import { HeaderMenu } from '@/components/layout/header-menu'
import { LoadingScreen } from '@/components/shared/feedback/loading-screen'
import { PageContainer } from '@/components/shared/layout/page-container'
import { PageHeader } from '@/components/shared/layout/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCompanies } from '@/lib/services/queries/use-companies'
import { useAuthStore } from '@/lib/stores/auth-store'
import { useCompanyStore } from '@/lib/stores/company-store'
import type { Company } from '@/lib/types/api'
import { AlertCircle, ArrowRight, Building2, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function SelectCompanyPage() {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const { data: companies = [], isLoading, error } = useCompanies()
  const { selectedCompany, selectCompany } = useCompanyStore()

  const handleSelectCompany = (company: Company) => {
    selectCompany(company)
    router.push('/dashboard')
  }

  const handleCompanySelect = (companyId: string) => {
    const company = companies.find((c) => c.id === companyId)
    if (company) {
      handleSelectCompany(company)
    }
  }

  if (isLoading) {
    return (
      <AdminOnly>
        <div className="flex min-h-screen flex-col bg-background">
          <HeaderMenu />
          <LoadingScreen message="Carregando empresas..." />
        </div>
      </AdminOnly>
    )
  }

  return (
    <AdminOnly>
      <div className="flex min-h-screen flex-col bg-background">
        <HeaderMenu />
        <div className="flex flex-1 items-center justify-center pt-16 sm:pt-20">
          <PageContainer maxWidth="4xl" className="py-8">
            <PageHeader
              title={`Olá, ${user?.name?.split(' ')[0] || 'Admin'}`}
              description="Selecione ou crie uma empresa para gerenciar"
              className="mb-12 text-center sm:mb-16"
            />

            {error && (
              <div className="mb-6 rounded-lg border border-destructive/50 bg-destructive/10 p-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  <p className="text-sm text-destructive">
                    Erro ao carregar empresas. Tente novamente.
                  </p>
                </div>
              </div>
            )}

            {!error && (
              <div className="grid gap-6 sm:gap-8 md:grid-cols-2">
                <Card className="border border-border bg-card transition-all hover:border-primary/50 hover:shadow-md">
                  <CardContent className="flex flex-col p-6 sm:p-8">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg border border-border bg-muted/50 sm:mb-6">
                      <Plus className="h-5 w-5 text-foreground" />
                    </div>
                    <CardTitle className="mb-2 text-lg font-semibold sm:text-xl">
                      Nova Empresa
                    </CardTitle>
                    <CardDescription className="mb-4 text-sm sm:mb-6">
                      Crie uma nova empresa para começar a gerenciar sua equipe
                    </CardDescription>
                    <Button
                      onClick={() => router.push('/companies/new?redirect=/select-company')}
                      variant="outline"
                      size="lg"
                      className="mt-auto w-full"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Cadastrar
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border border-border bg-card">
                  <CardContent className="p-6 sm:p-8">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg border border-border bg-muted/50 sm:mb-6">
                      <Building2 className="h-5 w-5 text-foreground" />
                    </div>
                    <CardTitle className="mb-2 text-lg font-semibold sm:text-xl">
                      Selecionar Empresa
                    </CardTitle>
                    <CardDescription className="mb-4 text-sm sm:mb-6">
                      Escolha uma empresa existente
                    </CardDescription>

                    {companies.length === 0 ? (
                      <div className="py-6 text-center sm:py-8">
                        <p className="text-sm text-muted-foreground">Nenhuma empresa cadastrada</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <Select
                          value={selectedCompany?.id || ''}
                          onValueChange={handleCompanySelect}
                        >
                          <SelectTrigger className="h-11 w-full">
                            <SelectValue placeholder="Selecione uma empresa" />
                          </SelectTrigger>
                          <SelectContent>
                            {companies.map((company) => (
                              <SelectItem key={company.id} value={company.id}>
                                {company.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Button
                          onClick={() => {
                            if (selectedCompany) {
                              handleSelectCompany(selectedCompany)
                            }
                          }}
                          disabled={!selectedCompany}
                          className="w-full"
                          size="lg"
                        >
                          {selectedCompany ? (
                            <>
                              Continuar
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </>
                          ) : (
                            'Selecione uma empresa'
                          )}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </PageContainer>
        </div>
      </div>
    </AdminOnly>
  )
}
