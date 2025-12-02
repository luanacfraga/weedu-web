'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ApiError } from '@/lib/api/api-client'
import { companiesApi } from '@/lib/api/endpoints/companies'
import { createCompanySchema, type CreateCompanyFormData } from '@/lib/validators/company'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { HeaderMenu } from '@/components/layout/header-menu'
import {
  Building2,
  ArrowLeft,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react'
import { useAuthStore } from '@/lib/stores/auth-store'
import { useCompanyStore } from '@/lib/stores/company-store'
import { AdminOnly } from '@/components/features/auth/guards/admin-only'

export default function NewCompanyPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const user = useAuthStore((state) => state.user)
  const addCompany = useCompanyStore((state) => state.addCompany)
  const selectCompany = useCompanyStore((state) => state.selectCompany)
  
  const redirectPath = searchParams.get('redirect') || '/select-company'

  const form = useForm<CreateCompanyFormData>({
    resolver: zodResolver(createCompanySchema),
    defaultValues: {
      name: '',
      description: '',
    },
  })

  const onSubmit = async (data: CreateCompanyFormData) => {
    try {
      setError(null)

      if (!user?.id) {
        setError('Usuário não autenticado')
        return
      }

      const newCompany = await companiesApi.create({
        name: data.name,
        description: data.description && data.description.trim() !== '' ? data.description.trim() : undefined,
        adminId: user.id,
      })

      // Add to store and select it
      addCompany(newCompany)
      selectCompany(newCompany)

      setSuccess(true)
      setTimeout(() => {
        // If coming from select-company, go back there. Otherwise go to dashboard
        if (redirectPath === '/select-company') {
          router.push('/select-company')
        } else {
          router.push('/dashboard')
        }
      }, 2000)
    } catch (err) {
      if (err instanceof ApiError) {
        const errorData = err.data as { message?: string }
        const errorMessage = errorData?.message || 'Erro ao criar empresa. Tente novamente.'
        setError(errorMessage)
      } else {
        setError('Erro ao criar empresa. Tente novamente.')
      }
    }
  }

  if (success) {
    return (
      <AdminOnly>
        <div className="flex min-h-screen flex-col bg-background">
          <HeaderMenu />
          <div className="flex flex-1 items-center justify-center pt-16 sm:pt-20">
            <div className="w-full max-w-md px-6">
              <Card className="animate-fade-in text-center">
                <CardHeader>
                  <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-success-lightest">
                    <CheckCircle2 className="h-10 w-10 text-success-base" />
                  </div>
                  <CardTitle className="text-2xl">Empresa criada com sucesso!</CardTitle>
                  <CardDescription className="pt-2">
                    Sua nova empresa foi cadastrada e já está selecionada.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => {
                      if (redirectPath === '/select-company') {
                        router.push('/select-company')
                      } else {
                        router.push('/dashboard')
                      }
                    }}
                    className="w-full"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    {redirectPath === '/select-company' ? 'Voltar' : 'Ir para Dashboard'}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </AdminOnly>
    )
  }

  return (
    <AdminOnly>
      <div className="flex min-h-screen flex-col bg-background">
        <HeaderMenu />
        <div className="flex flex-1 pt-16 sm:pt-20">
          <div className="mx-auto w-full max-w-3xl px-6 py-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                Nova Empresa
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Cadastre uma nova empresa para gerenciar
              </p>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="mb-6 rounded-lg border border-destructive/50 bg-destructive/10 p-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              </div>
            )}

            {/* Form */}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <Card className="border border-border">
                  <CardContent className="p-6 sm:p-8">
                    <div className="space-y-6">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Nome da Empresa <span className="text-destructive">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Ex: Minha Empresa LTDA"
                                className="h-11"
                                {...field}
                                autoFocus
                              />
                            </FormControl>
                            <FormDescription>
                              Nome oficial ou razão social da empresa
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Descrição</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Descreva sua empresa (opcional)"
                                className="min-h-[100px] resize-none"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Adicione uma descrição sobre sua empresa (máximo 500 caracteres)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Submit Actions */}
                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={() => router.push(redirectPath)}
                    disabled={form.formState.isSubmitting}
                    className="w-full sm:w-auto"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    size="lg"
                    disabled={form.formState.isSubmitting}
                    className="w-full sm:w-auto sm:min-w-[200px]"
                  >
                    {form.formState.isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Criando empresa...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Criar Empresa
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </AdminOnly>
  )
}
