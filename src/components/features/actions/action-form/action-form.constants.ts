import { ActionPriority } from '@/lib/types/action'

export const FORM_MODE = {
  CREATE: 'create',
  EDIT: 'edit',
} as const

export type FormMode = (typeof FORM_MODE)[keyof typeof FORM_MODE]

export const USER_ROLE = {
  MASTER: 'master',
  ADMIN: 'admin',
  MANAGER: 'manager',
  EXECUTOR: 'executor',
  CONSULTANT: 'consultant',
} as const

export type UserRoleType = (typeof USER_ROLE)[keyof typeof USER_ROLE]

export const ROLES_WITH_BLOCK_PERMISSION: UserRoleType[] = [
  USER_ROLE.MANAGER,
  USER_ROLE.EXECUTOR,
  USER_ROLE.ADMIN,
  USER_ROLE.MASTER,
]

export const ADMIN_ROLES: UserRoleType[] = [USER_ROLE.ADMIN, USER_ROLE.MASTER]

export const PRIORITY_CONFIG = {
  [ActionPriority.LOW]: {
    exclamationCount: 0,
  },
  [ActionPriority.MEDIUM]: {
    exclamationCount: 1,
  },
  [ActionPriority.HIGH]: {
    exclamationCount: 2,
  },
  [ActionPriority.URGENT]: {
    exclamationCount: 3,
  },
} as const

export const SELECT_VALUES = {
  NO_TEAM: 'none',
} as const
