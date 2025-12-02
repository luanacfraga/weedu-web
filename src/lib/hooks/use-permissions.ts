import { useAuthStore } from '@/lib/stores/auth-store'
import {
  Permission,
  type UserRole,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  hasRoleOrHigher,
  hasHigherRole,
  hasLowerRole,
  canManageUser,
  getRolePermissions,
} from '@/lib/permissions'

export function usePermissions() {
  const user = useAuthStore((state) => state.user)
  const role = user?.role

  return {
    role,
    user,
    can: (permission: Permission) => hasPermission(role, permission),
    canAny: (permissions: Permission[]) => hasAnyPermission(role, permissions),
    canAll: (permissions: Permission[]) => hasAllPermissions(role, permissions),
    hasRoleOrHigher: (requiredRole: UserRole) => hasRoleOrHigher(role, requiredRole),
    hasHigherRole: (compareRole: UserRole) => hasHigherRole(role, compareRole),
    hasLowerRole: (compareRole: UserRole) => hasLowerRole(role, compareRole),
    canManageUser: (targetRole: UserRole) => canManageUser(role, targetRole),
    getPermissions: () => getRolePermissions(role),
    isMaster: role === 'master',
    isAdmin: role === 'admin',
    isManager: role === 'manager',
    isExecutor: role === 'executor',
    isConsultant: role === 'consultant',
    isAdminOrManager: role === 'admin' || role === 'manager',
    canCreateCompany: hasPermission(role, Permission.CREATE_COMPANY),
    canInviteEmployee: hasPermission(role, Permission.INVITE_EMPLOYEE),
    canCreateTeam: hasPermission(role, Permission.CREATE_TEAM),
    canManagePlans: hasPermission(role, Permission.CREATE_PLAN),
    canViewTasks: hasPermission(role, Permission.VIEW_TASKS),
    canViewMyTasks: hasPermission(role, Permission.VIEW_MY_TASKS),
    canViewBoard: hasPermission(role, Permission.VIEW_BOARD),
    canViewBoardGeneral: hasPermission(role, Permission.VIEW_BOARD_GENERAL),
    canViewBoardTeam: hasPermission(role, Permission.VIEW_BOARD_TEAM),
  }
}

