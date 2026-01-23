import type { User } from '@/lib/stores/auth-store'
import type { Employee } from '@/lib/types/api'
import type { Team } from '@/lib/api/endpoints/teams'
import { ADMIN_ROLES, type UserRoleType } from './action-form.constants'

interface CreateInjectedEmployeeParams {
  authUser: User
  selectedCompanyId: string
  role: UserRoleType
}

export function createInjectedEmployee({
  authUser,
  selectedCompanyId,
  role,
}: CreateInjectedEmployeeParams): Employee {
  const fullName = authUser.name || ''
  const [firstName, ...rest] = fullName.split(' ')
  const lastName = rest.join(' ') || firstName

  return {
    id: `self-${authUser.id}-${selectedCompanyId}`,
    userId: authUser.id,
    companyId: selectedCompanyId,
    role: 'manager',
    status: 'ACTIVE',
    position: undefined,
    notes: undefined,
    invitedAt: null,
    acceptedAt: null,
    invitedBy: null,
    user: {
      id: authUser.id,
      firstName: firstName || fullName || 'Usuário',
      lastName: lastName || '',
      email: authUser.email,
      phone: authUser.phone ?? '',
      document: authUser.document ?? '',
      role: role,
      initials: authUser.initials ?? null,
      avatarColor: authUser.avatarColor ?? null,
    },
  }
}

export function shouldInjectCurrentUser(
  hasTeam: boolean,
  hasResponsibles: boolean,
  hasCompany: boolean,
  hasAuthUser: boolean,
  role: UserRoleType | null
): boolean {
  if (hasTeam || hasResponsibles) return false
  if (!hasCompany || !hasAuthUser || !role) return false

  return ['manager', 'admin'].includes(role)
}

export function isAdminRole(role: UserRoleType | null | undefined): boolean {
  if (!role) return false
  return ADMIN_ROLES.includes(role)
}

export function findUserTeam(params: {
  selectedCompanyId: string | null
  authUser: User | null
  teams: Team[]
  role: UserRoleType | null
  mode: 'create' | 'edit'
  firstTeam: Team | null
  firstTeamResponsibles: Employee[]
}): Team | null {
  const { selectedCompanyId, authUser, teams, role, mode, firstTeam, firstTeamResponsibles } =
    params

  if (!selectedCompanyId || !authUser || !teams.length || mode !== 'create') {
    return null
  }

  if (role === 'manager') {
    const managerTeams = teams.filter((team) => team.managerId === authUser.id)
    return managerTeams.length === 1 ? managerTeams[0] : null
  }

  if (role === 'executor' && firstTeam) {
    const isMember = firstTeamResponsibles.some((emp) => emp.userId === authUser.id)
    return isMember ? firstTeam : null
  }

  return null
}

export function mergeResponsibleOptions(
  baseOptions: Employee[],
  injectedEmployee: Employee | null
): Employee[] {
  if (!injectedEmployee) return baseOptions

  const exists = baseOptions.some((emp) => emp.userId === injectedEmployee.userId)
  if (exists) return baseOptions

  return [...baseOptions, injectedEmployee]
}
