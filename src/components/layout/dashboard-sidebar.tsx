'use client'

import { CompanySelector } from '@/components/features/company/selectors/company-selector'
import { useAuth } from '@/lib/hooks/use-auth'
import { usePermissions } from '@/lib/hooks/use-permissions'
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
  const { isAdmin, isManager, isExecutor, isConsultant, isMaster, can } = usePermissions()

  const menuItems: MenuItem[] = useMemo(() => {
    const items: MenuItem[] = []

    if (isAdmin) {
      items.push(
        {
          name: 'Empresa',
          href: '/companies',
          icon: Building2,
        },
        {
          name: 'Usuários',
          href: '/employees',
          icon: UsersRound,
        },
        {
          name: 'Tarefas',
          href: '/tasks',
          icon: CheckSquare,
        },
        {
          name: 'Board',
          href: '/board',
          icon: LayoutDashboard,
        },
        {
          name: 'Dashboards',
          href: '/dashboards',
          icon: BarChart3,
        }
      )
    }

    if (isManager) {
      items.push(
        {
          name: 'Minhas equipes',
          href: '/teams/my-teams',
          icon: Users,
        },
        {
          name: 'Board geral',
          href: '/board/general',
          icon: LayoutDashboard,
        },
        {
          name: 'Dashboard equipe',
          href: '/dashboard/team',
          icon: BarChart3,
        },
        {
          name: 'Dashboard pessoal',
          href: '/dashboard/personal',
          icon: Home,
        }
      )
    }

    if (isExecutor) {
      items.push(
        {
          name: 'Minhas tarefas',
          href: '/tasks/my-tasks',
          icon: CheckSquare,
        },
        {
          name: 'Board equipe',
          href: '/board/team',
          icon: LayoutDashboard,
        },
        {
          name: 'Dashboard pessoal',
          href: '/dashboard/personal',
          icon: Home,
        }
      )
    }

    if (isConsultant) {
      items.push(
        {
          name: 'Dashboard empresa',
          href: '/dashboard/company',
          icon: BarChart3,
        },
        {
          name: 'Dashboard equipe',
          href: '/dashboard/team',
          icon: BarChart3,
        },
        {
          name: 'Dashboard usuário',
          href: '/dashboard/user',
          icon: Home,
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

    items.push({
      name: 'Configurações',
      href: '/settings',
      icon: Settings,
    })

    return items
  }, [isAdmin, isManager, isExecutor, isConsultant, isMaster])

  const showCompanySelector = isAdmin

  return (
    <Sidebar
      items={menuItems}
      onLogout={logout}
      showLogout={true}
      topComponent={
        showCompanySelector ? (
          <div className="px-4">
            <CompanySelector variant="default" showLabel={true} />
          </div>
        ) : undefined
      }
    />
  )
}
