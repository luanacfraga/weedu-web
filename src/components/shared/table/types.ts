import { ColumnDef } from '@tanstack/react-table'
import { LucideIcon } from 'lucide-react'

export interface PaginationConfig {
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
}

export interface ResponsiveDataTableProps<T> {
  data: T[]
  columns: ColumnDef<T>[]
  CardComponent: React.ComponentType<{ item: T }>
  emptyMessage?: string
  isLoading?: boolean
  pagination?: PaginationConfig
  filters?: React.ReactNode
  manualPagination?: boolean
  manualSorting?: boolean
}

export type FilterType = 'search' | 'select' | 'toggle' | 'date-range'

export interface FilterOption {
  value: string
  label: string
  icon?: LucideIcon
}

export interface FilterConfig {
  type: FilterType
  key: string
  label: string
  icon?: LucideIcon
  options?: FilterOption[]
  placeholder?: string
}

export interface StandardFiltersProps {
  config: FilterConfig[]
  values: Record<string, any>
  onChange: (values: Record<string, any>) => void
  onClear?: () => void
}
