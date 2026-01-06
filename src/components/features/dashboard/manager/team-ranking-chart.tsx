'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts'
import { Trophy } from 'lucide-react'
import type { TeamMemberMetrics } from '@/lib/types/dashboard'

interface TeamRankingChartProps {
  members: TeamMemberMetrics[]
  maxDisplay?: number
}

export function TeamRankingChart({ members, maxDisplay = 5 }: TeamRankingChartProps) {
  // Ordenar por total de entregas (maior para menor)
  const sortedMembers = [...members]
    .sort((a, b) => b.totalDeliveries - a.totalDeliveries)
    .slice(0, maxDisplay)

  // Cores baseadas na posição
  const getBarColor = (index: number) => {
    if (index === 0) return 'hsl(var(--primary))' // #1: primary (roxo)
    if (index <= 2) return 'hsl(var(--info))' // #2-3: info (azul)
    return 'hsl(var(--muted))' // Demais: muted (cinza)
  }

  // Se não tem membros ou entregas
  if (sortedMembers.length === 0 || sortedMembers.every(m => m.totalDeliveries === 0)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ranking da Equipe</CardTitle>
          <CardDescription>Top {maxDisplay} performers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] items-center justify-center">
            <p className="text-sm text-muted-foreground">
              Sem entregas neste período
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ranking da Equipe</CardTitle>
        <CardDescription>Top {maxDisplay} performers</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={sortedMembers} layout="vertical" margin={{ left: 0, right: 20 }}>
            <XAxis type="number" />
            <YAxis
              dataKey="name"
              type="category"
              width={120}
              tick={{ fontSize: 12 }}
            />
            <Bar dataKey="totalDeliveries" radius={[0, 4, 4, 0]}>
              {sortedMembers.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(index)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Badge para #1 */}
        {sortedMembers[0] && sortedMembers[0].totalDeliveries > 0 && (
          <div className="mt-4 flex items-center gap-2 text-sm">
            <Trophy className="h-4 w-4 text-yellow-500" />
            <span className="font-medium">{sortedMembers[0].name}</span>
            <span className="text-muted-foreground">lidera com {sortedMembers[0].totalDeliveries} entregas</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
