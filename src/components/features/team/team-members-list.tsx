'use client'

import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/shared/feedback/empty-state'
import { Loader2, Trash2, Users } from 'lucide-react'
import { ApiError } from '@/lib/api/api-client'
import { toast } from 'sonner'

export interface TeamMember {
  id: string
  userId: string
  displayName: string
  email: string
  position?: string | null
}

interface TeamMembersListProps {
  members: TeamMember[]
  isLoading: boolean
  onRemove: (memberId: string) => Promise<void>
  isRemoving: boolean
}

export function TeamMembersList({
  members,
  isLoading,
  onRemove,
  isRemoving,
}: TeamMembersListProps) {
  const handleRemove = async (memberId: string) => {
    try {
      await onRemove(memberId)
      toast.success('Membro removido com sucesso!')
    } catch (err) {
      const message =
        err instanceof ApiError && (err.data as any)?.message
          ? (err.data as any).message
          : 'Erro ao remover membro. Tente novamente.'
      toast.error(message)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (members.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="Nenhum membro adicionado"
        description="Adicione executores para começar a trabalhar com esta equipe."
        className="border border-dashed py-8"
      />
    )
  }

  return (
    <div className="divide-y rounded-lg border">
      {members.map((member) => (
        <div
          key={member.id}
          className="flex items-center justify-between p-4 transition-colors hover:bg-muted/50"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium leading-none">{member.displayName}</p>
              <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                <span>{member.email}</span>
                {member.position && (
                  <>
                    <span className="h-1 w-1 rounded-full bg-muted-foreground/30" />
                    <span>{member.position}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleRemove(member.id)}
            disabled={isRemoving}
            className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            title="Remover membro"
          >
            {isRemoving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      ))}
    </div>
  )
}

