'use client'

import { EmployeeFilters } from '@/components/features/company/company-members/employee-filters'
import { Pagination } from '@/components/shared/data/pagination'
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { config } from '@/config/config'
import { useUserContext } from '@/lib/contexts/user-context'
import { formatCPF } from '@/lib/formatters'
import { usePermissions } from '@/lib/hooks/use-permissions'
import {
  useActivateEmployee,
  useEmployeesByCompany,
  useRemoveEmployee,
  useResendInvite,
  useSuspendEmployee,
} from '@/lib/services/queries/use-employees'
import type { Employee } from '@/lib/types/api'
import { getApiErrorMessage } from '@/lib/utils/error-handling'
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ArrowUpDown, Mail, MoreHorizontal, Trash2, UserCheck, UserPlus, UserX } from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useCallback, useMemo, useState } from 'react'
import { toast } from 'sonner'

const getRoleLabel = (role: string) => {
  const labels: Record<string, string> = {
    manager: 'Gestor',
    executor: 'Executor',
    consultant: 'Consultor',
  }
  return labels[role] || role
}

export default function CompanyMembersPage() {
  const params = useParams()
  const router = useRouter()
  const companyId = params.companyId as string
  const { user } = useUserContext()
  const { canInviteEmployee } = usePermissions()
  const [sorting, setSorting] = useState<SortingState>([])
  const [selectedStatuses, setSelectedStatuses] = useState<
    Array<'INVITED' | 'ACTIVE' | 'SUSPENDED' | 'REJECTED' | 'REMOVED'>
  >([])
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState<number>(config.table.defaultPageSize)
  const [sortBy, setSortBy] = useState<string>('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const apiStatusParam = selectedStatuses.length === 1 ? selectedStatuses[0] : undefined

  const {
    data: employeesResponse,
    isLoading: loadingEmployees,
    error,
    refetch,
  } = useEmployeesByCompany(companyId, {
    status: apiStatusParam,
    page,
    limit,
    sortBy,
    sortOrder,
  })

  const employees = useMemo(() => employeesResponse?.data || [], [employeesResponse?.data])
  const filteredEmployees = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    const statusSet = new Set(selectedStatuses)
    return employees.filter((e) => {
      if (statusSet.size > 0 && !statusSet.has(e.status as any)) return false
      const fullName = e.user ? `${e.user.firstName} ${e.user.lastName}`.toLowerCase() : ''
      const email = e.user?.email?.toLowerCase() || ''
      const role = (e.role || '').toLowerCase()
      const document = e.user?.document?.toLowerCase() || ''
      if (!q) return true
      return fullName.includes(q) || email.includes(q) || role.includes(q) || document.includes(q)
    })
  }, [employees, searchQuery, selectedStatuses])
  const meta = useMemo(
    () =>
      employeesResponse?.meta || {
        page: 1,
        limit: config.table.defaultPageSize,
        total: 0,
        totalPages: 0,
      },
    [employeesResponse?.meta]
  )

  const { mutateAsync: suspend, isPending: isSuspending } = useSuspendEmployee()
  const { mutateAsync: activate, isPending: isActivating } = useActivateEmployee()
  const { mutateAsync: remove, isPending: isRemoving } = useRemoveEmployee()
  const { mutateAsync: resendInvite, isPending: isResendingInvite } = useResendInvite()

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit)
    setPage(1)
  }

  const handleStatusesChange = (
    value: Array<'INVITED' | 'ACTIVE' | 'SUSPENDED' | 'REJECTED' | 'REMOVED'>
  ) => {
    setSelectedStatuses(value)
    setPage(1)
  }

  const handleClearFilters = () => {
    setSearchQuery('')
    setSelectedStatuses([])
    setPage(1)
  }

  const handleSuspend = useCallback(
    async (id: string) => {
      try {
        await suspend(id)
      } catch (error) {
        const message = getApiErrorMessage(error, 'Erro ao suspender funcionário')
        toast.error(message)
      }
    },
    [suspend]
  )

  const handleActivate = useCallback(
    async (id: string) => {
      try {
        await activate(id)
      } catch (error) {
        const message = getApiErrorMessage(error, 'Erro ao ativar funcionário')
        toast.error(message)
      }
    },
    [activate]
  )

  const handleResendInvite = useCallback(
    async (id: string) => {
      try {
        await resendInvite(id)
        // React Query vai atualizar automaticamente via invalidação
      } catch (error) {
        const message = getApiErrorMessage(
          error,
          'Erro ao reenviar convite. Verifique se o convite ainda está pendente.'
        )
        toast.error(message)
      }
    },
    [resendInvite]
  )

  const handleRemove = useCallback(
    async (id: string) => {
      if (confirm('Tem certeza que deseja remover este funcionário?')) {
        try {
          await remove(id)
        } catch (error) {
          const message = getApiErrorMessage(
            error,
            'Erro ao remover funcionário. Verifique se ele ainda pode ser removido.'
          )
          toast.error(message)
        }
      }
    },
    [remove]
  )

  const columns = useMemo<ColumnDef<Employee>[]>(
    () => [
      {
        accessorFn: (row) => row.user?.firstName || '',
        id: 'name',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => {
                const newOrder = column.getIsSorted() === 'asc' ? 'desc' : 'asc'
                setSortBy('firstName')
                setSortOrder(newOrder)
                setPage(1)
              }}
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
              onClick={() => {
                const newOrder = column.getIsSorted() === 'asc' ? 'desc' : 'asc'
                setSortBy('email')
                setSortOrder(newOrder)
                setPage(1)
              }}
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
        accessorFn: (row) => row.user?.document || '',
        id: 'document',
        header: () => <span>CPF</span>,
        cell: ({ row }) => {
          const employee = row.original
          const document = employee.user?.document
          if (!document) {
            return <div className="text-muted-foreground">-</div>
          }
          return (
            <div className="font-mono text-xs sm:text-sm">
              {formatCPF(document.replace(/\D/g, ''))}
            </div>
          )
        },
      },
      {
        accessorKey: 'role',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => {
                const newOrder = column.getIsSorted() === 'asc' ? 'desc' : 'asc'
                setSortBy('role')
                setSortOrder(newOrder)
                setPage(1)
              }}
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
              onClick={() => {
                const newOrder = column.getIsSorted() === 'asc' ? 'desc' : 'asc'
                setSortBy('status')
                setSortOrder(newOrder)
                setPage(1)
              }}
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
        accessorKey: 'invitedAt',
        header: () => <span>Convite</span>,
        cell: ({ row }) => {
          const employee = row.original
          if (employee.status !== 'INVITED' || !employee.invitedAt) {
            return <span className="text-xs text-muted-foreground">—</span>
          }
          const date = new Date(employee.invitedAt)
          return (
            <span className="text-xs text-muted-foreground">
              Enviado em {format(date, 'dd/MM/yyyy HH:mm', { locale: ptBR })}
            </span>
          )
        },
      },
      {
        id: 'actions',
        header: () => <span className="sr-only">Ações</span>,
        cell: ({ row }) => {
          const employee = row.original
          const isLoading = isSuspending || isActivating || isRemoving || isResendingInvite

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
                  {employee.status === 'INVITED' && (
                    <DropdownMenuItem
                      onClick={() => handleResendInvite(employee.id)}
                      disabled={isLoading}
                    >
                      <Mail className="mr-2 h-4 w-4" />
                      <div className="flex flex-col items-start">
                        <span>Reenviar Convite</span>
                        {employee.invitedAt && (
                          <span className="text-[11px] text-muted-foreground">
                            Último envio:{' '}
                            {format(new Date(employee.invitedAt), 'dd/MM/yyyy HH:mm', {
                              locale: ptBR,
                            })}
                          </span>
                        )}
                      </div>
                    </DropdownMenuItem>
                  )}
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
                    <span>{employee.status === 'INVITED' ? 'Cancelar Convite' : 'Remover'}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )
        },
      },
    ],
    [
      isSuspending,
      isActivating,
      isRemoving,
      isResendingInvite,
      handleSuspend,
      handleActivate,
      handleRemove,
      handleResendInvite,
    ]
  )

  const table = useReactTable({
    data: filteredEmployees,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  })

  const stats = useMemo(() => {
    const active = employees.filter((e) => e.status === 'ACTIVE').length
    const invited = employees.filter((e) => e.status === 'INVITED').length
    const suspended = employees.filter((e) => e.status === 'SUSPENDED').length

    return { total: meta.total, active, invited, suspended }
  }, [employees, meta.total])

  const company = user?.companies.find((c) => c.id === companyId)

  return (
    <PageContainer maxWidth="7xl">
      <PageHeader
        title="Funcionários"
        description="Gerencie os funcionários"
        action={
          canInviteEmployee && (
            <Link href={`/companies/${companyId}/invite`}>
              <Button className="gap-1.5 font-medium sm:gap-2">
                <UserPlus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span>Convidar Funcionário</span>
              </Button>
            </Link>
          )
        }
      />

      <EmployeeFilters
        companyName={company?.name}
        stats={stats}
        searchQuery={searchQuery}
        onSearchQueryChange={(value) => {
          setSearchQuery(value)
          setPage(1)
        }}
        statuses={selectedStatuses}
        onStatusesChange={handleStatusesChange}
        onClear={handleClearFilters}
      />

      {error && (
        <div className="mb-6">
          <ErrorState message="Erro ao carregar funcionários" onRetry={() => refetch()} />
        </div>
      )}

      {!error && !loadingEmployees && filteredEmployees.length === 0 && meta.total === 0 && (
        <EmptyState
          icon={UserPlus}
          title="Nenhum funcionário encontrado"
          description="Você ainda não possui funcionários cadastrados. Comece convidando um funcionário."
          action={
            canInviteEmployee
              ? {
                  label: 'Convidar Funcionário',
                  onClick: () => router.push(`/companies/${companyId}/invite`),
                }
              : undefined
          }
        />
      )}

      {!error && employees.length > 0 && (
        <>
          <div className="overflow-hidden rounded-xl border border-border/50 bg-card/95 shadow-sm backdrop-blur-sm">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead key={header.id} className="whitespace-nowrap">
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
                          <TableCell key={cell.id} className="whitespace-nowrap">
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
          </div>

          {meta.totalPages > 0 && (
            <div className="mt-4">
              <Pagination
                page={meta.page}
                limit={meta.limit}
                total={meta.total}
                totalPages={meta.totalPages}
                onPageChange={handlePageChange}
                onLimitChange={handleLimitChange}
                pageSizeOptions={[...config.table.pageSizeOptions]}
              />
            </div>
          )}
        </>
      )}
    </PageContainer>
  )
}
