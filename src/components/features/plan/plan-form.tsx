'use client'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import type { Plan } from '@/lib/api/endpoints/plans'
import { planSchema, type PlanFormData } from '@/lib/validators/plan'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'

interface PlanFormProps {
  plan?: Plan
  onSubmit: (data: PlanFormData) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export function PlanForm({ plan, onSubmit, onCancel, isLoading = false }: PlanFormProps) {
  const form = useForm<PlanFormData>({
    resolver: zodResolver(planSchema),
    defaultValues: plan
      ? {
          name: plan.name,
          maxCompanies: plan.maxCompanies,
          maxManagers: plan.maxManagers,
          maxExecutors: plan.maxExecutors,
          maxConsultants: plan.maxConsultants,
          iaCallsLimit: plan.iaCallsLimit,
        }
      : {
          name: '',
          maxCompanies: 1,
          maxManagers: 0,
          maxExecutors: 0,
          maxConsultants: 0,
          iaCallsLimit: 0,
        },
  })

  const handleSubmit = async (data: PlanFormData) => {
    await onSubmit(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do Plano</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Plano Premium" {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="maxCompanies"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Máximo de Empresas</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="0"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="maxManagers"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Máximo de Gerentes</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="0"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="maxExecutors"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Máximo de Executores</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="0"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="maxConsultants"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Máximo de Consultores</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="0"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="iaCallsLimit"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Limite de Chamadas de IA por Mês</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="0"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {plan ? 'Salvar Alterações' : 'Criar Plano'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
