import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

import { USER_ROLES } from '@/lib/constants'
import { useUserContext } from '@/lib/contexts/user-context'

export function useDashboardRedirect() {
  const router = useRouter()
  const { user, currentCompanyId } = useUserContext()

  useEffect(() => {
    if (!user) return

    if (user.globalRole === USER_ROLES.MASTER) {
      router.replace('/plans')
      return
    }

    if (user.globalRole === USER_ROLES.ADMIN) {
      router.replace('/companies')
      return
    }

    if (currentCompanyId) {
      router.replace(`/companies/${currentCompanyId}/dashboard`)
      return
    }

    if (user.companies.length > 0) {
      router.replace(`/companies/${user.companies[0].id}/dashboard`)
    }
  }, [user, currentCompanyId, router])
}
