'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ActionForm } from '@/components/features/actions/action-form/action-form';
import { useAction } from '@/lib/hooks/use-actions';
import { PageContainer } from '@/components/shared/layout/page-container';
import { PageHeader } from '@/components/shared/layout/page-header';

interface EditActionPageProps {
  params: {
    actionId: string;
  };
}

export default function EditActionPage({ params }: EditActionPageProps) {
  const { data: action, isLoading, error } = useAction(params.actionId);

  if (isLoading) {
    return (
      <PageContainer>
        <div className="space-y-6">
          <Skeleton className="h-8 w-[200px]" />
          <Skeleton className="h-[600px]" />
        </div>
      </PageContainer>
    );
  }

  if (error || !action) {
    return (
      <PageContainer>
        <div className="py-12 text-center">
          <p className="mb-4 text-destructive">Falha ao carregar ação.</p>
          <Button asChild variant="outline">
            <Link href="/actions">Voltar para Ações</Link>
          </Button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Editar Ação"
        description={action.title}
        backHref="/actions"
      />

      {/* Form */}
      <div className="rounded-lg border bg-card p-6">
        <ActionForm mode="edit" action={action} readOnly={action.isBlocked} />
      </div>
    </PageContainer>
  );
}
