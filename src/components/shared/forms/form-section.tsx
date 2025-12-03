import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'
import { ReactNode } from 'react'

interface FormSectionProps {
  title: string
  description?: string
  icon?: LucideIcon
  iconColor?: string
  bgColor?: string
  children: ReactNode
  className?: string
}

export function FormSection({
  title,
  description,
  icon: Icon,
  iconColor = 'text-primary-base',
  bgColor = 'bg-primary-lightest',
  children,
  className,
}: FormSectionProps) {
  return (
    <Card className={cn('border border-border', className)}>
      <CardHeader>
        <div className="flex items-center gap-2">
          {Icon && (
            <div className={cn('rounded-lg p-2', bgColor)}>
              <Icon className={cn('h-5 w-5', iconColor)} />
            </div>
          )}
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            {description && <CardDescription className="mt-1">{description}</CardDescription>}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  )
}
