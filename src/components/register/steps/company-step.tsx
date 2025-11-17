'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { type RegisterFormData } from '@/lib/validators/auth'
import { FieldErrors, UseFormRegister } from 'react-hook-form'

interface CompanyStepProps {
  register: UseFormRegister<RegisterFormData>
  errors: FieldErrors<RegisterFormData>
}

export function CompanyStep({ register, errors }: CompanyStepProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2.5">
        <Label htmlFor="companyName" className="text-sm font-semibold text-foreground">
          Nome da Empresa *
        </Label>
        <Input
          id="companyName"
          type="text"
          placeholder="Weedu Tecnologia"
          {...register('companyName')}
          className={`h-12 text-base transition-all ${
            errors.companyName
              ? 'border-destructive focus-visible:ring-destructive'
              : 'border-input focus-visible:border-primary focus-visible:ring-primary/20'
          }`}
        />
        {errors.companyName && (
          <p className="text-sm font-medium text-destructive">{errors.companyName.message}</p>
        )}
      </div>

      <div className="space-y-2.5">
        <Label htmlFor="companyDescription" className="text-sm font-semibold text-foreground">
          Descrição da Empresa *
        </Label>
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
        {errors.companyDescription && (
          <p className="text-sm font-medium text-destructive">
            {errors.companyDescription.message}
          </p>
        )}
        <p className="text-xs text-muted-foreground">Mínimo de 10 caracteres</p>
      </div>
    </div>
  )
}

