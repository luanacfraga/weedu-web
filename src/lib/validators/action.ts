import { z } from 'zod';
import { ActionPriority } from '@/lib/types/action';

export const actionPriorities = [
  ActionPriority.LOW,
  ActionPriority.MEDIUM,
  ActionPriority.HIGH,
  ActionPriority.URGENT,
] as const;

const baseActionSchema = z.object({
  title: z
    .string()
    .min(1, 'Título é obrigatório')
    .min(3, 'Título deve ter no mínimo 3 caracteres')
    .max(200, 'Título deve ter no máximo 200 caracteres'),
  description: z
    .string()
    .min(1, 'Descrição é obrigatória')
    .min(10, 'Descrição deve ter no mínimo 10 caracteres'),
  objective: z.string().optional(),
  objectiveDue: z.string().optional(),
  estimatedStartDate: z.string().min(1, 'Data de início é obrigatória'),
  estimatedEndDate: z.string().min(1, 'Data de término é obrigatória'),
  priority: z.enum(actionPriorities, {
    errorMap: () => ({ message: 'Selecione uma prioridade válida' }),
  }),
  companyId: z.string().min(1, 'Empresa é obrigatória'),
  teamId: z.string().optional(),
  responsibleId: z.string().min(1, 'Responsável é obrigatório'),
  isBlocked: z.boolean().optional(),
});

export const actionFormSchema = baseActionSchema.refine(
  (data) => {
    if (!data.estimatedStartDate || !data.estimatedEndDate) return true;
    return new Date(data.estimatedEndDate) >= new Date(data.estimatedStartDate);
  },
  {
    message: 'Data de término deve ser posterior à data de início',
    path: ['estimatedEndDate'],
  }
);

export const actionFormSchemaWithObjective = actionFormSchema.refine(
  (data) => {
    const objective = data.objective?.trim();
    const due = data.objectiveDue?.trim();
    if (!due) return true;
    return !!objective;
  },
  {
    message: 'Informe um objetivo para definir um prazo',
    path: ['objective'],
  }
);

export const updateActionFormSchema = baseActionSchema.partial();

export type ActionFormData = z.infer<typeof actionFormSchemaWithObjective>;
export type UpdateActionFormData = z.infer<typeof updateActionFormSchema>;
