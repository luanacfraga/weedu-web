'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { CheckCircle2, Loader2, Mail } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FormFieldWrapper } from '@/components/ui/form-field-wrapper'
import { Input } from '@/components/ui/input'

import { authApi } from '@/lib/api/endpoints/auth'
import { cn } from '@/lib/utils'

import { forgotPasswordSchema, type ForgotPasswordFormData } from '@/lib/validators/auth'

import { getApiErrorMessage } from '@/lib/utils/error-handling'
import { getInputClassName } from '@/lib/utils/form-styles'
import { ErrorAlert } from '../login/error-alert'

export function ForgotPasswordForm() {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  })

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      setError(null)
      setIsLoading(true)
      await authApi.forgotPassword({ email: data.email })
      setSuccess(true)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Erro ao enviar email de recuperação'))
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <Card className="animate-fade-in">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success-lightest">
            <CheckCircle2 className="h-8 w-8 text-success-base" />
          </div>
          <CardTitle className="text-xl">Email enviado!</CardTitle>
          <CardDescription className="mt-2">
            Enviamos um link de redefinição de senha para o email informado. Verifique sua caixa de
            entrada e siga as instruções.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button asChild className="w-full" variant="outline">
              <Link href="/login">Voltar para login</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="relative animate-fade-in rounded-3xl border border-border/60 bg-card/95 p-6 shadow-2xl backdrop-blur-xl transition-all sm:p-8 lg:rounded-2xl lg:bg-card lg:shadow-lg">
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
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              {...register('email')}
              className={cn(getInputClassName(!!errors.email), 'pl-10')}
            />
          </div>
        </FormFieldWrapper>

        <Button
          type="submit"
          className="mt-8 h-12 w-full text-base font-semibold shadow-lg transition-all hover:shadow-xl hover:brightness-105 active:scale-[0.98]"
          size="lg"
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center gap-2.5">
              <Loader2 className="h-5 w-5 animate-spin" />
              Enviando...
            </span>
          ) : (
            'Enviar link de recuperação'
          )}
        </Button>
      </form>

      <div className="mt-8 border-t border-border/50 pt-6 text-center">
        <p className="text-sm text-muted-foreground">
          Lembrou sua senha?{' '}
          <Link
            href="/login"
            className="font-semibold text-primary transition-all hover:text-primary/80 hover:underline active:scale-95"
          >
            Voltar para login
          </Link>
        </p>
      </div>
    </div>
  )
}
