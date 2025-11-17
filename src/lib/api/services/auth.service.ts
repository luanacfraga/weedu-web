import api from '../config/api.config'

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

export class AuthService {
  private static readonly BASE_URL = '/api/v1/auth'

  static async signIn(email: string, password: string): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>(`${this.BASE_URL}/login`, {
      email,
      password,
    })
    return response.data
  }

  static async register(data: RegisterRequest): Promise<RegisterResponse> {
    const response = await api.post<RegisterResponse>(
      `${this.BASE_URL}/register`,
      data
    )
    return response.data
  }

  static async me() {
    const response = await api.get<LoginResponse['user']>(`${this.BASE_URL}/me`)
    return response.data
  }

  static async logout(): Promise<void> {
    await api.post<void>(`${this.BASE_URL}/logout`)
  }
}

