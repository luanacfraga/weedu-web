import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().min(1, 'Email é obrigatório').email('Email inválido'),
  password: z
    .string()
    .min(1, 'Senha é obrigatória')
    .min(6, 'Senha deve ter no mínimo 6 caracteres'),
})

export const registerSchema = z
  .object({
    firstName: z
      .string()
      .min(1, 'Nome é obrigatório')
      .min(2, 'Nome deve ter no mínimo 2 caracteres'),
    lastName: z
      .string()
      .min(1, 'Sobrenome é obrigatório')
      .min(2, 'Sobrenome deve ter no mínimo 2 caracteres'),
    email: z.string().min(1, 'Email é obrigatório').email('Email inválido'),
    password: z
      .string()
      .min(1, 'Senha é obrigatória')
      .min(6, 'Senha deve ter no mínimo 6 caracteres'),
    confirmPassword: z.string().min(1, 'Confirmação de senha é obrigatória'),
    phone: z
      .string()
      .min(1, 'Telefone é obrigatório')
      .regex(/^\d{10,11}$/, 'Telefone inválido (apenas números)'),
  document: z
    .string()
    .min(1, 'CNPJ é obrigatório')
    .regex(/^\d{14}$/, 'CNPJ deve conter 14 dígitos'),
    companyName: z
      .string()
      .min(1, 'Nome da empresa é obrigatório')
      .min(3, 'Nome da empresa deve ter no mínimo 3 caracteres'),
    companyDescription: z
      .string()
      .min(1, 'Descrição da empresa é obrigatória')
      .min(10, 'Descrição deve ter no mínimo 10 caracteres'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  })

export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
