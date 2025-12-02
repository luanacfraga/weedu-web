'use client'

import { RequireCompany } from '@/components/features/auth/guards/require-company'
import { BaseLayout } from '@/components/layout/base-layout'
import { DashboardSidebar } from '@/components/layout/dashboard-sidebar'
import { usePermissions } from '@/lib/hooks/use-permissions'
import { useAuthStore } from '@/lib/stores/auth-store'

export default function DashboardPage() {
  const { user } = useAuthStore()
  const { isAdmin, isManager, isAdminOrManager } = usePermissions()

  return (
    <RequireCompany>
      <BaseLayout sidebar={<DashboardSidebar />}>
        <div className="container mx-auto max-w-7xl py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">
              Olá, {user?.name?.split(' ')[0] || 'Usuário'}!
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">Bem-vindo ao painel de </p>
          </div>
        </div>
      </BaseLayout>
    </RequireCompany>
  )
}
