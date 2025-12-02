'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Building2 } from 'lucide-react'
import { useAuthGuard } from '@/lib/hooks/auth/use-auth-guard'
import { useCompanyStore } from '@/lib/stores/company-store'
import { LoadingScreen } from '@/components/shared/feedback/loading-screen'

interface RequireCompanyProps {
  children: React.ReactNode
}

/**
 * Componente que garante que usuários admin tenham empresa selecionada
 * Responsabilidade única: Verificar seleção de empresa para admins
 *
 * Aplica SRP: Usa hooks para lógica de autenticação
 * Aplica OCP: Componente de UI separado (CompanySelectionPrompt)
 */
export function RequireCompany({ children }: RequireCompanyProps) {
  const router = useRouter()
  const { isChecking, user } = useAuthGuard()
  const selectedCompany = useCompanyStore((state) => state.selectedCompany)

  useEffect(() => {
    // Apenas admins precisam ter empresa selecionada
    if (!isChecking && user?.role === 'admin' && !selectedCompany) {
      router.push('/select-company')
    }
  }, [isChecking, user, selectedCompany, router])

  // Mostrar loading enquanto verifica
  if (isChecking || !user) {
    return <LoadingScreen />
  }

  // Se admin sem empresa, mostrar mensagem amigável
  if (user.role === 'admin' && !selectedCompany) {
    return <CompanySelectionPrompt onNavigate={() => router.push('/select-company')} />
  }

  // Usuário autenticado e (não admin OU tem empresa)
  return <>{children}</>
}

/**
 * Componente de apresentação para prompt de seleção de empresa
 * Responsabilidade única: Renderizar UI de prompt
 *
 * Aplica SRP: Componente puro de apresentação
 */
function CompanySelectionPrompt({ onNavigate }: { onNavigate: () => void }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-lightest/30 via-background to-secondary-lightest/30 p-4">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary-lightest">
          <Building2 className="h-10 w-10 text-primary-base" />
        </div>
        <h2 className="text-2xl font-bold">Selecione uma Empresa</h2>
        <p className="mt-3 text-muted-foreground">
          Para continuar, você precisa selecionar qual empresa deseja administrar.
        </p>
        <Button onClick={onNavigate} className="mt-6" size="lg">
          Selecionar Empresa
        </Button>
      </div>
    </div>
  )
}
