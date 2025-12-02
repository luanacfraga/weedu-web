'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useAuthGuard } from '@/lib/hooks/auth/use-auth-guard'
import { usePermissions } from '@/lib/hooks/use-permissions'
import { LoadingScreen } from '@/components/shared/feedback/loading-screen'

interface AdminOnlyProps {
  children: React.ReactNode
  fallbackPath?: string
}

/**
 * Componente que garante acesso apenas para usuários com role 'admin'
 * Responsabilidade única: Verificar permissão de admin e renderizar children
 *
 * Aplica SRP: Usa hooks para lógica de autenticação
 * Aplica DIP: Depende de abstrações (hooks) ao invés de implementações
 */
export function AdminOnly({ children, fallbackPath = '/dashboard' }: AdminOnlyProps) {
  const router = useRouter()
  const { isChecking, isAuthenticated, user } = useAuthGuard()
  const { isAdmin } = usePermissions()

  useEffect(() => {
    // Se autenticado mas não é admin, redirecionar
    if (!isChecking && isAuthenticated && user && !isAdmin) {
      router.push(fallbackPath)
    }
  }, [isChecking, isAuthenticated, user, isAdmin, router, fallbackPath])

  // Mostrar loading enquanto verifica
  if (isChecking || !user) {
    return <LoadingScreen message="Verificando permissões..." />
  }

  // Se não é admin, mostrar loading durante redirecionamento
  if (!isAdmin) {
    return <LoadingScreen message="Redirecionando..." />
  }

  // Usuário é admin, renderizar children
  return <>{children}</>
}
