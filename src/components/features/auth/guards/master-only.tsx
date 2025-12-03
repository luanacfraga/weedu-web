'use client'

import { LoadingScreen } from '@/components/shared/feedback/loading-screen'
import { useAuthGuard } from '@/lib/hooks/auth/use-auth-guard'
import { usePermissions } from '@/lib/hooks/use-permissions'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface MasterOnlyProps {
  children: React.ReactNode
  fallbackPath?: string
}

export function MasterOnly({ children, fallbackPath = '/dashboard' }: MasterOnlyProps) {
  const router = useRouter()
  const { isChecking, isAuthenticated, user } = useAuthGuard()
  const { isMaster } = usePermissions()

  useEffect(() => {
    if (!isChecking && isAuthenticated && user && !isMaster) {
      router.push(fallbackPath)
    }
  }, [isChecking, isAuthenticated, user, isMaster, router, fallbackPath])

  if (isChecking || !user) {
    return <LoadingScreen message="Verificando permissões..." />
  }

  if (!isMaster) {
    return <LoadingScreen message="Redirecionando..." />
  }

  return <>{children}</>
}
