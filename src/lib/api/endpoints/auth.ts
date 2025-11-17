import { apiClient } from '../api-client'

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  access_token: string
  user: {
    id: string
    email: string
    name: string
    role: 'master' | 'admin' | 'manager' | 'executor' | 'consultant'
  }
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
}

export interface RegisterResponse {
  id: string
  email: string
  name: string
  role: string
}

export const authApi = {
  login: (data: LoginRequest) =>
    apiClient.post<LoginResponse>('/api/v1/auth/login', data),

  register: (data: RegisterRequest) =>
    apiClient.post<RegisterResponse>('/api/v1/auth/register', data),

  me: () =>
    apiClient.get<LoginResponse['user']>('/api/v1/auth/me'),

  logout: () =>
    apiClient.post<void>('/api/v1/auth/logout'),
}
