import api from '../config/api.config'
import { PaginatedResponse, PaginationParams } from '../types'

export interface Plan {
  id: string
  name: string
  description: string | null
  price: number
  maxCompanies: number
  maxManagers: number
  maxExecutors: number
  maxConsultants: number
  iaCallsLimit: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreatePlanRequest {
  name: string
  description?: string
  price: number
  maxCompanies: number
  maxManagers: number
  maxExecutors: number
  maxConsultants: number
  iaCallsLimit: number
  isActive?: boolean
}

export interface UpdatePlanRequest extends Partial<CreatePlanRequest> {}

export class PlanService {
  private static readonly BASE_URL = '/api/v1/plans'

  static async getAll(params?: PaginationParams): Promise<PaginatedResponse<Plan>> {
    const response = await api.get<PaginatedResponse<Plan>>(this.BASE_URL, {
      params: params as Record<string, string | number | boolean | undefined>,
    })
    return response.data
  }

  static async getById(id: string): Promise<Plan> {
    const response = await api.get<Plan>(`${this.BASE_URL}/${id}`)
    return response.data
  }

  static async create(data: CreatePlanRequest): Promise<Plan> {
    const response = await api.post<Plan>(this.BASE_URL, data)
    return response.data
  }

  static async update(id: string, data: UpdatePlanRequest): Promise<Plan> {
    const response = await api.put<Plan>(`${this.BASE_URL}/${id}`, data)
    return response.data
  }

  static async delete(id: string): Promise<void> {
    await api.delete<void>(`${this.BASE_URL}/${id}`)
  }
}

