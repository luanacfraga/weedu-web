'use client'

import { MetricCardWithComparison } from '@/components/features/dashboard/shared/metric-card-with-comparison'
import { PeriodFilter } from '@/components/features/dashboard/shared/period-filter'
import { PeriodIndicator } from '@/components/features/dashboard/shared/period-indicator'
import { ProgressBar } from '@/components/shared/data/progress-bar'
import { ActivityItem } from '@/components/shared/feedback/activity-item'
import { LoadingSpinner } from '@/components/shared/feedback/loading-spinner'
import { PageHeader } from '@/components/shared/layout/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useBlockAction, useMoveAction, useUnblockAction } from '@/lib/hooks/use-actions'
import { useExecutorDashboard } from '@/lib/hooks/use-executor-dashboard'
import { ActionLateStatus, ActionPriority, ActionStatus } from '@/lib/types/action'
import type { ImpactCategory } from '@/lib/types/executor-dashboard'
import { cn } from '@/lib/utils'
import type { DatePreset } from '@/lib/utils/date-presets'
import { getPresetRange } from '@/lib/utils/period-comparator'
import {
  Calendar,
  CheckCircle2,
  Clock,
  Hand,
  ListTodo,
  Lock,
  Play,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { ExecutorDoneTrendChart } from './executor-done-trend-chart'

function formatPercent(value: number): string {
  if (!Number.isFinite(value)) return '0%'
  return `${Math.round(value)}%`
}

function toDateInputValue(iso: string): string {
  try {
    return iso.slice(0, 10)
  } catch {
    return ''
  }
}

function toIsoRangeFromDateInputs(input: { fromYmd: string; toYmd: string }): {
  dateFrom: string
  dateTo: string
} {
  // Inputs are "YYYY-MM-DD"
  const dateFrom = new Date(`${input.fromYmd}T00:00:00.000Z`).toISOString()
  const dateTo = new Date(`${input.toYmd}T23:59:59.999Z`).toISOString()
  return { dateFrom, dateTo }
}

const IMPACT_LABELS: Record<ImpactCategory, string> = {
  receita: 'Receita',
  cliente: 'Cliente',
  eficiencia: 'Eficiência',
  qualidade: 'Qualidade',
  risco: 'Risco',
  pessoas: 'Pessoas',
  outro: 'Outro',
  'nao-informado': 'Não informado',
}

function buildDoneNotes(input: { impact?: ImpactCategory; note?: string }) {
  const lines: string[] = []
  if (input.impact && input.impact !== 'nao-informado')
    lines.push(`Impacto: ${IMPACT_LABELS[input.impact]}`)
  if (input.note?.trim()) lines.push(`Nota: ${input.note.trim()}`)
  return lines.join('\n')
}

function priorityToColor(priority: ActionPriority, isLate: boolean) {
  if (isLate) return 'red' as const
  switch (priority) {
    case ActionPriority.URGENT:
      return 'orange' as const
    case ActionPriority.HIGH:
      return 'purple' as const
    case ActionPriority.MEDIUM:
      return 'blue' as const
    case ActionPriority.LOW:
      return 'green' as const
  }
}

function getLateStatusLabel(lateStatus: ActionLateStatus | null, fallback: string): string {
  if (!lateStatus) return fallback

  switch (lateStatus) {
    case ActionLateStatus.LATE_TO_START:
      return 'Para iniciar'
    case ActionLateStatus.LATE_TO_FINISH:
      return 'Para terminar'
    case ActionLateStatus.COMPLETED_LATE:
      return 'Concluída com atraso'
    default:
      return fallback
  }
}

function getMotivationCopy(input: {
  total: number
  done: number
  doneInPeriod: number
  late: number
  blocked: number
  completionRate: number
}) {
  const { total, done, doneInPeriod, late, blocked, completionRate } = input

  if (total <= 0) {
    return {
      title: 'Vamos começar?',
      subtitle: 'Escolha uma ação pendente e dê o primeiro passo hoje.',
      tone: 'fresh' as const,
    }
  }

  if (late > 0) {
    return {
      title: 'Hora de recuperar o ritmo',
      subtitle: `${late} ação(ões) atrasada(s). Foque em uma e destrave a próxima entrega.`,
      tone: 'focus' as const,
    }
  }

  if (blocked > 0) {
    return {
      title: 'Destrave para avançar',
      subtitle: `${blocked} ação(ões) bloqueada(s). Resolver um bloqueio pode acelerar seu dia.`,
      tone: 'focus' as const,
    }
  }

  if (doneInPeriod <= 0) {
    return {
      title: 'Bora ganhar tração',
      subtitle: 'Uma conclusão hoje já muda o jogo. Escolha a menor ação e comece.',
      tone: 'fresh' as const,
    }
  }

  if (completionRate >= 70) {
    return {
      title: 'Excelente ritmo!',
      subtitle: 'Você está consistente. Mantenha o foco e finalize o que está em andamento.',
      tone: 'celebrate' as const,
    }
  }

  return {
    title: 'Continue avançando',
    subtitle: 'Priorize as próximas ações e mantenha o fluxo de entregas.',
    tone: 'fresh' as const,
  }
}

export function ExecutorDashboard(props: { companyId: string; className?: string }) {
  const [preset, setPreset] = useState<DatePreset>('esta-semana')
  const presetRange = useMemo(() => getPresetRange(preset), [preset])
  const [customOpen, setCustomOpen] = useState(false)
  const [customFrom, setCustomFrom] = useState<string>('') // YYYY-MM-DD
  const [customTo, setCustomTo] = useState<string>('') // YYYY-MM-DD
  const moveAction = useMoveAction()
  const blockAction = useBlockAction()
  const unblockAction = useUnblockAction()

  const [completeOpen, setCompleteOpen] = useState(false)
  const [completeAction, setCompleteAction] = useState<{ id: string; title: string } | null>(null)
  const [impact, setImpact] = useState<ImpactCategory>('nao-informado')
  const [quickNote, setQuickNote] = useState('')

  const [blockOpen, setBlockOpen] = useState(false)
  const [blockTarget, setBlockTarget] = useState<{ id: string; title: string } | null>(null)
  const [blockReason, setBlockReason] = useState<string>('Aguardando dependência')

  const effectiveRange = useMemo(() => {
    if (customFrom && customTo) {
      return toIsoRangeFromDateInputs({ fromYmd: customFrom, toYmd: customTo })
    }
    return presetRange
  }, [customFrom, customTo, presetRange])

  const q = useExecutorDashboard({
    companyId: props.companyId,
    dateFrom: effectiveRange.dateFrom,
    dateTo: effectiveRange.dateTo,
  })

  const data = q.data
  const canInteract = !moveAction.isPending && !blockAction.isPending && !unblockAction.isPending

  return (
    <div className={cn('space-y-6', props.className)}>
      <PageHeader
        title="Meu desempenho"
        description="Acompanhe suas entregas e veja seu contexto dentro do time."
      />

      {/* Compact filter toolbar (kept outside PageHeader to avoid large button styling) */}
      <div className="flex flex-col gap-2 rounded-xl border border-border/40 bg-card/70 p-3 shadow-sm backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center rounded-lg border border-border/50 bg-background/60 p-1">
            <PeriodFilter selected={preset} onChange={setPreset} />
          </div>

          <Popover open={customOpen} onOpenChange={setCustomOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-2 px-3 text-xs">
                <Calendar className="h-4 w-4" />
                {customFrom && customTo ? 'Customizado' : 'Data'}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-[320px]">
              <div className="space-y-3">
                <div className="text-sm font-semibold">Período</div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">De</div>
                    <Input
                      type="date"
                      value={customFrom}
                      onChange={(e) => setCustomFrom(e.target.value)}
                      className="h-9 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">Até</div>
                    <Input
                      type="date"
                      value={customTo}
                      onChange={(e) => setCustomTo(e.target.value)}
                      className="h-9 text-sm"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-3 text-xs"
                    onClick={() => {
                      setCustomFrom('')
                      setCustomTo('')
                      setCustomOpen(false)
                    }}
                  >
                    Limpar
                  </Button>
                  <Button
                    size="sm"
                    className="h-8 px-3 text-xs"
                    onClick={() => {
                      if (!customFrom || !customTo) {
                        setCustomFrom(toDateInputValue(presetRange.dateFrom))
                        setCustomTo(toDateInputValue(presetRange.dateTo))
                        return
                      }
                      setCustomOpen(false)
                    }}
                  >
                    Aplicar
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground">
                  Dica: os presets continuam disponíveis ao lado.
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <PeriodIndicator preset={preset} className="text-xs sm:text-sm" />
      </div>

      {q.isLoading ? (
        <div className="flex items-center justify-center py-16">
          <LoadingSpinner icon="logo" size="lg" variant="muted" label="Carregando dashboard..." />
        </div>
      ) : q.error ? (
        <Card>
          <CardHeader>
            <CardTitle>Não foi possível carregar</CardTitle>
            <CardDescription>Tente novamente em instantes.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={() => q.refetch()}>
              Tentar novamente
            </Button>
          </CardContent>
        </Card>
      ) : !data ? null : (
        <>
          {/* Motivation hero */}
          {(() => {
            const motivation = getMotivationCopy({
              total: data.totals.total,
              done: data.totals.done,
              doneInPeriod: data.doneInPeriod.current,
              late: data.totals.late,
              blocked: data.totals.blocked,
              completionRate: data.completionRate,
            })

            return (
              <Card className="overflow-hidden border-border/40 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
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

                    <div className="hidden flex-col items-end gap-1 sm:flex">
                      <div className="text-sm font-semibold text-foreground">
                        {data.doneInPeriod.current} concluída(s)
                      </div>
                      <div className="text-xs text-muted-foreground">no período selecionado</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Taxa de conclusão</span>
                      <span>{formatPercent(data.completionRate)}</span>
                    </div>
                    <ProgressBar value={data.completionRate} label="Taxa de conclusão" />
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <Button asChild size="sm">
                      <Link href="/actions">Ir para o Kanban</Link>
                    </Button>
                    <Button asChild variant="outline" size="sm">
                      <Link href="/actions?view=kanban">Continuar executando</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })()}

          {/* Hoje / Próximas 3 */}
          <Card>
            <CardHeader>
              <CardTitle>Hoje / Próximas 3</CardTitle>
              <CardDescription>Uma decisão a menos: comece pelo próximo passo.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.todayTop3?.length ? (
                data.todayTop3.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-start justify-between gap-3 rounded-lg border border-border/40 bg-background/60 p-3"
                  >
                    <div className="min-w-0 flex-1">
                      <ActivityItem
                        title={a.title}
                        description={
                          a.isBlocked
                            ? `Bloqueada${a.blockedReason ? ` — ${a.blockedReason}` : ''}`
                            : a.isLate
                              ? getLateStatusLabel(a.lateStatus ?? null, 'Em atraso')
                              : a.priority.toLowerCase()
                        }
                        color={priorityToColor(a.priority, a.isLate)}
                      />
                    </div>
                    <div className="flex flex-shrink-0 items-center gap-2">
                      {a.isBlocked ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 px-2"
                          disabled={!canInteract}
                          onClick={async () => {
                            try {
                              await unblockAction.mutateAsync(a.id)
                              toast.success('Ação desbloqueada')
                              q.refetch()
                            } catch {
                              toast.error('Não foi possível desbloquear')
                            }
                          }}
                          title="Desbloquear"
                        >
                          <Lock className="h-4 w-4" />
                        </Button>
                      ) : a.status === ActionStatus.TODO ? (
                        <>
                          <Button
                            size="sm"
                            className="h-8 px-2"
                            disabled={!canInteract}
                            onClick={async () => {
                              try {
                                await moveAction.mutateAsync({
                                  id: a.id,
                                  data: { toStatus: ActionStatus.IN_PROGRESS },
                                })
                                toast.success('Ação iniciada')
                                q.refetch()
                              } catch {
                                toast.error('Não foi possível iniciar')
                              }
                            }}
                            title="Iniciar"
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 px-2"
                            onClick={() => {
                              setBlockTarget({ id: a.id, title: a.title })
                              setBlockReason('Aguardando dependência')
                              setBlockOpen(true)
                            }}
                            title="Bloquear"
                          >
                            <Hand className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            className="h-8 px-2"
                            disabled={!canInteract}
                            onClick={() => {
                              setCompleteAction({ id: a.id, title: a.title })
                              setImpact('nao-informado')
                              setQuickNote('')
                              setCompleteOpen(true)
                            }}
                            title="Concluir"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 px-2"
                            onClick={() => {
                              setBlockTarget({ id: a.id, title: a.title })
                              setBlockReason('Aguardando dependência')
                              setBlockOpen(true)
                            }}
                            title="Bloquear"
                          >
                            <Hand className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  Sem sugestões por aqui. Abra o Kanban para escolher uma ação.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Metrics */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCardWithComparison
              title="Concluídas no período"
              value={data.doneInPeriod.current}
              comparison={{
                absolute: data.doneInPeriod.delta,
                percent: data.doneInPeriod.previous
                  ? Math.round((data.doneInPeriod.delta / data.doneInPeriod.previous) * 100)
                  : 0,
                isImprovement: data.doneInPeriod.delta >= 0,
              }}
              icon={TrendingUp}
              iconColor="text-primary"
              bgColor="bg-primary/10"
            />
            <MetricCardWithComparison
              title="Taxa de conclusão"
              value={formatPercent(data.completionRate)}
              icon={ListTodo}
              iconColor="text-success"
              bgColor="bg-success/10"
            />
            <MetricCardWithComparison
              title="Atrasadas"
              value={data.totals.late}
              icon={Clock}
              iconColor={data.totals.late > 0 ? 'text-warning' : 'text-muted-foreground'}
              bgColor={data.totals.late > 0 ? 'bg-warning/10' : 'bg-muted'}
            />
            <MetricCardWithComparison
              title="Bloqueadas"
              value={data.totals.blocked}
              icon={ShieldAlert}
              iconColor={data.totals.blocked > 0 ? 'text-warning' : 'text-muted-foreground'}
              bgColor={data.totals.blocked > 0 ? 'bg-warning/10' : 'bg-muted'}
            />
          </div>

          {/* Impacto + Qualidade */}
          <div className="grid gap-4 lg:grid-cols-3 lg:gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Impacto entregue no período</CardTitle>
                <CardDescription>
                  Ajuda o gestor/dono a enxergar valor (sem burocracia).
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(data.impact?.categories ?? {}) as ImpactCategory[])
                    .filter((k) => (data.impact?.categories?.[k] ?? 0) > 0 && k !== 'nao-informado')
                    .map((k) => (
                      <div
                        key={k}
                        className="rounded-full border border-border/50 bg-background/60 px-3 py-1 text-xs"
                      >
                        <span className="font-medium">{IMPACT_LABELS[k]}</span>{' '}
                        <span className="text-muted-foreground">· {data.impact.categories[k]}</span>
                      </div>
                    ))}
                  {Object.values(data.impact?.categories ?? {}).every((v) => v === 0) && (
                    <span className="text-sm text-muted-foreground">
                      Sem entregas concluídas no período.
                    </span>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  Dica: ao concluir uma ação, marque &quot;Impacto&quot; em 5s.
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Qualidade & previsibilidade</CardTitle>
                <CardDescription>Não é só “quantas”: é “bem feito e no prazo”.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span>No prazo</span>
                  <span className="font-semibold">{data.quality?.doneOnTime ?? 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Atrasadas (concluídas)</span>
                  <span className="font-semibold">{data.quality?.doneLate ?? 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Reabertas</span>
                  <span className="font-semibold">{data.quality?.reopened ?? 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Tempo médio (ciclo)</span>
                  <span className="font-semibold">
                    {data.quality?.avgCycleTimeHours ? `${data.quality.avgCycleTimeHours}h` : '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Em progresso (médio)</span>
                  <span className="font-semibold">
                    {data.quality?.avgInProgressAgeHours
                      ? `${data.quality.avgInProgressAgeHours}h`
                      : '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Taxa de bloqueio</span>
                  <span className="font-semibold">
                    {Math.round(data.quality?.blockedRatePercent ?? 0)}%
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 lg:grid-cols-3 lg:gap-6">
            <ExecutorDoneTrendChart
              className="lg:col-span-2"
              current={data.doneTrend.current}
              previous={data.doneTrend.previous}
            />

            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Minha posição
                </CardTitle>
                <CardDescription>Contexto do time (sem expor ranking completo).</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {data.team ? (
                  <>
                    <div className="text-sm">
                      Você é <span className="font-semibold">#{data.team.rank}</span> de{' '}
                      <span className="font-semibold">{data.team.totalMembers}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {data.team.percentDiffFromAverage >= 0 ? 'Acima' : 'Abaixo'} da média do time:{' '}
                      <span className="font-semibold text-foreground">
                        {Math.abs(Math.round(data.team.percentDiffFromAverage))}%
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Suas concluídas: {data.team.myDone} · Média:{' '}
                      {data.team.averageDone.toFixed(1)}
                    </div>
                  </>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    Você ainda não está vinculado(a) a uma equipe.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <div>
                <CardTitle>Minhas próximas ações</CardTitle>
                <CardDescription>Priorize o próximo passo para avançar rápido.</CardDescription>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href="/actions">Ver no Kanban</Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.nextActions.length ? (
                <div className="space-y-4">
                  {data.nextActions.map((a) => (
                    <ActivityItem
                      key={a.id}
                      title={a.title}
                      description={
                        a.isBlocked
                          ? `Bloqueada${a.blockedReason ? ` — ${a.blockedReason}` : ''}`
                          : a.isLate
                            ? getLateStatusLabel(a.lateStatus ?? null, 'Em atraso')
                            : a.priority.toLowerCase()
                      }
                      color={priorityToColor(a.priority, a.isLate)}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Sem próximas ações. Escolha uma pendente no Kanban para começar.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Estou travado */}
          <Card>
            <CardHeader>
              <CardTitle>Estou travado</CardTitle>
              <CardDescription>Bloqueios com contexto para pedir ajuda rápido.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.blockedActions?.length ? (
                data.blockedActions.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-start justify-between gap-3 rounded-lg border border-border/40 bg-background/60 p-3"
                  >
                    <div className="min-w-0 flex-1">
                      <ActivityItem
                        title={a.title}
                        description={a.blockedReason ? a.blockedReason : 'Bloqueada'}
                        color="orange"
                      />
                    </div>
                    <div className="flex flex-shrink-0 items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 px-2"
                        disabled={!canInteract}
                        onClick={async () => {
                          try {
                            await unblockAction.mutateAsync(a.id)
                            toast.success('Ação desbloqueada')
                            q.refetch()
                          } catch {
                            toast.error('Não foi possível desbloquear')
                          }
                        }}
                        title="Desbloquear"
                      >
                        <Lock className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        className="h-8 px-3 text-xs"
                        onClick={async () => {
                          const msg = `Preciso de ajuda com a ação: "${a.title}". Bloqueio: ${a.blockedReason ?? '—'}`
                          try {
                            await navigator.clipboard.writeText(msg)
                            toast.success('Mensagem copiada para pedir ajuda')
                          } catch {
                            toast.error('Não foi possível copiar')
                          }
                        }}
                      >
                        Pedir ajuda
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">Sem bloqueios no momento.</p>
              )}
            </CardContent>
          </Card>

          {/* Dialog: Concluir com objetivo/impacto */}
          <Dialog open={completeOpen} onOpenChange={setCompleteOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Concluir ação</DialogTitle>
                <DialogDescription>Leva 5–10 segundos e melhora a visibilidade.</DialogDescription>
              </DialogHeader>

              <div className="space-y-3">
                <div className="text-sm font-medium">{completeAction?.title}</div>
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">Impacto</div>
                  <div className="grid grid-cols-2 gap-2">
                    {(Object.keys(IMPACT_LABELS) as ImpactCategory[]).map((k) => (
                      <Button
                        key={k}
                        type="button"
                        variant={impact === k ? 'default' : 'outline'}
                        size="sm"
                        className="h-8 justify-start text-xs"
                        onClick={() => setImpact(k)}
                      >
                        {IMPACT_LABELS[k]}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">Nota rápida (opcional)</div>
                  <Input
                    value={quickNote}
                    onChange={(e) => setQuickNote(e.target.value)}
                    placeholder="Ex.: entregue e validado"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setCompleteOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  disabled={!completeAction || !canInteract}
                  onClick={async () => {
                    if (!completeAction) return
                    const notes = buildDoneNotes({ impact, note: quickNote })
                    try {
                      await moveAction.mutateAsync({
                        id: completeAction.id,
                        data: { toStatus: ActionStatus.DONE, notes: notes || undefined },
                      })
                      toast.success('Ação concluída')
                      setCompleteOpen(false)
                      q.refetch()
                    } catch {
                      toast.error('Não foi possível concluir')
                    }
                  }}
                >
                  Concluir
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Dialog: Bloquear */}
          <Dialog open={blockOpen} onOpenChange={setBlockOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Marcar como bloqueada</DialogTitle>
                <DialogDescription>Escolha um motivo rápido (sem texto longo).</DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <div className="text-sm font-medium">{blockTarget?.title}</div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {[
                    'Aguardando dependência',
                    'Aguardando aprovação',
                    'Problema técnico',
                    'Falta de informação',
                    'Mudança de prioridade',
                    'Outro',
                  ].map((r) => (
                    <Button
                      key={r}
                      type="button"
                      variant={blockReason === r ? 'default' : 'outline'}
                      size="sm"
                      className="h-8 justify-start text-xs"
                      onClick={() => setBlockReason(r)}
                    >
                      {r}
                    </Button>
                  ))}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setBlockOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  disabled={!blockTarget || !canInteract}
                  onClick={async () => {
                    if (!blockTarget) return
                    try {
                      await blockAction.mutateAsync({
                        id: blockTarget.id,
                        data: { reason: blockReason },
                      })
                      toast.success('Ação bloqueada')
                      setBlockOpen(false)
                      q.refetch()
                    } catch {
                      toast.error('Não foi possível bloquear')
                    }
                  }}
                >
                  Bloquear
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  )
}
