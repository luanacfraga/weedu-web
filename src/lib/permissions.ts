import { USER_ROLES } from '@/lib/constants'

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES]

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  [USER_ROLES.MASTER]: 5,
  [USER_ROLES.ADMIN]: 4,
  [USER_ROLES.MANAGER]: 3,
  [USER_ROLES.EXECUTOR]: 2,
  [USER_ROLES.CONSULTANT]: 1,
}

export enum Permission {
  CREATE_COMPANY = 'create:company',
  VIEW_COMPANIES = 'view:companies',
  EDIT_COMPANY = 'edit:company',
  DELETE_COMPANY = 'delete:company',
  SELECT_COMPANY = 'select:company',

  INVITE_EMPLOYEE = 'invite:employee',
  VIEW_EMPLOYEES = 'view:employees',
  EDIT_EMPLOYEE = 'edit:employee',
  DELETE_EMPLOYEE = 'delete:employee',

  CREATE_TEAM = 'create:team',
  VIEW_TEAMS = 'view:teams',
  VIEW_MY_TEAMS = 'view:my_teams',
  EDIT_TEAM = 'edit:team',
  DELETE_TEAM = 'delete:team',
  MANAGE_TEAM_MEMBERS = 'manage:team_members',

  CREATE_PLAN = 'create:plan',
  VIEW_PLANS = 'view:plans',
  EDIT_PLAN = 'edit:plan',
  DELETE_PLAN = 'delete:plan',

  VIEW_DASHBOARD = 'view:dashboard',
  VIEW_DASHBOARD_COMPANY = 'view:dashboard:company',
  VIEW_DASHBOARD_TEAM = 'view:dashboard:team',
  VIEW_DASHBOARD_PERSONAL = 'view:dashboard:personal',
  VIEW_DASHBOARD_USER = 'view:dashboard:user',

  VIEW_TASKS = 'view:tasks',
  VIEW_MY_TASKS = 'view:my_tasks',
  CREATE_TASK = 'create:task',
  EDIT_TASK = 'edit:task',
  DELETE_TASK = 'delete:task',

  VIEW_BOARD = 'view:board',
  VIEW_BOARD_GENERAL = 'view:board:general',
  VIEW_BOARD_TEAM = 'view:board:team',
  MANAGE_BOARD = 'manage:board',
}

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [USER_ROLES.MASTER]: [
    Permission.CREATE_PLAN,
    Permission.VIEW_PLANS,
    Permission.EDIT_PLAN,
    Permission.DELETE_PLAN,
    Permission.VIEW_DASHBOARD,
  ],

  [USER_ROLES.ADMIN]: [
    Permission.CREATE_COMPANY,
    Permission.VIEW_COMPANIES,
    Permission.EDIT_COMPANY,
    Permission.DELETE_COMPANY,
    Permission.SELECT_COMPANY,
    Permission.INVITE_EMPLOYEE,
    Permission.VIEW_EMPLOYEES,
    Permission.EDIT_EMPLOYEE,
    Permission.DELETE_EMPLOYEE,
    Permission.VIEW_TASKS,
    Permission.CREATE_TASK,
    Permission.EDIT_TASK,
    Permission.DELETE_TASK,
    Permission.VIEW_BOARD,
    Permission.MANAGE_BOARD,
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_DASHBOARD_COMPANY,
    Permission.VIEW_DASHBOARD_TEAM,
    Permission.VIEW_DASHBOARD_PERSONAL,
  ],

  [USER_ROLES.MANAGER]: [
    Permission.INVITE_EMPLOYEE,
    Permission.VIEW_MY_TEAMS,
    Permission.VIEW_BOARD_GENERAL,
    Permission.VIEW_BOARD_TEAM,
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_DASHBOARD_TEAM,
    Permission.VIEW_DASHBOARD_PERSONAL,
  ],

  [USER_ROLES.EXECUTOR]: [
    Permission.VIEW_MY_TASKS,
    Permission.VIEW_BOARD_TEAM,
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_DASHBOARD_PERSONAL,
  ],

  [USER_ROLES.CONSULTANT]: [
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_DASHBOARD_COMPANY,
    Permission.VIEW_DASHBOARD_TEAM,
    Permission.VIEW_DASHBOARD_USER,
  ],
}

export function hasPermission(role: UserRole | null | undefined, permission: Permission): boolean {
  if (!role) return false

  const permissions = ROLE_PERMISSIONS[role] || []
  return permissions.includes(permission)
}

export function hasAnyPermission(
  role: UserRole | null | undefined,
  permissions: Permission[]
): boolean {
  if (!role) return false
  return permissions.some((permission) => hasPermission(role, permission))
}

export function hasAllPermissions(
  role: UserRole | null | undefined,
  permissions: Permission[]
): boolean {
  if (!role) return false
  return permissions.every((permission) => hasPermission(role, permission))
}

export function hasRoleOrHigher(
  userRole: UserRole | null | undefined,
  requiredRole: UserRole
): boolean {
  if (!userRole) return false
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole]
}

export function hasHigherRole(
  userRole: UserRole | null | undefined,
  compareRole: UserRole
): boolean {
  if (!userRole) return false
  return ROLE_HIERARCHY[userRole] > ROLE_HIERARCHY[compareRole]
}

export function hasLowerRole(
  userRole: UserRole | null | undefined,
  compareRole: UserRole
): boolean {
  if (!userRole) return false
  return ROLE_HIERARCHY[userRole] < ROLE_HIERARCHY[compareRole]
}

export function getRolePermissions(role: UserRole | null | undefined): Permission[] {
  if (!role) return []
  return ROLE_PERMISSIONS[role] || []
}

export function canManageUser(
  managerRole: UserRole | null | undefined,
  targetRole: UserRole
): boolean {
  if (!managerRole) return false

  if (managerRole === USER_ROLES.MASTER) return true

  if (managerRole === USER_ROLES.ADMIN) {

    return (
      [USER_ROLES.MANAGER, USER_ROLES.EXECUTOR, USER_ROLES.CONSULTANT] as UserRole[]
    ).includes(targetRole)

  }

  if (managerRole === USER_ROLES.MANAGER) {
    return targetRole === USER_ROLES.EXECUTOR
  }

  return false
}
