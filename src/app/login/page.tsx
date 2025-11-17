'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ApiError } from '@/lib/api'
import { useAuth } from '@/lib/hooks/use-auth'
import { loginSchema, type LoginFormData } from '@/lib/validators/auth'
import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
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
    <div className="relative flex min-h-screen overflow-hidden">
      <div className="from-primary/8 to-secondary/8 absolute inset-0 bg-gradient-to-b via-background via-50% lg:hidden"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent lg:hidden"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-secondary/10 via-transparent to-transparent lg:hidden"></div>

      <div className="animate-blob absolute -right-40 -top-40 h-80 w-80 rounded-full bg-primary/15 opacity-40 blur-[100px] lg:hidden"></div>
      <div className="animate-blob animation-delay-2000 absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-secondary/15 opacity-40 blur-[120px] lg:hidden"></div>
      <div className="animate-blob animation-delay-4000 absolute right-1/3 top-1/3 h-64 w-64 rounded-full bg-primary/10 opacity-30 blur-[80px] lg:hidden"></div>
      <div className="animate-blob animation-delay-3000 bg-secondary/12 absolute bottom-1/4 left-1/4 h-72 w-72 rounded-full opacity-25 blur-[90px] lg:hidden"></div>

      <div className="relative hidden overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-secondary/10 lg:flex lg:w-1/2">
        <div className="animate-blob absolute right-0 top-0 h-64 w-64 rounded-full bg-primary/20 opacity-40 mix-blend-multiply blur-xl filter"></div>
        <div className="animate-blob animation-delay-2000 absolute right-0 top-0 h-64 w-64 rounded-full bg-secondary/20 opacity-40 mix-blend-multiply blur-xl filter"></div>
        <div className="animate-blob animation-delay-4000 absolute -bottom-8 left-0 h-64 w-64 rounded-full bg-primary/20 opacity-40 mix-blend-multiply blur-xl filter"></div>

        <div className="relative z-10 mx-auto flex max-w-md flex-col justify-center px-12">
          <div className="mb-6 flex items-center">
            <h1 className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-3xl font-bold text-transparent">
              Weedu
            </h1>
          </div>
          <h2 className="mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-4xl font-bold leading-tight text-transparent md:text-5xl">
            Transforme a gestão da sua empresa
          </h2>
          <p className="text-lg text-muted-foreground">
            Simplifique. Produza mais. Cresça com facilidade usando nossa plataforma inteligente.
          </p>
        </div>
      </div>

      <div className="relative z-10 flex flex-1 flex-col justify-center px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mx-auto w-full max-w-md">
          <div className="animate-fade-in mb-8 text-center lg:hidden">
            <div className="mb-6 flex flex-col items-center gap-4">
              <div className="text-center">
                <h1 className="bg-gradient-to-r from-primary via-primary to-secondary bg-clip-text text-3xl font-bold text-transparent">
                  Weedu
                </h1>
                <p className="mt-1 text-xs text-muted-foreground">Gestão inteligente</p>
              </div>
            </div>
            <h2 className="mb-2 text-2xl font-bold text-foreground">Bem-vindo de volta</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Entre com suas credenciais para acessar sua conta
            </p>
          </div>

          <div className="mb-8 hidden text-center lg:block">
            <h2 className="text-3xl font-bold text-foreground">Bem-vindo de volta</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Entre com suas credenciais para continuar
            </p>
          </div>
          <div className="animate-fade-in relative rounded-3xl border border-border/60 bg-card/95 p-6 shadow-2xl backdrop-blur-xl transition-all sm:p-8 lg:rounded-2xl lg:bg-card lg:shadow-lg">
            <form
              method="POST"
              onSubmit={(e) => {
                e.preventDefault()
                handleSubmit(onSubmit)(e)
              }}
              className="space-y-6"
            >
              {error && (
                <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-2.5">
                <Label htmlFor="email" className="text-sm font-semibold text-foreground">
                  Email
                </Label>
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
                {errors.email && (
                  <p className="text-sm font-medium text-destructive">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-semibold text-foreground">
                    Senha
                  </Label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-xs font-semibold text-primary transition-all hover:text-primary/80 active:scale-95"
                  >
                    Esqueceu?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    {...register('password')}
                    className={`h-12 pr-12 text-base transition-all ${
                      errors.password
                        ? 'border-destructive focus-visible:ring-destructive'
                        : 'border-input focus-visible:border-primary focus-visible:ring-primary/20'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-muted-foreground transition-all hover:bg-muted hover:text-foreground active:scale-95"
                    aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm font-medium text-destructive">{errors.password.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="mt-8 h-12 w-full text-base font-semibold shadow-lg transition-all hover:shadow-xl hover:brightness-105 active:scale-[0.98]"
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
                  className="font-semibold text-primary transition-all hover:text-primary/80 hover:underline active:scale-95"
                >
                  Cadastre-se
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
