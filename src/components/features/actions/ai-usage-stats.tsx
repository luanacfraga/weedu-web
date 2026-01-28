'use client'

import type { UsageStats } from '@/lib/types/ai'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Sparkles } from 'lucide-react'

interface AIUsageStatsProps {
  usage: UsageStats
}

export function AIUsageStats({ usage }: AIUsageStatsProps) {
  const percentage = (usage.used / usage.limit) * 100
  const isNearLimit = percentage >= 80
  const isAtLimit = usage.remaining === 0

  return (
    <Card className={isAtLimit ? 'border-red-200 bg-red-50' : ''}>
      <CardContent className="pt-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium">Uso de IA este mês</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {usage.used} de {usage.limit} chamadas
            </span>
          </div>
          <Progress
            value={percentage}
            className={isNearLimit ? 'bg-orange-100' : ''}
            indicatorClassName={
              isAtLimit
                ? 'bg-red-500'
                : isNearLimit
                  ? 'bg-orange-500'
                  : 'bg-purple-500'
            }
          />
          <p className="text-xs text-muted-foreground">
            {isAtLimit ? (
              <span className="text-red-600 font-medium">
                Limite atingido. Faça upgrade do seu plano para continuar usando IA.
              </span>
            ) : isNearLimit ? (
              <span className="text-orange-600">
                Você está próximo do limite. {usage.remaining} chamadas restantes.
              </span>
            ) : (
              <span>
                {usage.remaining} chamadas restantes para este mês.
              </span>
            )}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
