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
