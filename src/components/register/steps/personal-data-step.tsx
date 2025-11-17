'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { maskPhone, unmaskPhone } from '@/lib/utils/masks'
import { type RegisterFormData } from '@/lib/validators/auth'
import { FieldErrors, UseFormRegister, UseFormSetValue } from 'react-hook-form'

interface PersonalDataStepProps {
  register: UseFormRegister<RegisterFormData>
  errors: FieldErrors<RegisterFormData>
  setValue: UseFormSetValue<RegisterFormData>
  phoneValue: string
  setPhoneValue: (value: string) => void
}

export function PersonalDataStep({
  register,
  errors,
  setValue,
  phoneValue,
  setPhoneValue,
}: PersonalDataStepProps) {
  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="space-y-2.5">
          <Label htmlFor="firstName" className="text-sm font-semibold text-foreground">
            Nome *
          </Label>
          <Input
            id="firstName"
            type="text"
            placeholder="João"
            {...register('firstName')}
            className={`h-12 text-base transition-all ${
              errors.firstName
                ? 'border-destructive focus-visible:ring-destructive'
                : 'border-input focus-visible:border-primary focus-visible:ring-primary/20'
            }`}
          />
          {errors.firstName && (
            <p className="text-sm font-medium text-destructive">{errors.firstName.message}</p>
          )}
        </div>

        <div className="space-y-2.5">
          <Label htmlFor="lastName" className="text-sm font-semibold text-foreground">
            Sobrenome *
          </Label>
          <Input
            id="lastName"
            type="text"
            placeholder="Silva"
            {...register('lastName')}
            className={`h-12 text-base transition-all ${
              errors.lastName
                ? 'border-destructive focus-visible:ring-destructive'
                : 'border-input focus-visible:border-primary focus-visible:ring-primary/20'
            }`}
          />
          {errors.lastName && (
            <p className="text-sm font-medium text-destructive">{errors.lastName.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2.5">
        <Label htmlFor="email" className="text-sm font-semibold text-foreground">
          Email *
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="seu@email.com"
          {...register('email')}
          className={`h-12 text-base transition-all ${
            errors.email
              ? 'border-destructive focus-visible:ring-destructive'
              : 'border-input focus-visible:border-primary focus-visible:ring-primary/20'
          }`}
        />
        {errors.email && (
          <p className="text-sm font-medium text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2.5">
        <Label htmlFor="phone" className="text-sm font-semibold text-foreground">
          Telefone *
        </Label>
        <Input
          id="phone"
          type="tel"
          placeholder="(11) 98765-4321"
          value={phoneValue}
          onChange={(e) => {
            const unmasked = unmaskPhone(e.target.value)
            const masked = maskPhone(unmasked)
            setPhoneValue(masked)
            setValue('phone', unmasked, { shouldValidate: true })
          }}
          onBlur={register('phone').onBlur}
          className={`h-12 text-base transition-all ${
            errors.phone
              ? 'border-destructive focus-visible:ring-destructive'
              : 'border-input focus-visible:border-primary focus-visible:ring-primary/20'
          }`}
        />
        {errors.phone && (
          <p className="text-sm font-medium text-destructive">{errors.phone.message}</p>
        )}
      </div>
    </div>
  )
}

