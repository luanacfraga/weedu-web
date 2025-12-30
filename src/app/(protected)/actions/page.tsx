import { ActionFilters } from '@/components/features/actions/action-list/action-filters'
import { ActionListHeader } from '@/components/features/actions/action-list/action-list-header'
import { ActionListSkeleton } from '@/components/features/actions/action-list/action-list-skeleton'
import { ActionTable } from '@/components/features/actions/action-list/action-table'
import { Suspense } from 'react'

export default function ActionsPage() {
  return (
    <div className="space-y-6">
      <ActionListHeader />
      <ActionFilters />
      <Suspense fallback={<ActionListSkeleton />}>
        <ActionTable />
      </Suspense>
    </div>
  )
}
