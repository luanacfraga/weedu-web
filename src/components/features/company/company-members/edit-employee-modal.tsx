'use client'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import { useUpdateEmployee } from '@/lib/services/queries/use-employees'
import type { Employee } from '@/lib/types/api'
import { getApiErrorMessage } from '@/lib/utils/error-handling'
import { maskCPF, maskPhone, unmaskCPF, unmaskPhone } from '@/lib/utils/masks'
import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle, Loader2 } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

interface EditEmployeeModalProps {
  employee: Employee
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

const editEmployeeSchema = z.object({
  firstName: z.string().min(1, 'Nome é obrigatório').min(2, 'Nome deve ter no mínimo 2 caracteres'),
  lastName: z
    .string()
    .min(1, 'Sobrenome é obrigatório')
    .min(2, 'Sobrenome deve ter no mínimo 2 caracteres'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val || val.trim() === '') return true
        const digits = val.replace(/\D/g, '')
        return digits.length === 11 || digits.length === 10
      },
      { message: 'Digite o telefone completo (10 ou 11 dígitos)' }
    ),
  document: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val || val.trim() === '') return true
        return /^\d{11}$/.test(val)
      },
      { message: 'CPF inválido (deve conter 11 dígitos)' }
    ),
  role: z.enum(['manager', 'executor', 'consultant'], {
    errorMap: () => ({ message: 'Cargo deve ser gestor, executor ou consultor' }),
  }),
  position: z.string().optional(),
  notes: z.string().optional(),
})

type EditEmployeeFormData = z.infer<typeof editEmployeeSchema>

export function EditEmployeeModal({
  employee,
  open,
  onOpenChange,
  onSuccess,
}: EditEmployeeModalProps) {
  const [error, setError] = useState<string | null>(null)

  const { mutateAsync: updateEmployee, isPending } = useUpdateEmployee()

  const isActive = employee.status === 'ACTIVE'

  // Prepara valores iniciais, removendo valores temporários
  const getInitialPhone = useCallback(() => {
    const phone = employee.user?.phone
    if (!phone || phone.startsWith('temp_')) return ''
    return phone
  }, [employee.user?.phone])

  const getInitialDocument = useCallback(() => {
    const document = employee.user?.document
    if (!document || document.startsWith('temp_')) return ''
    return document
  }, [employee.user?.document])

  const form = useForm<EditEmployeeFormData>({
    resolver: zodResolver(editEmployeeSchema),
    defaultValues: {
      firstName: employee.user?.firstName || '',
      lastName: employee.user?.lastName || '',
      email: employee.user?.email || '',
      phone: getInitialPhone(),
      document: getInitialDocument(),
      role: (employee.role as 'manager' | 'executor' | 'consultant') || 'executor',
      position: employee.position || '',
      notes: employee.notes || '',
    },
  })

  // Reset form quando o employee muda ou o modal abre
  useEffect(() => {
    if (open && employee) {
      form.reset({
        firstName: employee.user?.firstName || '',
        lastName: employee.user?.lastName || '',
        email: employee.user?.email || '',
        phone: getInitialPhone(),
        document: getInitialDocument(),
        role: (employee.role as 'manager' | 'executor' | 'consultant') || 'executor',
        position: employee.position || '',
        notes: employee.notes || '',
      })
      setError(null)
    }
  }, [open, employee, form, getInitialPhone, getInitialDocument])

  const handleSubmit = async (data: EditEmployeeFormData) => {
    try {
      setError(null)
      await updateEmployee({
        id: employee.id,
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone ? unmaskPhone(data.phone) : undefined,
          document: data.document ? unmaskCPF(data.document) : undefined,
          // Só envia role se o funcionário não estiver ativo
          role: isActive ? undefined : data.role,
          position: data.position || undefined,
          notes: data.notes || undefined,
        },
      })

      toast.success('Dados do funcionário atualizados com sucesso')
      onOpenChange(false)
      onSuccess?.()
    } catch (err) {
      const message = getApiErrorMessage(err, 'Erro ao atualizar funcionário')
      setError(message)
      toast.error(message)
    }
  }

  const fullName = employee.user
    ? `${employee.user.firstName} ${employee.user.lastName}`
    : 'Funcionário'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Editar Funcionário</DialogTitle>
          <DialogDescription>
            Atualize as informações de <span className="font-medium text-foreground">{fullName}</span>
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="mb-4 animate-fade-in rounded-lg border border-danger-light bg-danger-lightest p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 flex-shrink-0 text-danger-base" />
              <div className="flex-1">
                <h3 className="font-semibold text-danger-dark">Erro ao atualizar</h3>
                <p className="mt-1 text-sm text-danger-base">{error}</p>
              </div>
            </div>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="rounded-xl border bg-card shadow-sm p-6">
              <fieldset disabled={isPending} className="space-y-4">
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
                          disabled={isActive || isPending}
                        />
                      </FormControl>
                      {isActive && (
                        <FormDescription className="text-xs text-muted-foreground">
                          O email não pode ser alterado para funcionários ativos.
                        </FormDescription>
                      )}
                      {!isActive && (
                        <FormDescription className="text-xs">
                          O convite será enviado para este email.
                        </FormDescription>
                      )}
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
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={isActive || isPending}
                        >
                          <FormControl>
                            <SelectTrigger className="h-9 text-sm">
                              <SelectValue placeholder="Selecione o cargo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="manager">Gestor</SelectItem>
                            <SelectItem value="executor">Executor</SelectItem>
                            <SelectItem value="consultant">Consultor</SelectItem>
                          </SelectContent>
                        </Select>
                        {isActive && (
                          <FormDescription className="text-xs text-muted-foreground">
                            O cargo não pode ser alterado para funcionários ativos.
                          </FormDescription>
                        )}
                        {!isActive && (
                          <FormDescription className="text-xs">
                            Define as permissões do usuário.
                          </FormDescription>
                        )}
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
                  onClick={() => onOpenChange(false)}
                  disabled={isPending}
                  size="sm"
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isPending} size="sm">
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    'Salvar alterações'
                  )}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

