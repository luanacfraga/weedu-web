'use client'

import { MasterOnly } from '@/components/features/auth/guards/master-only'
import { PlanDialog } from '@/components/features/plan/plan-dialog'
import { EmptyState } from '@/components/shared/feedback/empty-state'
import { ErrorState } from '@/components/shared/feedback/error-state'
import { LoadingScreen } from '@/components/shared/feedback/loading-screen'
import { PageContainer } from '@/components/shared/layout/page-container'
import { PageHeader } from '@/components/shared/layout/page-header'
import { ResponsiveDataTable } from '@/components/shared/table/responsive-data-table'
import { Button } from '@/components/ui/button'
import { ApiError } from '@/lib/api/api-client'
import { useCreatePlan, usePlans, useUpdatePlan } from '@/lib/services/queries/use-plans'
import type { Plan } from '@/lib/types/plan'
import type { PlanFormData } from '@/lib/validators/plan'
import type { ColumnDef } from '@tanstack/react-table'
import { Edit, Package, Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { PlanCard } from './plan-card'

export default function PlansPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState<Plan | undefined>(undefined)

  const { data: plans = [], isLoading, error, refetch } = usePlans()
  const { mutateAsync: createPlan, isPending: isCreating } = useCreatePlan()
  const { mutateAsync: updatePlan, isPending: isUpdating } = useUpdatePlan()

  const handleCreate = () => {
    setEditingPlan(undefined)
    setDialogOpen(true)
  }

  const handleEdit = (plan: Plan) => {
    setEditingPlan(plan)
    setDialogOpen(true)
  }

  const handleSubmit = async (data: PlanFormData) => {
    try {
      if (editingPlan) {
        await updatePlan({ id: editingPlan.id, data })
      } else {
        await createPlan(data)
      }
      setDialogOpen(false)
      setEditingPlan(undefined)
    } catch (err) {
      if (err instanceof ApiError) {
        const errorData = err.data as { message?: string }
        throw new Error(errorData?.message || 'Erro ao salvar plano')
      }
      throw err
    }
  }

  const columns = useMemo<ColumnDef<Plan>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Nome do Plano',
      },
      {
        accessorKey: 'maxCompanies',
        header: 'Max Empresas',
      },
      {
        accessorKey: 'maxManagers',
        header: 'Max Gestores',
      },
      {
        accessorKey: 'maxExecutors',
        header: 'Max Executores',
      },
      {
        accessorKey: 'maxConsultants',
        header: 'Max Consultores',
      },
      {
        accessorKey: 'iaCallsLimit',
        header: 'Limite IA',
      },
      {
        id: 'actions',
        header: () => <span className="sr-only">Ações</span>,
        cell: ({ row }) => {
          const plan = row.original
          return (
            <div className="flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEdit(plan)}
                className="h-8 w-8 p-0"
              >
                <Edit className="h-4 w-4" />
                <span className="sr-only">Editar plano</span>
              </Button>
            </div>
          )
        },
      },
    ],
    [handleEdit]
  )

  if (isLoading) {
    return (
      <MasterOnly>
        <LoadingScreen message="Carregando planos..." />
      </MasterOnly>
    )
  }

  return (
    <MasterOnly>
      <PageContainer maxWidth="7xl">
        <PageHeader
          title="Planos de Acesso"
          description="Gerencie os planos disponíveis no sistema"
          action={
            <Button onClick={handleCreate} className="gap-1.5 font-medium sm:gap-2">
              <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>Novo Plano</span>
            </Button>
          }
        />

        {error && (
          <div className="mb-6">
            <ErrorState message="Erro ao carregar planos" onRetry={() => refetch()} />
          </div>
        )}

        {!error && plans.length === 0 && (
          <EmptyState
            icon={Package}
            title="Nenhum plano cadastrado"
            description="Você ainda não possui planos cadastrados. Crie seu primeiro plano para começar."
            action={{
              label: 'Criar Primeiro Plano',
              onClick: handleCreate,
            }}
          />
        )}

        {!error && plans.length > 0 && (
          <ResponsiveDataTable
            data={plans}
            columns={columns}
            CardComponent={PlanCard}
            isLoading={false}
            emptyMessage="Nenhum plano cadastrado"
            getRowId={(plan) => plan.id}
          />
        )}

        <PlanDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          plan={editingPlan}
          onSubmit={handleSubmit}
          isLoading={isCreating || isUpdating}
        />
      </PageContainer>
    </MasterOnly>
  )
}
