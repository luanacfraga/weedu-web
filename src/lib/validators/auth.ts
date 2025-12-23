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
      .refine(
        (val) => {
          const digits = val.replace(/\D/g, '')
          return digits.length === 11 || digits.length === 10
        },
        { message: 'Digite o telefone completo (10 ou 11 dígitos)' }
      )
      .refine(
        (val) => {
          const digits = val.replace(/\D/g, '')
          // Valida se é um número de telefone brasileiro válido
          if (digits.length === 11) {
            // Celular: DDD (2 dígitos) + 9 + 8 dígitos
            return /^[1-9]{2}9[0-9]{8}$/.test(digits)
          }
          if (digits.length === 10) {
            // Fixo: DDD (2 dígitos) + 8 dígitos
            return /^[1-9]{2}[2-5][0-9]{7}$/.test(digits)
          }
          return false
        },
        { message: 'Número de telefone inválido' }
      ),
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

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Email é obrigatório').email('Email inválido'),
})

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(1, 'Senha é obrigatória')
      .min(6, 'Senha deve ter no mínimo 6 caracteres'),
    confirmPassword: z.string().min(1, 'Confirmação de senha é obrigatória'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  })

export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>
