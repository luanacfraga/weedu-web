import { Suspense } from 'react';
import { ActionListHeader } from '@/components/features/actions/action-list/action-list-header';
import { ActionFilters } from '@/components/features/actions/action-list/action-filters';
import { ActionTable } from '@/components/features/actions/action-list/action-table';
import { ActionListSkeleton } from '@/components/features/actions/action-list/action-list-skeleton';

export default function ActionsPage() {
  return (
    <div className="space-y-6">
      <ActionListHeader />
      <ActionFilters />
      <Suspense fallback={<ActionListSkeleton />}>
        <ActionTable />
      </Suspense>
    </div>
  );
}
