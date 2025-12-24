'use client'

import { CompanySelector } from '@/components/features/company/selectors/company-selector'
import { USER_ROLES } from '@/lib/constants'
import { useUserContext } from '@/lib/contexts/user-context'
import { useAuth } from '@/lib/hooks/use-auth'
import { usePermissions } from '@/lib/hooks/use-permissions'
import {
  BarChart3,
  Building2,
  CheckSquare,
  LayoutDashboard,
  Settings,
  Users,
  UsersRound,
} from 'lucide-react'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { useMemo } from 'react'
import { Sidebar, type MenuItem } from './sidebar'

function SidebarLogo({ isCollapsed }: { isCollapsed?: boolean }) {
  return (
    <div className="flex items-center justify-center px-2">
      <Image
        src="/images/logo.png"
        alt="Weedu"
        width={120}
        height={40}
        className="h-8 w-auto object-contain"
        priority
      />
    </div>
  )
}

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
        isAdmin && companyId ? (
          <CompanySelector variant="default" showLabel={true} />
        ) : (
          <SidebarLogo />
        )
      }
    />
  )
}
