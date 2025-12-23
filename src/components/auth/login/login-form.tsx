'use client'

import { Button } from '@/components/ui/button'
import { FormFieldWrapper } from '@/components/ui/form-field-wrapper'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { ApiError } from '@/lib/api/api-client'
import { useAuth } from '@/lib/hooks/use-auth'
import { loginSchema, type LoginFormData } from '@/lib/validators/auth'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { ErrorAlert } from './error-alert'

export function LoginForm() {
  const [error, setError] = useState<string | null>(null)
  const { login, isLoading } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async (data: LoginFormData) => {
    try {
      setError(null)
      await login(data.email, data.password)
    } catch (err) {
      if (err instanceof ApiError) {
        const errorMessage =
          (err.data as { message?: string })?.message || 'Email ou senha inválidos'
        setError(errorMessage)
      } else {
        setError('Erro ao fazer login. Tente novamente.')
      }
    }
  }

  return (
    <div className="animate-fade-in relative rounded-3xl border border-border/40 bg-card/80 p-6 shadow-xl backdrop-blur-md transition-all sm:p-8 lg:rounded-2xl lg:bg-card/50 lg:shadow-2xl lg:hover:bg-card/80">
      <form
        method="POST"
        onSubmit={(e) => {
          e.preventDefault()
          handleSubmit(onSubmit)(e)
        }}
        className="space-y-6"
      >
        {error && <ErrorAlert message={error} />}

        <FormFieldWrapper label="Email" htmlFor="email" error={errors.email?.message}>
          <Input
            id="email"
            type="email"
            placeholder="seu@email.com"
            {...register('email')}
            className={`h-12 text-base transition-all ${
              errors.email
                ? 'border-destructive focus-visible:ring-destructive'
                : 'border-input focus-visible:border-primary focus-visible:ring-primary/20'
            }`}
          />
        </FormFieldWrapper>

        <FormFieldWrapper
          label="Senha"
          htmlFor="password"
          error={errors.password?.message}
          labelAction={
            <Link
              href="/forgot-password"
              className="text-xs font-semibold text-primary transition-all duration-300 hover:text-secondary hover:underline active:scale-95"
            >
              Esqueceu?
            </Link>
          }
        >
          <PasswordInput
            id="password"
            placeholder="••••••••"
            {...register('password')}
            className={`h-12 text-base transition-all ${
              errors.password
                ? 'border-destructive focus-visible:ring-destructive'
                : 'border-input focus-visible:border-primary focus-visible:ring-primary/20'
            }`}
          />
        </FormFieldWrapper>

        <Button
          type="submit"
          className="mt-8 h-12 w-full bg-gradient-to-r from-primary to-secondary text-base font-bold text-white shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:brightness-110 active:scale-[0.98]"
          size="lg"
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center gap-2.5">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
              Entrando...
            </span>
          ) : (
            'Entrar'
          )}
        </Button>
      </form>

      <div className="mt-8 border-t border-border/50 pt-6 text-center">
        <p className="text-sm text-muted-foreground">
          Não tem uma conta?{' '}
          <Link
            href="/register"
            className="font-bold text-primary transition-all duration-300 hover:text-secondary hover:underline hover:decoration-2 hover:underline-offset-4 active:scale-95"
          >
            Cadastre-se
          </Link>
        </p>
      </div>
    </div>
  )
}
