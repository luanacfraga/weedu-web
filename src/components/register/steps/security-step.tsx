'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { type RegisterFormData } from '@/lib/validators/auth'
import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { FieldErrors, UseFormRegister } from 'react-hook-form'

interface SecurityStepProps {
  register: UseFormRegister<RegisterFormData>
  errors: FieldErrors<RegisterFormData>
}

export function SecurityStep({ register, errors }: SecurityStepProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  return (
    <div className="space-y-6">
      <div className="space-y-2.5">
        <Label htmlFor="password" className="text-sm font-semibold text-foreground">
          Senha *
        </Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            {...register('password')}
            className={`h-12 pr-12 text-base transition-all ${
              errors.password
                ? 'border-destructive focus-visible:ring-destructive'
                : 'border-input focus-visible:border-primary focus-visible:ring-primary/20'
            }`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-muted-foreground transition-all hover:bg-muted hover:text-foreground active:scale-95"
            aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
        {errors.password && (
          <p className="text-sm font-medium text-destructive">{errors.password.message}</p>
        )}
      </div>

      <div className="space-y-2.5">
        <Label htmlFor="confirmPassword" className="text-sm font-semibold text-foreground">
          Confirmar Senha *
        </Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="••••••••"
            {...register('confirmPassword')}
            className={`h-12 pr-12 text-base transition-all ${
              errors.confirmPassword
                ? 'border-destructive focus-visible:ring-destructive'
                : 'border-input focus-visible:border-primary focus-visible:ring-primary/20'
            }`}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-muted-foreground transition-all hover:bg-muted hover:text-foreground active:scale-95"
            aria-label={showConfirmPassword ? 'Ocultar senha' : 'Mostrar senha'}
          >
            {showConfirmPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="text-sm font-medium text-destructive">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>
    </div>
  )
}

