import { authApi, type RegisterRequest } from '@/lib/api/endpoints/auth'
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

      const response = await authApi.login({ email, password })

      const userForStore = {
        id: response.user.id,
        email: response.user.email,
        name: `${response.user.firstName} ${response.user.lastName}`,
        role: response.user.role,
      }

      setAuth(userForStore, response.access_token)

      await new Promise((resolve) => setTimeout(resolve, 100))

      const redirectPath = userForStore.role === 'admin' ? '/select-company' : '/dashboard'

      router.replace(redirectPath)
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

      await authApi.register(data)

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
      await authApi.logout()
    } catch (err) {
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
