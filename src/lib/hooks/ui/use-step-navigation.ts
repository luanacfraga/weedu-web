import { useState, useCallback } from 'react'

interface UseStepNavigationOptions {
  totalSteps: number
  initialStep?: number
  onStepChange?: (step: number) => void
}

interface UseStepNavigationResult {
  currentStep: number
  isFirstStep: boolean
  isLastStep: boolean
  goToNext: () => void
  goToPrevious: () => void
  goToStep: (step: number) => void
}

/**
 * Hook para gerenciar navegação entre steps
 * Responsabilidade única: Controlar estado e navegação de steps
 *
 * Aplica SRP: Separa lógica de navegação de steps
 */
export function useStepNavigation({
  totalSteps,
  initialStep = 0,
  onStepChange,
}: UseStepNavigationOptions): UseStepNavigationResult {
  const [currentStep, setCurrentStep] = useState(initialStep)

  const goToStep = useCallback(
    (step: number) => {
      if (step >= 0 && step < totalSteps) {
        setCurrentStep(step)
        onStepChange?.(step)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    },
    [totalSteps, onStepChange]
  )

  const goToNext = useCallback(() => {
    if (currentStep < totalSteps - 1) {
      goToStep(currentStep + 1)
    }
  }, [currentStep, totalSteps, goToStep])

  const goToPrevious = useCallback(() => {
    if (currentStep > 0) {
      goToStep(currentStep - 1)
    }
  }, [currentStep, goToStep])

  return {
    currentStep,
    isFirstStep: currentStep === 0,
    isLastStep: currentStep === totalSteps - 1,
    goToNext,
    goToPrevious,
    goToStep,
  }
}
