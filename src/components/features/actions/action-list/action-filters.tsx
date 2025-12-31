'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useActionFiltersStore } from '@/lib/stores/action-filters-store'
import { ActionPriority, ActionStatus } from '@/lib/types/action'
import { LayoutGrid, LayoutList, Plus, Search, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function ActionFilters() {
  const filters = useActionFiltersStore()
  const router = useRouter()

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-card p-2">
      {/* Search */}
      <div className="min-w-[160px] flex-1">
        <div className="relative">
          <Search className="absolute left-2 top-2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Buscar ações..."
            value={filters.searchQuery}
            onChange={(e) => filters.setFilter('searchQuery', e.target.value)}
            className="h-8 pl-7 text-sm"
          />
        </div>
      </div>

      {/* Status Filter */}
      <Select
        value={filters.status}
        onValueChange={(value) => filters.setFilter('status', value as ActionStatus | 'all')}
      >
        <SelectTrigger className="h-8 w-[120px] text-sm">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value={ActionStatus.TODO}>Pendente</SelectItem>
          <SelectItem value={ActionStatus.IN_PROGRESS}>Em Andamento</SelectItem>
          <SelectItem value={ActionStatus.DONE}>Concluído</SelectItem>
        </SelectContent>
      </Select>

      {/* Priority Filter */}
      <Select
        value={filters.priority}
        onValueChange={(value) => filters.setFilter('priority', value as ActionPriority | 'all')}
      >
        <SelectTrigger className="h-8 w-[120px] text-sm">
          <SelectValue placeholder="Prioridade" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas</SelectItem>
          <SelectItem value={ActionPriority.LOW}>Baixa</SelectItem>
          <SelectItem value={ActionPriority.MEDIUM}>Média</SelectItem>
          <SelectItem value={ActionPriority.HIGH}>Alta</SelectItem>
          <SelectItem value={ActionPriority.URGENT}>Urgente</SelectItem>
        </SelectContent>
      </Select>

      {/* Assignment Filter */}
      <Select
        value={filters.assignment}
        onValueChange={(value) => filters.setFilter('assignment', value as any)}
      >
        <SelectTrigger className="h-8 w-[140px] text-sm">
          <SelectValue placeholder="Atribuição" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas</SelectItem>
          <SelectItem value="assigned-to-me">Atribuídas a Mim</SelectItem>
          <SelectItem value="created-by-me">Criadas por Mim</SelectItem>
          <SelectItem value="my-teams">Minhas Equipes</SelectItem>
        </SelectContent>
      </Select>

      {/* Toggle Filters */}
      <div className="flex gap-1">
        <Button
          variant={filters.showBlockedOnly ? 'default' : 'outline'}
          size="sm"
          onClick={() => filters.setFilter('showBlockedOnly', !filters.showBlockedOnly)}
          className="h-8 text-xs"
        >
          Bloqueadas
        </Button>
        <Button
          variant={filters.showLateOnly ? 'default' : 'outline'}
          size="sm"
          onClick={() => filters.setFilter('showLateOnly', !filters.showLateOnly)}
          className="h-8 text-xs"
        >
          Atrasadas
        </Button>
      </div>

      {/* View Mode */}
      <div className="flex items-center gap-1 border-l pl-2">
        <Button
          variant={filters.viewMode === 'list' ? 'default' : 'ghost'}
          size="icon"
          onClick={() => filters.setFilter('viewMode', 'list')}
          title="Visualização em Lista"
          className="h-8 w-8"
        >
          <LayoutList className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant={filters.viewMode === 'kanban' ? 'default' : 'ghost'}
          size="icon"
          onClick={() => filters.setFilter('viewMode', 'kanban')}
          title="Visualização Kanban"
          className="h-8 w-8"
        >
          <LayoutGrid className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Clear Filters */}
      {(filters.searchQuery ||
        filters.status !== 'all' ||
        filters.priority !== 'all' ||
        filters.assignment !== 'all' ||
        filters.showBlockedOnly ||
        filters.showLateOnly) && (
        <Button
          variant="ghost"
          size="sm"
          onClick={filters.resetFilters}
          className="h-8 text-xs"
        >
          <X className="mr-1 h-3.5 w-3.5" />
          Limpar
        </Button>
      )}

      {/* Nova Ação Button */}
      <div className="ml-auto border-l pl-2">
        <Button
          size="sm"
          onClick={() => router.push('/actions/new')}
          className="h-8 text-xs"
        >
          <Plus className="mr-1 h-3.5 w-3.5" />
          Nova Ação
        </Button>
      </div>
    </div>
  )
}
