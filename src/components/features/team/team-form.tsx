'use client'

import { FormSection } from '@/components/shared/forms/form-section'
import { InputWithIcon } from '@/components/shared/forms/input-with-icon'
import { Button } from '@/components/ui/button'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import type { Employee } from '@/lib/types/api'
import { teamSchema, type TeamFormData } from '@/lib/validators/team'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, FileText, Loader2, Save, Sparkles, Users } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'

interface TeamFormProps {
  companyId: string
  managers: Employee[]
  currentUserId?: string
  currentUserRole?: string
  onSubmit: (data: TeamFormData) => Promise<void>
  onCancel?: () => void
  isLoading?: boolean
  defaultValues?: Partial<TeamFormData>
  isEditing?: boolean
}

export function TeamForm({
  companyId,
  managers,
  currentUserId,
  currentUserRole,
  onSubmit,
  onCancel,
  isLoading = false,
  defaultValues,
  isEditing = false,
}: TeamFormProps) {
  const isManager = currentUserRole === 'manager'
  const defaultManagerId = !isEditing && isManager && currentUserId ? currentUserId : ''

  const form = useForm<TeamFormData>({
    resolver: zodResolver(teamSchema),
    defaultValues: {
      name: '',
      companyId,
      managerId: defaultManagerId,
      description: '',
      iaContext: '',
      ...defaultValues,
    },
  })

  useEffect(() => {
    if (!isEditing && isManager && currentUserId && !form.getValues('managerId')) {
      form.setValue('managerId', currentUserId)
    }
  }, [isEditing, isManager, currentUserId, form])

  const handleSubmit = async (data: TeamFormData) => {
    await onSubmit(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormSection
          title="Informações da Equipe"
          description="Dados básicos da equipe"
          icon={Users}
          iconColor="text-primary-base"
          bgColor="bg-primary-lightest"
          className="animate-fade-in"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Nome da Equipe <span className="text-danger-base">*</span>
                </FormLabel>
                <FormControl>
                  <InputWithIcon
                    icon={Users}
                    placeholder="Ex: Equipe de Desenvolvimento"
                    {...field}
                    autoFocus
                    disabled={isLoading}
                  />
                </FormControl>
                <FormDescription>Nome que identifica a equipe na empresa</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="managerId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Gestor da Equipe <span className="text-danger-base">*</span>
                </FormLabel>
                <FormControl>
                  {!isEditing && isManager ? (
                    <InputWithIcon
                      icon={Users}
                      value={
                        managers.find((m) => m.userId === currentUserId)?.user
                          ? `${managers.find((m) => m.userId === currentUserId)?.user?.firstName} ${managers.find((m) => m.userId === currentUserId)?.user?.lastName}`
                          : 'Você'
                      }
                      disabled
                      readOnly
                    />
                  ) : (
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || undefined}
                      disabled={isLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um gestor" />
                      </SelectTrigger>
                      <SelectContent>
                        {managers.length === 0 ? (
                          <div className="px-2 py-1.5 text-sm text-muted-foreground">
                            Nenhum gestor disponível
                          </div>
                        ) : (
                          managers.map((manager) => (
                            <SelectItem key={manager.id} value={manager.userId}>
                              {manager.user
                                ? `${manager.user.firstName} ${manager.user.lastName}`
                                : manager.userId}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  )}
                </FormControl>
                <FormDescription>
                  {isEditing
                    ? 'Você pode substituir o gestor da equipe. Cada gestor só pode gerenciar uma equipe por vez na empresa.'
                    : isManager
                      ? 'Você será o gestor desta equipe'
                      : 'Selecione o gestor responsável pela equipe'}
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
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Textarea
                      placeholder="Descreva a equipe (opcional)"
                      className="min-h-[100px] resize-none pl-10"
                      {...field}
                      disabled={isLoading}
                    />
                  </div>
                </FormControl>
                <FormDescription>Adicione uma descrição sobre a equipe (opcional)</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="iaContext"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contexto de IA</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Sparkles className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Textarea
                      placeholder="Ex: Equipe responsável por campanhas de mídia paga no setor de varejo"
                      className="min-h-[100px] resize-none pl-10"
                      {...field}
                      disabled={isLoading}
                    />
                  </div>
                </FormControl>
                <FormDescription>
                  Contexto específico para uso de IA (máximo 1000 caracteres, opcional)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </FormSection>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading || form.formState.isSubmitting}
              className="w-full sm:w-auto"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Cancelar
            </Button>
          )}
          <Button
            type="submit"
            disabled={isLoading || form.formState.isSubmitting}
            className="w-full sm:w-auto sm:min-w-[200px]"
            size="lg"
          >
            {isLoading || form.formState.isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEditing ? 'Salvando alterações...' : 'Criando equipe...'}
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {isEditing ? 'Salvar Alterações' : 'Criar Equipe'}
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}
