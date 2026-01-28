'use client'

import { useQuery } from '@tanstack/react-query'

import { MasterOnly } from '@/components/features/auth/guards/master-only'
import { PageContainer } from '@/components/shared/layout/page-container'
import { PageHeader } from '@/components/shared/layout/page-header'
import { ResponsiveDataTable } from '@/components/shared/table/responsive-data-table'
import { Button } from '@/components/ui/button'

import { usersApi, type User } from '@/lib/api/endpoints/users'
import Link from 'next/link'

export default function MastersListPage() {
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['masters'],
    queryFn: async () => {
      const response = await usersApi.getAll({ page: 1, limit: 50, role: 'master' })
      return response.data.map((user) => ({
        ...user,
        name: `${user.firstName} ${user.lastName}`,
      }))
    },
    staleTime: 1000 * 60,
  })

  const masters = data ?? []

  return (
    <MasterOnly>
      <PageContainer maxWidth="lg">
        <PageHeader
          title="Usuários Master"
          description="Veja quem já é Master na plataforma."
          action={
            <Button asChild size="sm" className="font-medium">
              <Link href="/masters/new">Novo usuário Master</Link>
            </Button>
          }
        />

        <div className="mt-6 rounded-2xl border border-border/60 bg-card/95 p-4 shadow-sm">
          <ResponsiveDataTable<User>
            data={masters}
            columns={[
              {
                accessorKey: 'firstName',
                header: 'Nome',
              },
              {
                accessorKey: 'email',
                header: 'Email',
              },
              {
                accessorKey: 'role',
                header: 'Papel',
                cell: () => 'Master',
              },
            ]}
            CardComponent={({ item }) => (
              <div className="space-y-1">
                <div className="text-sm font-medium">{item.firstName}</div>
                <div className="text-xs text-muted-foreground">{item.email}</div>
                <div className="text-[11px] text-muted-foreground/80">Papel: Master</div>
              </div>
            )}
            emptyMessage="Nenhum usuário master cadastrado ainda."
            isLoading={isLoading || isFetching}
          />
        </div>
      </PageContainer>
    </MasterOnly>
  )
}
