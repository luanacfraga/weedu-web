'use client'

import { RequireCompany } from '@/components/features/auth/guards/require-company'
import { BaseLayout } from '@/components/layout/base-layout'
import { DashboardSidebar } from '@/components/layout/dashboard-sidebar'
import { FormSection } from '@/components/shared/forms/form-section'
import { InputWithIcon } from '@/components/shared/forms/input-with-icon'
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
import { usePermissions } from '@/lib/hooks/use-permissions'
import { useAuthStore } from '@/lib/stores/auth-store'
import { useCompanyStore } from '@/lib/stores/company-store'
import { maskCPF, maskPhone, unmaskCPF, unmaskPhone } from '@/lib/utils/masks'
import { inviteEmployeeSchema, type InviteEmployeeFormData } from '@/lib/validators/employee'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  AlertCircle,
  ArrowLeft,
  Briefcase,
  Building2,
  CheckCircle2,
  FileText,
  Loader2,
  Mail,
  Phone,
  Send,
  User,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

export default function InviteEmployeePage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const user = useAuthStore((state) => state.user)
  const { canInviteEmployee } = usePermissions()
  const selectedCompany = useCompanyStore((state) => state.selectedCompany)

  const form = useForm<InviteEmployeeFormData>({
    resolver: zodResolver(inviteEmployeeSchema),
    defaultValues: {
      companyId: selectedCompany?.id || '',
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

  const [phoneValue, setPhoneValue] = useState('')
  const [cpfValue, setCpfValue] = useState('')

  useEffect(() => {
    if (selectedCompany) {
      form.setValue('companyId', selectedCompany.id)
    }
  }, [selectedCompany, form])

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
        router.push('/dashboard')
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
      <RequireCompany>
        <BaseLayout sidebar={<DashboardSidebar />}>
          <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
            <Card className="w-full max-w-md animate-fade-in text-center">
              <CardHeader>
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-success-lightest">
                  <CheckCircle2 className="h-10 w-10 text-success-base" />
                </div>
                <CardTitle className="text-2xl">Convite enviado com sucesso!</CardTitle>
                <CardDescription className="pt-2">
                  O funcionário receberá um email com o link para aceitar o convite e criar sua
                  conta.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  onClick={() => router.push('/dashboard')}
                  className="w-full"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar ao Dashboard
                </Button>
              </CardContent>
            </Card>
          </div>
        </BaseLayout>
      </RequireCompany>
    )
  }

  return (
    <RequireCompany>
      <BaseLayout sidebar={<DashboardSidebar />}>
        <PageContainer maxWidth="4xl">
          <PageHeader
            title="Convidar Funcionário"
            description="Preencha os dados do funcionário para enviar o convite"
            action={
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/dashboard')}
                className="w-full sm:w-auto"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Cancelar
              </Button>
            }
          />

          {/* Error Alert */}
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

          {/* Company Indicator */}
          {selectedCompany && (
            <div className="mb-6 animate-fade-in rounded-lg border border-border bg-muted/30 p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary-lightest p-2">
                  <Building2 className="h-5 w-5 text-primary-base" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-muted-foreground">Empresa</p>
                  <p className="text-sm font-semibold text-foreground">{selectedCompany.name}</p>
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Personal Information Card */}
              <FormSection
                title="Dados Pessoais"
                description="Informações básicas do funcionário"
                icon={User}
                iconColor="text-secondary-base"
                bgColor="bg-secondary-lightest"
                className="animate-fade-in"
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Nome <span className="text-danger-base">*</span>
                        </FormLabel>
                        <FormControl>
                          <InputWithIcon icon={User} placeholder="João" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Sobrenome <span className="text-danger-base">*</span>
                        </FormLabel>
                        <FormControl>
                          <InputWithIcon icon={User} placeholder="Silva" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Email <span className="text-danger-base">*</span>
                      </FormLabel>
                      <FormControl>
                        <InputWithIcon
                          icon={Mail}
                          type="email"
                          placeholder="funcionario@empresa.com"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>O convite será enviado para este email</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone</FormLabel>
                        <FormControl>
                          <InputWithIcon
                            icon={Phone}
                            type="tel"
                            placeholder="(11) 98765-4321"
                            value={phoneValue}
                            onChange={(e) => {
                              const unmasked = unmaskPhone(e.target.value)
                              const masked = maskPhone(unmasked)
                              setPhoneValue(masked)
                              form.setValue('phone', unmasked, { shouldValidate: false })
                            }}
                            onBlur={() => {
                              field.onBlur()
                              form.trigger('phone')
                            }}
                            className={`h-12 text-base transition-all ${
                              form.formState.errors.phone
                                ? 'border-destructive focus-visible:ring-destructive'
                                : 'border-input focus-visible:border-primary focus-visible:ring-primary/20'
                            }`}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="document"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          CPF <span className="text-danger-base">*</span>
                        </FormLabel>
                        <FormControl>
                          <InputWithIcon
                            icon={FileText}
                            placeholder="000.000.000-00"
                            value={cpfValue}
                            onChange={(e) => {
                              const unmasked = unmaskCPF(e.target.value)
                              const masked = maskCPF(unmasked)
                              setCpfValue(masked)
                              form.setValue('document', unmasked, { shouldValidate: false })
                            }}
                            onBlur={() => {
                              field.onBlur()
                              form.trigger('document')
                            }}
                            className={`h-12 text-base transition-all ${
                              form.formState.errors.document
                                ? 'border-destructive focus-visible:ring-destructive'
                                : 'border-input focus-visible:border-primary focus-visible:ring-primary/20'
                            }`}
                          />
                        </FormControl>
                        <FormDescription>
                          O funcionário precisará informar este CPF ao criar sua senha
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </FormSection>

              {/* Professional Information Card */}
              <FormSection
                title="Informações Profissionais"
                description="Cargo e função do funcionário na empresa"
                icon={Briefcase}
                iconColor="text-warning-base"
                bgColor="bg-warning-lightest"
                className="animate-fade-in"
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Cargo no Sistema <span className="text-danger-base">*</span>
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-11 w-full">
                              <SelectValue placeholder="Selecione o cargo">
                                {field.value === 'manager' && 'Gestor'}
                                {field.value === 'executor' && 'Executor'}
                                {field.value === 'consultant' && 'Consultor'}
                                {!field.value && 'Selecione o cargo'}
                              </SelectValue>
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="manager">Gestor</SelectItem>
                            <SelectItem value="executor">Executor</SelectItem>
                            <SelectItem value="consultant">Consultor</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>Define as permissões do funcionário</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="position"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Posição/Função</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Briefcase className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              placeholder="Ex: Pintor, Engenheiro, etc."
                              className="h-11 pl-10"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormDescription>Função específica na empresa</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Observações</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Informações adicionais sobre o funcionário (opcional)"
                          className="min-h-[100px] resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>Notas internas sobre o funcionário</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </FormSection>

              {/* Submit Actions */}
              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/dashboard')}
                  disabled={form.formState.isSubmitting}
                  className="w-full sm:w-auto"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={form.formState.isSubmitting}
                  className="w-full sm:w-auto sm:min-w-[200px]"
                  size="lg"
                >
                  {form.formState.isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando convite...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Enviar Convite
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </PageContainer>
      </BaseLayout>
    </RequireCompany>
  )
}
