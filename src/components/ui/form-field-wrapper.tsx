import * as React from 'react'
import { Label } from './label'
import { FormError } from './form-error'
import { cn } from '@/lib/utils'

export interface FormFieldWrapperProps {
  label: string
  htmlFor: string
  error?: string
  children: React.ReactNode
  required?: boolean
  className?: string
  labelAction?: React.ReactNode
}

export function FormFieldWrapper({
  label,
  htmlFor,
  error,
  children,
  required = false,
  className,
  labelAction,
}: FormFieldWrapperProps) {
  return (
    <div className={cn('space-y-2.5', className)}>
      <div className="flex items-center justify-between">
        <Label htmlFor={htmlFor} className="text-sm font-semibold text-foreground">
          {label}
          {required && <span className="ml-1 text-destructive">*</span>}
        </Label>
        {labelAction}
      </div>
      {children}
      <FormError message={error} />
    </div>
  )
}
