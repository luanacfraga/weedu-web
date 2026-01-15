'use client'

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
import { Textarea } from '@/components/ui/textarea'
import { useUpdateCompany } from '@/lib/services/queries/use-companies'
import type { Company } from '@/lib/types/api'
import { getApiErrorMessage } from '@/lib/utils/error-handling'
import { updateCompanySchema, type UpdateCompanyFormData } from '@/lib/validators/company'
import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

interface EditCompanyModalProps {
  company: Company
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function EditCompanyModal({
  company,
  open,
  onOpenChange,
  onSuccess,
}: EditCompanyModalProps) {
  const [error, setError] = useState<string | null>(null)

  const { mutateAsync: updateCompany, isPending } = useUpdateCompany()

  const form = useForm<UpdateCompanyFormData>({
    resolver: zodResolver(updateCompanySchema),
    defaultValues: {
      name: company.name || '',
      description: company.description || '',
    },
  })

  // Reset form quando o company muda ou o modal abre
  useEffect(() => {
    if (open && company) {
      form.reset({
        name: company.name || '',
        description: company.description || '',
      })
      setError(null)
    }
  }, [open, company, form])

  const handleSubmit = async (data: UpdateCompanyFormData) => {
    try {
      setError(null)
      await updateCompany({
        id: company.id,
        data: {
          name: data.name,
          description: data.description || undefined,
        },
      })

      toast.success('Empresa atualizada com sucesso')
      onOpenChange(false)
      onSuccess?.()
    } catch (err) {
      const message = getApiErrorMessage(err, 'Erro ao atualizar empresa')
      setError(message)
      toast.error(message)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] flex-col gap-0 p-0 sm:max-w-[600px]">
        <DialogHeader className="border-b px-6 pb-4 pt-6">
          <DialogTitle>Editar Empresa</DialogTitle>
          <DialogDescription>
            Atualize as informações de{' '}
            <span className="font-medium text-foreground">{company.name}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-6">
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
            <form
              id="edit-company-form"
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4"
            >
              <fieldset disabled={isPending} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">Nome da Empresa</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Tooldo Tecnologia" {...field} className="h-9 text-sm" />
                      </FormControl>
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
                        <Textarea
                          placeholder="Descreva a empresa (opcional)"
                          className="min-h-[100px] text-sm"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Informações adicionais sobre a empresa.
                      </FormDescription>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </fieldset>
            </form>
          </Form>
        </div>

        <div className="flex justify-end gap-2 border-t bg-background px-6 py-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
            size="sm"
          >
            Cancelar
          </Button>
          <Button type="submit" form="edit-company-form" disabled={isPending} size="sm">
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
      </DialogContent>
    </Dialog>
  )
}

