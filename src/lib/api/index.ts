export { apiClient, ApiError } from './api-client'
export * from './types'

// Services (padrão weedu-app)
export { AuthService } from './services/auth.service'
export { CompanyService } from './services/company.service'
export { PlanService } from './services/plan.service'

// Re-export types from services
export type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
} from './services/auth.service'
export type {
  Company,
  CreateCompanyRequest,
  UpdateCompanyRequest,
} from './services/company.service'
export type { CreatePlanRequest, Plan, UpdatePlanRequest } from './services/plan.service'

// Legacy exports (manter compatibilidade temporária)
export { authApi } from './endpoints/auth'
export { companiesApi } from './endpoints/companies'
export { plansApi } from './endpoints/plans'
export { teamsApi } from './endpoints/teams'
export { usersApi } from './endpoints/users'
