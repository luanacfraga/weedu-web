'use client'

import { ActionChecklist } from '@/components/features/actions/action-form/action-checklist'
import { ActionForm } from '@/components/features/actions/action-form/action-form'
import { PageContainer } from '@/components/shared/layout/page-container'
import { PageHeader } from '@/components/shared/layout/page-header'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { useAction } from '@/lib/hooks/use-actions'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface EditActionPageProps {
  params: {
    actionId: string
  }
}

export default function EditActionPage({ params }: EditActionPageProps) {
  const router = useRouter()
  const { data: action, isLoading, error } = useAction(params.actionId)

  if (isLoading) {
    return (
      <PageContainer>
        <div className="space-y-6">
          <Skeleton className="h-8 w-[200px]" />
          <Skeleton className="h-[600px]" />
        </div>
      </PageContainer>
    )
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
    )
  }

  const readOnly = action.isBlocked || false

  return (
    <PageContainer maxWidth="4xl">
      <PageHeader title="Editar Ação" description={action.title} backHref="/actions" />

      <div className="space-y-8 rounded-lg border bg-card p-6">
        <ActionForm
          mode="edit"
          action={action}
          readOnly={readOnly}
          onCancel={() => router.push('/actions')}
          onSuccess={() => router.push('/actions')}
        />

        <Separator />

        <ActionChecklist action={action} readOnly={readOnly} />
      </div>
    </PageContainer>
  )
}
