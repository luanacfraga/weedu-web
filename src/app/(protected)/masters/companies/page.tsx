'use client'

import { MasterOnly } from '@/components/features/auth/guards/master-only'
import { EmptyState } from '@/components/shared/feedback/empty-state'
import { ErrorState } from '@/components/shared/feedback/error-state'
import { LoadingScreen } from '@/components/shared/feedback/loading-screen'
import { PageContainer } from '@/components/shared/layout/page-container'
import { PageHeader } from '@/components/shared/layout/page-header'
import { ResponsiveDataTable } from '@/components/shared/table/responsive-data-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { ActiveCompanyWithPlan } from '@/lib/api/endpoints/companies'
import {
  useActiveCompaniesWithPlans,
  useSetCompanyBlocked,
  useUpdateCompanyPlan,
} from '@/lib/services/queries/use-companies'
import { usePlans } from '@/lib/services/queries/use-plans'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Building2, Lock, RefreshCw, Unlock, User } from 'lucide-react'
import { toast } from 'sonner'

export default function MasterCompaniesPage() {
  const { data: companies = [], isLoading, isFetching, error, refetch } =
    useActiveCompaniesWithPlans()
  const { data: plans = [] } = usePlans()
  const updatePlan = useUpdateCompanyPlan()
  const setBlocked = useSetCompanyBlocked()

  const handleChangePlan = async (companyId: string, planId: string) => {
    try {
      await updatePlan.mutateAsync({ companyId, planId })
      toast.success('Plano alterado com sucesso')
    } catch {
      toast.error('Erro ao alterar plano')
    }
  }

  const handleToggleBlock = async (companyId: string, currentlyBlocked: boolean) => {
    try {
      await setBlocked.mutateAsync({ companyId, blocked: !currentlyBlocked })
      toast.success(
        currentlyBlocked ? 'Acesso da empresa liberado' : 'Acesso da empresa bloqueado'
      )
    } catch {
      toast.error('Erro ao alterar bloqueio')
    }
  }

  if (isLoading || (isFetching && companies.length === 0)) {
    return (
      <MasterOnly>
        <LoadingScreen message="Carregando empresas ativas..." />
      </MasterOnly>
    )
  }

  return (
    <MasterOnly>
      <PageContainer maxWidth="lg">
        <PageHeader
          title="Empresas ativas"
          description="Empresas com assinatura ativa. Altere o plano de cada empresa quando necessário."
          action={
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
            >
              <RefreshCw
                className={`mr-1.5 h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`}
              />
              Atualizar
            </Button>
          }
        />

        <div className="mt-6 rounded-2xl border border-border/60 bg-card/95 p-4 shadow-sm">
          {error ? (
            <ErrorState
              message="Erro ao carregar empresas ativas"
              onRetry={() => refetch()}
            />
          ) : companies.length === 0 ? (
            <EmptyState
              title="Nenhuma empresa ativa"
              description="Não há empresas com assinatura ativa no momento."
            />
          ) : (
            <ResponsiveDataTable<ActiveCompanyWithPlan>
              data={companies}
              columns={[
                {
                  accessorKey: 'company.name',
                  header: 'Empresa',
                  cell: ({ row }) => (
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <span className="font-medium">{row.original.company.name}</span>
                    </div>
                  ),
                },
                {
                  accessorKey: 'adminName',
                  header: 'Administrador',
                  cell: ({ row }) => (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <User className="h-3.5 w-3.5 shrink-0" />
                      <span>{row.original.adminName}</span>
                    </div>
                  ),
                },
                {
                  accessorKey: 'plan.name',
                  header: 'Plano atual',
                  cell: ({ row }) => (
                    <Badge variant="secondary" className="font-normal">
                      {row.original.plan.name}
                    </Badge>
                  ),
                },
                {
                  id: 'subscription',
                  header: 'Assinatura',
                  cell: ({ row }) => (
                    <Badge
                      variant={row.original.subscription.isActive ? 'default' : 'outline'}
                      className={
                        row.original.subscription.isActive
                          ? 'bg-emerald-600 hover:bg-emerald-700'
                          : ''
                      }
                    >
                      {row.original.subscription.isActive ? 'Ativo' : 'Inativo'}
                    </Badge>
                  ),
                },
                {
                  id: 'access',
                  header: 'Acesso',
                  cell: ({ row }) => {
                    const item = row.original
                    const blocked = item.company.isBlocked ?? false
                    return (
                      <div className="flex items-center gap-2">
                        {blocked ? (
                          <Badge variant="destructive" className="font-normal">
                            Bloqueada
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="font-normal">
                            Liberada
                          </Badge>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs"
                          onClick={() =>
                            handleToggleBlock(item.company.id, blocked)
                          }
                          disabled={setBlocked.isPending}
                        >
                          {blocked ? (
                            <>
                              <Unlock className="mr-1 h-3 w-3" />
                              Desbloquear
                            </>
                          ) : (
                            <>
                              <Lock className="mr-1 h-3 w-3" />
                              Bloquear
                            </>
                          )}
                        </Button>
                      </div>
                    )
                  },
                },
                {
                  id: 'startedAt',
                  header: 'Início',
                  cell: ({ row }) =>
                    format(
                      new Date(row.original.subscription.startedAt),
                      "dd/MM/yyyy",
                      { locale: ptBR }
                    ),
                },
                {
                  id: 'changePlan',
                  header: () => <span className="sr-only">Trocar plano</span>,
                  cell: ({ row }) => {
                    const item = row.original
                    return (
                      <Select
                        value={item.plan.id}
                        onValueChange={(planId) =>
                          planId !== item.plan.id &&
                          handleChangePlan(item.company.id, planId)
                        }
                        disabled={updatePlan.isPending || plans.length === 0}
                      >
                        <SelectTrigger className="h-8 w-[160px] text-xs">
                          <SelectValue placeholder="Trocar plano" />
                        </SelectTrigger>
                        <SelectContent>
                          {plans.map((plan) => (
                            <SelectItem
                              key={plan.id}
                              value={plan.id}
                              className="text-xs"
                            >
                              {plan.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )
                  },
                },
              ]}
              CardComponent={({ item }) => {
                const blocked = item.company.isBlocked ?? false
                return (
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-medium">{item.company.name}</div>
                        <div className="text-xs text-muted-foreground">
                          Admin: {item.adminName}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge
                          variant={item.subscription.isActive ? 'default' : 'outline'}
                          className={
                            item.subscription.isActive
                              ? 'bg-emerald-600 hover:bg-emerald-700'
                              : ''
                          }
                        >
                          {item.subscription.isActive ? 'Ativo' : 'Inativo'}
                        </Badge>
                        {blocked && (
                          <Badge variant="destructive" className="text-[10px]">
                            Bloqueada
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between border-t border-border/50 pt-2">
                      <span className="text-xs text-muted-foreground">
                        Plano: {item.plan.name}
                      </span>
                      <Select
                        value={item.plan.id}
                        onValueChange={(planId) =>
                          planId !== item.plan.id &&
                          handleChangePlan(item.company.id, planId)
                        }
                        disabled={updatePlan.isPending || plans.length === 0}
                      >
                        <SelectTrigger className="h-8 w-full text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {plans.map((plan) => (
                            <SelectItem key={plan.id} value={plan.id} className="text-xs">
                              {plan.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="border-t border-border/50 pt-2">
                      <Button
                        variant={blocked ? 'default' : 'destructive'}
                        size="sm"
                        className="h-8 w-full text-xs"
                        onClick={() =>
                          handleToggleBlock(item.company.id, blocked)
                        }
                        disabled={setBlocked.isPending}
                      >
                        {blocked ? (
                          <>
                            <Unlock className="mr-1.5 h-3 w-3" />
                            Desbloquear acesso
                          </>
                        ) : (
                          <>
                            <Lock className="mr-1.5 h-3 w-3" />
                            Bloquear acesso
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )
              }}
              emptyMessage="Nenhuma empresa ativa."
              isLoading={isFetching}
            />
          )}
        </div>
      </PageContainer>
    </MasterOnly>
  )
}
