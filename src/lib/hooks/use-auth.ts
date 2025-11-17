import { AuthService } from '@/lib/api/services/auth.service'
import { useAuthStore } from '@/lib/stores'
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

      // Aguarda um tick para garantir que o estado foi atualizado
      await new Promise((resolve) => setTimeout(resolve, 0))

      // Redireciona para o dashboard
      // Usa window.location como fallback caso router não funcione
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
    logout,
  }
}
