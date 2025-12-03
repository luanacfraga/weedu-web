'use client'

import { CompanySelector } from '@/components/features/company/selectors/company-selector'
import { useAuth } from '@/lib/hooks/use-auth'
import { useUserContext } from '@/lib/contexts/user-context'
import { useParams } from 'next/navigation'
import {
  BarChart3,
  Building2,
  CheckSquare,
  Home,
  LayoutDashboard,
  Settings,
  Users,
  UsersRound,
} from 'lucide-react'
import { useMemo } from 'react'
import { Sidebar, type MenuItem } from './sidebar'

export function DashboardSidebar() {
  const { logout } = useAuth()
  const { currentRole, currentCompanyId } = useUserContext()
  const params = useParams()
  const companyId = (params.companyId as string) || currentCompanyId

  const isAdmin = currentRole === 'admin'
  const isManager = currentRole === 'manager'
  const isExecutor = currentRole === 'executor'
  const isConsultant = currentRole === 'consultant'
  const isMaster = currentRole === 'master'

  const menuItems: MenuItem[] = useMemo(() => {
    const items: MenuItem[] = []
    const basePath = companyId ? `/companies/${companyId}` : ''

    if (isAdmin && companyId) {
      items.push(
        {
          name: 'Dashboard',
          href: `${basePath}/dashboard`,
          icon: BarChart3,
        },
        {
          name: 'Usuários',
          href: `${basePath}/members`,
          icon: UsersRound,
        },
        {
          name: 'Tarefas',
          href: `${basePath}/tasks`,
          icon: CheckSquare,
        },
        {
          name: 'Board',
          href: `${basePath}/board`,
          icon: LayoutDashboard,
        }
      )
    }

    if (isManager && companyId) {
      items.push(
        {
          name: 'Dashboard',
          href: `${basePath}/dashboard`,
          icon: BarChart3,
        },
        {
          name: 'Minhas equipes',
          href: `${basePath}/teams`,
          icon: Users,
        },
        {
          name: 'Board geral',
          href: `${basePath}/board/general`,
          icon: LayoutDashboard,
        },
        {
          name: 'Tarefas',
          href: `${basePath}/tasks`,
          icon: CheckSquare,
        }
      )
    }

    if (isExecutor && companyId) {
      items.push(
        {
          name: 'Dashboard',
          href: `${basePath}/dashboard`,
          icon: BarChart3,
        },
        {
          name: 'Minhas tarefas',
          href: `${basePath}/tasks/my-tasks`,
          icon: CheckSquare,
        },
        {
          name: 'Board equipe',
          href: `${basePath}/board/team`,
          icon: LayoutDashboard,
        }
      )
    }

    if (isConsultant && companyId) {
      items.push(
        {
          name: 'Dashboard',
          href: `${basePath}/dashboard`,
          icon: BarChart3,
        }
      )
    }

    if (isMaster) {
      items.push({
        name: 'Planos',
        href: '/plans',
        icon: Settings,
      })
    }

    if (isAdmin && !isMaster) {
      items.push({
        name: 'Empresas',
        href: '/companies',
        icon: Building2,
      })
    }

    items.push({
      name: 'Configurações',
      href: companyId ? `${basePath}/settings` : '/settings',
      icon: Settings,
    })

    return items
  }, [isAdmin, isManager, isExecutor, isConsultant, isMaster, companyId])

  return (
    <Sidebar
      items={menuItems}
      onLogout={logout}
      showLogout={true}
      topComponent={
        isAdmin && companyId ? (
          <CompanySelector variant="default" showLabel={true} />
        ) : undefined
      }
    />
  )
}
