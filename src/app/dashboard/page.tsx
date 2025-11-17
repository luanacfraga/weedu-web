'use client'

import { useAuthStore } from '@/lib/stores/auth-store'

export default function DashboardPage() {
  const { user } = useAuthStore()

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-foreground">
          Olá, {user?.name?.split(' ')[0] || 'Usuário'}!
        </h1>
      </div>
    </div>
  )
}
