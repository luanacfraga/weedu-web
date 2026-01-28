'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import { Button, type ButtonProps } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type CommonProps = {
  label?: string
  className?: string
  iconClassName?: string
  intent?: 'header' | 'inline'
}

type HeaderBackButtonProps =
  | (CommonProps & {
      href: string
      onClick?: never
      variant?: ButtonProps['variant']
      size?: ButtonProps['size']
    })
  | (CommonProps & {
      href?: never
      onClick: () => void
      variant?: ButtonProps['variant']
      size?: ButtonProps['size']
    })

export function HeaderBackButton({
  label = 'Voltar',
  className,
  iconClassName,
  intent = 'header',
  variant = 'ghost',
  size = 'sm',
  ...props
}: HeaderBackButtonProps) {
  const base = cn(
    'gap-2 font-medium',
    intent === 'header' && '-ml-2 text-muted-foreground hover:text-foreground',
    intent === 'header' && 'hover:bg-accent/40 focus-visible:ring-ring/40',
    className
  )

  if ('href' in props && props.href) {
    return (
      <Button variant={variant} size={size} asChild className={base}>
        <Link href={props.href} aria-label={label} title={label}>
          <ArrowLeft className={cn('h-4 w-4', iconClassName)} />
          <span>{label}</span>
        </Link>
      </Button>
    )
  }

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={props.onClick}
      aria-label={label}
      title={label}
      className={base}
    >
      <ArrowLeft className={cn('h-4 w-4', iconClassName)} />
      <span>{label}</span>
    </Button>
  )
}


