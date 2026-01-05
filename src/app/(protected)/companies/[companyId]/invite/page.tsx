'use client'

import { LoadingScreen } from '@/components/shared/feedback/loading-screen'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { ApiError } from '@/lib/api/api-client'
import { employeesApi } from '@/lib/api/endpoints/employees'
import { useUserContext } from '@/lib/contexts/user-context'
import { usePermissions } from '@/lib/hooks/use-permissions'
import { maskCPF, maskPhone, unmaskCPF, unmaskPhone } from '@/lib/utils/masks'
import { inviteEmployeeSchema, type InviteEmployeeFormData } from '@/lib/validators/employee'
import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle, ArrowLeft, Building2, CheckCircle2, Loader2, Send } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

export default function CompanyInvitePage() {
  const params = useParams()
  const router = useRouter()
  const companyId = params.companyId as string
  const { user } = useUserContext()
  const { canInviteEmployee, isManager } = usePermissions()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const company = user?.companies.find((c) => c.id === companyId)

  const form = useForm<InviteEmployeeFormData>({
    resolver: zodResolver(inviteEmployeeSchema),
    defaultValues: {
      companyId: companyId,
      email: '',
      firstName: '',
      lastName: '',
      phone: '',
      document: '',
      role: 'executor',
      position: '',
      notes: '',
    },
  })

  useEffect(() => {
    if (user && !canInviteEmployee) {
      router.push(`/companies/${companyId}/members`)
    }
  }, [user, canInviteEmployee, router, companyId])

  useEffect(() => {
    if (companyId) {
      form.setValue('companyId', companyId)
    }
  }, [companyId, form])

  if (!user || !canInviteEmployee) {
    return (
      <PageContainer>
        <LoadingScreen message="Verificando permissões..." />
      </PageContainer>
    )
  }

  const onSubmit = async (data: InviteEmployeeFormData) => {
    try {
      setError(null)

      await employeesApi.invite({
        companyId: data.companyId,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone ? unmaskPhone(data.phone) : undefined,
        document: data.document ? unmaskCPF(data.document) : undefined,
        role: data.role,
        position: data.position || undefined,
        notes: data.notes || undefined,
      })

      setSuccess(true)
      setTimeout(() => {
        router.push(`/companies/${companyId}/members`)
      }, 2000)
    } catch (err) {
      if (err instanceof ApiError) {
        const errorData = err.data as { message?: string }
        const errorMessage = errorData?.message || 'Erro ao convidar funcionário. Tente novamente.'
        setError(errorMessage)
      } else {
        setError('Erro ao convidar funcionário. Tente novamente.')
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
              <CardTitle className="text-2xl">Convite enviado com sucesso!</CardTitle>
              <CardDescription className="pt-2">
                O funcionário receberá um email com o link para aceitar o convite e criar sua conta.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                onClick={() => router.push(`/companies/${companyId}/members`)}
                className="w-full"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar à Listagem
              </Button>
            </CardContent>
          </Card>
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <PageHeader
        title="Convidar Funcionário"
        description={`Preencha os dados do funcionário para enviar o convite${company ? ` - ${company.name}` : ''}`}
        backHref={`/companies/${companyId}/members`}
      />

      {error && (
        <div className="mb-6 animate-fade-in rounded-lg border border-danger-light bg-danger-lightest p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-danger-base" />
            <div className="flex-1">
              <h3 className="font-semibold text-danger-dark">Erro ao enviar convite</h3>
              <p className="mt-1 text-sm text-danger-base">{error}</p>
            </div>
          </div>
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {company && (
            <div className="rounded-xl border border-border/40 bg-card/95 p-4 shadow-sm backdrop-blur-sm">
              <div className="flex items-center gap-2.5 rounded-lg bg-primary/10 px-3 py-2">
                <Building2 className="h-4 w-4 text-primary" />
                <span className="font-semibold text-foreground">{company.name}</span>
              </div>
            </div>
          )}

          <div className="rounded-xl border bg-card shadow-sm">
            <div className="border-b p-6">
              <h2 className="text-base font-semibold">Dados do usuário</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Preencha as informações para enviar o convite.
              </p>
            </div>

            <div className="p-6">
              <fieldset disabled={form.formState.isSubmitting} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">Nome</FormLabel>
                        <FormControl>
                          <Input placeholder="João" {...field} className="h-9 text-sm" />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">Sobrenome</FormLabel>
                        <FormControl>
                          <Input placeholder="Silva" {...field} className="h-9 text-sm" />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="funcionario@empresa.com"
                          {...field}
                          className="h-9 text-sm"
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        O convite será enviado para este email.
                      </FormDescription>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">Telefone</FormLabel>
                        <FormControl>
                          <Input
                            type="tel"
                            placeholder="(11) 98765-4321"
                            value={maskPhone(field.value || '')}
                            onChange={(e) => {
                              const unmasked = unmaskPhone(e.target.value)
                              field.onChange(unmasked)
                            }}
                            onBlur={() => {
                              field.onBlur()
                              form.trigger('phone')
                            }}
                            className="h-9 text-sm"
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="document"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">CPF</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="000.000.000-00"
                            value={maskCPF(field.value || '')}
                            onChange={(e) => {
                              const unmasked = unmaskCPF(e.target.value)
                              field.onChange(unmasked)
                            }}
                            onBlur={() => {
                              field.onBlur()
                              form.trigger('document')
                            }}
                            className="h-9 text-sm"
                          />
                        </FormControl>
                        <FormDescription className="text-xs">
                          O usuário precisará informar este CPF ao criar a senha.
                        </FormDescription>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">Cargo no sistema</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-9 text-sm">
                              <SelectValue placeholder="Selecione o cargo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {!isManager && <SelectItem value="manager">Gestor</SelectItem>}
                            <SelectItem value="executor">Executor</SelectItem>
                            {!isManager && <SelectItem value="consultant">Consultor</SelectItem>}
                          </SelectContent>
                        </Select>
                        <FormDescription className="text-xs">
                          Define as permissões do usuário.
                        </FormDescription>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="position"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">Posição/Função</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ex: Pintor, Engenheiro, etc."
                            {...field}
                            className="h-9 text-sm"
                          />
                        </FormControl>
                        <FormDescription className="text-xs">
                          Função específica na empresa.
                        </FormDescription>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">Observações</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Informações adicionais sobre o usuário (opcional)"
                          className="min-h-[100px] text-sm"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Notas internas sobre o usuário.
                      </FormDescription>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </fieldset>

              <div className="mt-6 flex justify-end gap-2 border-t pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(`/companies/${companyId}/members`)}
                  disabled={form.formState.isSubmitting}
                  size="sm"
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={form.formState.isSubmitting} size="sm">
                  {form.formState.isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Enviar convite
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </Form>
    </PageContainer>
  )
}
