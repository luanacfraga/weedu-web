'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUserContext } from '@/lib/contexts/user-context'
import { LoadingScreen } from '@/components/shared/feedback/loading-screen'

export default function DashboardPage() {
  const router = useRouter()
  const { user, currentCompanyId } = useUserContext()

  useEffect(() => {
    if (user) {
      if (currentCompanyId) {
        router.replace(`/companies/${currentCompanyId}/dashboard`)
      } else if (user.companies.length > 0) {
        router.replace(`/companies/${user.companies[0].id}/dashboard`)
      } else {
        router.replace('/select-company')
      }
    }
  }, [user, currentCompanyId, router])

  return <LoadingScreen message="Redirecionando..." />
}
