'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Building2, Flag, Loader2, Lock, Target, User, Users } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useUserContext } from '@/lib/contexts/user-context';
import {
  actionFormSchemaWithObjective,
  actionPriorities,
  type ActionFormData,
} from '@/lib/validators/action';
import { useBlockAction, useCreateAction, useUnblockAction, useUpdateAction } from '@/lib/hooks/use-actions';
import { useCompany } from '@/lib/hooks/use-company';
import { useTeamsByCompany } from '@/lib/services/queries/use-teams';
import { useEmployeesByCompany } from '@/lib/services/queries/use-employees';
import { ActionPriority, type Action } from '@/lib/types/action';
import { getActionPriorityUI } from '../shared/action-priority-ui';
import { mergeObjectiveMeta, parseObjectiveMeta } from '@/lib/utils/objective-meta';

interface ActionFormProps {
  action?: Action;
  initialData?: Partial<ActionFormData>;
  mode: 'create' | 'edit';
  onSuccess?: () => void;
  onCancel?: () => void;
  readOnly?: boolean;
}

const priorityLabels: Record<ActionPriority, string> = {
  [ActionPriority.LOW]: getActionPriorityUI(ActionPriority.LOW).label,
  [ActionPriority.MEDIUM]: getActionPriorityUI(ActionPriority.MEDIUM).label,
  [ActionPriority.HIGH]: getActionPriorityUI(ActionPriority.HIGH).label,
  [ActionPriority.URGENT]: getActionPriorityUI(ActionPriority.URGENT).label,
};

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
};

export function ActionForm({
  action,
  initialData,
  mode,
  onSuccess,
  onCancel,
  readOnly = false,
}: ActionFormProps) {
  const router = useRouter();
  const { user, currentRole } = useUserContext();
  const { companies } = useCompany();
  const createAction = useCreateAction();
  const updateAction = useUpdateAction();
  const blockAction = useBlockAction();
  const unblockAction = useUnblockAction();

  // Check if user can block/unblock actions
  const role = currentRole ?? user?.globalRole;
  const canBlock = !!role && ['manager', 'executor', 'admin', 'master'].includes(role);
  const isEditing = mode === 'edit';

  const parsedDescription = parseObjectiveMeta(
    action?.description || initialData?.description || ''
  );

  const form = useForm<ActionFormData>({
    resolver: zodResolver(actionFormSchemaWithObjective),
    defaultValues: {
      title: action?.title || initialData?.title || '',
      description: parsedDescription.cleanDescription || '',
      objective: parsedDescription.meta.objective || '',
      objectiveDue: parsedDescription.meta.objectiveDue || '',
      estimatedStartDate: action?.estimatedStartDate?.split('T')[0] || initialData?.estimatedStartDate || '',
      estimatedEndDate: action?.estimatedEndDate?.split('T')[0] || initialData?.estimatedEndDate || '',
      priority: action?.priority || initialData?.priority || ActionPriority.MEDIUM,
      companyId: action?.companyId || initialData?.companyId || '',
      teamId: action?.teamId || initialData?.teamId || undefined,
      responsibleId: action?.responsibleId || initialData?.responsibleId || '',
      isBlocked: action?.isBlocked || initialData?.isBlocked || false,
    },
  });

  const selectedCompanyId = form.watch('companyId');

  // Keep isBlocked in sync when action updates (e.g. after block/unblock)
  useEffect(() => {
    if (isEditing && action) {
      form.setValue('isBlocked', action.isBlocked);
    }
  }, [action, form, isEditing]);

  // Fetch teams for selected company
  const { data: teamsData } = useTeamsByCompany(selectedCompanyId || '');
  const teams = teamsData?.data || [];

  // Fetch employees for selected company
  const { data: employeesData } = useEmployeesByCompany(selectedCompanyId || '');
  const employees = employeesData?.data || [];

  // Reset team and responsible when company changes
  useEffect(() => {
    if (mode === 'create' && !initialData) {
      form.setValue('teamId', undefined);
      form.setValue('responsibleId', '');
    }
  }, [selectedCompanyId, form, mode, initialData]);

  const onSubmit = async (data: ActionFormData) => {
    try {
      if (readOnly) return;
      if (mode === 'create') {
        const {
          isBlocked: _isBlocked,
          objective,
          objectiveDue,
          ...payload
        } = data;
        await createAction.mutateAsync({
          ...payload,
          description: mergeObjectiveMeta(payload.description, {
            objective,
            objectiveDue,
          }),
          teamId: payload.teamId || undefined,
        });

        toast.success('Ação criada com sucesso!');
        if (onSuccess) {
          onSuccess();
        } else {
          router.push('/actions');
        }
      } else if (action) {
        const {
          isBlocked: _isBlocked,
          objective,
          objectiveDue,
          ...payload
        } = data;
        await updateAction.mutateAsync({
          id: action.id,
          data: {
            ...payload,
            description: mergeObjectiveMeta(payload.description ?? '', {
              objective,
              objectiveDue,
            }),
            teamId: payload.teamId || undefined,
          },
        });

        toast.success('Ação atualizada com sucesso!');
        if (onSuccess) {
          onSuccess();
        } else {
          router.push(`/actions`);
        }
      }
    } catch (error) {
      toast.error(mode === 'create' ? 'Erro ao criar ação' : 'Erro ao atualizar ação');
      console.error(error);
    }
  };

  const isSubmitting =
    createAction.isPending ||
    updateAction.isPending ||
    blockAction.isPending ||
    unblockAction.isPending;

  const handleToggleBlocked = async (checked: boolean) => {
    if (!action || !isEditing || !canBlock) return;

    // optimistic UI
    form.setValue('isBlocked', checked);

    try {
      if (checked) {
        // Backend/domain requires a non-empty reason when blocking; we set a default
        await blockAction.mutateAsync({ id: action.id, data: { reason: 'Bloqueado' } });
        toast.success('Ação bloqueada');
      } else {
        await unblockAction.mutateAsync(action.id);
        toast.success('Ação desbloqueada');
      }
    } catch (error) {
      form.setValue('isBlocked', action.isBlocked);
      toast.error('Erro ao atualizar bloqueio');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {readOnly && (
          <Alert
            variant="warning"
            className="flex items-start gap-2 [&>svg]:static [&>svg+div]:translate-y-0 [&>svg~*]:pl-0"
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

          {/* Objective + Due */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="objective"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm">Objetivo (opcional)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Target className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70" />
                      <Input
                        placeholder="Ex.: reduzir churn, fechar contrato..."
                        {...field}
                        value={field.value ?? ''}
                        className="h-9 pl-9 text-sm"
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="objectiveDue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm">Prazo do objetivo (opcional)</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                      value={field.value ?? ''}
                      className="h-9 text-sm"
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        <Flag className={cn('mr-2 h-3.5 w-3.5', priorityStyles[priority].flagClass)} />
                        <span>{priorityLabels[priority]}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          {/* Company */}
          <FormField
            control={form.control}
            name="companyId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm">Empresa</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="Selecione a empresa" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {companies.map((company) => (
                      <SelectItem key={company.id} value={company.id} className="text-sm">
                        <Building2 className="mr-2 h-3.5 w-3.5 text-primary" />
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Start Date */}
          <FormField
            control={form.control}
            name="estimatedStartDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm">Data de Início</FormLabel>
                <FormControl>
                  <Input type="date" {...field} className="h-9 text-sm" />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          {/* End Date */}
          <FormField
            control={form.control}
            name="estimatedEndDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm">Data de Término</FormLabel>
                <FormControl>
                  <Input type="date" {...field} className="h-9 text-sm" />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Team (Optional) */}
          <FormField
            control={form.control}
            name="teamId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm">Equipe (Opcional)</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={!selectedCompanyId || teams.length === 0}
                >
                  <FormControl>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="Selecione a equipe" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {teams.map((team) => (
                      <SelectItem key={team.id} value={team.id} className="text-sm">
                        <Users className="mr-2 h-3.5 w-3.5 text-secondary" />
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          {/* Responsible */}
          <FormField
            control={form.control}
            name="responsibleId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm">Responsável</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={!selectedCompanyId || employees.length === 0}
                >
                  <FormControl>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="Selecione o responsável" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {employees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.userId} className="text-sm">
                        <User className="mr-2 h-3.5 w-3.5 text-info" />
                        {employee.user
                          ? `${employee.user.firstName} ${employee.user.lastName}`
                          : employee.userId}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
          </div>

        </fieldset>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              if (onCancel) return onCancel();
              router.back();
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
  );
}
