import { Input, InputProps } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface InputWithIconProps extends InputProps {
  icon: LucideIcon
  iconClassName?: string
}

export function InputWithIcon({
  icon: Icon,
  iconClassName,
  className,
  ...props
}: InputWithIconProps) {
  return (
    <div className="relative">
      <Icon
        className={cn(
          'absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground',
          iconClassName
        )}
      />
      <Input className={cn('h-11 pl-10', className)} {...props} />
    </div>
  )
}
