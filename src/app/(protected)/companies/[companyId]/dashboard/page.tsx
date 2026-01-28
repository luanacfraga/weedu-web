'use client'

import { ActionDialog } from '@/components/features/actions/action-dialog'
import { ExecutorDashboard } from '@/components/features/dashboard/executor/executor-dashboard'
import { MetricCardWithComparison } from '@/components/features/dashboard/shared/metric-card-with-comparison'
import { PeriodFilter } from '@/components/features/dashboard/shared/period-filter'
import { PeriodIndicator } from '@/components/features/dashboard/shared/period-indicator'
import { ProgressBar } from '@/components/shared/data/progress-bar'
import { StatCard } from '@/components/shared/data/stat-card'
import { ActivityItem } from '@/components/shared/feedback/activity-item'
import { LoadingSpinner } from '@/components/shared/feedback/loading-spinner'
import { PageContainer } from '@/components/shared/layout/page-container'
import { PageHeader } from '@/components/shared/layout/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { USER_ROLES } from '@/lib/constants'
import { useUserContext } from '@/lib/contexts/user-context'
import { useActions } from '@/lib/hooks/use-actions'
import { useCompanyPerformance } from '@/lib/hooks/use-company-performance'
import { useTeamsByCompany } from '@/lib/services/queries/use-teams'
import { useActionDialogStore } from '@/lib/stores/action-dialog-store'
import { useActionFiltersStore } from '@/lib/stores/action-filters-store'
import { ActionStatus, DateFilterType, ViewMode } from '@/lib/types/action'
import type { DatePreset } from '@/lib/utils/date-presets'
import { createMetricComparison } from '@/lib/utils/metrics-calculator'
import { getPresetRange } from '@/lib/utils/period-comparator'
import {
  AlertTriangle,
  BarChart3,
  CheckSquare,
  Clock,
  Lock,
  Sparkles,
  Target,
  TrendingUp,
  Users,
} from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

function formatPercent(value: number): string {
  if (!Number.isFinite(value)) return '0%'
  return `${Math.round(value)}%`
}

function formatRate(value: number): string {
  if (!Number.isFinite(value)) return '0%'
  return `${Math.round(value)}%`
}

function getMotivationCopy(input: {
  total: number
  done: number
  inProgress: number
  late: number
  blocked: number
}) {
  const { total, done, inProgress, late, blocked } = input

  if (total <= 0) {
    return {
      title: 'Vamos começar?',
      subtitle: 'Crie sua primeira ação e dê o primeiro passo rumo às entregas.',
      tone: 'fresh' as const,
    }
  }

  if (done >= total) {
    return {
      title: 'Missão cumprida!',
      subtitle: 'Você concluiu tudo por aqui. Que tal planejar a próxima rodada?',
      tone: 'celebrate' as const,
    }
  }

  if (late > 0) {
    return {
      title: 'Hora de recuperar o ritmo',
      subtitle: `${late} ação(ões) atrasada(s). Escolha uma e destrave a próxima entrega agora.`,
      tone: 'focus' as const,
    }
  }

  if (blocked > 0) {
    return {
      title: 'Destrave para avançar',
      subtitle: `${blocked} ação(ões) bloqueada(s). Um desbloqueio hoje pode liberar várias entregas.`,
      tone: 'focus' as const,
    }
  }

  if (inProgress > 0) {
    return {
      title: 'Bora finalizar',
      subtitle: `${inProgress} em andamento. Fechar uma hoje já muda o jogo.`,
      tone: 'focus' as const,
    }
  }

  return {
    title: 'Pronto para avançar?',
    subtitle: 'Escolha uma ação pendente e comece pelo próximo passo mais simples.',
    tone: 'fresh' as const,
  }
}

export default function CompanyDashboardPage() {
  const params = useParams()
  const { currentRole, setCurrentCompanyId } = useUserContext()
  const companyId = params.companyId as string

  // Keep global company selection in sync with route
  useEffect(() => {
    if (!companyId) return
    setCurrentCompanyId(companyId)
  }, [companyId, setCurrentCompanyId])

  if (currentRole === USER_ROLES.EXECUTOR) {
    return (
      <PageContainer>
        <ExecutorDashboard companyId={companyId} />
      </PageContainer>
    )
  }

  if (currentRole === USER_ROLES.ADMIN) {
    return (
      <PageContainer maxWidth="7xl">
        <AdminCompanyDashboard companyId={companyId} />
      </PageContainer>
    )
  }

  return <ManagerCompanyDashboard companyId={companyId} />
}

function AdminCompanyDashboard({ companyId }: { companyId: string }) {
  const { user } = useUserContext()
  const filters = useActionFiltersStore()
  const [preset, setPreset] = useState<DatePreset>('esta-semana')
  const { metrics, trendData, isLoading, error } = useCompanyPerformance({
    companyId,
    preset,
  })

  const { data: teamsData } = useTeamsByCompany(companyId)
  const company = user?.companies.find((c) => c.id === companyId)

  const statusDistribution = useMemo(() => {
    const total = metrics.totalActions || 1
    return [
      {
        name: 'Concluídas',
        value: metrics.totalDeliveries,
      },
      {
        name: 'Em andamento',
        value: metrics.totalActions - metrics.totalDeliveries - metrics.totalLate,
      },
      {
        name: 'Atrasadas',
        value: metrics.totalLate,
      },
    ]
  }, [metrics])

  const deliveriesComparison = createMetricComparison(
    metrics.totalDeliveries,
    metrics.totalDeliveries - metrics.deliveriesChange
  )

  const completionRateComparison = createMetricComparison(
    metrics.avgCompletionRate,
    metrics.avgCompletionRate - metrics.completionRateChange
  )

  const lateComparison = createMetricComparison(
    metrics.totalLate,
    metrics.totalLate - metrics.lateChange,
    true
  )

  const teamsCount = teamsData?.data?.length || 0

  return (
    <>
      <div className="mb-6 space-y-4">
        <PageHeader
          title={company ? `Dashboard • ${company.name}` : 'Dashboard da empresa'}
          description="Visão executiva do desempenho da empresa com métricas, tendências e insights das equipes."
          action={
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                filters.resetFilters()
                filters.setFilter('companyId', companyId)
                filters.setFilter('viewMode', ViewMode.KANBAN)
              }}
              asChild
            >
              <Link href="/actions">
                <BarChart3 className="mr-2 h-4 w-4" />
                Ver ações
              </Link>
            </Button>
          }
        />
        <div className="flex items-center justify-between gap-4">
          <PeriodFilter
            selected={preset}
            onChange={(newPreset) => {
              setPreset(newPreset)

              const range = getPresetRange(newPreset)
              filters.setFilter('dateFrom', range.dateFrom)
              filters.setFilter('dateTo', range.dateTo)
              filters.setFilter('dateFilterType', DateFilterType.CREATED_AT)
            }}
          />
          <PeriodIndicator preset={preset} />
        </div>
      </div>

      {error ? (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Não foi possível carregar as métricas</CardTitle>
            <CardDescription>Tente novamente em instantes.</CardDescription>
          </CardHeader>
        </Card>
      ) : isLoading ? (
        <div className="flex h-[300px] items-center justify-center">
          <LoadingSpinner size="lg" variant="muted" label="Carregando desempenho da empresa..." />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Cards principais - visão descritiva com melhor design */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCardWithComparison
              title="Entregas no período"
              value={metrics.totalDeliveries}
              comparison={deliveriesComparison}
              icon={Target}
              iconColor="text-success"
              bgColor="bg-success/10"
            />
            <MetricCardWithComparison
              title="Taxa de conclusão"
              value={formatRate(metrics.avgCompletionRate)}
              comparison={completionRateComparison}
              icon={TrendingUp}
              iconColor="text-primary"
              bgColor="bg-primary/10"
            />
            <MetricCardWithComparison
              title="Atrasadas"
              value={metrics.totalLate}
              comparison={lateComparison}
              icon={AlertTriangle}
              iconColor={metrics.totalLate > 0 ? 'text-warning' : 'text-muted-foreground'}
              bgColor={metrics.totalLate > 0 ? 'bg-warning/10' : 'bg-muted'}
            />
            <MetricCardWithComparison
              title="Total de ações"
              value={metrics.totalActions}
              icon={CheckSquare}
              iconColor="text-info"
              bgColor="bg-info/10"
            />
          </div>

          {/* Cards secundários - informações adicionais */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="border-border/60 bg-gradient-to-br from-primary/5 via-background to-background">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Equipes ativas</CardTitle>
                <div className="rounded-lg bg-primary/10 p-2">
                  <Users className="h-4 w-4 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{teamsCount}</div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {teamsCount === 0
                    ? 'Nenhuma equipe cadastrada'
                    : teamsCount === 1
                      ? '1 equipe'
                      : `${teamsCount} equipes`}
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/60">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Em andamento</CardTitle>
                <div className="rounded-lg bg-info/10 p-2">
                  <Clock className="h-4 w-4 text-info" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics.totalActions - metrics.totalDeliveries - metrics.totalLate}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">Ações em execução</p>
              </CardContent>
            </Card>

            <Card className="border-border/60">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Taxa de atraso</CardTitle>
                <div className="rounded-lg bg-warning/10 p-2">
                  <AlertTriangle className="h-4 w-4 text-warning" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics.totalActions > 0
                    ? formatRate((metrics.totalLate / metrics.totalActions) * 100)
                    : '0%'}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {metrics.totalLate} de {metrics.totalActions} ações
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Gráficos */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="border-border/60 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-semibold">Distribuição por status</CardTitle>
                <CardDescription className="text-xs">
                  Proporção de ações concluídas, em andamento e atrasadas.
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statusDistribution}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted/50" />
                    <XAxis
                      dataKey="name"
                      tickLine={false}
                      tick={{ fontSize: 12 }}
                      className="text-muted-foreground"
                    />
                    <YAxis
                      allowDecimals={false}
                      tickLine={false}
                      tick={{ fontSize: 12 }}
                      className="text-muted-foreground"
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: 8,
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      }}
                      cursor={{ fill: 'hsl(var(--muted))', opacity: 0.2 }}
                    />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {statusDistribution.map((entry, index) => {
                        let fill = 'hsl(var(--primary))'
                        if (entry.name === 'Concluídas') fill = 'hsl(var(--success))'
                        if (entry.name === 'Atrasadas') fill = 'hsl(var(--warning))'
                        if (entry.name === 'Em andamento') fill = 'hsl(var(--info))'
                        return <Cell key={`cell-${index}`} fill={fill} />
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-border/60 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-semibold">Tendência de entregas</CardTitle>
                <CardDescription className="text-xs">
                  Quantidade de ações concluídas ao longo do período selecionado.
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                {trendData.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center gap-2">
                    <BarChart3 className="h-8 w-8 text-muted-foreground/50" />
                    <p className="px-4 text-center text-sm text-muted-foreground">
                      Ainda não há dados suficientes de entregas neste período.
                    </p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted/50" />
                      <XAxis
                        dataKey="label"
                        tickLine={false}
                        tick={{ fontSize: 12 }}
                        className="text-muted-foreground"
                      />
                      <YAxis
                        allowDecimals={false}
                        tickLine={false}
                        tick={{ fontSize: 12 }}
                        className="text-muted-foreground"
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: 8,
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                        }}
                        labelFormatter={(label) => `Dia ${label}`}
                        cursor={{ fill: 'hsl(var(--muted))', opacity: 0.2 }}
                      />
                      <Bar dataKey="deliveries" radius={[6, 6, 0, 0]} fill="hsl(var(--success))" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Equipes da empresa - design melhorado */}
          <Card className="border-border/60 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold">Equipes da empresa</CardTitle>
                  <CardDescription className="mt-1 text-xs">
                    Visão geral das equipes e seus gestores
                  </CardDescription>
                </div>
                {teamsData?.data && teamsData.data.length > 0 && (
                  <div className="flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-1.5">
                    <Users className="h-4 w-4 text-primary" />
                    <span className="text-sm font-semibold text-primary">{teamsCount}</span>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {teamsData?.data && teamsData.data.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {teamsData.data.map((team) => (
                    <Link key={team.id} href={`/companies/${companyId}/teams`} className="group">
                      <div className="rounded-lg border border-border/60 bg-card p-4 transition-all hover:border-primary/40 hover:shadow-md">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <h4 className="truncate text-sm font-semibold transition-colors group-hover:text-primary">
                              {team.name}
                            </h4>
                            {team.description ? (
                              <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                                {team.description}
                              </p>
                            ) : (
                              <p className="mt-1 text-xs text-muted-foreground">Sem descrição</p>
                            )}
                          </div>
                          <div className="flex-shrink-0">
                            <div className="rounded-md bg-primary/10 p-1.5">
                              <Users className="h-3.5 w-3.5 text-primary" />
                            </div>
                          </div>
                        </div>
                        {/* <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>
                            Criada em{' '}
                            {new Date(team.createdAt).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </div> */}
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="mb-4 rounded-full bg-muted p-4">
                    <Users className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="mb-1 text-sm font-medium text-foreground">
                    Nenhuma equipe cadastrada
                  </p>
                  <p className="mb-4 text-xs text-muted-foreground">
                    Crie sua primeira equipe para começar a organizar o trabalho
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/companies/${companyId}/teams`}>Criar equipe</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}

function ManagerCompanyDashboard({ companyId }: { companyId: string }) {
  const { user } = useUserContext()
  const filters = useActionFiltersStore()
  const { openCreate } = useActionDialogStore()
  const company = user?.companies.find((c) => c.id === companyId)

  const totalFilters = useMemo(() => ({ companyId, page: 1, limit: 1 }), [companyId])
  const todoFilters = useMemo(
    () => ({ companyId, status: ActionStatus.TODO, page: 1, limit: 1 }),
    [companyId]
  )
  const inProgressFilters = useMemo(
    () => ({ companyId, status: ActionStatus.IN_PROGRESS, page: 1, limit: 1 }),
    [companyId]
  )
  const doneFilters = useMemo(
    () => ({ companyId, status: ActionStatus.DONE, page: 1, limit: 1 }),
    [companyId]
  )
  const lateFilters = useMemo(() => ({ companyId, isLate: true, page: 1, limit: 1 }), [companyId])
  const blockedFilters = useMemo(
    () => ({ companyId, isBlocked: true, page: 1, limit: 1 }),
    [companyId]
  )

  const focusFilters = useMemo(
    () => ({ companyId, status: ActionStatus.IN_PROGRESS, page: 1, limit: 3 }),
    [companyId]
  )
  const nextFilters = useMemo(
    () => ({ companyId, status: ActionStatus.TODO, page: 1, limit: 3 }),
    [companyId]
  )

  const totalQ = useActions(totalFilters)
  const todoQ = useActions(todoFilters)
  const inProgressQ = useActions(inProgressFilters)
  const doneQ = useActions(doneFilters)
  const lateQ = useActions(lateFilters)
  const blockedQ = useActions(blockedFilters)

  const focusQ = useActions(focusFilters)
  const nextQ = useActions(nextFilters)

  const total = totalQ.data?.meta.total ?? 0
  const todo = todoQ.data?.meta.total ?? 0
  const inProgress = inProgressQ.data?.meta.total ?? 0
  const done = doneQ.data?.meta.total ?? 0
  const late = lateQ.data?.meta.total ?? 0
  const blocked = blockedQ.data?.meta.total ?? 0

  const completionRate = total > 0 ? (done / total) * 100 : 0
  const motivation = getMotivationCopy({ total, done, inProgress, late, blocked })

  const isLoadingStats =
    totalQ.isLoading ||
    todoQ.isLoading ||
    inProgressQ.isLoading ||
    doneQ.isLoading ||
    lateQ.isLoading ||
    blockedQ.isLoading

  return (
    <>
      <PageContainer maxWidth="7xl">
        <PageHeader
          title={`Olá, ${user?.name?.split(' ')[0] || 'Usuário'}!`}
          description={`Bem-vindo(a) ao painel de controle${company ? ` - ${company.name}` : ''}`}
          action={
            <div className="flex items-center gap-2">
              <Button onClick={openCreate} size="sm" className="hidden sm:inline-flex">
                Nova Ação
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/actions">Ver Ações</Link>
              </Button>
            </div>
          }
        />

        {/* Motivation hero */}
        <Card className="mb-6 overflow-hidden border-border/40 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <CardTitle className="text-lg sm:text-xl">
                  <span className="inline-flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    {motivation.title}
                  </span>
                </CardTitle>
                <CardDescription className="max-w-2xl">{motivation.subtitle}</CardDescription>
              </div>

              {isLoadingStats ? (
                <div className="pt-1">
                  <LoadingSpinner size="sm" variant="muted" label="Carregando métricas..." />
                </div>
              ) : (
                <div className="hidden flex-col items-end gap-1 sm:flex">
                  <div className="text-sm font-semibold text-foreground">
                    {formatPercent(completionRate)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {done} de {total} concluídas
                  </div>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Progresso</span>
                <span className="sm:hidden">
                  {done} / {total}
                </span>
              </div>
              <ProgressBar value={completionRate} label="Progresso de conclusão" />
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Button
                size="sm"
                onClick={() => {
                  filters.resetFilters()
                  filters.setFilter('companyId', companyId)
                  filters.setFilter('viewMode', ViewMode.KANBAN)
                }}
                asChild
                className="sm:w-auto"
              >
                <Link href="/actions">Continuar no Kanban</Link>
              </Button>

              {late > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    filters.resetFilters()
                    filters.setFilter('companyId', companyId)
                    filters.setFilter('showLateOnly', true)
                  }}
                  asChild
                >
                  <Link href="/actions">
                    <Clock className="mr-2 h-4 w-4 text-warning" />
                    Ver atrasadas ({late})
                  </Link>
                </Button>
              )}

              {blocked > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    filters.resetFilters()
                    filters.setFilter('companyId', companyId)
                    filters.setFilter('showBlockedOnly', true)
                  }}
                  asChild
                >
                  <Link href="/actions">
                    <Lock className="mr-2 h-4 w-4 text-warning" />
                    Ver bloqueadas ({blocked})
                  </Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
          <StatCard
            title="Pendentes"
            value={todo}
            description="Prontas para começar"
            icon={CheckSquare}
            iconColor="text-muted-foreground"
            bgColor="bg-muted"
          />
          <StatCard
            title="Em Andamento"
            value={inProgress}
            description="Em execução agora"
            icon={BarChart3}
            iconColor="text-info"
            bgColor="bg-info/10"
          />
          <StatCard
            title="Concluídas"
            value={done}
            description="Entregas realizadas"
            icon={CheckSquare}
            iconColor="text-success"
            bgColor="bg-success/10"
          />
          <StatCard
            title="Atrasadas"
            value={late}
            description="Priorize para destravar"
            icon={Clock}
            iconColor={late > 0 ? 'text-warning' : 'text-muted-foreground'}
            bgColor={late > 0 ? 'bg-warning/10' : 'bg-muted'}
          />
        </div>

        <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Foco agora</CardTitle>
              <CardDescription>Continue o que já está em andamento</CardDescription>
            </CardHeader>
            <CardContent>
              {focusQ.isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <LoadingSpinner size="md" variant="muted" label="Carregando..." />
                </div>
              ) : focusQ.data?.data?.length ? (
                <div className="space-y-4">
                  {focusQ.data.data.map((a) => (
                    <ActivityItem
                      key={a.id}
                      title={a.title}
                      description={a.isBlocked ? 'Bloqueada' : undefined}
                      color={a.isBlocked ? 'orange' : 'blue'}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Sem ações em andamento. Comece por uma pendente e ganhe ritmo.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Próximo passo</CardTitle>
              <CardDescription>Escolha uma pendente e avance</CardDescription>
            </CardHeader>
            <CardContent>
              {nextQ.isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <LoadingSpinner size="md" variant="muted" label="Carregando..." />
                </div>
              ) : nextQ.data?.data?.length ? (
                <div className="space-y-4">
                  {nextQ.data.data.map((a) => (
                    <ActivityItem
                      key={a.id}
                      icon={<CheckSquare className="h-5 w-5 flex-shrink-0 text-muted-foreground" />}
                      title={a.title}
                      description={a.isLate ? 'Atrasada' : undefined}
                      color={a.isLate ? 'orange' : 'purple'}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Sem ações pendentes. Crie uma nova e comece a entregar.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </PageContainer>

      <ActionDialog />
    </>
  )
}
