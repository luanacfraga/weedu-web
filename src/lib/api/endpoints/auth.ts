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
    firstName: string
    lastName: string
    role: 'master' | 'admin' | 'manager' | 'executor' | 'consultant'
    initials?: string | null
    avatarColor?: string | null
    phone?: string | null
  }
}

export interface RegisterRequest {
  firstName: string
  lastName: string
  email: string
  password: string
  phone: string
  document: string
  documentType: 'CPF' | 'CNPJ'
  company?: {
    name: string
    description: string
  }
}

export interface RegisterMasterRequest {
  firstName: string
  lastName: string
  email: string
  password: string
  phone: string
  document: string
  documentType: 'CPF' | 'CNPJ'
}

export interface RegisterResponse {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  token: string
  newPassword: string
}

export const authApi = {
  login: (data: LoginRequest) => apiClient.post<LoginResponse>('/api/v1/auth/login', data),

  register: (data: RegisterRequest) =>
    apiClient.post<RegisterResponse>('/api/v1/auth/register', data),

  registerMaster: (data: RegisterMasterRequest) =>
    apiClient.post<RegisterResponse>('/api/v1/auth/register-master', data),

  me: () => apiClient.get<LoginResponse['user']>('/api/v1/auth/me'),

  logout: () => apiClient.post<void>('/api/v1/auth/logout'),

  forgotPassword: (data: ForgotPasswordRequest) =>
    apiClient.post<void>('/api/v1/auth/forgot-password', data),

  resetPassword: (data: ResetPasswordRequest) =>
    apiClient.post<void>('/api/v1/auth/reset-password', data),
}
