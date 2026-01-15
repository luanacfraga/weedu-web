export interface Company {
  id: string
  name: string
  description?: string
  adminId: string
  createdAt: string
  updatedAt: string
}

export interface CreateCompanyRequest {
  name: string
  description?: string
  adminId: string
}

export interface UpdateCompanyRequest {
  name?: string
  description?: string
}

export type EmployeeRole = 'manager' | 'executor' | 'consultant'
export type EmployeeStatus = 'INVITED' | 'ACTIVE' | 'REJECTED' | 'SUSPENDED' | 'REMOVED'

export interface Employee {
  id: string
  userId: string
  companyId: string
  role: EmployeeRole
  status: EmployeeStatus
  position?: string | null
  notes?: string | null
  invitedAt?: string | null
  acceptedAt?: string | null
  invitedBy?: string | null
  user?: {
    id: string
    firstName: string
    lastName: string
    email: string
    phone: string
    document: string
    role: string
    initials?: string | null
    avatarColor?: string | null
  }
}

export interface InviteEmployeeRequest {
  companyId: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  document?: string
  role: EmployeeRole
  position?: string
  notes?: string
}
