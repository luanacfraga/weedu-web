import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-gradient-to-r from-primary via-primary/95 to-primary/90 text-primary-foreground shadow-sm hover:shadow-md hover:from-primary/95 hover:via-primary/90 hover:to-primary/85 active:scale-[0.97]',
        destructive:
          'bg-gradient-to-r from-destructive via-destructive/95 to-destructive/90 text-destructive-foreground shadow-sm hover:shadow-md hover:from-destructive/95 hover:via-destructive/90 hover:to-destructive/85 active:scale-[0.97]',
        success:
          'bg-gradient-to-r from-success via-success/95 to-success/90 text-success-foreground shadow-sm hover:shadow-md hover:from-success/95 hover:via-success/90 hover:to-success/85 active:scale-[0.97]',
        warning:
          'bg-gradient-to-r from-warning via-warning/95 to-warning/90 text-warning-foreground shadow-sm hover:shadow-md hover:from-warning/95 hover:via-warning/90 hover:to-warning/85 active:scale-[0.97]',
        outline:
          'border border-input/60 bg-background/50 backdrop-blur-sm hover:bg-accent/60 hover:border-input hover:text-accent-foreground hover:shadow-sm active:scale-[0.97]',
        secondary:
          'bg-gradient-to-r from-secondary to-secondary/90 text-secondary-foreground shadow-sm hover:shadow-md hover:from-secondary/95 hover:to-secondary/80 active:scale-[0.97]',
        ghost: 'hover:bg-accent/60 hover:text-accent-foreground active:scale-[0.97]',
        link: 'text-primary underline-offset-4 hover:underline hover:text-primary/80',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
