'use client'

import { FormFieldWrapper } from '@/components/ui/form-field-wrapper'
import { Input } from '@/components/ui/input'
import { type RegisterFormData } from '@/lib/validators/auth'
import { FieldErrors, UseFormRegister } from 'react-hook-form'

interface CompanyStepProps {
  register: UseFormRegister<RegisterFormData>
  errors: FieldErrors<RegisterFormData>
}

export function CompanyStep({ register, errors }: CompanyStepProps) {
  return (
    <div className="space-y-6">
      <FormFieldWrapper
        label="Nome da Empresa"
        htmlFor="companyName"
        error={errors.companyName?.message}
        required
      >
        <Input
          id="companyName"
          type="text"
          placeholder="ToolDo Tecnologia"
          {...register('companyName')}
          className={`h-12 text-base transition-all ${
            errors.companyName
              ? 'border-destructive focus-visible:ring-destructive'
              : 'border-input focus-visible:border-primary focus-visible:ring-primary/20'
          }`}
        />
      </FormFieldWrapper>

      <FormFieldWrapper
        label="Descrição da Empresa"
        htmlFor="companyDescription"
        error={errors.companyDescription?.message}
        required
      >
        <textarea
          id="companyDescription"
          rows={4}
          placeholder="Descreva brevemente o ramo de atividade da sua empresa..."
          {...register('companyDescription')}
          className={`flex w-full resize-none rounded-md border bg-background px-3 py-2.5 text-base transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
            errors.companyDescription
              ? 'border-destructive focus-visible:ring-destructive'
              : 'border-input focus-visible:border-primary focus-visible:ring-primary/20'
          }`}
        />
        <p className="mt-1 text-xs text-muted-foreground">Mínimo de 10 caracteres</p>
      </FormFieldWrapper>
    </div>
  )
}
