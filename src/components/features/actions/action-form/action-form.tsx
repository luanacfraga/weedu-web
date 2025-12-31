'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
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
import { actionFormSchema, actionPriorities, type ActionFormData } from '@/lib/validators/action';
import { useCreateAction, useUpdateAction } from '@/lib/hooks/use-actions';
import { useCompany } from '@/lib/hooks/use-company';
import { useTeamsByCompany } from '@/lib/services/queries/use-teams';
import { useEmployeesByCompany } from '@/lib/services/queries/use-employees';
import { ActionPriority, type Action } from '@/lib/types/action';

interface ActionFormProps {
  action?: Action;
  mode: 'create' | 'edit';
  onSuccess?: () => void;
}

const priorityLabels: Record<ActionPriority, string> = {
  [ActionPriority.LOW]: 'Baixa',
  [ActionPriority.MEDIUM]: 'Média',
  [ActionPriority.HIGH]: 'Alta',
  [ActionPriority.URGENT]: 'Urgente',
};

export function ActionForm({ action, mode, onSuccess }: ActionFormProps) {
  const router = useRouter();
  const { companies } = useCompany();
  const createAction = useCreateAction();
  const updateAction = useUpdateAction();

  const form = useForm<ActionFormData>({
    resolver: zodResolver(actionFormSchema),
    defaultValues: {
      title: action?.title || '',
      description: action?.description || '',
      estimatedStartDate: action?.estimatedStartDate?.split('T')[0] || '',
      estimatedEndDate: action?.estimatedEndDate?.split('T')[0] || '',
      priority: action?.priority || ActionPriority.MEDIUM,
      companyId: action?.companyId || '',
      teamId: action?.teamId || undefined,
      responsibleId: action?.responsibleId || '',
    },
  });

  const selectedCompanyId = form.watch('companyId');

  // Fetch teams for selected company
  const { data: teamsData } = useTeamsByCompany(selectedCompanyId || '');
  const teams = teamsData?.data || [];

  // Fetch employees for selected company
  const { data: employeesData } = useEmployeesByCompany(selectedCompanyId || '');
  const employees = employeesData?.data || [];

  // Reset team and responsible when company changes
  useEffect(() => {
    if (mode === 'create') {
      form.setValue('teamId', undefined);
      form.setValue('responsibleId', '');
    }
  }, [selectedCompanyId, form, mode]);

  const onSubmit = async (data: ActionFormData) => {
    try {
      if (mode === 'create') {
        await createAction.mutateAsync({
          ...data,
          teamId: data.teamId || undefined,
        });
        toast.success('Ação criada com sucesso!');
        if (onSuccess) {
          onSuccess();
        } else {
          router.push('/actions');
        }
      } else if (action) {
        await updateAction.mutateAsync({
          id: action.id,
          data: {
            ...data,
            teamId: data.teamId || undefined,
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
    }
  };

  const isSubmitting = createAction.isPending || updateAction.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
        {/* Title */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm">Título</FormLabel>
              <FormControl>
                <Input placeholder="Digite o título da ação" {...field} className="h-8 text-sm" />
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
                  className="min-h-[80px] text-sm"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Priority */}
          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm">Prioridade</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue placeholder="Selecione a prioridade" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {actionPriorities.map((priority) => (
                      <SelectItem key={priority} value={priority} className="text-sm">
                        {priorityLabels[priority]}
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
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue placeholder="Selecione a empresa" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {companies.map((company) => (
                      <SelectItem key={company.id} value={company.id} className="text-sm">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Start Date */}
          <FormField
            control={form.control}
            name="estimatedStartDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm">Data de Início</FormLabel>
                <FormControl>
                  <Input type="date" {...field} className="h-8 text-sm" />
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
                  <Input type="date" {...field} className="h-8 text-sm" />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue placeholder="Selecione a equipe" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {teams.map((team) => (
                      <SelectItem key={team.id} value={team.id} className="text-sm">
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
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue placeholder="Selecione o responsável" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {employees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.userId} className="text-sm">
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

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
            size="sm"
            className="h-8 text-sm"
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting} size="sm" className="h-8 text-sm">
            {isSubmitting && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
            {mode === 'create' ? 'Criar Ação' : 'Salvar Alterações'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
