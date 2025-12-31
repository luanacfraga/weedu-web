'use client'

import { PageHeader } from '@/components/shared/layout/page-header'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/hooks/use-auth'
import { Plus } from 'lucide-react'
import Link from 'next/link'

export function ActionListHeader() {
  const { user } = useAuth()
  const canCreate = user?.role === 'admin' || user?.role === 'manager'

  return (
    <div>
      <PageHeader
        title="Ações"
        description="Gerencie e acompanhe o progresso das suas tarefas"
        action={
          canCreate ? (
            <Button asChild>
              <Link href="/actions/new">
                <Plus className="mr-2 h-4 w-4" />
                Nova Ação
              </Link>
            </Button>
          ) : null
        }
      />
    </div>
  )
}
