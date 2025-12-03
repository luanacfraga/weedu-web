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

export function RequireCompany({ children }: RequireCompanyProps) {
  const router = useRouter()
  const { isChecking, user } = useAuthGuard()
  const selectedCompany = useCompanyStore((state) => state.selectedCompany)

  useEffect(() => {
    if (!isChecking && user?.role === 'admin' && !selectedCompany) {
      router.push('/select-company')
    }
  }, [isChecking, user, selectedCompany, router])

  if (isChecking || !user) {
    return <LoadingScreen />
  }

  if (user.role === 'admin' && !selectedCompany) {
    return <CompanySelectionPrompt onNavigate={() => router.push('/select-company')} />
  }

  return <>{children}</>
}

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
