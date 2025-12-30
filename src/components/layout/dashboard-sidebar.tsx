'use client'

import { CompanySelector } from '@/components/features/company/selectors/company-selector'
import { USER_ROLES } from '@/lib/constants'
import { useUserContext } from '@/lib/contexts/user-context'
import { useAuth } from '@/lib/hooks/use-auth'
import { usePermissions } from '@/lib/hooks/use-permissions'
import {
  BarChart3,
  Building2,
  ClipboardList,
  LayoutDashboard,
  Settings,
  Users,
  UsersRound,
} from 'lucide-react'
import { useParams } from 'next/navigation'
import { useMemo } from 'react'
import { Sidebar, type MenuItem } from './sidebar'

export function DashboardSidebar() {
  const { logout } = useAuth()
  const { currentRole, currentCompanyId } = useUserContext()
  const { canInviteEmployee } = usePermissions()
  const params = useParams()
  const companyId = (params.companyId as string) || currentCompanyId

  const isAdmin = currentRole === USER_ROLES.ADMIN
  const isManager = currentRole === USER_ROLES.MANAGER
  const isExecutor = currentRole === USER_ROLES.EXECUTOR
  const isConsultant = currentRole === USER_ROLES.CONSULTANT
  const isMaster = currentRole === USER_ROLES.MASTER

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
          name: 'Ações',
          href: '/actions',
          icon: ClipboardList,
        },
        {
          name: 'Usuários',
          href: `${basePath}/members`,
          icon: UsersRound,
          subItems: [
            {
              name: 'Lista de Usuários',
              href: `${basePath}/members`,
            },
            {
              name: 'Convidar Funcionário',
              href: `${basePath}/invite`,
            },
          ],
        },
        {
          name: 'Equipes',
          href: `${basePath}/teams`,
          icon: Users,
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
          name: 'Ações',
          href: '/actions',
          icon: ClipboardList,
        },
        {
          name: 'Minhas equipes',
          href: `${basePath}/teams`,
          icon: Users,
        },
        ...(canInviteEmployee
          ? [
              {
                name: 'Usuários',
                href: `${basePath}/members`,
                icon: UsersRound,
                subItems: [
                  {
                    name: 'Convidar Funcionário',
                    href: `${basePath}/invite`,
                  },
                ],
              },
            ]
          : []),
        {
          name: 'Board geral',
          href: `${basePath}/board/general`,
          icon: LayoutDashboard,
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
          name: 'Board equipe',
          href: `${basePath}/board/team`,
          icon: LayoutDashboard,
        }
      )
    }

    if (isConsultant && companyId) {
      items.push({
        name: 'Dashboard',
        href: `${basePath}/dashboard`,
        icon: BarChart3,
      })
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
        subItems: [
          {
            name: 'Lista de Empresas',
            href: '/companies',
          },
          {
            name: 'Nova Empresa',
            href: '/companies/new',
          },
        ],
      })
    }

    items.push({
      name: 'Configurações',
      href: companyId ? `${basePath}/settings` : '/settings',
      icon: Settings,
    })

    return items
  }, [isAdmin, isManager, isExecutor, isConsultant, isMaster, companyId, canInviteEmployee])

  return (
    <Sidebar
      items={menuItems}
      onLogout={logout}
      showLogout={true}
      topComponent={
        isAdmin && companyId ? <CompanySelector variant="default" showLabel={true} /> : null
      }
    />
  )
}
