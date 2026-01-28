import { useState } from 'react'
import { apiClient } from '@/lib/api/api-client'
import type {
  GenerateActionPlanRequest,
  GenerateActionPlanResponse,
  AILimitExceededError,
} from '@/lib/types/ai'

interface UseGenerateActionPlanResult {
  generatePlan: (request: GenerateActionPlanRequest) => Promise<GenerateActionPlanResponse>
  isGenerating: boolean
  error: Error | AILimitExceededError | null
  clearError: () => void
}

export function useGenerateActionPlan(): UseGenerateActionPlanResult {
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<Error | AILimitExceededError | null>(null)

  const generatePlan = async (
    request: GenerateActionPlanRequest
  ): Promise<GenerateActionPlanResponse> => {
    setIsGenerating(true)
    setError(null)

    try {
      const response = await apiClient.post<GenerateActionPlanResponse>(
        '/actions/generate',
        request
      )
      return response
    } catch (err: any) {
      // Trata erro 402 (limite excedido) de forma especial
      if (err.status === 402 && err.data) {
        const limitError: AILimitExceededError = err.data
        setError(limitError)
        throw limitError
      }

      // Outros erros
      const genericError = new Error(
        err.message || 'Erro ao gerar plano de ação com IA'
      )
      setError(genericError)
      throw genericError
    } finally {
      setIsGenerating(false)
    }
  }

  const clearError = () => setError(null)

  return {
    generatePlan,
    isGenerating,
    error,
    clearError,
  }
}
