import * as React from 'react'
import { cn } from '@/lib/utils'

export interface FormErrorProps extends React.HTMLAttributes<HTMLParagraphElement> {
  message?: string
}

const FormError = React.forwardRef<HTMLParagraphElement, FormErrorProps>(
  ({ className, message, ...props }, ref) => {
    if (!message) return null

    return (
      <p
        ref={ref}
        className={cn('text-sm font-medium text-destructive', className)}
        {...props}
      >
        {message}
      </p>
    )
  }
)

FormError.displayName = 'FormError'

export { FormError }
