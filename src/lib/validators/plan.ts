import { z } from 'zod'

export const planSchema = z.object({
  name: z
    .string()
    .min(1, 'Nome é obrigatório')
    .min(3, 'Nome deve ter no mínimo 3 caracteres'),
  maxCompanies: z
    .number({
      required_error: 'Número máximo de empresas é obrigatório',
      invalid_type_error: 'Deve ser um número inteiro',
    })
    .int('Deve ser um número inteiro')
    .positive('Deve ser um número positivo')
    .min(1, 'Deve permitir pelo menos 1 empresa'),
  maxManagers: z
    .number({
      required_error: 'Número máximo de gerentes é obrigatório',
      invalid_type_error: 'Deve ser um número inteiro',
    })
    .int('Deve ser um número inteiro')
    .positive('Deve ser um número positivo')
    .min(0, 'Não pode ser negativo'),
  maxExecutors: z
    .number({
      required_error: 'Número máximo de executores é obrigatório',
      invalid_type_error: 'Deve ser um número inteiro',
    })
    .int('Deve ser um número inteiro')
    .positive('Deve ser um número positivo')
    .min(0, 'Não pode ser negativo'),
  maxConsultants: z
    .number({
      required_error: 'Número máximo de consultores é obrigatório',
      invalid_type_error: 'Deve ser um número inteiro',
    })
    .int('Deve ser um número inteiro')
    .positive('Deve ser um número positivo')
    .min(0, 'Não pode ser negativo'),
  iaCallsLimit: z
    .number({
      required_error: 'Limite de chamadas de IA é obrigatório',
      invalid_type_error: 'Deve ser um número inteiro',
    })
    .int('Deve ser um número inteiro')
    .positive('Deve ser um número positivo')
    .min(0, 'Não pode ser negativo'),
})

export type PlanFormData = z.infer<typeof planSchema>
