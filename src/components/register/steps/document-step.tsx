'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { maskCNPJ, unmaskCNPJ } from '@/lib/utils/masks'
import { type RegisterFormData } from '@/lib/validators/auth'
import { FieldErrors, UseFormRegister, UseFormSetValue } from 'react-hook-form'

interface DocumentStepProps {
  register: UseFormRegister<RegisterFormData>
  errors: FieldErrors<RegisterFormData>
  setValue: UseFormSetValue<RegisterFormData>
  cnpjValue: string
  setCnpjValue: (value: string) => void
}

export function DocumentStep({
  register,
  errors,
  setValue,
  cnpjValue,
  setCnpjValue,
}: DocumentStepProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2.5">
        <Label htmlFor="document" className="text-sm font-semibold text-foreground">
          CNPJ da Empresa *
        </Label>
        <Input
          id="document"
          type="text"
          placeholder="00.000.000/0001-00"
          maxLength={18}
          value={cnpjValue}
          onChange={(e) => {
            const unmasked = unmaskCNPJ(e.target.value)
            const masked = maskCNPJ(unmasked)
            setCnpjValue(masked)
            setValue('document', unmasked, { shouldValidate: true })
          }}
          onBlur={register('document').onBlur}
          className={`h-12 text-base transition-all ${
            errors.document
              ? 'border-destructive focus-visible:ring-destructive'
              : 'border-input focus-visible:border-primary focus-visible:ring-primary/20'
          }`}
        />
        {errors.document && (
          <p className="text-sm font-medium text-destructive">{errors.document.message}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Digite o CNPJ completo da sua empresa (14 dígitos)
        </p>
      </div>
    </div>
  )
}

