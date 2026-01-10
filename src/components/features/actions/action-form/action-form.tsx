'use client'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { UserAvatar } from '@/components/ui/user-avatar'
import { ApiError } from '@/lib/api/api-client'
import { useUserContext } from '@/lib/contexts/user-context'
import {
  useBlockAction,
  useCreateAction,
  useUnblockAction,
  useUpdateAction,
} from '@/lib/hooks/use-actions'
import { useCompany } from '@/lib/hooks/use-company'
import { useCompanyResponsibles } from '@/lib/services/queries/use-companies'
import { useTeamResponsibles, useTeamsByCompany } from '@/lib/services/queries/use-teams'
import { useAuthStore } from '@/lib/stores/auth-store'
import { ActionPriority, type Action } from '@/lib/types/action'
import type { Employee } from '@/lib/types/api'
import { cn } from '@/lib/utils'
import { actionFormSchema, actionPriorities, type ActionFormData } from '@/lib/validators/action'
import { zodResolver } from '@hookform/resolvers/zod'
import { Building2, Flag, Loader2, Lock, Users } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { getActionPriorityUI } from '../shared/action-priority-ui'

interface ActionFormProps {
  action?: Action
  initialData?: Partial<ActionFormData>
  mode: 'create' | 'edit'
  onSuccess?: () => void
  onCancel?: () => void
  readOnly?: boolean
}

const priorityLabels: Record<ActionPriority, string> = {
  [ActionPriority.LOW]: getActionPriorityUI(ActionPriority.LOW).label,
  [ActionPriority.MEDIUM]: getActionPriorityUI(ActionPriority.MEDIUM).label,
  [ActionPriority.HIGH]: getActionPriorityUI(ActionPriority.HIGH).label,
  [ActionPriority.URGENT]: getActionPriorityUI(ActionPriority.URGENT).label,
}

const priorityStyles: Record<ActionPriority, { itemActiveClass: string; flagClass: string }> = {
  [ActionPriority.LOW]: {
    itemActiveClass: getActionPriorityUI(ActionPriority.LOW).itemActiveClass,
    flagClass: getActionPriorityUI(ActionPriority.LOW).flagClass,
  },
  [ActionPriority.MEDIUM]: {
    itemActiveClass: getActionPriorityUI(ActionPriority.MEDIUM).itemActiveClass,
    flagClass: getActionPriorityUI(ActionPriority.MEDIUM).flagClass,
  },
  [ActionPriority.HIGH]: {
    itemActiveClass: getActionPriorityUI(ActionPriority.HIGH).itemActiveClass,
    flagClass: getActionPriorityUI(ActionPriority.HIGH).flagClass,
  },
  [ActionPriority.URGENT]: {
    itemActiveClass: getActionPriorityUI(ActionPriority.URGENT).itemActiveClass,
    flagClass: getActionPriorityUI(ActionPriority.URGENT).flagClass,
  },
}

export function ActionForm({
  action,
  initialData,
  mode,
  onSuccess,
  onCancel,
  readOnly = false,
}: ActionFormProps) {
  const router = useRouter()
  const authUser = useAuthStore((s) => s.user)
  const { user, currentRole, currentCompanyId } = useUserContext()
  const { companies } = useCompany()
  const createAction = useCreateAction()
  const updateAction = useUpdateAction()
  const blockAction = useBlockAction()
  const unblockAction = useUnblockAction()

  // Check if user can block/unblock actions
  const role = currentRole ?? user?.globalRole
  const canBlock = !!role && ['manager', 'executor', 'admin', 'master'].includes(role)
  const isEditing = mode === 'edit'

  const defaultCompanyId =
    action?.companyId ||
    initialData?.companyId ||
    currentCompanyId ||
    user?.companies?.[0]?.id ||
    ''

  const form = useForm<ActionFormData>({
    resolver: zodResolver(actionFormSchema),
    defaultValues: {
      title: action?.title || initialData?.title || '',
      description: action?.description || initialData?.description || '',
      estimatedStartDate:
        action?.estimatedStartDate?.split('T')[0] || initialData?.estimatedStartDate || '',
      estimatedEndDate:
        action?.estimatedEndDate?.split('T')[0] || initialData?.estimatedEndDate || '',
      priority: action?.priority || initialData?.priority || ActionPriority.MEDIUM,
      companyId: defaultCompanyId,
      teamId: action?.teamId || initialData?.teamId || undefined,
      responsibleId: action?.responsibleId || initialData?.responsibleId || '',
      isBlocked: action?.isBlocked || initialData?.isBlocked || false,
      actualStartDate:
        action?.actualStartDate?.split('T')[0] || initialData?.actualStartDate || undefined,
      actualEndDate:
        action?.actualEndDate?.split('T')[0] || initialData?.actualEndDate || undefined,
    },
  })

  const selectedCompanyId = form.watch('companyId')
  const selectedTeamId = form.watch('teamId')
  // Garante que a empresa seja preenchida assim que o contexto/carregamento estiver disponível
  useEffect(() => {
    if (selectedCompanyId) return

    const fallbackCompanyId =
      currentCompanyId || user?.companies?.[0]?.id || action?.companyId || initialData?.companyId

    if (fallbackCompanyId) {
      form.setValue('companyId', fallbackCompanyId)
    }
  }, [
    selectedCompanyId,
    currentCompanyId,
    user?.companies,
    action?.companyId,
    initialData?.companyId,
    form,
  ])

  // Keep isBlocked in sync when action updates (e.g. after block/unblock)
  useEffect(() => {
    if (isEditing && action) {
      form.setValue('isBlocked', action.isBlocked)
    }
  }, [action, form, isEditing])

  // Fetch teams for selected company
  const { data: teamsData } = useTeamsByCompany(selectedCompanyId || '')
  const teams = teamsData?.data || []

  // Responsáveis por equipe (quando houver equipe definida)
  const { data: teamResponsibles = [] } = useTeamResponsibles(selectedTeamId || '')

  // Responsáveis em nível de empresa (backend aplica regras por papel)
  const { data: companyResponsibles = [] } = useCompanyResponsibles(selectedCompanyId || '')
  const baseResponsibleOptions: Employee[] = selectedTeamId ? teamResponsibles : companyResponsibles

  // Quando não há executores/ responsáveis retornados pelo backend,
  // permitimos que o próprio gestor/admin se selecione como responsável,
  // para que ele consiga criar ações mesmo sendo o único usuário associado.
  const shouldInjectCurrentUserAsResponsible =
    !selectedTeamId &&
    baseResponsibleOptions.length === 0 &&
    !!selectedCompanyId &&
    !!authUser &&
    !!role &&
    ['manager', 'admin'].includes(role)

  const injectedCurrentUserAsEmployee: Employee | null = shouldInjectCurrentUserAsResponsible
    ? {
        id: `self-${authUser!.id}-${selectedCompanyId}`,
        userId: authUser!.id,
        companyId: selectedCompanyId!,
        role: 'manager',
        status: 'ACTIVE',
        position: undefined,
        notes: undefined,
        invitedAt: null,
        acceptedAt: null,
        invitedBy: null,
        user: (() => {
          const fullName = authUser!.name || ''
          const [firstName, ...rest] = fullName.split(' ')
          const lastName = rest.join(' ') || firstName
          return {
            id: authUser!.id,
            firstName: firstName || fullName || 'Usuário',
            lastName: lastName || '',
            email: authUser!.email,
            phone: authUser!.phone ?? '',
            document: authUser!.document ?? '',
            role: role!,
            initials: authUser!.initials ?? null,
            avatarColor: authUser!.avatarColor ?? null,
          }
        })(),
      }
    : null

  const responsibleOptions: Employee[] = (() => {
    if (!injectedCurrentUserAsEmployee) return baseResponsibleOptions
    const exists = baseResponsibleOptions.some(
      (emp) => emp.userId === injectedCurrentUserAsEmployee.userId
    )
    if (exists) return baseResponsibleOptions
    return [...baseResponsibleOptions, injectedCurrentUserAsEmployee]
  })()

  // Se existir exatamente um responsável disponível e nenhum selecionado ainda,
  // preenche automaticamente para evitar bloqueio na criação.
  useEffect(() => {
    const currentResponsibleId = form.getValues('responsibleId')
    if (!currentResponsibleId && responsibleOptions.length === 1) {
      form.setValue('responsibleId', responsibleOptions[0].userId)
    }
  }, [form, responsibleOptions])

  // Reset team and responsible when company changes
  useEffect(() => {
    if (mode === 'create' && !initialData) {
      form.setValue('teamId', undefined)
      form.setValue('responsibleId', '')
    }
  }, [selectedCompanyId, form, mode, initialData])

  const onSubmit = async (data: ActionFormData) => {
    try {
      if (readOnly) return
      if (mode === 'create') {
        const { isBlocked: _isBlocked, ...payload } = data
        await createAction.mutateAsync({
          ...payload,
          teamId: payload.teamId || undefined,
        })

        toast.success('Ação criada com sucesso!')
        if (onSuccess) {
          onSuccess()
        } else {
          router.push('/actions')
        }
      } else if (action) {
        const {
          isBlocked: _isBlocked,
          companyId: _companyId, // não é permitido no UpdateActionDto da API
          ...payload
        } = data
        await updateAction.mutateAsync({
          id: action.id,
          data: {
            ...payload,
            teamId: payload.teamId || undefined,
            // Datas reais são opcionais; quando presentes, convertemos para ISO preservando apenas a parte de data.
            actualStartDate: payload.actualStartDate
              ? new Date(payload.actualStartDate).toISOString()
              : undefined,
            actualEndDate: payload.actualEndDate
              ? new Date(payload.actualEndDate).toISOString()
              : undefined,
          },
        })

        toast.success('Ação atualizada com sucesso!')
        if (onSuccess) {
          onSuccess()
        } else {
          router.push(`/actions`)
        }
      }
    } catch (error) {
      const defaultMessage = mode === 'create' ? 'Erro ao criar ação' : 'Erro ao atualizar ação'
      const message =
        error instanceof ApiError && (error.data as any)?.message
          ? (error.data as any).message
          : error instanceof Error && error.message
            ? error.message
            : defaultMessage
      toast.error(message)
      console.error(error)
    }
  }

  const isSubmitting =
    createAction.isPending ||
    updateAction.isPending ||
    blockAction.isPending ||
    unblockAction.isPending

  const handleToggleBlocked = async (checked: boolean) => {
    if (!action || !isEditing || !canBlock) return

    // optimistic UI
    form.setValue('isBlocked', checked)

    try {
      if (checked) {
        // Backend/domain requires a non-empty reason when blocking; we set a default
        await blockAction.mutateAsync({ id: action.id, data: { reason: 'Bloqueado' } })
        toast.success('Ação bloqueada')
      } else {
        await unblockAction.mutateAsync(action.id)
        toast.success('Ação desbloqueada')
      }
    } catch (error) {
      form.setValue('isBlocked', action.isBlocked)
      toast.error('Erro ao atualizar bloqueio')
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {readOnly && (
          <Alert
            variant="warning"
            className="flex items-start gap-2 [&>svg+div]:translate-y-0 [&>svg]:static [&>svg~*]:pl-0"
          >
            <Lock className="mt-0.5 h-4 w-4" />
            <AlertDescription className="leading-relaxed">
              Esta ação está bloqueada.
              {canBlock
                ? ' Desmarque o bloqueio para editar.'
                : ' Somente gestores, executores e admins podem desbloquear.'}
            </AlertDescription>
          </Alert>
        )}
        {/* Block Toggle - allow unblock even when readOnly */}
        {canBlock && isEditing && action && (
          <div className="flex items-center justify-between rounded-lg border border-border/40 bg-muted/30 p-4">
            <div className="flex items-center gap-3">
              <Lock className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label className="text-sm font-semibold">Bloquear Ação</Label>
                <p className="text-xs text-muted-foreground">
                  Impede edição e movimentação por qualquer usuário
                </p>
              </div>
            </div>
            <Switch
              checked={form.watch('isBlocked') || false}
              onCheckedChange={handleToggleBlocked}
              disabled={isSubmitting}
            />
          </div>
        )}

        <fieldset disabled={isSubmitting || readOnly} className="space-y-4">
          {/* Title */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm">Título</FormLabel>
                <FormControl>
                  <Input placeholder="Digite o título da ação" {...field} className="h-9 text-sm" />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          {/* Description */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm">Descrição</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Descreva a ação em detalhes"
                    className="min-h-[100px] text-sm"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          {/* Empresa (definida pelo contexto, não selecionável) */}
          {selectedCompanyId && (
            <div className="space-y-1">
              <FormLabel className="text-sm">Empresa</FormLabel>
              <div className="flex h-9 items-center gap-2 rounded-md border border-border/60 bg-muted/40 px-3 text-xs text-muted-foreground">
                <Building2 className="h-3.5 w-3.5 text-primary" />
                <span>
                  {companies.find((c) => c.id === selectedCompanyId)?.name || 'Empresa selecionada'}
                </span>
              </div>
            </div>
          )}

          {/* Responsável (filtrado pela equipe pré-definida) */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {selectedTeamId && (
              <div className="space-y-1">
                <FormLabel className="text-sm">Equipe</FormLabel>
                <div className="flex h-9 items-center gap-2 rounded-md border border-border/60 bg-muted/40 px-3 text-xs text-muted-foreground">
                  <Users className="h-3.5 w-3.5 text-secondary" />
                  <span>
                    {teams.find((t) => t.id === selectedTeamId)?.name || 'Equipe vinculada à ação'}
                  </span>
                </div>
              </div>
            )}

            <FormField
              control={form.control}
              name="responsibleId"
              render={({ field }) => {
                const selectedEmployee = responsibleOptions.find(
                  (emp) => emp.userId === field.value
                )
                const selectedInitials =
                  authUser && selectedEmployee?.userId === authUser.id
                    ? (authUser.initials ?? null)
                    : (selectedEmployee?.user?.initials ?? null)
                const selectedAvatarColor =
                  authUser && selectedEmployee?.userId === authUser.id
                    ? (authUser.avatarColor ?? null)
                    : (selectedEmployee?.user?.avatarColor ?? null)
                return (
                  <FormItem>
                    <FormLabel className="text-sm">Responsável</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={!selectedCompanyId || responsibleOptions.length === 0}
                    >
                      <FormControl>
                        <SelectTrigger className="h-9 text-sm">
                          {selectedEmployee && selectedEmployee.user ? (
                            <div className="flex items-center gap-2">
                              <UserAvatar
                                firstName={selectedEmployee.user.firstName}
                                lastName={selectedEmployee.user.lastName}
                                initials={selectedInitials}
                                avatarColor={selectedAvatarColor}
                                size="sm"
                                className="h-5 w-5 text-[9px]"
                              />
                              <span>
                                {selectedEmployee.user.firstName} {selectedEmployee.user.lastName}
                              </span>
                            </div>
                          ) : (
                            <SelectValue placeholder="Selecione o responsável" />
                          )}
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {responsibleOptions.map((employee) => (
                          <SelectItem key={employee.id} value={employee.userId} className="text-sm">
                            <div className="flex items-center gap-2">
                              <UserAvatar
                                firstName={employee.user?.firstName}
                                lastName={employee.user?.lastName}
                                initials={
                                  authUser && employee.userId === authUser.id
                                    ? (authUser.initials ?? null)
                                    : (employee.user?.initials ?? null)
                                }
                                avatarColor={
                                  authUser && employee.userId === authUser.id
                                    ? (authUser.avatarColor ?? null)
                                    : (employee.user?.avatarColor ?? null)
                                }
                                size="sm"
                                className="h-5 w-5 text-[9px]"
                              />
                              <span>
                                {employee.user
                                  ? `${employee.user.firstName} ${employee.user.lastName}`
                                  : employee.userId}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )
              }}
            />
          </div>

          {/* Priority */}
          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm">Prioridade</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="Selecione a prioridade" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {actionPriorities.map((priority) => (
                      <SelectItem
                        key={priority}
                        value={priority}
                        className={cn(
                          'text-sm',
                          field.value === priority && priorityStyles[priority].itemActiveClass
                        )}
                      >
                        <Flag
                          className={cn('mr-2 h-3.5 w-3.5', priorityStyles[priority].flagClass)}
                        />
                        <span>{priorityLabels[priority]}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          {/* Dates */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Estimated Start Date */}
              <FormField
                control={form.control}
                name="estimatedStartDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">Início Previsto</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        className="h-9 text-sm"
                        max={form.watch('estimatedEndDate') ?? undefined}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              {/* Estimated End Date */}
              <FormField
                control={form.control}
                name="estimatedEndDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">Fim Previsto</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        className="h-9 text-sm"
                        min={form.watch('estimatedStartDate') ?? undefined}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </div>

            {isEditing && (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* Actual Start Date */}
                <FormField
                  control={form.control}
                  name="actualStartDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">Início Real</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          className="h-9 text-sm"
                          max={form.watch('actualEndDate') ?? undefined}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                {/* Actual End Date */}
                <FormField
                  control={form.control}
                  name="actualEndDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">Fim Real</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          className="h-9 text-sm"
                          min={form.watch('actualStartDate') ?? undefined}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </div>
            )}
          </div>
        </fieldset>

        {/* Actions */}
        <div className="flex justify-end gap-2 border-t pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              if (onCancel) return onCancel()
              router.back()
            }}
            disabled={isSubmitting}
            size="sm"
          >
            {readOnly ? 'Fechar' : 'Cancelar'}
          </Button>
          {!readOnly && (
            <Button type="submit" disabled={isSubmitting} size="sm">
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === 'create' ? 'Criar Ação' : 'Salvar Alterações'}
            </Button>
          )}
        </div>
      </form>
    </Form>
  )
}
