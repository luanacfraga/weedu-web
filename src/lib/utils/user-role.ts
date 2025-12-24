import type { UserRole } from '@/lib/permissions'
import type { User } from '@/lib/stores/auth-store'
import { USER_ROLES } from '@/lib/constants'

export interface CompanyWithRole {
  id: string
  name: string
  role: UserRole
}

export function mapCompanyToCompanyWithRole(
  company: { id: string; name: string },
  userRole: User['role']
): CompanyWithRole {
  if (userRole === USER_ROLES.MASTER) {
    return { id: company.id, name: company.name, role: USER_ROLES.MASTER as UserRole }
  }

  if (userRole === USER_ROLES.ADMIN) {
    return { id: company.id, name: company.name, role: USER_ROLES.ADMIN as UserRole }
  }

  return { id: company.id, name: company.name, role: userRole as UserRole }
}

export function getCompaniesWithRoles(
  companies: Array<{ id: string; name: string }>,
  user: User | null
): CompanyWithRole[] {
  if (!user || !companies.length) return []

  return companies.map((company) => mapCompanyToCompanyWithRole(company, user.role))
}

