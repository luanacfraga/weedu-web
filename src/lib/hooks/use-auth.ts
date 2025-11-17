import { AuthService, type RegisterRequest } from '@/lib/api/services/auth.service'
import { useAuthStore } from '@/lib/stores/auth-store'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function useAuth() {
  const router = useRouter()
  const { user, isAuthenticated, login: setAuth, logout: clearAuth } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await AuthService.signIn(email, password)
      setAuth(response.user, response.access_token)

      await new Promise((resolve) => setTimeout(resolve, 0))

      if (typeof window !== 'undefined') {
        window.location.href = '/dashboard'
      } else {
        router.replace('/dashboard')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao fazer login'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (data: RegisterRequest) => {
    try {
      setIsLoading(true)
      setError(null)

      await AuthService.register(data)

      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      } else {
        router.push('/login')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao fazer cadastro'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      setIsLoading(true)
      await AuthService.logout()
    } catch (err) {
      console.error('Erro ao fazer logout:', err)
    } finally {
      clearAuth()
      setIsLoading(false)
      router.push('/login')
    }
  }

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
  }
}
