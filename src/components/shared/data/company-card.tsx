import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { Building2, CheckCircle, Settings } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface CompanyCardProps {
  id: string
  name: string
  description?: string
  isSelected?: boolean
  onSelect?: () => void
  onEdit?: () => void
  className?: string
}

export function CompanyCard({
  id,
  name,
  description,
  isSelected = false,
  onSelect,
  onEdit,
  className,
}: CompanyCardProps) {
  const router = useRouter()

  const handleEdit = () => {
    if (onEdit) {
      onEdit()
    } else {
      router.push(`/companies/${id}/edit`)
    }
  }

  return (
    <Card
      className={cn(
        'group relative transition-all hover:shadow-lg',
        isSelected && 'ring-2 ring-primary',
        className
      )}
      onClick={onSelect}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="flex-shrink-0 rounded-lg bg-primary-lightest p-2.5">
              <Building2 className="h-5 w-5 text-primary-base" />
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="truncate text-base">{name}</CardTitle>
              {isSelected && (
                <div className="mt-1 flex items-center gap-1 text-xs text-primary-base">
                  <CheckCircle className="h-3 w-3 flex-shrink-0" />
                  <span className="font-medium">Ativa</span>
                </div>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 flex-shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
            onClick={(e) => {
              e.stopPropagation()
              handleEdit()
            }}
            aria-label="Editar empresa"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-xs">ID: {id.slice(0, 8)}...</CardDescription>
        {description && (
          <p className="mt-3 line-clamp-2 text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  )
}
