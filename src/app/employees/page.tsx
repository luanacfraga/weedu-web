'use client'

import { BaseLayout } from '@/components/layout/base-layout'
import { DashboardSidebar } from '@/components/layout/dashboard-sidebar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { companiesApi } from '@/lib/api/endpoints/companies'
import { employeesApi } from '@/lib/api/endpoints/employees'
import { usePermissions } from '@/lib/hooks/use-permissions'
import { Permission } from '@/lib/permissions'
import { useAuthStore } from '@/lib/stores/auth-store'
import { UserPlus } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

interface Employee {
  id: string
  userId: string
  companyId: string
  role: 'manager' | 'executor' | 'consultant'
  status: 'INVITED' | 'ACTIVE' | 'REJECTED' | 'SUSPENDED' | 'REMOVED'
  user: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
}

interface Company {
  id: string
  name: string
}

export default function EmployeesPage() {
  const { user } = useAuthStore()
  const { can } = usePermissions()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [selectedCompany, setSelectedCompany] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        if (can(Permission.VIEW_EMPLOYEES)) {
          // Load companies for admin
          const companiesResponse = await companiesApi.getMyCompanies()
          setCompanies(companiesResponse || [])

          if (companiesResponse && companiesResponse.length > 0) {
            setSelectedCompany(companiesResponse[0].id)
            await loadEmployees(companiesResponse[0].id)
          }
        }
      } catch (err) {
        console.error('Error loading data:', err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [user])

  const loadEmployees = async (companyId: string) => {
    try {
      const response = await employeesApi.listByCompany(companyId)
      setEmployees(response.data || [])
    } catch (err) {
      console.error('Error loading employees:', err)
    }
  }

  useEffect(() => {
    if (selectedCompany) {
      loadEmployees(selectedCompany)
    }
  }, [selectedCompany])

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      INVITED: 'Convidado',
      ACTIVE: 'Ativo',
      REJECTED: 'Rejeitado',
      SUSPENDED: 'Suspenso',
      REMOVED: 'Removido',
    }
    return labels[status] || status
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      INVITED: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      ACTIVE: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      REJECTED: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
      SUSPENDED: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
      REMOVED: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      manager: 'Gestor',
      executor: 'Executor',
      consultant: 'Consultor',
    }
    return labels[role] || role
  }

  if (loading) {
    return (
      <BaseLayout sidebar={<DashboardSidebar />}>
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="mt-4 text-sm text-muted-foreground">Carregando...</p>
          </div>
        </div>
      </BaseLayout>
    )
  }

  return (
    <BaseLayout sidebar={<DashboardSidebar />}>
      <div className="container mx-auto max-w-7xl py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Funcionários</h1>
            <p className="mt-2 text-sm text-muted-foreground">Gerencie os funcionários da sua</p>
          </div>
          <Link href="/invite-employee">
            <Button size="lg" className="gap-2">
              <UserPlus className="h-5 w-5" />
              Convidar Funcionário
            </Button>
          </Link>
        </div>

        {companies.length > 0 && (
          <Card className="mb-6 p-4">
            <label className="mb-2 block text-sm font-medium">Filtrar por Empresa</label>
            <Select value={selectedCompany} onValueChange={setSelectedCompany}>
              <SelectTrigger className="h-11 w-full">
                <SelectValue placeholder="Selecione uma empresa">
                  {companies.find((c) => c.id === selectedCompany)?.name || 'Selecione uma empresa'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {companies.map((company) => (
                  <SelectItem key={company.id} value={company.id}>
                    {company.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Card>
        )}

        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="px-6 py-4 text-left text-sm font-semibold">Nome</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Cargo</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {employees.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-12 text-center text-sm text-muted-foreground"
                    >
                      Nenhum funcionário encontrado. Comece convidando um funcionário.
                    </td>
                  </tr>
                ) : (
                  employees.map((employee) => (
                    <tr key={employee.id} className="border-b hover:bg-muted/50">
                      <td className="px-6 py-4 text-sm">
                        {employee.user.firstName} {employee.user.lastName}
                      </td>
                      <td className="px-6 py-4 text-sm">{employee.user.email}</td>
                      <td className="px-6 py-4 text-sm">{getRoleLabel(employee.role)}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(
                            employee.status
                          )}`}
                        >
                          {getStatusLabel(employee.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          {employee.status === 'SUSPENDED' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={async () => {
                                try {
                                  await employeesApi.activate(employee.id)
                                  if (selectedCompany) {
                                    await loadEmployees(selectedCompany)
                                  }
                                } catch (err) {
                                  console.error('Error activating employee:', err)
                                }
                              }}
                            >
                              Ativar
                            </Button>
                          )}
                          {employee.status === 'ACTIVE' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={async () => {
                                try {
                                  await employeesApi.suspend(employee.id)
                                  if (selectedCompany) {
                                    await loadEmployees(selectedCompany)
                                  }
                                } catch (err) {
                                  console.error('Error suspending employee:', err)
                                }
                              }}
                            >
                              Suspender
                            </Button>
                          )}
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={async () => {
                              if (confirm('Tem certeza que deseja remover este funcionário?')) {
                                try {
                                  await employeesApi.remove(employee.id)
                                  if (selectedCompany) {
                                    await loadEmployees(selectedCompany)
                                  }
                                } catch (err) {
                                  console.error('Error removing employee:', err)
                                }
                              }
                            }}
                          >
                            Remover
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </BaseLayout>
  )
}
