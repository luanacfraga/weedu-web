'use client'

import { AdminOnly } from '@/components/features/auth/guards/admin-only'
import { PageContainer } from '@/components/shared/layout/page-container'
import { PageHeader } from '@/components/shared/layout/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ApiError } from '@/lib/api/api-client'
import { useCreateCompany } from '@/lib/services/queries/use-companies'
import { useAuthStore } from '@/lib/stores/auth-store'
import { createCompanySchema, type CreateCompanyFormData } from '@/lib/validators/company'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  CheckCircle2,
  FileText,
  Loader2,
  Save,
} from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

export default function NewCompanyPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const user = useAuthStore((state) => state.user)
  const { mutateAsync: createCompany, isPending } = useCreateCompany()

  const redirectPath = searchParams.get('redirect') || '/companies'

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

      await createCompany({
        name: data.name,
        description:
          data.description && data.description.trim() !== '' ? data.description.trim() : undefined,
        adminId: user.id,
      })

      setSuccess(true)
      setTimeout(() => {
        router.push(redirectPath === '/companies' ? '/companies' : '/dashboard')
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
      <PageContainer>
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
          <Card className="w-full max-w-md animate-fade-in text-center">
            <CardHeader>
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-success-lightest">
                <CheckCircle2 className="h-10 w-10 text-success-base" />
              </div>
              <CardTitle className="text-2xl">Empresa criada com sucesso!</CardTitle>
              <CardDescription className="pt-2">
                Sua nova empresa foi cadastrada e já está disponível para gerenciamento.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                onClick={() =>
                  router.push(redirectPath === '/companies' ? '/companies' : '/dashboard')
                }
                className="w-full"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                {redirectPath === '/companies' ? 'Voltar à Listagem' : 'Ir para Dashboard'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </PageContainer>
    )
  }

  return (
    <AdminOnly>
      <PageContainer>
        <PageHeader
          title="Nova Empresa"
          description="Cadastre uma nova empresa para gerenciar sua equipe e projetos"
          backHref={redirectPath}
        />

        {error && (
          <div className="mb-6 animate-fade-in rounded-lg border border-danger-light bg-danger-lightest p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 flex-shrink-0 text-danger-base" />
              <div className="flex-1">
                <h3 className="font-semibold text-danger-dark">Erro ao criar empresa</h3>
                <p className="mt-1 text-sm text-danger-base">{error}</p>
              </div>
            </div>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="rounded-xl border bg-card shadow-sm">
              <div className="border-b p-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2 text-primary">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base font-semibold">Informações da Empresa</h3>
                    <p className="text-sm text-muted-foreground">Dados básicos da empresa</p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <fieldset disabled={form.formState.isSubmitting || isPending} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">
                      Nome da Empresa <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Ex: Minha Empresa LTDA"
                          {...field}
                          autoFocus
                          className="h-9 pl-10 text-sm"
                        />
                      </div>
                    </FormControl>
                    <FormDescription className="text-xs">
                      Nome oficial ou razão social da empresa
                    </FormDescription>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">Descrição</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Textarea
                          placeholder="Descreva sua empresa (opcional)"
                          className="min-h-[100px] resize-none pl-10 text-sm"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormDescription className="text-xs">
                      Adicione uma descrição sobre sua empresa (máximo 500 caracteres)
                    </FormDescription>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
                </fieldset>
              </div>

              <div className="flex flex-col-reverse gap-2 border-t p-6 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(redirectPath)}
                  disabled={form.formState.isSubmitting || isPending}
                  size="sm"
                  className="w-full sm:w-auto"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={form.formState.isSubmitting || isPending}
                  size="sm"
                  className="w-full sm:w-auto sm:min-w-[200px]"
                >
                  {(form.formState.isSubmitting || isPending) ? (
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
            </div>
          </form>
        </Form>
      </PageContainer>
    </AdminOnly>
  )
}
