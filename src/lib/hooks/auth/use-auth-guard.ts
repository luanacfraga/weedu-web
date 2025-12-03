'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import { config } from '@/config'
import { useAuthStore } from '@/lib/stores/auth-store'

interface UseAuthGuardOptions {
  redirectTo?: string
  requireAuth?: boolean
}

interface AuthGuardState {
  isChecking: boolean
  isAuthenticated: boolean
  user: any
}

/**
 * Hook para gerenciar lógica de autenticação e redirecionamento
 * Responsabilidade única: Verificar estado de autenticação
 *
 * Aplica DIP: Não depende diretamente de implementações, retorna apenas estado
 */
export function useAuthGuard(options: UseAuthGuardOptions = {}): AuthGuardState {
  const { redirectTo = '/login', requireAuth = true } = options
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const token = Cookies.get(config.cookies.tokenName)

    const checkAuth = setTimeout(() => {
      // Se não tem token e não tem usuário, redirecionar para login
      if (!token && !user && requireAuth) {
        router.push(redirectTo)
        return
      }

      // Se tem token mas Zustand não hidratou ainda, aguardar
      if (token && !user) {
        setIsChecking(true)
        return
      }

      setIsChecking(false)
    }, 100)

    return () => clearTimeout(checkAuth)
  }, [user, isAuthenticated, router, redirectTo, requireAuth])

  return {
    isChecking,
    isAuthenticated: !!user,
    user,
  }
}
