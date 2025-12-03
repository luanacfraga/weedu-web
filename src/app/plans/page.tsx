'use client'

import { MasterOnly } from '@/components/features/auth/guards/master-only'
import { PlanDialog } from '@/components/features/plan/plan-dialog'
import { BaseLayout } from '@/components/layout/base-layout'
import { DashboardSidebar } from '@/components/layout/dashboard-sidebar'
import { EmptyState } from '@/components/shared/feedback/empty-state'
import { ErrorState } from '@/components/shared/feedback/error-state'
import { LoadingScreen } from '@/components/shared/feedback/loading-screen'
import { PageContainer } from '@/components/shared/layout/page-container'
import { PageHeader } from '@/components/shared/layout/page-header'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ApiError } from '@/lib/api/api-client'
import type { Plan } from '@/lib/api/endpoints/plans'
import { useCreatePlan, usePlans, useUpdatePlan } from '@/lib/services/queries/use-plans'
import type { PlanFormData } from '@/lib/validators/plan'
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table'
import { Edit, Package, Plus } from 'lucide-react'
import { useMemo, useState } from 'react'

export default function PlansPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState<Plan | undefined>(undefined)
  const [sorting, setSorting] = useState<SortingState>([])

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
        header: 'Nome',
        cell: ({ row }) => <div className="font-medium">{row.getValue('name')}</div>,
      },
      {
        accessorKey: 'maxCompanies',
        header: 'Max Empresas',
        cell: ({ row }) => <div className="text-center">{row.getValue('maxCompanies')}</div>,
      },
      {
        accessorKey: 'maxManagers',
        header: 'Max Gerentes',
        cell: ({ row }) => <div className="text-center">{row.getValue('maxManagers')}</div>,
      },
      {
        accessorKey: 'maxExecutors',
        header: 'Max Executores',
        cell: ({ row }) => <div className="text-center">{row.getValue('maxExecutors')}</div>,
      },
      {
        accessorKey: 'maxConsultants',
        header: 'Max Consultores',
        cell: ({ row }) => <div className="text-center">{row.getValue('maxConsultants')}</div>,
      },
      {
        accessorKey: 'iaCallsLimit',
        header: 'Limite IA/Mês',
        cell: ({ row }) => {
          const limit = row.getValue('iaCallsLimit') as number
          return <div className="text-center">{limit.toLocaleString('pt-BR')}</div>
        },
      },
      {
        id: 'actions',
        header: 'Ações',
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
    []
  )

  const table = useReactTable({
    data: plans,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  })

  if (isLoading) {
    return (
      <MasterOnly>
        <BaseLayout sidebar={<DashboardSidebar />}>
          <LoadingScreen message="Carregando planos..." />
        </BaseLayout>
      </MasterOnly>
    )
  }

  return (
    <MasterOnly>
      <BaseLayout sidebar={<DashboardSidebar />}>
        <PageContainer maxWidth="7xl">
          <PageHeader
            title="Planos"
            description="Gerencie os planos disponíveis no sistema"
            action={
              <Button onClick={handleCreate} className="w-full sm:w-auto" size="lg">
                <Plus className="mr-2 h-4 w-4" />
                Novo Plano
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
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={columns.length} className="h-24 text-center">
                        Nenhum resultado encontrado.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          <PlanDialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            plan={editingPlan}
            onSubmit={handleSubmit}
            isLoading={isCreating || isUpdating}
          />
        </PageContainer>
      </BaseLayout>
    </MasterOnly>
  )
}
