# Standardized Tables and Filters Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement responsive hybrid table system with reusable filters for all main tables in the application

**Architecture:** TanStack React Table for desktop view, custom card components for mobile, unified filter system with Zustand stores, responsive breakpoint detection

**Tech Stack:** React 18, TypeScript, TanStack React Table v8, Tailwind CSS, Radix UI, Zustand

---

## Task 1: Create TypeScript Types

**Files:**
- Create: `src/components/shared/table/types.ts`

**Step 1: Create base types file**

```typescript
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
```

**Step 2: Verify TypeScript compiles**

Run: `cd /Users/luanafraga/www/toolDo/tooldo-app && npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add src/components/shared/table/types.ts
git commit -m "feat(table): add TypeScript types for responsive table system"
```

---

## Task 2: Create useResponsiveTable Hook

**Files:**
- Create: `src/components/shared/table/use-responsive-table.ts`

**Step 1: Create breakpoint detection hook**

```typescript
'use client';

import { useEffect, useState } from 'react';

export function useResponsiveTable() {
  const [breakpoint, setBreakpoint] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setBreakpoint('mobile');
      } else if (width < 1024) {
        setBreakpoint('tablet');
      } else {
        setBreakpoint('desktop');
      }
    };

    // Set initial value
    updateBreakpoint();

    // Listen for resize
    window.addEventListener('resize', updateBreakpoint);
    return () => window.removeEventListener('resize', updateBreakpoint);
  }, []);

  const isMobile = breakpoint === 'mobile';
  const isTablet = breakpoint === 'tablet';
  const isDesktop = breakpoint === 'desktop';
  const viewMode = isMobile ? 'cards' : 'table';

  return { breakpoint, isMobile, isTablet, isDesktop, viewMode };
}
```

**Step 2: Verify no TypeScript errors**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add src/components/shared/table/use-responsive-table.ts
git commit -m "feat(table): add useResponsiveTable hook for breakpoint detection"
```

---

## Task 3: Create useTableState Hook

**Files:**
- Create: `src/components/shared/table/use-table-state.ts`

**Step 1: Create state management hook**

```typescript
'use client';

import { useEffect, useState } from 'react';
import { SortingState } from '@tanstack/react-table';

interface UseTableStateConfig {
  initialPageSize?: number;
  initialSortBy?: string;
  persistKey?: string;
}

export function useTableState<TFilters = Record<string, any>>(
  config?: UseTableStateConfig
) {
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: config?.initialPageSize || 20,
  });

  const [sorting, setSorting] = useState<SortingState>([]);
  const [filters, setFilters] = useState<TFilters>({} as TFilters);

  // Restore from localStorage on mount
  useEffect(() => {
    if (config?.persistKey) {
      const stored = localStorage.getItem(`table-${config.persistKey}`);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed.pageSize) {
            setPagination((prev) => ({ ...prev, pageSize: parsed.pageSize }));
          }
          if (parsed.sorting) {
            setSorting(parsed.sorting);
          }
        } catch (error) {
          console.error('Failed to parse stored table state:', error);
        }
      }
    }
  }, [config?.persistKey]);

  // Persist to localStorage on change
  useEffect(() => {
    if (config?.persistKey) {
      const toStore = {
        pageSize: pagination.pageSize,
        sorting,
      };
      localStorage.setItem(`table-${config.persistKey}`, JSON.stringify(toStore));
    }
  }, [pagination.pageSize, sorting, config?.persistKey]);

  return {
    pagination,
    setPagination,
    sorting,
    setSorting,
    filters,
    setFilters,
  };
}
```

**Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add src/components/shared/table/use-table-state.ts
git commit -m "feat(table): add useTableState hook with localStorage persistence"
```

---

## Task 4: Create CardView Component

**Files:**
- Create: `src/components/shared/table/card-view.tsx`

**Step 1: Create mobile card view component**

```typescript
'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

interface CardViewProps<T> {
  data: T[];
  CardComponent: React.ComponentType<{ item: T }>;
  isLoading?: boolean;
  emptyMessage?: string;
}

export function CardView<T>({
  data,
  CardComponent,
  isLoading,
  emptyMessage = 'Nenhum item encontrado',
}: CardViewProps<T>) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 custom-scrollbar">
      {data.map((item, index) => (
        <CardComponent key={index} item={item} />
      ))}
    </div>
  );
}
```

**Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add src/components/shared/table/card-view.tsx
git commit -m "feat(table): add CardView component for mobile display"
```

---

## Task 5: Create TableView Component

**Files:**
- Create: `src/components/shared/table/table-view.tsx`

**Step 1: Create desktop table view component**

```typescript
'use client';

import React from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  ColumnDef,
  SortingState,
  PaginationState,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ArrowUpDown, ArrowUp, ArrowDown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TableViewProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  isLoading?: boolean;
  emptyMessage?: string;
  sorting?: SortingState;
  onSortingChange?: (sorting: SortingState) => void;
  pagination?: PaginationState;
  onPaginationChange?: (pagination: PaginationState) => void;
  manualPagination?: boolean;
  manualSorting?: boolean;
  pageCount?: number;
}

export function TableView<T>({
  data,
  columns,
  isLoading,
  emptyMessage = 'Nenhum item encontrado',
  sorting = [],
  onSortingChange,
  pagination,
  onPaginationChange,
  manualPagination = false,
  manualSorting = false,
  pageCount,
}: TableViewProps<T>) {
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      pagination,
    },
    onSortingChange,
    onPaginationChange,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: manualSorting ? undefined : getSortedRowModel(),
    getPaginationRowModel: manualPagination ? undefined : getPaginationRowModel(),
    manualPagination,
    manualSorting,
    pageCount,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border/60 overflow-hidden custom-scrollbar">
      <Table>
        <TableHeader className="bg-muted/50 backdrop-blur-sm sticky top-0 z-10">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const canSort = header.column.getCanSort();
                const isSorted = header.column.getIsSorted();

                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : (
                      <div className="flex items-center gap-2">
                        {canSort ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 -ml-3 data-[state=open]:bg-accent"
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                            {isSorted === 'asc' && (
                              <ArrowUp className="ml-2 h-4 w-4" />
                            )}
                            {isSorted === 'desc' && (
                              <ArrowDown className="ml-2 h-4 w-4" />
                            )}
                            {!isSorted && (
                              <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
                            )}
                          </Button>
                        ) : (
                          flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )
                        )}
                      </div>
                    )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center text-muted-foreground"
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                className="hover:bg-muted/50 border-b border-border/40 transition-colors"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
```

**Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add src/components/shared/table/table-view.tsx
git commit -m "feat(table): add TableView component with TanStack React Table"
```

---

## Task 6: Create ResponsiveDataTable Component

**Files:**
- Create: `src/components/shared/table/responsive-data-table.tsx`

**Step 1: Create main responsive table component**

```typescript
'use client';

import React from 'react';
import { ResponsiveDataTableProps } from './types';
import { TableView } from './table-view';
import { CardView } from './card-view';
import { useResponsiveTable } from './use-responsive-table';
import { Pagination } from '@/components/shared/data/pagination';

export function ResponsiveDataTable<T>({
  data,
  columns,
  CardComponent,
  emptyMessage,
  isLoading,
  pagination,
  filters,
  manualPagination = false,
  manualSorting = false,
}: ResponsiveDataTableProps<T>) {
  const { viewMode } = useResponsiveTable();
  const [sorting, setSorting] = React.useState([]);

  const pageCount = pagination
    ? Math.ceil(pagination.total / pagination.pageSize)
    : undefined;

  return (
    <div className="space-y-4">
      {/* Filters slot */}
      {filters && <div>{filters}</div>}

      {/* Table or Cards based on viewport */}
      {viewMode === 'cards' ? (
        <CardView
          data={data}
          CardComponent={CardComponent}
          isLoading={isLoading}
          emptyMessage={emptyMessage}
        />
      ) : (
        <TableView
          data={data}
          columns={columns}
          isLoading={isLoading}
          emptyMessage={emptyMessage}
          sorting={sorting}
          onSortingChange={setSorting}
          pagination={
            pagination
              ? {
                  pageIndex: pagination.page - 1,
                  pageSize: pagination.pageSize,
                }
              : undefined
          }
          onPaginationChange={(newPagination) => {
            if (pagination) {
              pagination.onPageChange(newPagination.pageIndex + 1);
              pagination.onPageSizeChange(newPagination.pageSize);
            }
          }}
          manualPagination={manualPagination}
          manualSorting={manualSorting}
          pageCount={pageCount}
        />
      )}

      {/* Pagination */}
      {pagination && (
        <Pagination
          page={pagination.page}
          limit={pagination.pageSize}
          total={pagination.total}
          totalPages={pageCount || 1}
          onPageChange={pagination.onPageChange}
          onLimitChange={pagination.onPageSizeChange}
        />
      )}
    </div>
  );
}
```

**Step 2: Create index file for exports**

Create: `src/components/shared/table/index.ts`

```typescript
export { ResponsiveDataTable } from './responsive-data-table';
export { TableView } from './table-view';
export { CardView } from './card-view';
export { useTableState } from './use-table-state';
export { useResponsiveTable } from './use-responsive-table';
export * from './types';
```

**Step 3: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 4: Commit**

```bash
git add src/components/shared/table/responsive-data-table.tsx src/components/shared/table/index.ts
git commit -m "feat(table): add ResponsiveDataTable main component with exports"
```

---

## Task 7: Create Filter Types

**Files:**
- Create: `src/components/shared/filters/filter-types.ts`

**Step 1: Create filter configuration types**

```typescript
import { LucideIcon } from 'lucide-react';

export type FilterType = 'search' | 'select' | 'toggle' | 'date-range';

export interface FilterOption {
  value: string;
  label: string;
  icon?: LucideIcon;
}

export interface FilterConfig {
  type: FilterType;
  key: string;
  label: string;
  icon?: LucideIcon;
  options?: FilterOption[];
  placeholder?: string;
}

export interface StandardFiltersProps {
  config: FilterConfig[];
  values: Record<string, any>;
  onChange: (values: Record<string, any>) => void;
  onClear?: () => void;
}
```

**Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add src/components/shared/filters/filter-types.ts
git commit -m "feat(filters): add filter configuration types"
```

---

## Task 8: Create FilterPopover Component

**Files:**
- Create: `src/components/shared/filters/filter-popover.tsx`

**Step 1: Create reusable filter popover**

```typescript
'use client';

import React, { useState } from 'react';
import { Check } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FilterOption } from './filter-types';
import { cn } from '@/lib/utils';

interface FilterPopoverProps {
  label: string;
  icon?: React.ReactNode;
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
  activeCount?: number;
}

export function FilterPopover({
  label,
  icon,
  options,
  value,
  onChange,
  activeCount,
}: FilterPopoverProps) {
  const [open, setOpen] = useState(false);
  const isActive = value !== 'all' && value !== '';

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            'h-9 gap-2 text-sm',
            isActive
              ? 'border-solid border-primary'
              : 'border-dashed border-border'
          )}
        >
          {icon}
          {label}
          {activeCount !== undefined && activeCount > 0 && (
            <Badge variant="secondary" className="ml-1 h-5 px-1 text-xs">
              {activeCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-2" align="start">
        <div className="space-y-1">
          {options.map((option) => {
            const selected = value === option.value;
            return (
              <Button
                key={option.value}
                variant="ghost"
                size="sm"
                className={cn(
                  'w-full justify-start gap-2 text-sm font-normal',
                  selected && 'bg-muted'
                )}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
              >
                {option.icon && <option.icon className="h-4 w-4" />}
                <span className="flex-1 text-left">{option.label}</span>
                {selected && <Check className="h-4 w-4" />}
              </Button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
```

**Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add src/components/shared/filters/filter-popover.tsx
git commit -m "feat(filters): add FilterPopover component"
```

---

## Task 9: Create StandardFilters Component

**Files:**
- Create: `src/components/shared/filters/standard-filters.tsx`

**Step 1: Create main filters component**

```typescript
'use client';

import React from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FilterPopover } from './filter-popover';
import { StandardFiltersProps, FilterConfig } from './filter-types';
import { cn } from '@/lib/utils';

export function StandardFilters({
  config,
  values,
  onChange,
  onClear,
}: StandardFiltersProps) {
  const handleFilterChange = (key: string, value: any) => {
    onChange({ ...values, [key]: value });
  };

  const hasActiveFilters = Object.entries(values).some(
    ([key, value]) =>
      value !== 'all' && value !== '' && value !== false && value !== null
  );

  const handleClearAll = () => {
    const cleared: Record<string, any> = {};
    config.forEach((filter) => {
      if (filter.type === 'search') {
        cleared[filter.key] = '';
      } else if (filter.type === 'toggle') {
        cleared[filter.key] = false;
      } else {
        cleared[filter.key] = 'all';
      }
    });
    onChange(cleared);
    onClear?.();
  };

  const searchFilters = config.filter((f) => f.type === 'search');
  const selectFilters = config.filter((f) => f.type === 'select');
  const toggleFilters = config.filter((f) => f.type === 'toggle');

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center">
      {/* Search bars */}
      {searchFilters.map((filter) => (
        <div key={filter.key} className="relative flex-1 md:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={filter.placeholder || 'Buscar...'}
            value={values[filter.key] || ''}
            onChange={(e) => handleFilterChange(filter.key, e.target.value)}
            className="h-9 pl-9 text-sm"
          />
        </div>
      ))}

      {/* Filter buttons */}
      <div className="flex flex-wrap items-center gap-2">
        {selectFilters.map((filter) => (
          <FilterPopover
            key={filter.key}
            label={filter.label}
            icon={filter.icon && <filter.icon className="h-4 w-4" />}
            options={filter.options || []}
            value={values[filter.key] || 'all'}
            onChange={(value) => handleFilterChange(filter.key, value)}
          />
        ))}

        {toggleFilters.map((filter) => (
          <Button
            key={filter.key}
            variant="outline"
            size="sm"
            className={cn(
              'h-9 gap-2 text-sm',
              values[filter.key]
                ? 'border-solid border-primary'
                : 'border-dashed border-border'
            )}
            onClick={() => handleFilterChange(filter.key, !values[filter.key])}
          >
            {filter.icon && <filter.icon className="h-4 w-4" />}
            {filter.label}
          </Button>
        ))}

        {/* Clear all button */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            className="h-9 gap-2 text-sm"
            onClick={handleClearAll}
          >
            <X className="h-4 w-4" />
            Limpar filtros
          </Button>
        )}
      </div>
    </div>
  );
}
```

**Step 2: Create index file for exports**

Create: `src/components/shared/filters/index.ts`

```typescript
export { StandardFilters } from './standard-filters';
export { FilterPopover } from './filter-popover';
export * from './filter-types';
```

**Step 3: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 4: Commit**

```bash
git add src/components/shared/filters/standard-filters.tsx src/components/shared/filters/index.ts
git commit -m "feat(filters): add StandardFilters component with exports"
```

---

## Task 10: Add Custom Scrollbar Styles

**Files:**
- Modify: `src/app/globals.css`

**Step 1: Add custom scrollbar CSS**

Add to the end of `globals.css`:

```css
/* Custom scrollbar for tables and cards */
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: hsl(var(--muted-foreground) / 0.2) transparent;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: hsl(var(--muted-foreground) / 0.15);
  border-radius: 10px;
  transition: background-color 0.2s;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: hsl(var(--muted-foreground) / 0.3);
}
```

**Step 2: Verify styles compile**

Run: `npm run dev`
Expected: No errors, dev server starts

**Step 3: Commit**

```bash
git add src/app/globals.css
git commit -m "style: add custom scrollbar styles for tables"
```

---

## Task 11: Improve Pagination Component Styling

**Files:**
- Modify: `src/components/shared/data/pagination.tsx`

**Step 1: Read current pagination component**

Run: Read the file to understand current implementation

**Step 2: Update styling to match Kanban theme**

Update the component wrapper className to:

```typescript
<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-lg border border-border/60 bg-card/95 backdrop-blur-sm p-3">
```

Update button styles to use consistent hover effects:

```typescript
className="transition-all duration-200 hover:shadow-sm"
```

**Step 3: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 4: Commit**

```bash
git add src/components/shared/data/pagination.tsx
git commit -m "style(pagination): update styling to match Kanban theme"
```

---

## Task 12: Create Example Card Component for Plans

**Files:**
- Create: `src/app/(protected)/plans/plan-card.tsx`

**Step 1: Create mobile card component for plans**

```typescript
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';
import type { Plan } from '@/lib/types/plan';

interface PlanCardProps {
  item: Plan;
}

export function PlanCard({ item }: PlanCardProps) {
  return (
    <Card className="group/card relative overflow-hidden bg-card/95 backdrop-blur-sm border border-border/60 shadow-sm hover:shadow-md hover:border-border/80 hover:bg-card transition-all duration-200 ease-in-out hover:-translate-y-0.5 p-4">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <h3 className="font-semibold text-base">{item.name}</h3>
          <div className="flex gap-1 opacity-0 group-hover/card:opacity-100 transition-opacity">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-muted-foreground">Empresas</p>
            <p className="font-medium">{item.maxCompanies}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Gestores</p>
            <p className="font-medium">{item.maxManagers}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Executores</p>
            <p className="font-medium">{item.maxExecutors}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Consultores</p>
            <p className="font-medium">{item.maxConsultants}</p>
          </div>
        </div>

        {/* IA Calls */}
        <div className="pt-2 border-t border-border/40">
          <p className="text-sm text-muted-foreground">
            Chamadas IA: <span className="font-medium text-foreground">{item.iaCallsLimit}</span>
          </p>
        </div>
      </div>
    </Card>
  );
}
```

**Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add src/app/(protected)/plans/plan-card.tsx
git commit -m "feat(plans): add PlanCard component for mobile view"
```

---

## Task 13: Migrate Plans Page to ResponsiveDataTable

**Files:**
- Modify: `src/app/(protected)/plans/page.tsx`

**Step 1: Read current Plans page implementation**

Run: Read the file to understand current structure

**Step 2: Import ResponsiveDataTable and update page**

Update imports:

```typescript
import { ResponsiveDataTable } from '@/components/shared/table';
import { PlanCard } from './plan-card';
import { ColumnDef } from '@tanstack/react-table';
import type { Plan } from '@/lib/types/plan';
```

Define columns:

```typescript
const planColumns: ColumnDef<Plan>[] = [
  {
    accessorKey: 'name',
    header: 'Nome do Plano',
  },
  {
    accessorKey: 'maxCompanies',
    header: 'Max Empresas',
  },
  {
    accessorKey: 'maxManagers',
    header: 'Max Gestores',
  },
  {
    accessorKey: 'maxExecutors',
    header: 'Max Executores',
  },
  {
    accessorKey: 'maxConsultants',
    header: 'Max Consultores',
  },
  {
    accessorKey: 'iaCallsLimit',
    header: 'Limite IA',
  },
  {
    id: 'actions',
    header: 'Ações',
    cell: ({ row }) => {
      // Keep existing actions dropdown
      return (
        <DropdownMenu>
          {/* existing dropdown code */}
        </DropdownMenu>
      );
    },
  },
];
```

Replace table with ResponsiveDataTable:

```typescript
<ResponsiveDataTable
  data={plans || []}
  columns={planColumns}
  CardComponent={PlanCard}
  isLoading={isLoading}
  emptyMessage="Nenhum plano cadastrado"
/>
```

**Step 3: Verify TypeScript compiles and test**

Run: `npx tsc --noEmit`
Expected: No errors

Run: `npm run dev` and visit `/plans`
Expected: Table shows in desktop, cards in mobile

**Step 4: Commit**

```bash
git add src/app/(protected)/plans/page.tsx
git commit -m "feat(plans): migrate to ResponsiveDataTable with pagination"
```

---

## Task 14: Create Filter Store for Companies

**Files:**
- Create: `src/lib/stores/company-filters-store.ts`

**Step 1: Create Zustand store for company filters**

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CompanyFilters {
  query: string;
  status: 'all' | 'active' | 'inactive';
  page: number;
  pageSize: number;
}

interface CompanyFiltersStore {
  filters: CompanyFilters;
  setFilters: (filters: Partial<CompanyFilters>) => void;
  resetFilters: () => void;
}

const defaultFilters: CompanyFilters = {
  query: '',
  status: 'all',
  page: 1,
  pageSize: 20,
};

export const useCompanyFiltersStore = create<CompanyFiltersStore>()(
  persist(
    (set) => ({
      filters: defaultFilters,
      setFilters: (newFilters) =>
        set((state) => ({
          filters: { ...state.filters, ...newFilters, page: 1 }, // Reset to page 1 on filter change
        })),
      resetFilters: () => set({ filters: defaultFilters }),
    }),
    {
      name: 'company-filters',
      partialize: (state) => ({
        filters: {
          pageSize: state.filters.pageSize,
        },
      }),
    }
  )
);
```

**Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add src/lib/stores/company-filters-store.ts
git commit -m "feat(companies): add filter store with Zustand"
```

---

## Task 15: Create CompanyCard Component

**Files:**
- Create: `src/app/(protected)/companies/company-card.tsx`

**Step 1: Create mobile card for companies**

```typescript
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, Pencil, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import type { Company } from '@/lib/types/company';

interface CompanyCardProps {
  item: Company;
}

export function CompanyCard({ item }: CompanyCardProps) {
  return (
    <Link href={`/companies/${item.id}`}>
      <Card className="group/card relative overflow-hidden bg-card/95 backdrop-blur-sm border border-border/60 shadow-sm hover:shadow-md hover:border-border/80 hover:bg-card transition-all duration-200 ease-in-out hover:-translate-y-0.5 p-4 cursor-pointer">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-base">{item.name}</h3>
                <p className="text-sm text-muted-foreground">{item.cnpj}</p>
              </div>
            </div>
            <Badge variant={item.isActive ? 'default' : 'secondary'}>
              {item.isActive ? 'Ativa' : 'Inativa'}
            </Badge>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2 border-t border-border/40">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{item._count?.employees || 0} membros</span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
```

**Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add src/app/(protected)/companies/company-card.tsx
git commit -m "feat(companies): add CompanyCard component for mobile view"
```

---

## Task 16: Migrate Companies Page

**Files:**
- Modify: `src/app/(protected)/companies/page.tsx`

**Step 1: Import new components**

```typescript
import { ResponsiveDataTable } from '@/components/shared/table';
import { StandardFilters } from '@/components/shared/filters';
import { CompanyCard } from './company-card';
import { useCompanyFiltersStore } from '@/lib/stores/company-filters-store';
import { CheckCircle2 } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';
```

**Step 2: Add filter configuration**

```typescript
const filterConfig = [
  {
    type: 'search' as const,
    key: 'query',
    placeholder: 'Buscar empresas...',
  },
  {
    type: 'select' as const,
    key: 'status',
    label: 'Status',
    icon: CheckCircle2,
    options: [
      { value: 'all', label: 'Todas' },
      { value: 'active', label: 'Ativas' },
      { value: 'inactive', label: 'Inativas' },
    ],
  },
];
```

**Step 3: Define columns**

```typescript
const companyColumns: ColumnDef<Company>[] = [
  {
    accessorKey: 'name',
    header: 'Nome',
  },
  {
    accessorKey: 'cnpj',
    header: 'CNPJ',
  },
  {
    accessorKey: 'isActive',
    header: 'Status',
    cell: ({ row }) => (
      <Badge variant={row.original.isActive ? 'default' : 'secondary'}>
        {row.original.isActive ? 'Ativa' : 'Inativa'}
      </Badge>
    ),
  },
  {
    accessorKey: '_count.employees',
    header: 'Membros',
    cell: ({ row }) => row.original._count?.employees || 0,
  },
  {
    id: 'actions',
    header: 'Ações',
    cell: ({ row }) => (
      <Link href={`/companies/${row.original.id}`}>
        <Button variant="ghost" size="sm">
          Ver detalhes
        </Button>
      </Link>
    ),
  },
];
```

**Step 4: Update component to use filters and table**

```typescript
export default function CompaniesPage() {
  const { filters, setFilters, resetFilters } = useCompanyFiltersStore();
  const { data, isLoading } = useCompanies(filters);

  return (
    <div className="space-y-4">
      <StandardFilters
        config={filterConfig}
        values={filters}
        onChange={setFilters}
        onClear={resetFilters}
      />

      <ResponsiveDataTable
        data={data?.companies || []}
        columns={companyColumns}
        CardComponent={CompanyCard}
        isLoading={isLoading}
        emptyMessage="Nenhuma empresa encontrada"
        pagination={{
          page: filters.page,
          pageSize: filters.pageSize,
          total: data?.total || 0,
          onPageChange: (page) => setFilters({ page }),
          onPageSizeChange: (pageSize) => setFilters({ pageSize }),
        }}
        manualPagination
      />
    </div>
  );
}
```

**Step 5: Verify and test**

Run: `npx tsc --noEmit`
Expected: No errors

Run: `npm run dev` and test companies page
Expected: Filters work, pagination works, responsive

**Step 6: Commit**

```bash
git add src/app/(protected)/companies/page.tsx
git commit -m "feat(companies): migrate to ResponsiveDataTable with StandardFilters"
```

---

## Task 17: Update Members Page Styling

**Files:**
- Modify: `src/app/(protected)/companies/[companyId]/members/page.tsx`

**Step 1: Update table wrapper styling**

Find the table wrapper div and update className to:

```typescript
<div className="rounded-lg border border-border/60 overflow-hidden custom-scrollbar">
```

**Step 2: Update TableHeader styling**

```typescript
<TableHeader className="bg-muted/50 backdrop-blur-sm sticky top-0 z-10">
```

**Step 3: Update TableRow hover styling**

```typescript
<TableRow className="hover:bg-muted/50 border-b border-border/40 transition-colors">
```

**Step 4: Verify and test**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 5: Commit**

```bash
git add src/app/(protected)/companies/[companyId]/members/page.tsx
git commit -m "style(members): update table styling to match design system"
```

---

## Task 18: Update Actions Table Styling

**Files:**
- Modify: `src/components/features/actions/action-list/action-table.tsx`

**Step 1: Update table container styling**

Update the wrapping div to use consistent styling:

```typescript
<div className="rounded-lg border border-border/60 overflow-hidden custom-scrollbar">
```

**Step 2: Update header and row styling**

```typescript
// Header
<TableHeader className="bg-muted/50 backdrop-blur-sm sticky top-0 z-10">

// Rows
<TableRow className="hover:bg-muted/50 border-b border-border/40 transition-colors">
```

**Step 3: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 4: Commit**

```bash
git add src/components/features/actions/action-list/action-table.tsx
git commit -m "style(actions): update table styling to match design system"
```

---

## Task 19: Create TeamCard Component

**Files:**
- Create: `src/app/(protected)/companies/[companyId]/teams/team-card.tsx`

**Step 1: Create card component for teams**

```typescript
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Pencil, Trash2 } from 'lucide-react';
import type { Team } from '@/lib/types/team';

interface TeamCardProps {
  item: Team;
  onEdit?: (team: Team) => void;
  onDelete?: (team: Team) => void;
}

export function TeamCard({ item, onEdit, onDelete }: TeamCardProps) {
  return (
    <Card className="group/card relative overflow-hidden bg-card/95 backdrop-blur-sm border border-border/60 shadow-sm hover:shadow-md hover:border-border/80 hover:bg-card transition-all duration-200 ease-in-out hover:-translate-y-0.5 p-4">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-base">{item.name}</h3>
              {item.description && (
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {item.description}
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-1 opacity-0 group-hover/card:opacity-100 transition-opacity">
            {onEdit && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onEdit(item)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive"
                onClick={() => onDelete(item)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="pt-2 border-t border-border/40">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">
              {item.members?.length || 0}
            </span>{' '}
            membros
          </p>
        </div>
      </div>
    </Card>
  );
}
```

**Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add src/app/(protected)/companies/[companyId]/teams/team-card.tsx
git commit -m "feat(teams): add TeamCard component for mobile view"
```

---

## Task 20: Migrate Teams to ResponsiveDataTable

**Files:**
- Modify: `src/app/(protected)/companies/[companyId]/teams/page.tsx`

**Step 1: Import ResponsiveDataTable**

```typescript
import { ResponsiveDataTable } from '@/components/shared/table';
import { TeamCard } from './team-card';
import { ColumnDef } from '@tanstack/react-table';
```

**Step 2: Define columns**

```typescript
const teamColumns: ColumnDef<Team>[] = [
  {
    accessorKey: 'name',
    header: 'Nome da Equipe',
  },
  {
    accessorKey: 'description',
    header: 'Descrição',
  },
  {
    accessorKey: 'members',
    header: 'Membros',
    cell: ({ row }) => row.original.members?.length || 0,
  },
  {
    id: 'actions',
    header: 'Ações',
    cell: ({ row }) => (
      <div className="flex gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleEdit(row.original)}
        >
          Editar
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive"
          onClick={() => handleDelete(row.original)}
        >
          Excluir
        </Button>
      </div>
    ),
  },
];
```

**Step 3: Replace grid with ResponsiveDataTable**

```typescript
<ResponsiveDataTable
  data={teams || []}
  columns={teamColumns}
  CardComponent={(props) => (
    <TeamCard
      {...props}
      onEdit={handleEdit}
      onDelete={handleDelete}
    />
  )}
  isLoading={isLoading}
  emptyMessage="Nenhuma equipe cadastrada"
/>
```

**Step 4: Verify and test**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 5: Commit**

```bash
git add src/app/(protected)/companies/[companyId]/teams/page.tsx
git commit -m "feat(teams): migrate from grid to ResponsiveDataTable"
```

---

## Final Task: Documentation and Testing

**Files:**
- Create: `docs/components/responsive-data-table.md`

**Step 1: Create component documentation**

```markdown
# ResponsiveDataTable Component

## Overview

Hybrid table component that displays data as cards on mobile and traditional table on desktop.

## Usage

\`\`\`tsx
import { ResponsiveDataTable } from '@/components/shared/table';
import { MyCard } from './my-card';

const columns: ColumnDef<MyData>[] = [
  { accessorKey: 'name', header: 'Name' },
  // ...
];

<ResponsiveDataTable
  data={data}
  columns={columns}
  CardComponent={MyCard}
  isLoading={isLoading}
  pagination={{
    page: 1,
    pageSize: 20,
    total: 100,
    onPageChange: (page) => {},
    onPageSizeChange: (size) => {},
  }}
/>
\`\`\`

## Props

See `src/components/shared/table/types.ts` for full prop definitions.

## Styling

Follows Kanban design system with backdrop-blur and hover effects.
```

**Step 2: Test all migrated pages**

Manual testing checklist:
- [ ] Plans page: desktop table, mobile cards, responsive
- [ ] Companies page: filters work, pagination works
- [ ] Teams page: converted from grid, mobile cards
- [ ] Members page: updated styling
- [ ] Actions table: updated styling

**Step 3: Final commit**

```bash
git add docs/components/responsive-data-table.md
git commit -m "docs: add ResponsiveDataTable component documentation

All tables migrated:
- Plans: added pagination and responsive view
- Companies: added filters and responsive view
- Teams: converted from grid to responsive table
- Members: updated styling
- Actions: updated styling

All tables now use consistent Kanban-inspired design with:
- Hybrid mobile/desktop views
- Custom scrollbars
- Backdrop blur effects
- Smooth transitions"
```

---

## Acceptance Criteria Checklist

After completing all tasks, verify:

✅ **Core Components:**
- [ ] ResponsiveDataTable switches views at 768px breakpoint
- [ ] TableView uses TanStack React Table
- [ ] CardView renders custom cards
- [ ] useTableState manages pagination/sorting/filters
- [ ] useResponsiveTable detects breakpoints

✅ **Filters:**
- [ ] StandardFilters supports search and select
- [ ] FilterPopover shows active state with badges
- [ ] Clear all button appears when filters active

✅ **Styling:**
- [ ] All tables have backdrop-blur and custom scrollbar
- [ ] Hover effects work on cards and table rows
- [ ] Transitions are smooth

✅ **Tables Migrated:**
- [ ] Plans has pagination
- [ ] Companies has filters
- [ ] Teams converted to table
- [ ] Members styling updated
- [ ] Actions styling updated

✅ **Responsiveness:**
- [ ] Mobile shows cards
- [ ] Desktop shows table
- [ ] Resize transitions smoothly

---

## Next Steps

After implementation, consider:
1. Add unit tests for hooks
2. Add Storybook stories for components
3. Performance optimization (virtualization for large tables)
4. Accessibility audit (keyboard navigation, ARIA labels)
