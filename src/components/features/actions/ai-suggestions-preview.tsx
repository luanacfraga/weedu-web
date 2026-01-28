'use client'

import type { ActionSuggestion, UsageStats } from '@/lib/types/ai'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Calendar, Clock } from 'lucide-react'
import { AIUsageStats } from './ai-usage-stats'

interface AISuggestionsPreviewProps {
  suggestions: ActionSuggestion[]
  usage: UsageStats | null
  onEdit: () => void
}

const priorityColors = {
  LOW: 'bg-gray-100 text-gray-800',
  MEDIUM: 'bg-blue-100 text-blue-800',
  HIGH: 'bg-orange-100 text-orange-800',
  URGENT: 'bg-red-100 text-red-800',
}

const priorityLabels = {
  LOW: 'Baixa',
  MEDIUM: 'Média',
  HIGH: 'Alta',
  URGENT: 'Urgente',
}

export function AISuggestionsPreview({
  suggestions,
  usage,
  onEdit,
}: AISuggestionsPreviewProps) {
  return (
    <div className="space-y-4 py-4">
      {/* Estatísticas de uso */}
      {usage && <AIUsageStats usage={usage} />}

      {/* Título */}
      <div>
        <h3 className="text-lg font-semibold">Sugestões Geradas</h3>
        <p className="text-sm text-muted-foreground">
          Revise as sugestões abaixo. Você poderá editá-las após criar.
        </p>
      </div>

      {/* Lista de sugestões */}
      <div className="space-y-4">
        {suggestions.map((suggestion, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <CardTitle className="text-base">{suggestion.title}</CardTitle>
                  <CardDescription className="mt-1 text-sm">
                    {suggestion.rootCause}
                  </CardDescription>
                </div>
                <Badge className={priorityColors[suggestion.priority]}>
                  {priorityLabels[suggestion.priority]}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Descrição */}
              <p className="text-sm text-muted-foreground">{suggestion.description}</p>

              {/* Datas */}
              <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Início em {suggestion.estimatedStartDays === 0 ? 'hoje' : `${suggestion.estimatedStartDays} dias`}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Duração: {suggestion.estimatedDurationDays} dias</span>
                </div>
              </div>

              {/* Checklist */}
              <div>
                <h4 className="text-sm font-medium mb-2">Checklist ({suggestion.checklistItems.length} itens)</h4>
                <ul className="space-y-1.5">
                  {suggestion.checklistItems.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
