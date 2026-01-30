'use client'

import { ActionDialog } from '@/components/features/actions/action-dialog'
import { ActionFilters } from '@/components/features/actions/action-list/action-filters'
import { ActionListContainer } from '@/components/features/actions/action-list/action-list-container'
import { ActionListSkeleton } from '@/components/features/actions/action-list/action-list-skeleton'
import { PageContainer } from '@/components/shared/layout/page-container'
import { PageHeader } from '@/components/shared/layout/page-header'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/hooks/use-auth'
import { usePermissions } from '@/lib/hooks/use-permissions'
import { useActionDialogStore } from '@/lib/stores/action-dialog-store'
import { Plus } from 'lucide-react'
import { Suspense } from 'react'

export default function ActionsPage() {
  const { user } = useAuth()
  const { openCreate } = useActionDialogStore()
  const { isAdmin, isManager } = usePermissions()
  const canCreate = isAdmin || isManager

  return (
    <PageContainer maxWidth="full">
      <PageHeader
        title="Ações"
        description="Gerencie e acompanhe o progresso das suas tarefas"
        action={
          canCreate ? (
            <Button
              onClick={openCreate}
              className="hidden gap-1.5 font-medium md:inline-flex md:gap-2"
            >
              <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>Nova Ação</span>
            </Button>
          ) : null
        }
      />

      <div className="space-y-6">
        <ActionFilters />
        <div className="-mx-4 sm:mx-0">
          <Suspense fallback={<ActionListSkeleton />}>
            <ActionListContainer />
          </Suspense>
        </div>
      </div>

      {canCreate && (
        <Button
          onClick={openCreate}
          size="icon"
          className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg md:hidden"
          aria-label="Nova ação"
        >
          <Plus className="h-6 w-6" />
        </Button>
      )}

      <ActionDialog />
    </PageContainer>
  )
}
