'use client'

import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Step {
  id: number
  title: string
  description?: string
}

interface StepsProps {
  steps: Step[]
  currentStep: number
  className?: string
}

export function Steps({ steps, currentStep, className }: StepsProps) {
  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-start justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep
          const isCurrent = index === currentStep
          const isPending = index > currentStep

          return (
            <div key={step.id} className="flex flex-1 items-start">
              <div className="flex w-full flex-col items-center">
                <div
                  className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300 sm:h-12 sm:w-12',
                    isCompleted &&
                      'border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/20',
                    isCurrent &&
                      'border-primary bg-primary/10 text-primary shadow-md ring-2 ring-primary/20 sm:ring-4',
                    isPending && 'border-muted bg-background text-muted-foreground'
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5 sm:h-6 sm:w-6" />
                  ) : (
                    <span className="text-sm font-semibold sm:text-base">{step.id}</span>
                  )}
                </div>
                <div className="mt-2 w-full text-center sm:mt-3">
                  <p
                    className={cn(
                      'mx-auto max-w-[80px] text-xs font-semibold leading-tight transition-colors sm:max-w-[100px] sm:text-sm',
                      isCurrent && 'text-primary',
                      isCompleted && 'text-foreground',
                      isPending && 'text-muted-foreground'
                    )}
                  >
                    {step.title}
                  </p>
                  {step.description && (
                    <p
                      className={cn(
                        'mx-auto mt-1 hidden max-w-[80px] text-[10px] leading-tight transition-colors sm:max-w-[100px] sm:block sm:text-xs',
                        isCurrent && 'text-muted-foreground',
                        isCompleted && 'text-muted-foreground',
                        isPending && 'text-muted-foreground/60'
                      )}
                    >
                      {step.description}
                    </p>
                  )}
                </div>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'mx-2 mt-5 h-0.5 flex-1 transition-all duration-300 sm:mx-3 sm:mt-6',
                    isCompleted ? 'bg-primary' : 'bg-muted'
                  )}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

