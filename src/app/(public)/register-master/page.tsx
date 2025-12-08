'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { ErrorAlert } from '@/components/auth/login/error-alert'
import { Button } from '@/components/ui/button'
import { FormFieldWrapper } from '@/components/ui/form-field-wrapper'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { PhoneInput } from '@/components/ui/phone-input'

import { ApiError } from '@/lib/api/api-client'
import { authApi } from '@/lib/api/endpoints/auth'
import { cn } from '@/lib/utils'
import { maskCPF } from '@/lib/utils/masks'
import { registerMasterSchema, type RegisterMasterFormData } from '@/lib/validators/master'

function isApiErrorData(data: unknown): data is { message?: string } {
  return (
    typeof data === 'object' &&
    data !== null &&
    ('message' in data
      ? typeof (data as { message: unknown }).message === 'string' ||
        (data as { message: unknown }).message === undefined
      : true)
  )
}

function getInputClassName(hasError: boolean): string {
  return cn(
    'h-12 text-base transition-all',
    hasError
      ? 'border-destructive focus-visible:ring-destructive'
      : 'border-input focus-visible:border-primary focus-visible:ring-primary/20'
  )
}

export default function RegisterMasterPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<RegisterMasterFormData>({
    resolver: zodResolver(registerMasterSchema),
    mode: 'onBlur',
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
      document: '',
    },
  })

  const onSubmit = async (data: RegisterMasterFormData) => {
    try {
      setError(null)
      setIsLoading(true)

      await authApi.registerMaster({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        phone: data.phone,
        document: data.document,
        documentType: 'CPF',
      })

      router.push('/login?registered=master')
    } catch (err) {
      if (err instanceof ApiError) {
        const errorMessage = isApiErrorData(err.data) ? err.data.message : undefined
        setError(errorMessage || 'Erro ao fazer cadastro. Tente novamente.')
      } else {
        setError('Erro ao fazer cadastro. Tente novamente.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Cadastro Master</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Crie sua conta master para gerenciar planos
          </p>
        </div>

        <div className="relative animate-fade-in rounded-3xl border border-border/60 bg-card/95 p-6 shadow-2xl backdrop-blur-xl transition-all sm:p-8 lg:rounded-2xl lg:bg-card lg:shadow-lg">
          <form method="POST" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && <ErrorAlert message={error} />}

            <div className="grid grid-cols-2 gap-4">
              <FormFieldWrapper label="Nome" htmlFor="firstName" error={errors.firstName?.message}>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="João"
                  {...register('firstName')}
                  className={getInputClassName(!!errors.firstName)}
                />
              </FormFieldWrapper>

              <FormFieldWrapper
                label="Sobrenome"
                htmlFor="lastName"
                error={errors.lastName?.message}
              >
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Silva"
                  {...register('lastName')}
                  className={getInputClassName(!!errors.lastName)}
                />
              </FormFieldWrapper>
            </div>

            <FormFieldWrapper label="Email" htmlFor="email" error={errors.email?.message}>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                {...register('email')}
                className={getInputClassName(!!errors.email)}
              />
            </FormFieldWrapper>

            <FormFieldWrapper label="Telefone" htmlFor="phone" error={errors.phone?.message}>
              <PhoneInput
                id="phone"
                placeholder="(11) 98765-4321"
                value={watch('phone') || ''}
                onChange={(value) => setValue('phone', value)}
                className={getInputClassName(!!errors.phone)}
              />
            </FormFieldWrapper>

            <FormFieldWrapper label="CPF" htmlFor="document" error={errors.document?.message}>
              <Input
                id="document"
                type="text"
                placeholder="000.000.000-00"
                value={watch('document') ? maskCPF(watch('document')) : ''}
                onChange={(e) => {
                  const unmasked = e.target.value.replace(/\D/g, '')
                  setValue('document', unmasked)
                }}
                className={getInputClassName(!!errors.document)}
              />
            </FormFieldWrapper>

            <FormFieldWrapper label="Senha" htmlFor="password" error={errors.password?.message}>
              <PasswordInput
                id="password"
                placeholder="••••••••"
                {...register('password')}
                className={getInputClassName(!!errors.password)}
              />
            </FormFieldWrapper>

            <FormFieldWrapper
              label="Confirmar Senha"
              htmlFor="confirmPassword"
              error={errors.confirmPassword?.message}
            >
              <PasswordInput
                id="confirmPassword"
                placeholder="••••••••"
                {...register('confirmPassword')}
                className={getInputClassName(!!errors.confirmPassword)}
              />
            </FormFieldWrapper>

            <Button
              type="submit"
              className="mt-8 h-12 w-full text-base font-semibold shadow-lg transition-all hover:shadow-xl hover:brightness-105 active:scale-[0.98]"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2.5">
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                  Cadastrando...
                </span>
              ) : (
                'Cadastrar Master'
              )}
            </Button>
          </form>

          <div className="mt-8 border-t border-border/50 pt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Já tem uma conta?{' '}
              <Link
                href="/login"
                className="font-semibold text-primary transition-all hover:text-primary/80 hover:underline active:scale-95"
              >
                Faça login
              </Link>
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Ou{' '}
              <Link
                href="/register"
                className="font-semibold text-primary transition-all hover:text-primary/80 hover:underline active:scale-95"
              >
                cadastre-se como Admin
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
