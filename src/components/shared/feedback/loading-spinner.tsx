import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'
import Image from 'next/image'
import type React from 'react'

type LoadingSpinnerVariant = 'default' | 'muted'
type LoadingSpinnerIcon = 'loader' | 'logo'

export interface LoadingSpinnerProps
  extends Omit<React.ComponentPropsWithoutRef<typeof Loader2>, 'size'> {
  size?: 'sm' | 'md' | 'lg'
  icon?: LoadingSpinnerIcon
  variant?: LoadingSpinnerVariant
  logoSrc?: string
  logoPriority?: boolean
  label?: string
  className?: string
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
}

const logoSizeClasses = {
  sm: 'h-4 w-auto',
  md: 'h-8 w-auto',
  lg: 'h-12 w-auto',
}

const variantClasses: Record<LoadingSpinnerVariant, string> = {
  default: 'text-primary-base',
  muted: 'text-muted-foreground',
}

const logoVariantClasses: Record<LoadingSpinnerVariant, string> = {
  default: '',
  muted: 'opacity-70',
}

export function LoadingSpinner({
  size = 'md',
  icon = 'loader',
  variant = 'default',
  logoSrc = '/images/logo.png',
  logoPriority = false,
  label = 'Carregando...',
  className,
  ...props
}: LoadingSpinnerProps) {
  return (
    <span role="status" aria-live="polite" aria-label={label} className="inline-flex items-center">
      {icon === 'logo' ? (
        <Image
          src={logoSrc}
          alt=""
          aria-hidden="true"
          width={300}
          height={100}
          priority={logoPriority}
          className={cn(
            'animate-pulse object-contain motion-reduce:animate-none',
            logoVariantClasses[variant],
            logoSizeClasses[size],
            className
          )}
        />
      ) : (
        <Loader2
          aria-hidden="true"
          className={cn(
            'animate-spin motion-reduce:animate-none',
            variantClasses[variant],
            sizeClasses[size],
            className
          )}
          {...props}
        />
      )}
      <span className="sr-only">{label}</span>
    </span>
  )
}
