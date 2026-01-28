'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Sparkles, Loader2, AlertCircle } from 'lucide-react'
import { useGenerateActionPlan } from '@/lib/hooks/use-generate-action-plan'
import type { ActionSuggestion, UsageStats, AILimitExceededError } from '@/lib/types/ai'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AISuggestionsPreview } from './ai-suggestions-preview'
import { AIUsageStats } from './ai-usage-stats'

interface AIGenerateDialogProps {
  companyId: string
  teamId?: string
  onCreateActions: (suggestions: ActionSuggestion[]) => Promise<void>
}

export function AIGenerateDialog({
  companyId,
  teamId,
  onCreateActions,
}: AIGenerateDialogProps) {
  const [open, setOpen] = useState(false)
  const [goal, setGoal] = useState('')
  const [suggestions, setSuggestions] = useState<ActionSuggestion[]>([])
  const [usage, setUsage] = useState<UsageStats | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  const { generatePlan, isGenerating, error, clearError } = useGenerateActionPlan()

  const handleGenerate = async () => {
    if (!goal.trim()) return

    try {
      const response = await generatePlan({
        companyId,
        teamId,
        goal: goal.trim(),
      })

      setSuggestions(response.suggestions)
      setUsage(response.usage)
      setShowPreview(true)
    } catch (err) {
      // Erro já tratado pelo hook
      console.error('Erro ao gerar plano:', err)
    }
  }

  const handleCreateActions = async () => {
    try {
      await onCreateActions(suggestions)
      // Limpa e fecha
      setOpen(false)
      setGoal('')
      setSuggestions([])
      setUsage(null)
      setShowPreview(false)
      clearError()
    } catch (err) {
      console.error('Erro ao criar ações:', err)
    }
  }

  const handleClose = () => {
    setOpen(false)
    setGoal('')
    setSuggestions([])
    setUsage(null)
    setShowPreview(false)
    clearError()
  }

  const isLimitExceeded = error && 'statusCode' in error && error.statusCode === 402

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Sparkles className="h-4 w-4" />
          Gerar com IA
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Gerar Plano de Ação com IA
          </DialogTitle>
          <DialogDescription>
            Descreva seu objetivo e a IA gerará sugestões de ações personalizadas
          </DialogDescription>
        </DialogHeader>

        {!showPreview ? (
          <div className="space-y-4 py-4">
            {/* Estatísticas de uso */}
            {usage && <AIUsageStats usage={usage} />}

            {/* Formulário */}
            <div className="space-y-2">
              <Label htmlFor="goal">Qual é o seu objetivo?</Label>
              <Textarea
                id="goal"
                placeholder="Ex: Aumentar as vendas do time em 20% nos próximos 3 meses"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                rows={4}
                disabled={isGenerating}
              />
              <p className="text-sm text-muted-foreground">
                Seja específico sobre o que deseja alcançar
              </p>
            </div>

            {/* Erro: Limite Excedido */}
            {isLimitExceeded && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Limite de IA Excedido</AlertTitle>
                <AlertDescription>
                  {(error as AILimitExceededError).message}
                  <br />
                  <span className="text-sm">
                    Usado: {(error as AILimitExceededError).metadata.used}/
                    {(error as AILimitExceededError).metadata.limit}
                  </span>
                  {(error as AILimitExceededError).metadata.planName && (
                    <span className="text-sm">
                      {' '}
                      - Plano: {(error as AILimitExceededError).metadata.planName}
                    </span>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {/* Erro genérico */}
            {error && !isLimitExceeded && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Erro</AlertTitle>
                <AlertDescription>{error.message}</AlertDescription>
              </Alert>
            )}
          </div>
        ) : (
          <AISuggestionsPreview
            suggestions={suggestions}
            usage={usage}
            onEdit={() => setShowPreview(false)}
          />
        )}

        <DialogFooter>
          {!showPreview ? (
            <>
              <Button variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button onClick={handleGenerate} disabled={!goal.trim() || isGenerating}>
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Gerar Sugestões
                  </>
                )}
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setShowPreview(false)}>
                Voltar
              </Button>
              <Button onClick={handleCreateActions}>Criar Ações</Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
