'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ActionForm } from '@/components/features/actions/action-form/action-form';
import { useAction } from '@/lib/hooks/use-actions';

interface EditActionPageProps {
  params: {
    actionId: string;
  };
}

export default function EditActionPage({ params }: EditActionPageProps) {
  const { data: action, isLoading, error } = useAction(params.actionId);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-[200px]" />
        <Skeleton className="h-[600px]" />
      </div>
    );
  }

  if (error || !action) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive mb-4">Falha ao carregar ação.</p>
        <Button asChild variant="outline">
          <Link href="/actions">Voltar para Ações</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button variant="ghost" asChild className="mb-2">
            <Link href="/actions">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para Ações
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Editar Ação</h1>
          <p className="text-muted-foreground">{action.title}</p>
        </div>
      </div>

      {/* Form */}
      <div className="rounded-lg border bg-card p-6">
        <ActionForm mode="edit" action={action} />
      </div>
    </div>
  );
}
