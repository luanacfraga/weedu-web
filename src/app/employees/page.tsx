'use client'

import { AdminOnly } from '@/components/features/auth/guards/admin-only'
import { BaseLayout } from '@/components/layout/base-layout'
import { DashboardSidebar } from '@/components/layout/dashboard-sidebar'
import { StatusBadge } from '@/components/shared/data/status-badge'
import { EmptyState } from '@/components/shared/feedback/empty-state'
import { ErrorState } from '@/components/shared/feedback/error-state'
import { PageContainer } from '@/components/shared/layout/page-container'
import { PageHeader } from '@/components/shared/layout/page-header'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useActivateEmployee } from '@/lib/services/queries/use-employees'
import { useEmployeesByCompany } from '@/lib/services/queries/use-employees'
import { useRemoveEmployee } from '@/lib/services/queries/use-employees'
import { useSuspendEmployee } from '@/lib/services/queries/use-employees'
import { useCompanyStore } from '@/lib/stores/company-store'
import type { Employee } from '@/lib/types/api'
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table'
import {
  ArrowUpDown,
  Building2,
  Filter,
  MoreHorizontal,
  Trash2,
  UserCheck,
  UserPlus,
  UserX,
} from 'lucide-react'
import Link from 'next/link'
import { useMemo, useState } from 'react'

const getRoleLabel = (role: string) => {
  const labels: Record<string, string> = {
    manager: 'Gestor',
    executor: 'Executor',
    consultant: 'Consultor',
  }
  return labels[role] || role
}

export default function EmployeesPage() {
  const { selectedCompany } = useCompanyStore()
  const [sorting, setSorting] = useState<SortingState>([])
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const {
    data: employees = [],
    isLoading: loadingEmployees,
    error,
    refetch,
  } = useEmployeesByCompany(selectedCompany?.id || '', {
    status: statusFilter !== 'all' ? statusFilter : undefined,
  })
  const { mutateAsync: suspend, isPending: isSuspending } = useSuspendEmployee()
  const { mutateAsync: activate, isPending: isActivating } = useActivateEmployee()
  const { mutateAsync: remove, isPending: isRemoving } = useRemoveEmployee()

  const handleSuspend = async (id: string) => {
    try {
      await suspend(id)
    } catch (error) {
    }
  }

  const handleActivate = async (id: string) => {
    try {
      await activate(id)
    } catch (error) {
    }
  }

  const handleRemove = async (id: string) => {
    if (confirm('Tem certeza que deseja remover este funcionário?')) {
      try {
        await remove(id)
      } catch (error) {
      }
    }
  }

  const columns = useMemo<ColumnDef<Employee>[]>(
    () => [
      {
        accessorFn: (row) => row.user?.firstName || '',
        id: 'name',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              className="h-8 px-2 lg:px-3"
            >
              Nome
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          )
        },
        cell: ({ row }) => {
          const employee = row.original
          if (!employee.user) {
            return <div className="text-muted-foreground">Dados não disponíveis</div>
          }
          return (
            <div className="font-medium">
              {employee.user.firstName} {employee.user.lastName}
            </div>
          )
        },
      },
      {
        accessorFn: (row) => row.user?.email || '',
        id: 'email',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              className="h-8 px-2 lg:px-3"
            >
              Email
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          )
        },
        cell: ({ row }) => {
          const employee = row.original
          if (!employee.user) {
            return <div className="text-muted-foreground">-</div>
          }
          return <div className="max-w-[200px] truncate">{employee.user.email}</div>
        },
      },
      {
        accessorKey: 'role',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              className="h-8 px-2 lg:px-3"
            >
              Cargo
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          )
        },
        cell: ({ row }) => {
          const role = row.getValue('role') as string
          return <div>{getRoleLabel(role)}</div>
        },
      },
      {
        accessorKey: 'status',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              className="h-8 px-2 lg:px-3"
            >
              Status
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          )
        },
        cell: ({ row }) => {
          const status = row.getValue('status') as string
          return <StatusBadge status={status} />
        },
      },
      {
        id: 'actions',
        header: 'Ações',
        cell: ({ row }) => {
          const employee = row.original
          const isLoading = isSuspending || isActivating || isRemoving

          return (
            <div className="flex justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Abrir menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {employee.status === 'SUSPENDED' && (
                    <DropdownMenuItem
                      onClick={() => handleActivate(employee.id)}
                      disabled={isLoading}
                    >
                      <UserCheck className="mr-2 h-4 w-4" />
                      Ativar
                    </DropdownMenuItem>
                  )}
                  {employee.status === 'ACTIVE' && (
                    <DropdownMenuItem
                      onClick={() => handleSuspend(employee.id)}
                      disabled={isLoading}
                    >
                      <UserX className="mr-2 h-4 w-4" />
                      Suspender
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => handleRemove(employee.id)}
                    disabled={isLoading}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Remover
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )
        },
      },
    ],
    [isSuspending, isActivating, isRemoving]
  )

  const table = useReactTable({
    data: employees,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  })

  const stats = useMemo(() => {
    const total = employees.length
    const active = employees.filter((e) => e.status === 'ACTIVE').length
    const invited = employees.filter((e) => e.status === 'INVITED').length
    const suspended = employees.filter((e) => e.status === 'SUSPENDED').length

    return { total, active, invited, suspended }
  }, [employees])

  return (
    <AdminOnly>
      <BaseLayout sidebar={<DashboardSidebar />}>
        <PageContainer maxWidth="7xl">
          <PageHeader
            title="Funcionários"
            description="Gerencie os funcionários da sua empresa"
            action={
              <Link href="/invite-employee">
                <Button size="lg" className="w-full gap-2 sm:w-auto">
                  <UserPlus className="h-5 w-5" />
                  <span>Convidar Funcionário</span>
                </Button>
              </Link>
            }
          />

          {selectedCompany && (
            <div className="mb-4 space-y-3 sm:mb-6 sm:space-y-0">
              {/* Mobile: Layout vertical organizado */}
              <div className="flex flex-col gap-3 sm:hidden">
                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Empresa:</span>
                  <span className="font-medium">{selectedCompany.name}</span>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs">
                  <div>
                    <span className="text-muted-foreground">Total: </span>
                    <span className="font-semibold">{stats.total}</span>
                  </div>
                  {stats.active > 0 && (
                    <div>
                      <span className="text-muted-foreground">Ativos: </span>
                      <span className="font-semibold text-green-600">{stats.active}</span>
                    </div>
                  )}
                  {stats.invited > 0 && (
                    <div>
                      <span className="text-muted-foreground">Convidados: </span>
                      <span className="font-semibold text-yellow-600">{stats.invited}</span>
                    </div>
                  )}
                  {stats.suspended > 0 && (
                    <div>
                      <span className="text-muted-foreground">Suspensos: </span>
                      <span className="font-semibold text-orange-600">{stats.suspended}</span>
                    </div>
                  )}
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-9 w-full">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Filtrar por status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os status</SelectItem>
                    <SelectItem value="INVITED">Convidado</SelectItem>
                    <SelectItem value="ACTIVE">Ativo</SelectItem>
                    <SelectItem value="SUSPENDED">Suspenso</SelectItem>
                    <SelectItem value="REJECTED">Rejeitado</SelectItem>
                    <SelectItem value="REMOVED">Removido</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Desktop: Layout horizontal compacto */}
              <div className="hidden items-center justify-between sm:flex">
                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Empresa:</span>
                  <span className="font-medium">{selectedCompany.name}</span>
                  <span className="mx-2 text-muted-foreground">•</span>
                  <span className="text-muted-foreground">
                    {stats.total} {stats.total === 1 ? 'funcionário' : 'funcionários'}
                  </span>
                  {stats.active > 0 && (
                    <>
                      <span className="mx-2 text-muted-foreground">•</span>
                      <span className="text-green-600">{stats.active} ativos</span>
                    </>
                  )}
                  {stats.invited > 0 && (
                    <>
                      <span className="mx-2 text-muted-foreground">•</span>
                      <span className="text-yellow-600">{stats.invited} convidados</span>
                    </>
                  )}
                  {stats.suspended > 0 && (
                    <>
                      <span className="mx-2 text-muted-foreground">•</span>
                      <span className="text-orange-600">{stats.suspended} suspensos</span>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="h-9 w-[160px]">
                      <SelectValue placeholder="Todos os status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os status</SelectItem>
                      <SelectItem value="INVITED">Convidado</SelectItem>
                      <SelectItem value="ACTIVE">Ativo</SelectItem>
                      <SelectItem value="SUSPENDED">Suspenso</SelectItem>
                      <SelectItem value="REJECTED">Rejeitado</SelectItem>
                      <SelectItem value="REMOVED">Removido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {!selectedCompany && (
            <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900 dark:bg-yellow-900/20">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                Selecione uma empresa para visualizar os funcionários.
              </p>
            </div>
          )}

          {error && (
            <div className="mb-6">
              <ErrorState message="Erro ao carregar funcionários" onRetry={() => refetch()} />
            </div>
          )}

          {!error && !loadingEmployees && employees.length === 0 && (
            <EmptyState
              icon={UserPlus}
              title="Nenhum funcionário encontrado"
              description="Você ainda não possui funcionários cadastrados. Comece convidando um funcionário."
              action={{
                label: 'Convidar Funcionário',
                onClick: () => (window.location.href = '/invite-employee'),
              }}
            />
          )}

          {!error && employees.length > 0 && (
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
                  {loadingEmployees ? (
                    <TableRow>
                      <TableCell colSpan={columns.length} className="h-24 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                          <span>Carregando funcionários...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : table.getRowModel().rows?.length ? (
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
        </PageContainer>
      </BaseLayout>
    </AdminOnly>
  )
}
