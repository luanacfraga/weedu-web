import api from '../config/api.config'
import { PaginatedResponse, PaginationParams } from '../types'

export interface Company {
  id: string
  name: string
  adminId: string
  createdAt: string
  updatedAt: string
}

export interface CreateCompanyRequest {
  name: string
  adminId: string
}

export interface UpdateCompanyRequest {
  name?: string
}

export class CompanyService {
  private static readonly BASE_URL = '/api/v1/companies'

  static async getAll(params?: PaginationParams): Promise<PaginatedResponse<Company>> {
    const response = await api.get<PaginatedResponse<Company>>(this.BASE_URL, {
      params: params as Record<string, string | number | boolean | undefined>,
    })
    return response.data
  }

  static async getById(id: string): Promise<Company> {
    const response = await api.get<Company>(`${this.BASE_URL}/${id}`)
    return response.data
  }

  static async create(data: CreateCompanyRequest): Promise<Company> {
    const response = await api.post<Company>(this.BASE_URL, data)
    return response.data
  }

  static async update(id: string, data: UpdateCompanyRequest): Promise<Company> {
    const response = await api.put<Company>(`${this.BASE_URL}/${id}`, data)
    return response.data
  }

  static async delete(id: string): Promise<void> {
    await api.delete<void>(`${this.BASE_URL}/${id}`)
  }
}
